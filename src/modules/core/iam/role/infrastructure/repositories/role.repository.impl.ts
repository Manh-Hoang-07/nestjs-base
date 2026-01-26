
import { Injectable } from '@nestjs/common';
import { Role, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IRoleRepository, RoleFilter } from '../../domain/role.repository';

@Injectable()
export class RoleRepositoryImpl extends PrismaRepository<
    Role,
    Prisma.RoleWhereInput,
    Prisma.RoleCreateInput,
    Prisma.RoleUpdateInput,
    Prisma.RoleOrderByWithRelationInput
> implements IRoleRepository {

    constructor(private readonly prisma: PrismaService) {
        super(prisma.role as unknown as any);
        this.defaultSelect = {
            id: true,
            code: true,
            name: true,
            status: true,
            parent_id: true,
            created_at: true,
            updated_at: true,
            parent: { select: { id: true, name: true, code: true, status: true } },
            children: { select: { id: true, name: true, code: true, status: true } },
            permissions: { include: { permission: true } },
            role_contexts: { include: { context: true } },
        };
    }

    protected buildWhere(filter: RoleFilter & { contextId?: number | bigint }): Prisma.RoleWhereInput {
        const where: Prisma.RoleWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status;
        }

        if (filter.parentId !== undefined) {
            where.parent_id = filter.parentId === null ? null : BigInt(filter.parentId);
        }

        if (filter.contextId) {
            where.role_contexts = {
                some: { context_id: BigInt(filter.contextId) }
            };
        }

        return where;
    }

    async findByCode(code: string): Promise<Role | null> {
        return this.findOne({ code });
    }

    async syncPermissions(roleId: number | bigint, permissionIds: number[]): Promise<void> {
        await this.prisma.roleHasPermission.deleteMany({
            where: { role_id: BigInt(roleId) },
        });

        if (permissionIds.length > 0) {
            await this.prisma.roleHasPermission.createMany({
                data: permissionIds.map((pid) => ({
                    role_id: BigInt(roleId),
                    permission_id: BigInt(pid),
                })),
                skipDuplicates: true,
            });
        }
    }

    async syncContexts(roleId: number | bigint, contextIds: number[]): Promise<void> {
        await this.prisma.roleContext.deleteMany({
            where: { role_id: BigInt(roleId) },
        });

        if (contextIds.length > 0) {
            await this.prisma.roleContext.createMany({
                data: contextIds.map((cid) => ({
                    role_id: BigInt(roleId),
                    context_id: BigInt(cid),
                })),
                skipDuplicates: true,
            });
        }
    }
}
