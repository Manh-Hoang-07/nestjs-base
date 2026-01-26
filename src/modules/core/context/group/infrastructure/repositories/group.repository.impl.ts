
import { Injectable } from '@nestjs/common';
import { Group, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IGroupRepository, GroupFilter } from '../../domain/group.repository';

@Injectable()
export class GroupRepositoryImpl extends PrismaRepository<
    Group,
    Prisma.GroupWhereInput,
    Prisma.GroupCreateInput,
    Prisma.GroupUpdateInput,
    Prisma.GroupOrderByWithRelationInput
> implements IGroupRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.group as unknown as any, 'id:desc');
        this.defaultInclude = { context: true };
    }

    protected buildWhere(filter: GroupFilter): Prisma.GroupWhereInput {
        const where: Prisma.GroupWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.type) {
            where.type = filter.type;
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.contextId) {
            where.context_id = BigInt(filter.contextId);
        }

        if (filter.ownerId) {
            where.owner_id = BigInt(filter.ownerId);
        }

        return where;
    }

    async findByCode(code: string): Promise<Group | null> {
        return this.findOne({ code });
    }
}
