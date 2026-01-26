
import { Injectable } from '@nestjs/common';
import { UserRoleAssignment, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IUserRoleAssignmentRepository } from '../../domain/user-role-assignment.repository';

@Injectable()
export class UserRoleAssignmentRepositoryImpl extends PrismaRepository<
    UserRoleAssignment,
    Prisma.UserRoleAssignmentWhereInput,
    Prisma.UserRoleAssignmentCreateInput,
    Prisma.UserRoleAssignmentUpdateInput,
    Prisma.UserRoleAssignmentOrderByWithRelationInput
> implements IUserRoleAssignmentRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.userRoleAssignment as unknown as any);
        this.isSoftDelete = false; // Model doesn't have deleted_at
    }

    async findUnique(userId: number | bigint, roleId: number | bigint, groupId: number | bigint): Promise<UserRoleAssignment | null> {
        return this.prisma.userRoleAssignment.findUnique({
            where: {
                user_id_role_id_group_id: {
                    user_id: typeof userId === 'bigint' ? userId : BigInt(userId),
                    role_id: typeof roleId === 'bigint' ? roleId : BigInt(roleId),
                    group_id: typeof groupId === 'bigint' ? groupId : BigInt(groupId),
                },
            },
        });
    }

    protected buildWhere(filter: any): Prisma.UserRoleAssignmentWhereInput {
        const where: Prisma.UserRoleAssignmentWhereInput = {};
        if (filter.user_id) where.user_id = BigInt(filter.user_id);
        if (filter.role_id) where.role_id = BigInt(filter.role_id);
        if (filter.group_id) where.group_id = BigInt(filter.group_id);
        return where;
    }
}
