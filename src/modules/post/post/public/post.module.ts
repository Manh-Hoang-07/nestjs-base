import { Module } from '@nestjs/common';
import { PostController } from '@/modules/post/post/public/controllers/post.controller';
import { PostService } from '@/modules/post/post/public/services/post.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { PostRepositoryModule } from '../../post.repository.module';

@Module({
  imports: [RbacModule, PostRepositoryModule],
  controllers: [PostController],
  providers: [PostService],
  exports: [PostService],
})
export class PublicPostModule { }
