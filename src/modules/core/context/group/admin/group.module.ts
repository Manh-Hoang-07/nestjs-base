import { Module } from '@nestjs/common';
import { AdminGroupController } from './controllers/group.controller';
import { AdminGroupService } from './services/group.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ContextRepositoryModule } from '../../context.repository.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';

@Module({
  imports: [
    RbacModule,
    ContextRepositoryModule,
    RbacRepositoryModule,
  ],
  controllers: [AdminGroupController],
  providers: [AdminGroupService],
  exports: [AdminGroupService],
})
export class AdminGroupModule { }

