import { Module, forwardRef } from '@nestjs/common';
import { AdminContextController } from './controllers/context.controller';
import { AdminContextService } from './services/context.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { ContextRepositoryModule } from '../../context.repository.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';

@Module({
  imports: [
    forwardRef(() => RbacModule),
    ContextRepositoryModule,
    RbacRepositoryModule,
  ],
  controllers: [AdminContextController],
  providers: [AdminContextService],
  exports: [AdminContextService],
})
export class AdminContextModule { }

