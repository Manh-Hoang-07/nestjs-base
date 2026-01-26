import { Module } from '@nestjs/common';

// Import admin modules
import { AdminContactModule } from '@/modules/introduction/contact/admin/contact.module';

// Import public modules
import { PublicContactModule } from '@/modules/introduction/contact/public/contact.module';
import { ContactRepositoryModule } from './contact.repository.module';

@Module({
  imports: [
    ContactRepositoryModule,
    // Admin modules
    AdminContactModule,
    // Public modules
    PublicContactModule,
  ],
  exports: [],
})
export class ContactModule { }

