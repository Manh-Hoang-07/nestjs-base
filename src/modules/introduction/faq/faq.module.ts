import { Module } from '@nestjs/common';

// Import admin modules
import { AdminFaqModule } from '@/modules/introduction/faq/admin/faq.module';

// Import public modules
import { PublicFaqModule } from '@/modules/introduction/faq/public/faq.module';

// Import repository module
import { FaqRepositoryModule } from './faq.repository.module';

@Module({
  imports: [
    // Admin modules
    AdminFaqModule,
    // Public modules
    PublicFaqModule,
    // Repository module
    FaqRepositoryModule,
  ],
  exports: [FaqRepositoryModule],
})
export class FaqModule { }

