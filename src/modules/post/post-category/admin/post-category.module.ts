import { Module } from '@nestjs/common';
import { PostCategoryController } from '@/modules/post/post-category/admin/controllers/post-category.controller';
import { PostCategoryService } from '@/modules/post/post-category/admin/services/post-category.service';
import { PostRepositoryModule } from '@/modules/post/post.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [RbacModule, PostRepositoryModule],
  controllers: [PostCategoryController],
  providers: [PostCategoryService],
  exports: [PostCategoryService],
})
export class AdminPostCategoryModule { }
