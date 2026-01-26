import { Module } from '@nestjs/common';
import { RbacModule } from '@/modules/core/rbac/rbac.module';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { UserController } from '@/modules/core/iam/user/admin/controllers/user.controller';

@Module({
  imports: [RbacModule],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class AdminUserModule { }


