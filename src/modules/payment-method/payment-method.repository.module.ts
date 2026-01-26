import { Global, Module } from '@nestjs/common';
import { PAYMENT_METHOD_REPOSITORY } from './domain/payment-method.repository';
import { PaymentMethodRepositoryImpl } from './infrastructure/repositories/payment-method.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: PAYMENT_METHOD_REPOSITORY,
            useClass: PaymentMethodRepositoryImpl,
        },
    ],
    exports: [PAYMENT_METHOD_REPOSITORY],
})
export class PaymentMethodRepositoryModule { }
