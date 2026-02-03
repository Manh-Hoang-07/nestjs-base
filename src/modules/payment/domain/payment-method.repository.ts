import { PaymentMethod } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PAYMENT_METHOD_REPOSITORY = 'IPaymentMethodRepository';

export interface PaymentMethodFilter {
    status?: 'active' | 'inactive';
    type?: 'online' | 'offline';
}

export interface IPaymentMethodRepository extends IRepository<PaymentMethod> {
    findByCode(code: string): Promise<PaymentMethod | null>;
}


