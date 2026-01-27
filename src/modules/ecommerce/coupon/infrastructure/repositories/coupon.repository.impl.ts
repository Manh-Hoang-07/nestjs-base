import { Injectable } from '@nestjs/common';
import { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICouponRepository, CouponFilter } from '../../domain/coupon.repository';

@Injectable()
export class CouponRepositoryImpl extends PrismaRepository<
    Coupon,
    Prisma.CouponWhereInput,
    Prisma.CouponCreateInput,
    Prisma.CouponUpdateInput,
    Prisma.CouponOrderByWithRelationInput
> implements ICouponRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.coupon as any);
    }

    protected buildWhere(filter: CouponFilter): Prisma.CouponWhereInput {
        const where: Prisma.CouponWhereInput = {};

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

    async findByCode(code: string): Promise<Coupon | null> {
        return this.findOne({ code });
    }
}
