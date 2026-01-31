import { Module } from '@nestjs/common';
import { FollowsController } from '@/modules/comics/user/follows/controllers/follows.controller';
import { FollowsService } from '@/modules/comics/user/follows/services/follows.service';
import { RbacModule } from '@/modules/rbac/rbac.module';

@Module({
  imports: [
    RbacModule,
  ],
  controllers: [FollowsController],
  providers: [FollowsService],
  exports: [FollowsService],
})
export class UserFollowsModule {}

