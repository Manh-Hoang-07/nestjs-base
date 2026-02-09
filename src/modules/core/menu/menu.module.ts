import { Module } from '@nestjs/common';
import { AdminMenuModule } from '@/modules/core/menu/admin/menu.module';
import { UserMenuModule } from '@/modules/core/menu/user/menu.module';
import { PublicMenuModule } from '@/modules/core/menu/public/menu.module';
import { MenuRepositoryModule } from './menu.repository.module';

@Module({
  imports: [
    MenuRepositoryModule,
    AdminMenuModule,
    UserMenuModule,
    PublicMenuModule,
  ],
})
export class MenuModule { }

