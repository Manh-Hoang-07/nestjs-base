import { OrderItem } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const ORDER_ITEM_REPOSITORY = 'IOrderItemRepository';

export interface OrderItemFilter {
    order_id?: number | bigint;
    product_id?: number | bigint;
}

export interface IOrderItemRepository extends IRepository<OrderItem> {
}


