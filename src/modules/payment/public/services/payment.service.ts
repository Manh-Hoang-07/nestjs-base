import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CreatePaymentUrlDto } from '../dtos/create-payment-url.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { PaymentGatewayService } from '../../shared/payment-gateway.service';
import { IPaymentRepository, PAYMENT_REPOSITORY } from '../../domain/payment.repository';
import { IPaymentMethodRepository, PAYMENT_METHOD_REPOSITORY } from '../../domain/payment-method.repository';
import { IOrderRepository, ORDER_REPOSITORY } from '@/modules/ecommerce/order/domain/order.repository';

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(PAYMENT_REPOSITORY)
        private readonly paymentRepository: IPaymentRepository,
        @Inject(PAYMENT_METHOD_REPOSITORY)
        private readonly paymentMethodRepository: IPaymentMethodRepository,
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
        private readonly paymentGatewayService: PaymentGatewayService,
    ) { }

    /**
     * Entry point: Tạo thanh toán (Online URL hoặc COD)
     */
    async create(dto: CreatePaymentUrlDto | CreatePaymentDto): Promise<any> {
        const orderId = BigInt(dto.order_id);
        const order = await this.orderRepository.findById(orderId);

        if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
        if (order.payment_status === 'completed') throw new BadRequestException('Đơn hàng đã được thanh toán');

        // Tìm phương thức thanh toán dựa trên code hoặc id
        const method = await this.resolvePaymentMethod(dto);
        if (!method) throw new BadRequestException('Phương thức thanh toán không hợp lệ');

        if (method.type === 'online') {
            return this.createOnlinePayment(dto as CreatePaymentUrlDto, order, method);
        }
        return this.createOfflinePayment(dto as CreatePaymentDto, order, method);
    }

    private async resolvePaymentMethod(dto: any) {
        if (dto.payment_method_code) return this.paymentMethodRepository.findByCode(dto.payment_method_code);
        if (dto.payment_method_id) return this.paymentMethodRepository.findById(dto.payment_method_id);
        return null;
    }

    /**
     * Tạo URL thanh toán Online (VNPAY, v.v.)
     */
    private async createOnlinePayment(dto: CreatePaymentUrlDto, order: any, method: any) {
        const gateway = this.paymentGatewayService.getGateway(method.code);

        const response = await gateway.create({
            orderId: order.order_number,
            amount: Number(order.total_amount),
            currency: 'VND',
            description: `Thanh toan don hang ${order.order_number}`,
            bankCode: dto.bank_code,
            clientIp: dto.clientIp || '127.0.0.1',
        });

        if (!response.success) throw new BadRequestException(response.error || 'Lỗi khởi tạo thanh toán');

        // Lưu thông tin thanh toán ở trạng thái pending
        const payment = await this.paymentRepository.create({
            order_id: order.id,
            payment_method_id: method.id,
            amount: order.total_amount,
            payment_method_code: method.code,
            payment_method_type: 'online',
            status: 'pending',
            transaction_id: response.transactionId,
        });

        return {
            payment_id: payment.id.toString(),
            payment_url: response.paymentUrl,
            order_number: order.order_number,
        };
    }

    /**
     * Tạo bản ghi thanh toán Offline (COD)
     */
    private async createOfflinePayment(dto: CreatePaymentDto, order: any, method: any) {
        return await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    order_id: order.id,
                    payment_method_id: method.id,
                    amount: order.total_amount,
                    payment_method_type: 'offline',
                    status: 'pending',
                    payment_method_code: method.code,
                    notes: dto.notes,
                },
            });

            await tx.order.update({
                where: { id: order.id },
                data: { payment_status: 'pending' },
            });

            return {
                payment_id: payment.id.toString(),
                status: 'pending'
            };
        });
    }
}
