import { Module } from '@nestjs/common';
import { PublicChaptersController } from '@/modules/comics/chapter/public/controllers/chapter.controller';
import { PublicChaptersService } from '@/modules/comics/chapter/public/services/chapter.service';
import { ViewTrackingService } from '@/modules/comics/shared/services/view-tracking.service';
import { ChapterRepositoryModule } from '../chapter.repository.module';

@Module({
  imports: [ChapterRepositoryModule],
  controllers: [PublicChaptersController],
  providers: [PublicChaptersService, ViewTrackingService],
  exports: [PublicChaptersService, ViewTrackingService],
})
export class PublicChaptersModule { }

