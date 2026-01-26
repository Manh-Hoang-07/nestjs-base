import { Module } from '@nestjs/common';
import { PostTagController } from '@/modules/post/post-tag/public/controllers/post-tag.controller';
import { PostTagService } from '@/modules/post/post-tag/public/services/post-tag.service';
import { PostRepositoryModule } from '@/modules/post/post.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [RbacModule, PostRepositoryModule],
  controllers: [PostTagController],
  providers: [PostTagService],
  exports: [PostTagService],
})
export class PublicPostTagModule { }
