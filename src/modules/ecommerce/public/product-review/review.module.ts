import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReview } from '@/shared/entities/product-review.entity';
import { Product } from '@/shared/entities/product.entity';
import { PublicReviewController } from './controllers/review.controller';
import { PublicReviewService } from './services/review.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductReview, Product]),
  ],
  controllers: [PublicReviewController],
  providers: [PublicReviewService],
  exports: [PublicReviewService],
})
export class PublicReviewModule {}