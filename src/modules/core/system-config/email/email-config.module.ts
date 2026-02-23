import { Module } from '@nestjs/common';
import { EmailConfigController as AdminEmailConfigController } from './admin/controllers/email-config.controller';
import { EmailConfigService as AdminEmailConfigService } from './admin/services/email-config.service';
import { SystemConfigRepositoryModule } from '../system-config.repository.module';

@Module({
    imports: [SystemConfigRepositoryModule],
    controllers: [AdminEmailConfigController],
    providers: [AdminEmailConfigService],
    exports: [AdminEmailConfigService],
})
export class EmailConfigModule { }
