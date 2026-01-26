import { Module } from '@nestjs/common';
import { PublicProjectService } from '@/modules/introduction/project/public/services/project.service';
import { PublicProjectController } from '@/modules/introduction/project/public/controllers/project.controller';

import { ProjectRepositoryModule } from '@/modules/introduction/project/project.repository.module';

@Module({
  imports: [ProjectRepositoryModule],
  controllers: [PublicProjectController],
  providers: [PublicProjectService],
  exports: [PublicProjectService],
})
export class PublicProjectModule { }

