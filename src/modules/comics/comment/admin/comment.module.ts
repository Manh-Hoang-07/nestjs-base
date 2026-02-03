import { Module } from '@nestjs/common';
import { CommentsController } from './controllers/comments.controller';
import { CommentsService } from './services/comments.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { CommentRepositoryModule } from '../comment.repository.module';

@Module({
  imports: [
    RbacModule,
    CommentRepositoryModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class AdminCommentsModule { }



