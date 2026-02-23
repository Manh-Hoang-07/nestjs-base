import { Module } from '@nestjs/common';
import { GeneralConfigModule } from './general/general-config.module';
import { EmailConfigModule } from './email/email-config.module';

@Module({
  imports: [
    GeneralConfigModule,
    EmailConfigModule,
  ],
  exports: [
    GeneralConfigModule,
    EmailConfigModule,
  ],
})
export class SystemConfigModule { }
