import { Module } from '@nestjs/common';
// Import shared services
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';

// Import admin modules
import { AdminUserModule } from '@/modules/core/iam/user/admin/user.module';
import { AdminRoleModule } from '@/modules/core/iam/role/admin/role.module';
import { AdminPermissionModule } from '@/modules/core/iam/permission/admin/permission.module';

// Import user modules
import { UserRepositoryModule } from './user.repository.module';
import { UserProfileModule } from '@/modules/core/iam/user/user/user.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    // Admin modules
    AdminUserModule,
    AdminRoleModule,
    AdminPermissionModule,
    // User modules
    UserRepositoryModule,
    UserProfileModule,
    // Shared modules
    RbacModule,
  ],
  providers: [
    // Shared services
    UserService,
  ],
  exports: [
    // Export shared services for other modules to use
    UserService,
  ],
})
export class UserManagementModule { }
