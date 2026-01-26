import { Module } from '@nestjs/common';
import { AdminSystemConfigModule } from './admin/system-config.module';
import { PublicGeneralConfigModule } from './public/general-config.module';

@Module({
  imports: [
    AdminSystemConfigModule,
    PublicGeneralConfigModule,
  ],
  exports: [],
})
export class SystemConfigModule {}
