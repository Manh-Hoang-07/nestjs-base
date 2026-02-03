import { Module } from '@nestjs/common';
import { PAYMENT_REPOSITORY } from './domain/payment.repository';
import { PaymentRepositoryImpl } from './infrastructure/repositories/payment.repository.impl';
import { PAYMENT_METHOD_REPOSITORY } from './domain/payment-method.repository';
import { PaymentMethodRepositoryImpl } from './infrastructure/repositories/payment-method.repository.impl';

@Module({
    providers: [
        {
            provide: PAYMENT_REPOSITORY,
            useClass: PaymentRepositoryImpl,
        },
        {
            provide: PAYMENT_METHOD_REPOSITORY,
            useClass: PaymentMethodRepositoryImpl,
        },
    ],
    exports: [PAYMENT_REPOSITORY, PAYMENT_METHOD_REPOSITORY],
})
export class PaymentRepositoryModule { }
