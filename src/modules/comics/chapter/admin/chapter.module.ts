import { Module } from '@nestjs/common';
import { ChapterController } from './controllers/chapter.controller';
import { ChapterService } from './services/chapter.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { FileUploadModule } from '@/modules/storage/file-upload/file-upload.module';
import { ComicNotificationService } from '@/modules/comics/shared/services/comic-notification.service';
import { ChapterRepositoryModule } from '../chapter.repository.module';

@Module({
  imports: [
    RbacModule,
    FileUploadModule,
    ChapterRepositoryModule,
  ],
  controllers: [ChapterController],
  providers: [ChapterService, ComicNotificationService],
  exports: [ChapterService, ComicNotificationService],
})
export class AdminChapterModule { }
