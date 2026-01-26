import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '@/shared/entities/coupon.entity';
import { CouponUsage } from '@/shared/entities/coupon-usage.entity';
import { AdminCouponController } from './controllers/coupon.controller';
import { AdminCouponService } from './services/coupon.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, CouponUsage]),
    RbacModule,
  ],
  controllers: [AdminCouponController],
  providers: [AdminCouponService],
  exports: [AdminCouponService],
})
export class AdminCouponModule { }