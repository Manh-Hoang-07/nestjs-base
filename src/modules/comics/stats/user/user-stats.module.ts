import { Module } from '@nestjs/common';
import { UserStatsController } from './controllers/user-stats.controller';
import { UserStatsService } from './services/user-stats.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ReadingHistoryRepositoryModule } from '../../reading-history/reading-history.repository.module';
import { FollowRepositoryModule } from '../../follow/follow.repository.module';
import { BookmarkRepositoryModule } from '../../bookmark/bookmark.repository.module';

@Module({
  imports: [
    RbacModule,
    ReadingHistoryRepositoryModule,
    FollowRepositoryModule,
    BookmarkRepositoryModule,
  ],
  controllers: [UserStatsController],
  providers: [UserStatsService],
  exports: [UserStatsService],
})
export class UserStatsModule { }



