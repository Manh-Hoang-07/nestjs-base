import { Module } from '@nestjs/common';
import { COUPON_REPOSITORY } from './domain/coupon.repository';
import { CouponRepositoryImpl } from './infrastructure/repositories/coupon.repository.impl';

@Module({
    providers: [
        {
            provide: COUPON_REPOSITORY,
            useClass: CouponRepositoryImpl,
        },
    ],
    exports: [COUPON_REPOSITORY],
})
export class CouponRepositoryModule { }
