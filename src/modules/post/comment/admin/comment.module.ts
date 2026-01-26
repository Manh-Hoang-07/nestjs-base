import { Module } from '@nestjs/common';
import { AdminPostCommentController } from './controllers/comment.controller';
import { AdminPostCommentService } from './services/comment.service';
import { PostRepositoryModule } from '@/modules/post/post.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [RbacModule, PostRepositoryModule],
    controllers: [AdminPostCommentController],
    providers: [AdminPostCommentService],
    exports: [AdminPostCommentService],
})
export class AdminPostCommentModule { }
