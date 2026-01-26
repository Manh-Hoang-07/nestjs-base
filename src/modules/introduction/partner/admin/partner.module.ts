import { Module } from '@nestjs/common';
import { PartnerService } from '@/modules/introduction/partner/admin/services/partner.service';
import { PartnerController } from '@/modules/introduction/partner/admin/controllers/partner.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

import { PartnerRepositoryModule } from '@/modules/introduction/partner/partner.repository.module';

@Module({
  imports: [
    RbacModule,
    PartnerRepositoryModule,
  ],
  controllers: [PartnerController],
  providers: [PartnerService],
  exports: [PartnerService],
})
export class AdminPartnerModule { }

