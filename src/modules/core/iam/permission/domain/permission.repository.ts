
import { Permission } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const PERMISSION_REPOSITORY = 'IPermissionRepository';

export interface PermissionFilter {
    search?: string;
    status?: string;
    parentId?: number | bigint;
    scope?: string;
}

export interface IPermissionRepository extends IRepository<Permission> {
    findByCode(code: string): Promise<Permission | null>;
}
