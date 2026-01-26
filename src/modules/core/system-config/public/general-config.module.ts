import { Module } from '@nestjs/common';
import { PublicGeneralConfigController } from './controllers/general-config.controller';
import { PublicGeneralConfigService } from './services/general-config.service';

import { SystemConfigRepositoryModule } from '../system-config.repository.module';

@Module({
  imports: [SystemConfigRepositoryModule],
  controllers: [PublicGeneralConfigController],
  providers: [PublicGeneralConfigService],
  exports: [PublicGeneralConfigService],
})
export class PublicGeneralConfigModule { }
