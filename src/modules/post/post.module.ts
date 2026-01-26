import { Module } from '@nestjs/common';
import { PostRepositoryModule } from './post.repository.module';

// Import shared services
import { PostService } from '@/modules/post/post/admin/services/post.service';
import { PostCategoryService } from '@/modules/post/post-category/admin/services/post-category.service';
import { PostTagService } from '@/modules/post/post-tag/admin/services/post-tag.service';
import { AdminPostCommentService } from '@/modules/post/comment/admin/services/comment.service';
import { PostCommentService } from '@/modules/post/comment/public/services/comment.service';
import { PostViewCronService } from '@/modules/post/cron/post-view-cron.service';

// Import admin modules
import { AdminPostModule } from '@/modules/post/post/admin/post.module';
import { AdminPostCategoryModule } from '@/modules/post/post-category/admin/post-category.module';
import { AdminPostTagModule } from '@/modules/post/post-tag/admin/post-tag.module';

// Import public modules
import { PublicPostModule } from '@/modules/post/post/public/post.module';
import { PublicPostCategoryModule } from '@/modules/post/post-category/public/post-category.module';
import { PublicPostTagModule } from '@/modules/post/post-tag/public/post-tag.module';
import { AdminPostCommentModule } from '@/modules/post/comment/admin/comment.module';
import { PublicPostCommentModule } from '@/modules/post/comment/public/comment.module';

@Module({
  imports: [
    PostRepositoryModule,
    // Admin modules
    AdminPostModule,
    AdminPostCategoryModule,
    AdminPostTagModule,
    // Public modules
    PublicPostModule,
    PublicPostCategoryModule,
    PublicPostTagModule,
    AdminPostCommentModule,
    PublicPostCommentModule,
  ],
  providers: [
    // Shared services
    PostService,
    PostCategoryService,
    PostTagService,
    AdminPostCommentService,
    PostCommentService,
    PostViewCronService,
  ],
  exports: [
    // Export shared services for other modules to use
    PostService,
    PostCategoryService,
    PostTagService,
    AdminPostCommentService,
    PostCommentService,
  ],
})
export class PostModule { }
