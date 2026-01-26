import { Module } from '@nestjs/common';

// Import admin modules
import { AdminProjectModule } from '@/modules/introduction/project/admin/project.module';

// Import public modules
import { PublicProjectModule } from '@/modules/introduction/project/public/project.module';
import { ProjectRepositoryModule } from './project.repository.module';

@Module({
  imports: [
    ProjectRepositoryModule,
    // Admin modules
    AdminProjectModule,
    // Public modules
    PublicProjectModule,
  ],
  exports: [],
})
export class ProjectModule { }

