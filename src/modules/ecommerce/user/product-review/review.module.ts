import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { ProductReview } from '@/shared/entities/product-review.entity';
import { Product } from '@/shared/entities/product.entity';
import { Order } from '@/shared/entities/order.entity';
import { OrderItem } from '@/shared/entities/order-item.entity';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductReview,
      Product,
      Order,
      OrderItem,
    ]),
    RbacModule,
  ],
  controllers: [UserReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class UserReviewModule { }