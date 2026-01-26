import { Module } from '@nestjs/common';
import { AboutService } from '@/modules/introduction/about/admin/services/about.service';
import { AboutController } from '@/modules/introduction/about/admin/controllers/about.controller';
import { AboutRepositoryModule } from '@/modules/introduction/about/about.repository.module';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
    AboutRepositoryModule,
  ],
  controllers: [AboutController],
  providers: [AboutService],
  exports: [AboutService],
})
export class AdminAboutModule { }

