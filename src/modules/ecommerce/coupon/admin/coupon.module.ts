import { Module } from '@nestjs/common';
import { AdminCouponService } from './services/coupon.service';
import { AdminCouponController } from './controllers/coupon.controller';
import { CouponRepositoryModule } from '../coupon.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    CouponRepositoryModule,
    RbacModule,
  ],
  controllers: [AdminCouponController],
  providers: [AdminCouponService],
  exports: [AdminCouponService],
})
export class AdminCouponModule { }