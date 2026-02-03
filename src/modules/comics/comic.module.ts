import { Module } from '@nestjs/common';

// Import comic feature modules
import { AdminComicModule } from '@/modules/comics/comic/admin/comic.module';
import { PublicComicsModule } from '@/modules/comics/comic/public/comic.module';

// Import comic-category feature modules
import { AdminComicCategoryModule } from '@/modules/comics/comic-category/admin/comic-category.module';
import { PublicComicCategoriesModule } from '@/modules/comics/comic-category/public/comic-category.module';

// Import chapter feature modules
import { AdminChapterModule } from '@/modules/comics/chapter/admin/chapter.module';
import { PublicChaptersModule } from '@/modules/comics/chapter/public/chapter.module';

// Import comment feature modules
import { AdminCommentsModule } from '@/modules/comics/comment/admin/comment.module';
import { PublicCommentsModule } from '@/modules/comics/comment/public/comment.module';
import { UserCommentsModule } from '@/modules/comics/comment/user/comment.module';

// Import review feature modules
import { AdminReviewsModule } from '@/modules/comics/review/admin/review.module';
import { PublicReviewsModule } from '@/modules/comics/review/public/review.module';
import { UserReviewsModule } from '@/modules/comics/review/user/review.module';

// Import other modules

// Import stats feature modules
import { AdminStatsModule } from '@/modules/comics/stats/admin/admin-stats.module';
import { UserStatsModule } from '@/modules/comics/stats/user/user-stats.module';
import { PublicStatsModule } from '@/modules/comics/stats/public/public-stats.module';
import { HomepageModule } from '@/modules/comics/homepage/public/homepage.module';
import { UserReadingHistoryModule } from '@/modules/comics/reading-history/user/reading-history.module';
import { UserBookmarksModule } from '@/modules/comics/bookmark/user/bookmark.module';
import { UserFollowsModule } from '@/modules/comics/follow/user/follow.module';
import { FollowRepositoryModule } from '@/modules/comics/follow/follow.repository.module';
import { CommentRepositoryModule } from '@/modules/comics/comment/comment.repository.module';
import { NotificationRepositoryModule } from '@/modules/core/notification/notification.repository.module';

import { ComicNotificationService } from '@/modules/comics/shared/services/comic-notification.service';
@Module({
  imports: [
    // Comic
    AdminComicModule,
    PublicComicsModule,

    // Category
    AdminComicCategoryModule,
    PublicComicCategoriesModule,

    // Chapter
    AdminChapterModule,
    PublicChaptersModule,

    // Comment
    AdminCommentsModule,
    PublicCommentsModule,
    UserCommentsModule,

    // Review
    AdminReviewsModule,
    PublicReviewsModule,
    UserReviewsModule,

    // Others

    // Stats
    AdminStatsModule,
    UserStatsModule,
    PublicStatsModule,

    HomepageModule,
    UserReadingHistoryModule,
    UserBookmarksModule,
    UserFollowsModule,
    FollowRepositoryModule,
    CommentRepositoryModule,
    NotificationRepositoryModule,
  ],
  providers: [
    ComicNotificationService,
  ],
  exports: [
    ComicNotificationService,
  ],
})
export class ComicsModule { }

