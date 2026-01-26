import { Module } from '@nestjs/common';

// Import admin modules
import { AdminPartnerModule } from '@/modules/introduction/partner/admin/partner.module';

// Import public modules
import { PublicPartnerModule } from '@/modules/introduction/partner/public/partner.module';
import { PartnerRepositoryModule } from './partner.repository.module';

@Module({
  imports: [
    PartnerRepositoryModule,
    // Admin modules
    AdminPartnerModule,
    // Public modules
    PublicPartnerModule,
  ],
  exports: [],
})
export class PartnerModule { }

