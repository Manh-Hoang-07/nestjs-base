
import { Injectable } from '@nestjs/common';
import { Menu, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IMenuRepository, MenuFilter } from '../../domain/menu.repository';

@Injectable()
export class MenuRepositoryImpl extends PrismaRepository<
    Menu,
    Prisma.MenuWhereInput,
    Prisma.MenuCreateInput,
    Prisma.MenuUpdateInput,
    Prisma.MenuOrderByWithRelationInput
> implements IMenuRepository {

    constructor(private readonly prisma: PrismaService) {
        super(prisma.menu as unknown as any, 'sort_order:asc');
        this.defaultSelect = {
            id: true,
            code: true,
            name: true,
            icon: true,
            path: true,
            type: true,
            status: true,
            sort_order: true,
            parent_id: true,
            required_permission_id: true,
            is_public: true,
            show_in_menu: true,
            created_at: true,
            updated_at: true,
            parent: { select: { id: true, name: true, code: true } },
            required_permission: { select: { id: true, code: true, name: true } },
            menu_permissions: {
                include: {
                    permission: { select: { id: true, code: true, name: true } }
                }
            }
        };
    }

    protected buildWhere(filter: MenuFilter): Prisma.MenuWhereInput {
        const where: Prisma.MenuWhereInput = {};

        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        if (filter.status) {
            where.status = filter.status as any;
        }

        if (filter.type) {
            where.type = filter.type as any;
        }

        if (filter.parentId !== undefined) {
            where.parent_id = filter.parentId === null ? null : BigInt(filter.parentId);
        }

        return where;
    }

    async findAllWithChildren(filter?: MenuFilter): Promise<Menu[]> {
        return this.findMany(filter || {}, { sort: 'sort_order:asc' });
    }

    async findByCode(code: string): Promise<Menu | null> {
        return this.findOne({ code });
    }
}
