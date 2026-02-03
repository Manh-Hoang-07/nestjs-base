import { Module } from '@nestjs/common';
import { UserCommentsController } from './controllers/comments.controller';
import { UserCommentsService } from './services/comments.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ComicNotificationService } from '@/modules/comics/shared/services/comic-notification.service';
import { CommentRepositoryModule } from '../comment.repository.module';
import { FollowRepositoryModule } from '@/modules/comics/follow/follow.repository.module';
import { NotificationRepositoryModule } from '@/modules/core/notification/notification.repository.module';

@Module({
  imports: [
    RbacModule,
    CommentRepositoryModule,
    FollowRepositoryModule,
    NotificationRepositoryModule,
  ],
  controllers: [UserCommentsController],
  providers: [UserCommentsService, ComicNotificationService],
  exports: [UserCommentsService],
})
export class UserCommentsModule { }
