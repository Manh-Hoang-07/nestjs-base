import { Coupon } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const COUPON_REPOSITORY = 'ICouponRepository';

export interface CouponFilter {
    search?: string;
    code?: string;
    status?: 'active' | 'inactive';
    deleted_at?: Date | null;
}

export interface ICouponRepository extends IRepository<Coupon> {
    findByCode(code: string): Promise<Coupon | null>;
}


