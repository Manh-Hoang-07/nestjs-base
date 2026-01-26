import { Global, Module } from '@nestjs/common';
import { PARTNER_REPOSITORY } from './domain/partner.repository';
import { PartnerRepositoryImpl } from './infrastructure/repositories/partner.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: PARTNER_REPOSITORY,
            useClass: PartnerRepositoryImpl,
        },
    ],
    exports: [PARTNER_REPOSITORY],
})
export class PartnerRepositoryModule { }
