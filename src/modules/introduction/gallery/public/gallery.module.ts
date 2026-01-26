import { Module } from '@nestjs/common';
import { PublicGalleryService } from '@/modules/introduction/gallery/public/services/gallery.service';
import { PublicGalleryController } from '@/modules/introduction/gallery/public/controllers/gallery.controller';

import { GalleryRepositoryModule } from '@/modules/introduction/gallery/gallery.repository.module';

@Module({
  imports: [GalleryRepositoryModule],
  controllers: [PublicGalleryController],
  providers: [PublicGalleryService],
  exports: [PublicGalleryService],
})
export class PublicGalleryModule { }

