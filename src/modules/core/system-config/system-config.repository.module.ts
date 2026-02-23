import { Global, Module, Provider } from '@nestjs/common';
import { GENERAL_CONFIG_REPOSITORY } from './general/domain/repositories/general-config.repository';
import { GeneralConfigRepositoryImpl } from './general/infrastructure/repositories/general-config.repository.impl';
import { EMAIL_CONFIG_REPOSITORY } from './email/domain/repositories/email-config.repository';
import { EmailConfigRepositoryImpl } from './email/infrastructure/repositories/email-config.repository.impl';

const repositories: Provider[] = [
    {
        provide: GENERAL_CONFIG_REPOSITORY,
        useClass: GeneralConfigRepositoryImpl,
    },
    {
        provide: EMAIL_CONFIG_REPOSITORY,
        useClass: EmailConfigRepositoryImpl,
    },
];

@Global()
@Module({
    providers: [...repositories],
    exports: [...repositories],
})
export class SystemConfigRepositoryModule { }
