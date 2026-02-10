import { Module } from '@nestjs/common';
import { UserPostCommentsController } from './controllers/comments.controller';
import { UserPostCommentsService } from './services/comments.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { PostNotificationService } from '@/modules/post/shared/services/post-notification.service';
import { PostRepositoryModule } from '@/modules/post/post.repository.module';
import { NotificationRepositoryModule } from '@/modules/core/notification/notification.repository.module';

@Module({
    imports: [
        RbacModule,
        PostRepositoryModule,
        NotificationRepositoryModule,
    ],
    controllers: [UserPostCommentsController],
    providers: [UserPostCommentsService, PostNotificationService],
    exports: [UserPostCommentsService],
})
export class UserPostCommentsModule { }
