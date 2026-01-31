import { Module } from '@nestjs/common';
import { FollowsController } from './controllers/follows.controller';
import { FollowsService } from './services/follows.service';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { FollowRepositoryModule } from '../follow.repository.module';

@Module({
  imports: [
    RbacModule,
    FollowRepositoryModule,
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class UserFollowsModule { }

