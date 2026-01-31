import { Module } from '@nestjs/common';

// Import comic feature modules
import { AdminComicModule } from '@/modules/comics/comic/admin/comic.module';
import { PublicComicModule } from '@/modules/comics/comic/public/comic.module';

// Import comic-category feature modules
import { AdminComicCategoryModule } from '@/modules/comics/comic-category/admin/comic-category.module';
import { PublicComicCategoryModule } from '@/modules/comics/comic-category/public/comic-category.module';

// Import chapter feature modules
import { AdminChapterModule } from '@/modules/comics/chapter/admin/chapter.module';
import { PublicChapterModule } from '@/modules/comics/chapter/public/chapter.module';

// Import comment feature modules
import { AdminCommentModule } from '@/modules/comics/comment/admin/comment.module';
import { PublicCommentModule } from '@/modules/comics/comment/public/comment.module';
import { UserCommentModule } from '@/modules/comics/comment/user/comment.module';

// Import review feature modules
import { AdminReviewModule } from '@/modules/comics/review/admin/review.module';
import { PublicReviewModule } from '@/modules/comics/review/public/review.module';
import { UserReviewModule } from '@/modules/comics/review/user/review.module';

// Import other modules
import { ModerationModule } from '@/modules/comics/moderation/admin/moderation.module';
import { AnalyticsModule } from '@/modules/comics/analytics/admin/analytics.module';
import { StatsModule } from '@/modules/comics/stats/public/stats.module';
import { HomepageModule } from '@/modules/comics/homepage/public/homepage.module';
import { UserReadingHistoryModule } from '@/modules/comics/reading-history/user/reading-history.module';
import { UserBookmarkModule } from '@/modules/comics/bookmark/user/bookmark.module';
import { UserFollowModule } from '@/modules/comics/follow/user/follow.module';
import { DashboardModule } from '@/modules/comics/dashboard/user/dashboard.module';

import { ComicNotificationService } from '@/modules/comics/core/services/comic-notification.service';

@Module({
  imports: [
    // Comic
    AdminComicModule,
    PublicComicModule,

    // Category
    AdminComicCategoryModule,
    PublicComicCategoryModule,

    // Chapter
    AdminChapterModule,
    PublicChapterModule,

    // Comment
    AdminCommentModule,
    PublicCommentModule,
    UserCommentModule,

    // Review
    AdminReviewModule,
    PublicReviewModule,
    UserReviewModule,

    // Others
    ModerationModule,
    AnalyticsModule,
    StatsModule,
    HomepageModule,
    UserReadingHistoryModule,
    UserBookmarkModule,
    UserFollowModule,
    DashboardModule,
  ],
  providers: [
    ComicNotificationService,
  ],
  exports: [
    ComicNotificationService,
  ],
})
export class ComicsModule { }

