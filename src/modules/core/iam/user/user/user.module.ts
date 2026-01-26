import { Module } from '@nestjs/common';
import { UserService } from '@/modules/core/iam/user/admin/services/user.service';
import { ProfileController } from './controllers/profile.controller';
import { RbacModule } from '@/modules/core/rbac/rbac.module';

@Module({
    imports: [RbacModule],
    controllers: [ProfileController],
    providers: [UserService],
    exports: [UserService],
})
export class UserProfileModule { }
