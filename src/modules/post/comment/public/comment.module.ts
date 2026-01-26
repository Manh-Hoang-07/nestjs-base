import { Module } from '@nestjs/common';
import { PostCommentController } from './controllers/comment.controller';
import { PostCommentService } from './services/comment.service';
import { PostRepositoryModule } from '@/modules/post/post.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [
        RbacModule,
        PostRepositoryModule,
    ],
    controllers: [PostCommentController],
    providers: [PostCommentService],
    exports: [PostCommentService],
})
export class PublicPostCommentModule { }
