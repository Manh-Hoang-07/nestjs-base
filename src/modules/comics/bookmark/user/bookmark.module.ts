import { Module } from '@nestjs/common';
import { BookmarksController } from '@/modules/comics/bookmark/user/controllers/bookmarks.controller';
import { BookmarksService } from '@/modules/comics/bookmark/user/services/bookmarks.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { BookmarkRepositoryModule } from '../bookmark.repository.module';

@Module({
  imports: [
    RbacModule,
    BookmarkRepositoryModule,
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class UserBookmarksModule { }



