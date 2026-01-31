import { Injectable } from '@nestjs/common';
import { Warehouse, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IWarehouseRepository, WarehouseFilter } from '../../domain/warehouse.repository';

@Injectable()
export class WarehouseRepositoryImpl extends PrismaRepository<
    Warehouse,
    Prisma.WarehouseWhereInput,
    Prisma.WarehouseCreateInput,
    Prisma.WarehouseUpdateInput,
    Prisma.WarehouseOrderByWithRelationInput
> implements IWarehouseRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.warehouse as any);
    }

    protected buildWhere(filter: WarehouseFilter): Prisma.WarehouseWhereInput {
        const where: any = {};

        if (filter.code) where.code = filter.code;
        if (filter.status) where.status = filter.status as any;

        // ✅ Phân quyền Multi-shop: (Shared OR Specific Shop)
        if (filter.group_id !== undefined) {
            if (filter.group_id === null) {
                where.group_id = null;
            } else {
                where.OR = [
                    { group_id: null },
                    { group_id: this.toPrimaryKey(filter.group_id) }
                ];
            }
        }

        if (filter.search) {
            const searchCondition = {
                OR: [
                    { name: { contains: filter.search } },
                    { code: { contains: filter.search } },
                ]
            };

            if (where.OR) {
                const existingOr = where.OR;
                delete where.OR;
                where.AND = [
                    { OR: existingOr },
                    searchCondition
                ];
            } else {
                where.OR = searchCondition.OR;
            }
        }

        return where as Prisma.WarehouseWhereInput;
    }

    async findByCode(code: string): Promise<Warehouse | null> {
        return this.findOne({ code });
    }
}
