import { Coupon, CouponUsage } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COUPON_REPOSITORY = 'ICouponRepository';
export const COUPON_USAGE_REPOSITORY = 'ICouponUsageRepository';

export interface ICouponRepository extends IRepository<Coupon> {
    findByCode(code: string): Promise<Coupon | null>;
    incrementUsedCount(id: number | bigint): Promise<void>;
}

export interface ICouponUsageRepository extends IRepository<CouponUsage> {
    findByUser(couponId: number | bigint, userId: number | bigint): Promise<CouponUsage[]>;
}


