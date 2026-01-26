import { Global, Module, Provider } from '@nestjs/common';
import { GENERAL_CONFIG_REPOSITORY } from './system-config/domain/general-config.repository';
import { GeneralConfigRepositoryImpl } from './system-config/infrastructure/repositories/general-config.repository.impl';
import { EMAIL_CONFIG_REPOSITORY } from './system-config/domain/email-config.repository';
import { EmailConfigRepositoryImpl } from './system-config/infrastructure/repositories/email-config.repository.impl';

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
