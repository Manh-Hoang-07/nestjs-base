import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPaymentMethodRepository, PaymentMethodFilter } from '../../domain/payment-method.repository';

@Injectable()
export class PaymentMethodRepositoryImpl extends PrismaRepository<
    PaymentMethod,
    Prisma.PaymentMethodWhereInput,
    Prisma.PaymentMethodCreateInput,
    Prisma.PaymentMethodUpdateInput,
    Prisma.PaymentMethodOrderByWithRelationInput
> implements IPaymentMethodRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.paymentMethod as any, 'priority:desc');
        this.isSoftDelete = false;
    }

    protected buildWhere(filter: PaymentMethodFilter): Prisma.PaymentMethodWhereInput {
        const where: Prisma.PaymentMethodWhereInput = {};
        if (filter.status) where.status = filter.status;
        if (filter.type) where.type = filter.type;
        return where;
    }

    async findByCode(code: string): Promise<PaymentMethod | null> {
        return this.prisma.paymentMethod.findUnique({
            where: { code },
        });
    }
}
