import { UserGroup } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const USER_GROUP_REPOSITORY = 'IUserGroupRepository';

export interface IUserGroupRepository extends IRepository<UserGroup> {
    findUnique(userId: number | bigint, groupId: number | bigint): Promise<UserGroup | null>;
}
