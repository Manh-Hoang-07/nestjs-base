import { Module } from '@nestjs/common';
import { MenuService } from '@/modules/core/menu/admin/services/menu.service';
import { AdminMenuController } from '@/modules/core/menu/admin/controllers/menu.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { MenuRepositoryModule } from '../menu.repository.module';

@Module({
  imports: [
    RbacModule,
    MenuRepositoryModule,
  ],
  controllers: [AdminMenuController],
  providers: [MenuService],
  exports: [MenuService, RbacModule, MenuRepositoryModule],
})
export class AdminMenuModule { }
