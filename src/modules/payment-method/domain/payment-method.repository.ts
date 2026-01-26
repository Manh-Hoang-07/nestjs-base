import { PaymentMethod } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PAYMENT_METHOD_REPOSITORY = 'IPaymentMethodRepository';

export interface IPaymentMethodRepository extends IRepository<PaymentMethod> {
}
