import { Module } from '@nestjs/common';
import { CommentsController } from '@/modules/comics/admin/comments/controllers/comments.controller';
import { CommentsService } from '@/modules/comics/admin/comments/services/comments.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class AdminCommentsModule {}



