import { Injectable } from '@nestjs/common';
import { Payment, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPaymentRepository, PaymentFilter } from '../../domain/payment.repository';

@Injectable()
export class PaymentRepositoryImpl extends PrismaRepository<
    Payment,
    Prisma.PaymentWhereInput,
    Prisma.PaymentCreateInput,
    Prisma.PaymentUpdateInput,
    Prisma.PaymentOrderByWithRelationInput
> implements IPaymentRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.payment as any, 'created_at:desc');
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: PaymentFilter): Prisma.PaymentWhereInput {
        const where: Prisma.PaymentWhereInput = {};
        if (filter.order_id) where.order_id = this.toPrimaryKey(filter.order_id);
        if (filter.status) where.status = filter.status as any;
        if (filter.payment_method_code) where.payment_method_code = filter.payment_method_code;
        if (filter.transaction_id) where.transaction_id = filter.transaction_id;
        return where;
    }
}
