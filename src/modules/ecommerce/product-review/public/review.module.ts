import { Module } from '@nestjs/common';
import { PublicReviewController } from './controllers/review.controller';
import { PublicReviewService } from './services/review.service';
import { ProductReviewRepositoryModule } from '../product-review.repository.module';
import { ProductRepositoryModule } from '@/modules/ecommerce/product/product.repository.module';

@Module({
  imports: [
    ProductReviewRepositoryModule,
    ProductRepositoryModule,
  ],
  controllers: [PublicReviewController],
  providers: [PublicReviewService],
  exports: [PublicReviewService],
})
export class PublicReviewModule { }