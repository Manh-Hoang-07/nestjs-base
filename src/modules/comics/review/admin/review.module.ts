import { Module } from '@nestjs/common';
import { ReviewsController } from '@/modules/comics/admin/reviews/controllers/reviews.controller';
import { ReviewsService } from '@/modules/comics/admin/reviews/services/reviews.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class AdminReviewsModule {}



