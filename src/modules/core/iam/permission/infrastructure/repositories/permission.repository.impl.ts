
import { Injectable } from '@nestjs/common';
import { Permission, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IPermissionRepository, PermissionFilter } from '../../domain/permission.repository';

@Injectable()
export class PermissionRepositoryImpl extends PrismaRepository<
    Permission,
    Prisma.PermissionWhereInput,
    Prisma.PermissionCreateInput,
    Prisma.PermissionUpdateInput,
    Prisma.PermissionOrderByWithRelationInput
> implements IPermissionRepository {

    constructor(private readonly prisma: PrismaService) {
        super(prisma.permission as unknown as any);
        this.defaultSelect = {
            id: true,
            code: true,
            name: true,
            status: true,
            scope: true,
            parent_id: true,
            created_at: true,
            updated_at: true,
            parent: { select: { id: true, name: true, code: true, status: true } },
            children: { select: { id: true, name: true, code: true, status: true } },
        };
    }

    protected buildWhere(filter: PermissionFilter): Prisma.PermissionWhereInput {
        const where: Prisma.PermissionWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.scope) {
            where.scope = filter.scope;
        }

        if (filter.parentId !== undefined) {
            where.parent_id = filter.parentId === null ? null : BigInt(filter.parentId);
        }

        return where;
    }

    async findByCode(code: string): Promise<Permission | null> {
        return this.findOne({ code });
    }
}
