import { Module } from '@nestjs/common';
import { PublicReviewsController } from '@/modules/comics/public/reviews/controllers/reviews.controller';
import { PublicReviewsService } from '@/modules/comics/public/reviews/services/reviews.service';

@Module({
  imports: [],
  controllers: [PublicReviewsController],
  providers: [PublicReviewsService],
  exports: [PublicReviewsService],
})
export class PublicReviewsModule {}
