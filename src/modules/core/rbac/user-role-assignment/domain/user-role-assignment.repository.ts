import { UserRoleAssignment } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const USER_ROLE_ASSIGNMENT_REPOSITORY = 'IUserRoleAssignmentRepository';

export interface IUserRoleAssignmentRepository extends IRepository<UserRoleAssignment> {
    findUnique(userId: number | bigint, roleId: number | bigint, groupId: number | bigint): Promise<UserRoleAssignment | null>;
    deleteMany(where: any): Promise<{ count: number }>;
}
