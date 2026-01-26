import { Global, Module, Provider } from '@nestjs/common';
import { PrismaModule } from '@/core/database/prisma/prisma.module';
import { UserRepositoryImpl } from './user/infrastructure/repositories/user.repository.impl';
import { USER_REPOSITORY } from './user/domain/user.repository';
import { RoleRepositoryImpl } from './role/infrastructure/repositories/role.repository.impl';
import { ROLE_REPOSITORY } from './role/domain/role.repository';
import { PermissionRepositoryImpl } from './permission/infrastructure/repositories/permission.repository.impl';
import { PERMISSION_REPOSITORY } from './permission/domain/permission.repository';

const repositories: Provider[] = [
    {
        provide: USER_REPOSITORY,
        useClass: UserRepositoryImpl,
    },
    {
        provide: ROLE_REPOSITORY,
        useClass: RoleRepositoryImpl,
    },
    {
        provide: PERMISSION_REPOSITORY,
        useClass: PermissionRepositoryImpl,
    },
];

@Global()
@Module({
    imports: [PrismaModule],
    providers: [...repositories],
    exports: [...repositories],
})
export class UserRepositoryModule { }
