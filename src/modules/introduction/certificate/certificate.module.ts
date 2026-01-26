import { Module } from '@nestjs/common';

// Import admin modules
import { AdminCertificateModule } from '@/modules/introduction/certificate/admin/certificate.module';

// Import public modules
import { PublicCertificateModule } from '@/modules/introduction/certificate/public/certificate.module';

// Import repository module
import { CertificateRepositoryModule } from './certificate.repository.module';

@Module({
  imports: [
    // Admin modules
    AdminCertificateModule,
    // Public modules
    PublicCertificateModule,
    // Repository module
    CertificateRepositoryModule,
  ],
  exports: [CertificateRepositoryModule],
})
export class CertificateModule { }

