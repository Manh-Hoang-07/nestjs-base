import { Module } from '@nestjs/common';
import { GalleryService } from '@/modules/introduction/gallery/admin/services/gallery.service';
import { GalleryController } from '@/modules/introduction/gallery/admin/controllers/gallery.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { GalleryRepositoryModule } from '@/modules/introduction/gallery/gallery.repository.module';

@Module({
  imports: [
    RbacModule,
    GalleryRepositoryModule,
  ],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService],
})
export class AdminGalleryModule { }

