import { Module } from '@nestjs/common';

// Import admin modules
import { AdminAboutModule } from '@/modules/introduction/about/admin/about.module';

// Import public modules
import { PublicAboutModule } from '@/modules/introduction/about/public/about.module';

@Module({
  imports: [
    // Admin modules
    AdminAboutModule,
    // Public modules
    PublicAboutModule,
  ],
  exports: [],
})
export class AboutModule {}

