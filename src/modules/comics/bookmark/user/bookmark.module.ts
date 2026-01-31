import { Module } from '@nestjs/common';
import { BookmarksController } from '@/modules/comics/user/bookmarks/controllers/bookmarks.controller';
import { BookmarksService } from '@/modules/comics/user/bookmarks/services/bookmarks.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [BookmarksController],
  providers: [BookmarksService],
  exports: [BookmarksService],
})
export class UserBookmarksModule {}



