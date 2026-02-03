import { Module } from '@nestjs/common';
import { ReviewsController } from './controllers/reviews.controller';
import { ReviewsService } from './services/reviews.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ReviewRepositoryModule } from '../review.repository.module';

@Module({
  imports: [
    RbacModule,
    ReviewRepositoryModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class AdminReviewsModule { }



