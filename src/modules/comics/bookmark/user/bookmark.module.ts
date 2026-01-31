import { Module } from '@nestjs/common';
import { BookmarksController } from '@/modules/comics/bookmark/user/controllers/bookmarks.controller';
import { BookmarksService } from '@/modules/comics/bookmark/user/services/bookmarks.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class UserBookmarksModule { }



