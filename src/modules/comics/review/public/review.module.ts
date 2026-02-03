import { Module } from '@nestjs/common';
import { PublicReviewsController } from './controllers/reviews.controller';
import { PublicReviewsService } from './services/reviews.service';
import { ReviewRepositoryModule } from '../review.repository.module';

@Module({
  imports: [ReviewRepositoryModule],
  controllers: [PublicReviewsController],
  providers: [PublicReviewsService],
  exports: [PublicReviewsService],
})
export class PublicReviewsModule { }
