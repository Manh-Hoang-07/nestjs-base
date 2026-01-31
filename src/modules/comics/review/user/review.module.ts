import { Module } from '@nestjs/common';
import { ReviewsController } from '@/modules/comics/user/reviews/controllers/reviews.controller';
import { ReviewsService } from '@/modules/comics/user/reviews/services/reviews.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class UserReviewsModule {}



