import { Module } from '@nestjs/common';
import { UserGroupController } from './controllers/group.controller';
import { GroupMemberController } from './controllers/group-member.controller';
import { UserGroupService } from './services/group.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ContextRepositoryModule } from '../../context.repository.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';
import { UserRepositoryModule } from '@/modules/core/iam/user.repository.module';

@Module({
  imports: [
    RbacModule,
    ContextRepositoryModule,
    RbacRepositoryModule,
    UserRepositoryModule,
  ],
  controllers: [UserGroupController, GroupMemberController],
  providers: [UserGroupService],
  exports: [UserGroupService],
})
export class UserGroupModule { }

