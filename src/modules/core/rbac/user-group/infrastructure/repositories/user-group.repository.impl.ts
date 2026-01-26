
import { Injectable } from '@nestjs/common';
import { UserGroup, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IUserGroupRepository } from '../../domain/user-group.repository';

@Injectable()
export class UserGroupRepositoryImpl extends PrismaRepository<
    UserGroup,
    Prisma.UserGroupWhereInput,
    Prisma.UserGroupCreateInput,
    Prisma.UserGroupUpdateInput,
    Prisma.UserGroupOrderByWithRelationInput
> implements IUserGroupRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.userGroup as unknown as any);
        this.isSoftDelete = false; // Model doesn't have deleted_at
    }

    async findUnique(userId: number | bigint, groupId: number | bigint): Promise<UserGroup | null> {
        return this.prisma.userGroup.findUnique({
            where: {
                user_id_group_id: {
                    user_id: this.toPrimaryKey(userId),
                    group_id: this.toPrimaryKey(groupId),
                },
            },
        });
    }

    protected buildWhere(filter: any): Prisma.UserGroupWhereInput {
        const where: Prisma.UserGroupWhereInput = {};
        if (filter.user_id) where.user_id = this.toPrimaryKey(filter.user_id);
        if (filter.group_id) where.group_id = this.toPrimaryKey(filter.group_id);
        return where;
    }
}
