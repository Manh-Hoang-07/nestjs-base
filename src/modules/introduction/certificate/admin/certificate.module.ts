import { Module } from '@nestjs/common';
import { CertificateService } from '@/modules/introduction/certificate/admin/services/certificate.service';
import { CertificateController } from '@/modules/introduction/certificate/admin/controllers/certificate.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { CertificateRepositoryModule } from '@/modules/introduction/certificate/certificate.repository.module';

@Module({
  imports: [
    RbacModule,
    CertificateRepositoryModule,
  ],
  controllers: [CertificateController],
  providers: [CertificateService],
  exports: [CertificateService],
})
export class AdminCertificateModule { }

