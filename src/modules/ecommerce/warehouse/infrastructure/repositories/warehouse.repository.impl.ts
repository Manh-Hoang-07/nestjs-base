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
        const where: Prisma.WarehouseWhereInput = {};

        if (filter.code) where.code = filter.code;
        if (filter.status) where.status = filter.status as any;
        if (filter.search) {
            where.OR = [
                { name: { contains: filter.search } },
                { code: { contains: filter.search } },
            ];
        }

        return where;
    }

    async findByCode(code: string): Promise<Warehouse | null> {
        return this.findOne({ code });
    }
}
