import { Module } from '@nestjs/common';
import { UserReviewController } from './controllers/review.controller';
import { ReviewService } from './services/review.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ProductReviewRepositoryModule } from '../product-review.repository.module';
import { ProductRepositoryModule } from '@/modules/ecommerce/product/product.repository.module';
import { OrderRepositoryModule } from '@/modules/ecommerce/order/order.repository.module';

@Module({
  imports: [
    ProductReviewRepositoryModule,
    ProductRepositoryModule,
    OrderRepositoryModule,
    RbacModule,
  ],
  controllers: [UserReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class UserReviewModule { }