import { Global, Module } from '@nestjs/common';
import { CERTIFICATE_REPOSITORY } from './domain/certificate.repository';
import { CertificateRepositoryImpl } from './infrastructure/repositories/certificate.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: CERTIFICATE_REPOSITORY,
            useClass: CertificateRepositoryImpl,
        },
    ],
    exports: [CERTIFICATE_REPOSITORY],
})
export class CertificateRepositoryModule { }
