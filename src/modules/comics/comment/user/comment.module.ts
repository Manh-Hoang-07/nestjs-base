import { Module } from '@nestjs/common';
import { UserCommentsController } from '@/modules/comics/user/comments/controllers/comments.controller';
import { UserCommentsService } from '@/modules/comics/user/comments/services/comments.service';
import { RbacModule } from '@/modules/rbac/rbac.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [UserCommentsController],
  providers: [UserCommentsService, ComicNotificationService],
  exports: [UserCommentsService],
})
export class UserCommentsModule {}

