import { Order } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const ORDER_REPOSITORY = 'IOrderRepository';

export interface OrderFilter {
    status?: string;
    payment_status?: string;
    shipping_status?: string;
    search?: string;
    user_id?: number | bigint;
    group_id?: number | bigint;
    deleted_at?: Date | null;
}

export interface IOrderRepository extends IRepository<Order> {
    findByOrderNumber(orderNumber: string): Promise<Order | null>;
    getStatistics(): Promise<any>;
}


