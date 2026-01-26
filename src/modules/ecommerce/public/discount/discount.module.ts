import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coupon } from '@/shared/entities/coupon.entity';
import { CouponUsage } from '@/shared/entities/coupon-usage.entity';
import { Order } from '@/shared/entities/order.entity';
import { CartHeader } from '@/shared/entities/cart-header.entity';
import { Cart } from '@/shared/entities/cart.entity';
import { PublicDiscountController } from './controllers/discount.controller';
import { DiscountService } from './services/discount.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { PublicCartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Coupon, CouponUsage, Order, CartHeader, Cart]),
    RbacModule,
    forwardRef(() => PublicCartModule),
  ],
  controllers: [PublicDiscountController],
  providers: [DiscountService],
  exports: [DiscountService],
})
export class PublicDiscountModule { }