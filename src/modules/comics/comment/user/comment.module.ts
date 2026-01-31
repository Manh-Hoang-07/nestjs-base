import { Module } from '@nestjs/common';
import { UserCommentsController } from './controllers/comments.controller';
import { UserCommentsService } from './services/comments.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Module({
  imports: [RbacModule],
  controllers: [UserCommentsController],
  providers: [UserCommentsService, ComicNotificationService],
  exports: [UserCommentsService],
})
export class UserCommentsModule { }
