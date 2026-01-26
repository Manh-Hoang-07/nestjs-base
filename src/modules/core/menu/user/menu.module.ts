import { Module } from '@nestjs/common';
import { UserMenuController } from '@/modules/core/menu/user/controllers/menu.controller';
import { AdminMenuModule } from '@/modules/core/menu/admin/menu.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    AdminMenuModule,
  ],
  controllers: [UserMenuController],
})
export class UserMenuModule {}
