import { Module } from '@nestjs/common';
import { GeneralConfigController as AdminGeneralConfigController } from './admin/controllers/general-config.controller';
import { GeneralConfigService as AdminGeneralConfigService } from './admin/services/general-config.service';
import { PublicGeneralConfigController } from './public/controllers/general-config.controller';
import { PublicGeneralConfigService } from './public/services/general-config.service';
import { SystemConfigRepositoryModule } from '../system-config.repository.module';

@Module({
    imports: [SystemConfigRepositoryModule],
    controllers: [AdminGeneralConfigController, PublicGeneralConfigController],
    providers: [AdminGeneralConfigService, PublicGeneralConfigService],
    exports: [AdminGeneralConfigService, PublicGeneralConfigService],
})
export class GeneralConfigModule { }
