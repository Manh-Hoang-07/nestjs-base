import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';
// Previously I saw it in core/database/prisma/prisma.service.ts
import { PrismaRepository } from '@/common/core/repositories/prisma.repository';
import { PaymentMethod, Prisma } from '@prisma/client';

// Path: src/core/database/prisma/prisma.service.ts
// Alias: @/core/database/prisma/prisma.service or similar?
// Usually @ maps to src so @/core/database/prisma/prisma.service

@Injectable()
export class PaymentMethodRepository extends PrismaRepository<
    PaymentMethod,
    Prisma.PaymentMethodWhereInput,
    Prisma.PaymentMethodCreateInput,
    Prisma.PaymentMethodUpdateInput,
    Prisma.PaymentMethodOrderByWithRelationInput
> {
    constructor(protected readonly prisma: PrismaService) {
        super(prisma.paymentMethod);
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
