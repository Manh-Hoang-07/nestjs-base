import { Module } from '@nestjs/common';
import { ContextController } from './controllers/context.controller';
import { UserContextService } from './services/context.service';
import { ContextRepositoryModule } from '../../context.repository.module';

import { RbacRepositoryModule } from '@/modules/core/rbac/rbac.repository.module';

@Module({
  imports: [ContextRepositoryModule, RbacRepositoryModule],
  controllers: [ContextController],
  providers: [UserContextService],
  exports: [UserContextService],
})
export class UserContextModule { }

