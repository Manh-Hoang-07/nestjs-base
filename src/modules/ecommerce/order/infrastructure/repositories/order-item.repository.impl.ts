import { Injectable } from '@nestjs/common';
import { OrderItem, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IOrderItemRepository, OrderItemFilter } from '../../domain/order-item.repository';

@Injectable()
export class OrderItemRepositoryImpl extends PrismaRepository<
    OrderItem,
    Prisma.OrderItemWhereInput,
    Prisma.OrderItemCreateInput,
    Prisma.OrderItemUpdateInput,
    Prisma.OrderItemOrderByWithRelationInput
> implements IOrderItemRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.orderItem as any);
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: OrderItemFilter): Prisma.OrderItemWhereInput {
        const where: Prisma.OrderItemWhereInput = {};
        if (filter.order_id) where.order_id = this.toPrimaryKey(filter.order_id);
        if (filter.product_id) where.product_id = this.toPrimaryKey(filter.product_id);
        return where;
    }
}
