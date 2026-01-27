import { Injectable } from '@nestjs/common';
import {
    IPaymentGateway,
    CreatePaymentParams,
    PaymentResponse,
    VerifyPaymentParams,
    VerifyPaymentResponse,
} from '../interfaces/payment-gateway.interface';

/**
 * COD (Cash on Delivery) Gateway
 * This is a simple offline payment method that doesn't require external API calls
 */
@Injectable()
export class CODGateway implements IPaymentGateway {
    /**
     * COD doesn't need to create payment URL
     * Just return success with order info
     */
    async create(params: CreatePaymentParams): Promise<PaymentResponse> {
        return {
            success: true,
            transactionId: params.orderId,
            data: {
                method: 'cod',
                orderId: params.orderId,
                amount: params.amount,
                description: params.description || 'Thanh toán khi nhận hàng (COD)',
            },
        };
    }

    /**
     * COD verification is always successful
     * Payment will be verified when customer receives the goods
     */
    async verify(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
        return {
            success: true,
            transactionId: params.transactionId,
            amount: 0, // Amount will be collected on delivery
            status: 'pending',
            message: 'Đơn hàng sẽ được thanh toán khi nhận hàng',
        };
    }

    /**
     * COD doesn't have webhook
     */
    async webhook(payload: any): Promise<any> {
        return {
            success: true,
            message: 'COD does not support webhook',
        };
    }
}
