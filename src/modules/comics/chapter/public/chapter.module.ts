import { Module } from '@nestjs/common';
import { PublicChaptersController } from '@/modules/comics/public/chapters/controllers/chapters.controller';
import { PublicChaptersService } from '@/modules/comics/public/chapters/services/chapters.service';
import { ViewTrackingService } from '@/modules/comics/core/services/view-tracking.service';

@Module({
  imports: [],
  controllers: [PublicChaptersController],
  providers: [PublicChaptersService, ViewTrackingService],
  exports: [PublicChaptersService, ViewTrackingService],
})
export class PublicChaptersModule {}

