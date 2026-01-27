import { Module } from '@nestjs/common';
import { COUPON_REPOSITORY, COUPON_USAGE_REPOSITORY } from './domain/coupon.repository';
import { CouponRepositoryImpl, CouponUsageRepositoryImpl } from './infrastructure/repositories/coupon.repository.impl';
import { PrismaModule } from '@/core/database/prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [
        {
            provide: COUPON_REPOSITORY,
            useClass: CouponRepositoryImpl,
        },
        {
            provide: COUPON_USAGE_REPOSITORY,
            useClass: CouponUsageRepositoryImpl,
        },
    ],
    exports: [COUPON_REPOSITORY, COUPON_USAGE_REPOSITORY],
})
export class DiscountRepositoryModule { }
