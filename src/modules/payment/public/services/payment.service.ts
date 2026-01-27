import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { CreatePaymentUrlDto } from '../dtos/create-payment-url.dto';
import { CreatePaymentDto } from '../dtos/create-payment.dto';
import { GetPaymentsDto } from '../dtos/get-payments.dto';
import { PaymentGatewayService } from '../../shared/payment-gateway.service';

@Injectable()
export class PaymentService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly paymentGatewayService: PaymentGatewayService,
    ) { }

    /**
     * Create payment - supports both online (with payment URL) and offline payments
     */
    async create(dto: CreatePaymentUrlDto | CreatePaymentDto): Promise<any> {
        const orderId = BigInt(dto.order_id);
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.payment_status === 'completed') {
            throw new BadRequestException('Order already paid');
        }

        let paymentMethod;
        if ('payment_method_code' in dto && dto.payment_method_code) {
            paymentMethod = await this.prisma.paymentMethod.findUnique({
                where: { code: dto.payment_method_code },
            });
            if (!paymentMethod) {
                throw new NotFoundException(`Payment method with code "${dto.payment_method_code}" not found`);
            }
        } else if ('payment_method_id' in dto && dto.payment_method_id) {
            paymentMethod = await this.prisma.paymentMethod.findUnique({
                where: { id: BigInt(dto.payment_method_id) },
            });
            if (!paymentMethod) {
                throw new NotFoundException(`Payment method with id "${dto.payment_method_id}" not found`);
            }
        }

        if (!paymentMethod) {
            throw new BadRequestException('Payment method not found');
        }

        const isOnline = paymentMethod.type === 'online';

        if (isOnline) {
            return this.createOnlinePayment(dto as CreatePaymentUrlDto, order, paymentMethod);
        }
        return this.createOfflinePayment(dto as CreatePaymentDto, order, paymentMethod);
    }

    /**
     * Create online payment with payment URL
     */
    private async createOnlinePayment(
        dto: CreatePaymentUrlDto,
        order: any,
        paymentMethod: any,
    ): Promise<any> {
        const methodCode = dto.payment_method_code || paymentMethod.code;
        const gateway = this.paymentGatewayService.getGateway(methodCode);

        const paymentResponse = await gateway.create({
            orderId: order.order_number,
            amount: Number(order.total_amount),
            currency: order.currency || 'VND',
            description: `Thanh toan don hang ${order.order_number}`,
            customerEmail: dto.customer_email || order.customer_email,
            customerPhone: dto.customer_phone || order.customer_phone,
            customerName: dto.customer_name || order.customer_name,
        });

        if (!paymentResponse.success) {
            throw new BadRequestException(
                paymentResponse.error || 'Failed to create payment',
            );
        }

        const existingPayment = await this.prisma.payment.findFirst({
            where: {
                order_id: order.id,
                payment_method_code: methodCode
            },
        });

        let payment;
        if (existingPayment) {
            if (paymentResponse.transactionId && !existingPayment.transaction_id) {
                payment = await this.prisma.payment.update({
                    where: { id: existingPayment.id },
                    data: { transaction_id: paymentResponse.transactionId },
                });
            } else {
                payment = existingPayment;
            }
        } else {
            payment = await this.prisma.payment.create({
                data: {
                    order_id: order.id,
                    payment_method_id: paymentMethod.id,
                    amount: order.total_amount,
                    payment_method_code: methodCode,
                    payment_method_type: 'online',
                    status: 'pending',
                    transaction_id: paymentResponse.transactionId || null,
                },
            });
        }

        return {
            payment_id: payment.id.toString(),
            payment_url: paymentResponse.paymentUrl,
            order_id: order.id.toString(),
            order_number: order.order_number,
            amount: order.total_amount,
            payment_method_code: methodCode,
            transaction_id: paymentResponse.transactionId || null,
        };
    }

    /**
     * Create offline payment (COD)
     */
    private async createOfflinePayment(
        dto: CreatePaymentDto,
        order: any,
        paymentMethod: any,
    ): Promise<any> {
        return await this.prisma.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    order_id: order.id,
                    payment_method_id: paymentMethod.id,
                    amount: order.total_amount,
                    payment_method_type: 'offline',
                    status: 'pending',
                    transaction_id: dto.transaction_id || null,
                    payment_method_code: dto.payment_method_code || paymentMethod.code,
                    notes: dto.notes || null,
                },
            });

            await tx.order.update({
                where: { id: order.id },
                data: { payment_status: 'pending' },
            });

            return {
                payment_id: payment.id.toString(),
                order_id: payment.order_id.toString(),
                amount: payment.amount,
                status: payment.status,
            };
        });
    }

    /**
     * Verify payment from gateway callback
     */
    async verifyPayment(gatewayName: string, queryParams: any): Promise<any> {
        if (!this.paymentGatewayService.isSupported(gatewayName)) {
            throw new BadRequestException('Payment gateway not supported');
        }

        const paymentGateway = this.paymentGatewayService.getGateway(gatewayName);
        const transactionId = gatewayName === 'vnpay'
            ? queryParams.vnp_TxnRef
            : (queryParams.orderId || queryParams.vnp_TxnRef);

        if (!transactionId) {
            throw new BadRequestException('Missing transaction ID');
        }

        const verifyResponse = await paymentGateway.verify({ transactionId, queryParams });

        if (!verifyResponse.success) {
            throw new BadRequestException(verifyResponse.message || 'Payment verification failed');
        }

        const order = await this.prisma.order.findUnique({
            where: { order_number: verifyResponse.transactionId },
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Kiểm tra nếu order đã được thanh toán rồi
        if (order.payment_status === 'completed') {
            return {
                order_id: order.id.toString(),
                order_number: order.order_number,
                payment_status: 'success',
                amount: Number(order.total_amount),
                message: 'Order already paid. Payment was processed previously.',
                already_processed: true,
            };
        }

        const result = await this.processPaymentResult(
            order,
            gatewayName,
            verifyResponse.transactionId,
            verifyResponse.status === 'success',
            verifyResponse.amount,
            verifyResponse.message,
        );

        return result;
    }

    /**
     * Common logic to process payment success/failure
     */
    private async processPaymentResult(
        order: any,
        gateway: string,
        transactionId: string,
        isSuccess: boolean,
        amount: number,
        message?: string,
    ): Promise<any> {
        const existingPayment = await this.prisma.payment.findFirst({
            where: {
                order_id: order.id,
                transaction_id: transactionId,
            },
        });

        if (existingPayment && existingPayment.status === 'completed' && isSuccess) {
            return {
                order_id: order.id.toString(),
                order_number: order.order_number,
                payment_status: 'success',
                amount: amount,
                message: message || 'Payment already processed',
            };
        }

        return await this.prisma.$transaction(async (tx) => {
            const paymentUpdateData: any = {
                status: isSuccess ? 'completed' : 'failed',
                paid_at: isSuccess ? new Date() : null,
            };

            if (!existingPayment) {
                const paymentMethod = await tx.paymentMethod.findUnique({
                    where: { code: gateway }
                });

                await tx.payment.create({
                    data: {
                        order_id: order.id,
                        payment_method_id: paymentMethod?.id || order.payment_method_id,
                        amount: order.total_amount,
                        payment_method_code: gateway,
                        payment_method_type: 'online',
                        transaction_id: transactionId,
                        ...paymentUpdateData,
                    },
                });
            } else {
                await tx.payment.update({
                    where: { id: existingPayment.id },
                    data: paymentUpdateData,
                });
            }

            const updateData: any = {
                payment_status: isSuccess ? 'completed' : 'failed',
            };

            if (isSuccess && gateway === 'vnpay') {
                updateData.status = 'confirmed';
            }

            await tx.order.update({
                where: { id: order.id },
                data: updateData,
            });

            return {
                order_id: order.id.toString(),
                order_number: order.order_number,
                payment_status: isSuccess ? 'success' : 'failed',
                amount: amount,
                message: message || (isSuccess ? 'Payment successful' : 'Payment failed'),
            };
        });
    }

    /**
     * Handle payment webhook/IPN
     */
    async handleWebhook(gatewayName: string, payload: any): Promise<any> {
        try {
            if (!this.paymentGatewayService.isSupported(gatewayName)) {
                return { success: false, message: 'Gateway not supported' };
            }

            const paymentGateway = this.paymentGatewayService.getGateway(gatewayName);
            const webhookResponse = await paymentGateway.webhook(payload);

            if (webhookResponse.data?.success) {
                const orderNumber = webhookResponse.data.orderId;
                const amount = webhookResponse.data.amount || 0;

                const order = await this.prisma.order.findUnique({
                    where: { order_number: orderNumber },
                });

                if (order) {
                    await this.processPaymentResult(
                        order,
                        gatewayName,
                        orderNumber,
                        true,
                        amount,
                        webhookResponse.Message || 'Payment successful via webhook',
                    );
                }
            }

            return webhookResponse;
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    /**
     * Get list of payments with filters
     */
    async getPayments(getPaymentsDto: GetPaymentsDto): Promise<any> {
        const { page = 1, limit = 10, status } = getPaymentsDto;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        const [data, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                include: {
                    payment_method: true,
                },
                orderBy: { created_at: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Get payment by ID
     */
    async getPaymentById(id: number): Promise<any> {
        const payment = await this.prisma.payment.findUnique({
            where: { id: BigInt(id) },
            include: {
                payment_method: true,
            },
        });

        if (!payment) {
            throw new NotFoundException('Payment not found');
        }

        return payment;
    }
}
