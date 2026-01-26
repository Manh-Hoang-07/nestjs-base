import { Module } from '@nestjs/common';
import { PublicCertificateService } from '@/modules/introduction/certificate/public/services/certificate.service';
import { PublicCertificateController } from '@/modules/introduction/certificate/public/controllers/certificate.controller';

import { CertificateRepositoryModule } from '@/modules/introduction/certificate/certificate.repository.module';

@Module({
  imports: [CertificateRepositoryModule],
  controllers: [PublicCertificateController],
  providers: [PublicCertificateService],
  exports: [PublicCertificateService],
})
export class PublicCertificateModule { }

