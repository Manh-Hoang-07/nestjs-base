import { Module } from '@nestjs/common';
import { ORDER_REPOSITORY } from './domain/order.repository';
import { OrderRepositoryImpl } from './infrastructure/repositories/order.repository.impl';
import { ORDER_ITEM_REPOSITORY } from './domain/order-item.repository';
import { OrderItemRepositoryImpl } from './infrastructure/repositories/order-item.repository.impl';

@Module({
    providers: [
        {
            provide: ORDER_REPOSITORY,
            useClass: OrderRepositoryImpl,
        },
        {
            provide: ORDER_ITEM_REPOSITORY,
            useClass: OrderItemRepositoryImpl,
        },
    ],
    exports: [ORDER_REPOSITORY, ORDER_ITEM_REPOSITORY],
})
export class OrderRepositoryModule { }
