import { Injectable, Inject, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PaymentGatewayService } from '../../shared/payment-gateway.service';
import { PAYMENT_REPOSITORY } from '../../domain/payment.repository';
import { IOrderRepository, ORDER_REPOSITORY } from '@/modules/ecommerce/order/domain/order.repository';

@Injectable()
export class PaymentProcessorService {
    private readonly logger = new Logger(PaymentProcessorService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(PAYMENT_REPOSITORY)
        @Inject(ORDER_REPOSITORY)
        private readonly orderRepository: IOrderRepository,
        private readonly paymentGatewayService: PaymentGatewayService,
    ) { }

    /**
     * Xác thực và xử lý kết quả từ Callback của Gateway
     */
    async verifyAndProcess(gatewayName: string, queryParams: any) {
        const gateway = this.paymentGatewayService.getGateway(gatewayName);

        // 1. Verify chữ ký và dữ liệu từ Gateway
        const verifyResponse = await gateway.verify({
            transactionId: queryParams.vnp_TxnRef || queryParams.orderId,
            queryParams
        });

        if (!verifyResponse.success) {
            this.logger.error(`Payment verification failed for ${gatewayName}: ${verifyResponse.message}`);
            return { success: false, message: verifyResponse.message, order_id: null };
        }

        // 2. Tìm đơn hàng
        const order = await (this.orderRepository as any).findByOrderNumber(verifyResponse.transactionId);
        if (!order) throw new NotFoundException('Không tìm thấy đơn hàng');

        // 3. Nếu đơn hàng đã hoàn tất thì không xử lý lại (Idempotency)
        if (order.payment_status === 'completed') {
            return { success: true, already_confirmed: true, order_id: order.id, message: 'Thanh toán đã được xử lý' };
        }

        // 4. Cập nhật trạng thái
        return this.updateOrderAndPayment(
            order,
            gatewayName,
            verifyResponse.transactionId,
            verifyResponse.status === 'success',
            verifyResponse.amount
        );
    }

    /**
     * Cập nhật DB (Orchestration logic)
     */
    private async updateOrderAndPayment(order: any, gateway: string, txnId: string, isSuccess: boolean, amount: number) {
        return await this.prisma.$transaction(async (tx) => {
            const status = isSuccess ? 'completed' : 'failed';

            // Cập nhật hoặc tạo mới bản ghi thanh toán
            const existingPayment = await tx.payment.findFirst({
                where: { order_id: order.id, transaction_id: txnId }
            });

            if (existingPayment) {
                await tx.payment.update({
                    where: { id: existingPayment.id },
                    data: { status, paid_at: isSuccess ? new Date() : null }
                });
            } else {
                const method = await tx.paymentMethod.findUnique({ where: { code: gateway } });
                await tx.payment.create({
                    data: {
                        order_id: order.id,
                        payment_method_id: method?.id || order.payment_method_id,
                        amount: amount || order.total_amount,
                        payment_method_code: gateway,
                        payment_method_type: 'online',
                        transaction_id: txnId,
                        status,
                        paid_at: isSuccess ? new Date() : null
                    }
                });
            }

            // Cập nhật trạng thái đơn hàng
            await tx.order.update({
                where: { id: order.id },
                data: {
                    payment_status: status,
                    status: isSuccess ? 'confirmed' : order.status
                }
            });

            return {
                success: isSuccess,
                order_id: order.id,
                transactionId: txnId,
                message: isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'
            };
        });
    }

    /**
     * Xử lý Webhook (IPN)
     */
    async handleWebhook(gatewayName: string, payload: any) {
        try {
            const gateway = this.paymentGatewayService.getGateway(gatewayName);
            const webhookResult = await gateway.webhook(payload);

            if (webhookResult.RspCode === '00') {
                await this.verifyAndProcess(gatewayName, payload);
            }

            return webhookResult;
        } catch (error) {
            this.logger.error(`Webhook error: ${error.message}`);
            return { RspCode: '99', Message: error.message };
        }
    }
}
