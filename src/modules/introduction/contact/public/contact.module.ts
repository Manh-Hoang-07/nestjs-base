import { Module } from '@nestjs/common';
import { PublicContactService } from '@/modules/introduction/contact/public/services/contact.service';
import { PublicContactController } from '@/modules/introduction/contact/public/controllers/contact.controller';

import { ContactRepositoryModule } from '@/modules/introduction/contact/contact.repository.module';

@Module({
  imports: [ContactRepositoryModule],
  controllers: [PublicContactController],
  providers: [PublicContactService],
  exports: [PublicContactService],
})
export class PublicContactModule { }

