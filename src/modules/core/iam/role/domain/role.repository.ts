
import { Role } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const ROLE_REPOSITORY = 'IRoleRepository';

export interface RoleFilter {
    search?: string;
    status?: string;
    parentId?: number | bigint;
}

export interface IRoleRepository extends IRepository<Role> {
    findByCode(code: string): Promise<Role | null>;
    syncPermissions(roleId: number | bigint, permissionIds: number[]): Promise<void>;
    syncContexts(roleId: number | bigint, contextIds: number[]): Promise<void>;
}
