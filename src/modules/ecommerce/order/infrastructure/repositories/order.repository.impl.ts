import { Injectable } from '@nestjs/common';
import { Order, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IOrderRepository, OrderFilter } from '../../domain/order.repository';

@Injectable()
export class OrderRepositoryImpl extends PrismaRepository<
    Order,
    Prisma.OrderWhereInput,
    Prisma.OrderCreateInput,
    Prisma.OrderUpdateInput,
    Prisma.OrderOrderByWithRelationInput
> implements IOrderRepository {
    constructor(
        private readonly prisma: PrismaService,
    ) {
        super(prisma.order as any);
        this.defaultSelect = {
            id: true,
            order_number: true,
            user_id: true,
            customer_name: true,
            customer_email: true,
            customer_phone: true,
            shipping_address: true,
            billing_address: true,
            order_type: true,
            status: true,
            payment_status: true,
            shipping_status: true,
            subtotal: true,
            tax_amount: true,
            shipping_amount: true,
            discount_amount: true,
            total_amount: true,
            currency: true,
            notes: true,
            tracking_number: true,
            shipped_at: true,
            delivered_at: true,
            created_at: true,
            updated_at: true,
            shipping_method_id: true,
            payment_method_id: true,
            shipping_method: {
                select: { name: true, code: true, price: true }
            },
            payment_method: {
                select: { name: true, code: true, type: true }
            },
            items: {
                select: { id: true, variant_name: true, quantity: true, unit_price: true, total_price: true }
            },
            payments: true
        };
    }

    protected buildWhere(filter: OrderFilter): Prisma.OrderWhereInput {
        const where: Prisma.OrderWhereInput = {};

        if (filter.status) where.status = filter.status as any;
        if (filter.payment_status) where.payment_status = filter.payment_status as any;
        if (filter.shipping_status) where.shipping_status = filter.shipping_status as any;
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.group_id) where.group_id = this.toPrimaryKey(filter.group_id);

        if (filter.search) {
            where.OR = [
                { order_number: { contains: filter.search } },
                { customer_name: { contains: filter.search } },
                { customer_email: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByOrderNumber(orderNumber: string): Promise<Order | null> {
        return this.findOne({ order_number: orderNumber });
    }

    async getStatistics(): Promise<any> {
        const stats = await this.prisma.order.groupBy({
            by: ['status'],
            _count: { _all: true },
            _sum: { total_amount: true }
        });
        return stats;
    }
}
