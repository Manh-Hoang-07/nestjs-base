import { Module } from '@nestjs/common';
import { RoleService } from '@/modules/core/iam/role/admin/services/role.service';
import { RoleController } from '@/modules/core/iam/role/admin/controllers/role.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';

@Module({
  imports: [
    RbacModule,
    RbacRepositoryModule,
  ],
  providers: [RoleService],
  controllers: [RoleController],
  exports: [RoleService],
})
export class AdminRoleModule { }




