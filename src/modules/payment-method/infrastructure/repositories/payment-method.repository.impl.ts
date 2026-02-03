import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories/prisma.repository';
import { PaymentMethod, Prisma } from '@prisma/client';
import { IPaymentMethodRepository } from '../../domain/payment-method.repository';

@Injectable()
export class PaymentMethodRepositoryImpl extends PrismaRepository<
    PaymentMethod,
    Prisma.PaymentMethodWhereInput,
    Prisma.PaymentMethodCreateInput,
    Prisma.PaymentMethodUpdateInput,
    Prisma.PaymentMethodOrderByWithRelationInput
> implements IPaymentMethodRepository {
    constructor(protected readonly prisma: PrismaService) {
        super(prisma.paymentMethod as any);
    }

    protected buildWhere(filter: Record<string, any>): Prisma.PaymentMethodWhereInput {
        const where: Prisma.PaymentMethodWhereInput = {};

        if (filter.q) {
            where.OR = [
                { name: { contains: filter.q } },
                { code: { contains: filter.q } },
            ];
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.type) {
            where.type = filter.type;
        }

        return where;
    }
}


