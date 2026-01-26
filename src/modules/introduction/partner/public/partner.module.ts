import { Module } from '@nestjs/common';
import { PublicPartnerService } from '@/modules/introduction/partner/public/services/partner.service';
import { PublicPartnerController } from '@/modules/introduction/partner/public/controllers/partner.controller';

import { PartnerRepositoryModule } from '@/modules/introduction/partner/partner.repository.module';

@Module({
  imports: [PartnerRepositoryModule],
  controllers: [PublicPartnerController],
  providers: [PublicPartnerService],
  exports: [PublicPartnerService],
})
export class PublicPartnerModule { }

