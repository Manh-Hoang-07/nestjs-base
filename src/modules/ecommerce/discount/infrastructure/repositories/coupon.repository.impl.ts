import { Injectable } from '@nestjs/common';
import { Coupon, CouponUsage, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { ICouponRepository, ICouponUsageRepository } from '../../domain/coupon.repository';

@Injectable()
export class CouponRepositoryImpl
    extends PrismaRepository<Coupon>
    implements ICouponRepository {
    constructor(private readonly prismaService: PrismaService) {
        super(prismaService.coupon as any);
    }

    async findByCode(code: string): Promise<Coupon | null> {
        return this.prismaService.coupon.findUnique({
            where: { code, deleted_at: null },
        });
    }

    async incrementUsedCount(id: number | bigint): Promise<void> {
        await this.prismaService.coupon.update({
            where: { id: BigInt(id) },
            data: {
                used_count: { increment: 1 }
            }
        });
    }

    protected override buildWhere(filter: any): Prisma.CouponWhereInput {
        const where: Prisma.CouponWhereInput = {
            deleted_at: null,
        };
        if (filter.code) where.code = filter.code;
        return where;
    }
}

@Injectable()
export class CouponUsageRepositoryImpl
    extends PrismaRepository<CouponUsage>
    implements ICouponUsageRepository {
    constructor(private readonly prismaService: PrismaService) {
        super(prismaService.couponUsage as any);
    }

    async findByUser(couponId: number | bigint, userId: number | bigint): Promise<CouponUsage[]> {
        return this.prismaService.couponUsage.findMany({
            where: {
                coupon_id: BigInt(couponId),
                user_id: BigInt(userId),
            },
        });
    }

    protected override buildWhere(filter: any): Prisma.CouponUsageWhereInput {
        const where: Prisma.CouponUsageWhereInput = {};
        if (filter.coupon_id) where.coupon_id = BigInt(filter.coupon_id);
        if (filter.user_id) where.user_id = BigInt(filter.user_id);
        return where;
    }
}
