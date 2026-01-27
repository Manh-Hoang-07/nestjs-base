import { Module } from '@nestjs/common';
import { SHIPPING_METHOD_REPOSITORY } from './domain/shipping-method.repository';
import { ShippingMethodRepositoryImpl } from './infrastructure/repositories/shipping-method.repository.impl';

@Module({
    providers: [
        {
            provide: SHIPPING_METHOD_REPOSITORY,
            useClass: ShippingMethodRepositoryImpl,
        },
    ],
    exports: [SHIPPING_METHOD_REPOSITORY],
})
export class ShippingMethodRepositoryModule { }
