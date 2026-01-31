import { Module } from '@nestjs/common';
import { PublicReviewsController } from './controllers/reviews.controller';
import { PublicReviewsService } from './services/reviews.service';

@Module({
  imports: [],
  controllers: [PublicReviewsController],
  providers: [PublicReviewsService],
  exports: [PublicReviewsService],
})
export class PublicReviewsModule {}
