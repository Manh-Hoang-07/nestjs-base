import { Injectable } from '@nestjs/common';
import { ShippingMethod, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IShippingMethodRepository, ShippingMethodFilter } from '../../domain/shipping-method.repository';

@Injectable()
export class ShippingMethodRepositoryImpl extends PrismaRepository<
    ShippingMethod,
    Prisma.ShippingMethodWhereInput,
    Prisma.ShippingMethodCreateInput,
    Prisma.ShippingMethodUpdateInput,
    Prisma.ShippingMethodOrderByWithRelationInput
> implements IShippingMethodRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.shippingMethod as any);
    }

    protected buildWhere(filter: ShippingMethodFilter): Prisma.ShippingMethodWhereInput {
        const where: Prisma.ShippingMethodWhereInput = {};

        if (filter.code) where.code = filter.code;
        if (filter.status) where.status = filter.status as any;
        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByCode(code: string): Promise<ShippingMethod | null> {
        return this.findOne({ code });
    }
}
