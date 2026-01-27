import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { OrderRepositoryImpl } from './infrastructure/repositories/order.repository.impl';

@Module({
    providers: [
        {
            provide: ORDER_REPOSITORY,
            useClass: OrderRepositoryImpl,
        },
    ],
    exports: [ORDER_REPOSITORY],
})
export class OrderRepositoryModule { }
