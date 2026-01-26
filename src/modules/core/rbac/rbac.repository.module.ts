import { Global, Module } from '@nestjs/common';
import { USER_GROUP_REPOSITORY } from './user-group/domain/user-group.repository';
import { UserGroupRepositoryImpl } from './user-group/infrastructure/repositories/user-group.repository.impl';
import { USER_ROLE_ASSIGNMENT_REPOSITORY } from './user-role-assignment/domain/user-role-assignment.repository';
import { UserRoleAssignmentRepositoryImpl } from './user-role-assignment/infrastructure/repositories/user-role-assignment.repository.impl';
import { ROLE_HAS_PERMISSION_REPOSITORY } from './role-has-permission/domain/role-has-permission.repository';
import { RoleHasPermissionRepositoryImpl } from './role-has-permission/infrastructure/repositories/role-has-permission.repository.impl';
import { ROLE_CONTEXT_REPOSITORY } from './role-context/domain/role-context.repository';
import { RoleContextRepositoryImpl } from './role-context/infrastructure/repositories/role-context.repository.impl';

@Global()
@Module({
    providers: [
        {
            provide: USER_GROUP_REPOSITORY,
            useClass: UserGroupRepositoryImpl,
        },
        {
            provide: USER_ROLE_ASSIGNMENT_REPOSITORY,
            useClass: UserRoleAssignmentRepositoryImpl,
        },
        {
            provide: ROLE_HAS_PERMISSION_REPOSITORY,
            useClass: RoleHasPermissionRepositoryImpl,
        },
        {
            provide: ROLE_CONTEXT_REPOSITORY,
            useClass: RoleContextRepositoryImpl,
        },
    ],
    exports: [
        USER_GROUP_REPOSITORY,
        USER_ROLE_ASSIGNMENT_REPOSITORY,
        ROLE_HAS_PERMISSION_REPOSITORY,
        ROLE_CONTEXT_REPOSITORY,
    ],
})
export class RbacRepositoryModule { }
