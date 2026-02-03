import { Payment } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PAYMENT_REPOSITORY = 'IPaymentRepository';

export interface PaymentFilter {
    order_id?: number | bigint;
    status?: string;
    payment_method_code?: string;
    transaction_id?: string;
}

export interface IPaymentRepository extends IRepository<Payment> {
}
