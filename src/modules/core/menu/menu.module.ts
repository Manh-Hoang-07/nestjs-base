import { Module } from '@nestjs/common';
import { AdminMenuModule } from '@/modules/core/menu/admin/menu.module';
import { UserMenuModule } from '@/modules/core/menu/user/menu.module';
import { MenuRepositoryModule } from './menu.repository.module';

@Module({
  imports: [
    MenuRepositoryModule,
    AdminMenuModule,
    UserMenuModule,
  ],
})
export class MenuModule { }

