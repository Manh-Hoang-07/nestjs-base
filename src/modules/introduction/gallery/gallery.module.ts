import { Module } from '@nestjs/common';

// Import admin modules
import { AdminGalleryModule } from '@/modules/introduction/gallery/admin/gallery.module';

// Import public modules
import { PublicGalleryModule } from '@/modules/introduction/gallery/public/gallery.module';

// Import repository module
import { GalleryRepositoryModule } from './gallery.repository.module';

@Module({
  imports: [
    // Admin modules
    AdminGalleryModule,
    // Public modules
    PublicGalleryModule,
    // Repository module
    GalleryRepositoryModule,
  ],
  exports: [GalleryRepositoryModule],
})
export class GalleryModule { }

