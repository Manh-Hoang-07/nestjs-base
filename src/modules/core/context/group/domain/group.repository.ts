
import { Group } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const GROUP_REPOSITORY = 'IGroupRepository';

export interface GroupFilter {
    search?: string;
    type?: string;
    status?: string;
    contextId?: number;
    ownerId?: number;
}

export interface IGroupRepository extends IRepository<Group> {
    findByCode(code: string): Promise<Group | null>;
}
