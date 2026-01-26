import { Module } from '@nestjs/common';
import { ProjectService } from '@/modules/introduction/project/admin/services/project.service';
import { ProjectController } from '@/modules/introduction/project/admin/controllers/project.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

import { ProjectRepositoryModule } from '@/modules/introduction/project/project.repository.module';

@Module({
  imports: [
    RbacModule,
    ProjectRepositoryModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class AdminProjectModule { }

