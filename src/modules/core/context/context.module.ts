import { Module } from '@nestjs/common';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

// Import admin modules
import { AdminContextModule } from '@/modules/core/context/context/admin/context.module';
import { AdminGroupModule } from '@/modules/core/context/group/admin/group.module';

// Import user modules
import { UserContextModule } from '@/modules/core/context/context/user/context.module';
import { UserGroupModule } from '@/modules/core/context/group/user/group.module';

// Import repository module
import { ContextRepositoryModule } from './context.repository.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';

@Module({
  imports: [
    RbacModule,
    ContextRepositoryModule,
    RbacRepositoryModule,
    // Admin modules
    AdminContextModule,
    AdminGroupModule,
    // User modules
    UserContextModule,
    UserGroupModule,
  ],
  exports: [ContextRepositoryModule, AdminContextModule, AdminGroupModule, UserContextModule, UserGroupModule],
})
export class ContextModule { }

