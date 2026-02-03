import { Injectable } from '@nestjs/common';
import { StockTransfer, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { createPaginationMeta } from '@/common/core/utils';
import { IStockTransferRepository } from '../../domain/stock-transfer.repository';

@Injectable()
export class StockTransferRepositoryImpl extends PrismaRepository<
    StockTransfer,
    Prisma.StockTransferWhereInput,
    Prisma.StockTransferCreateInput,
    Prisma.StockTransferUpdateInput,
    Prisma.StockTransferOrderByWithRelationInput
> implements IStockTransferRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.stockTransfer);
    }

    protected buildWhere(filter: any): Prisma.StockTransferWhereInput {
        const where: Prisma.StockTransferWhereInput = {};
        if (filter.status) where.status = filter.status;
        if (filter.type) where.type = filter.type;
        if (filter.from_warehouse_id) where.from_warehouse_id = filter.from_warehouse_id;
        if (filter.to_warehouse_id) where.to_warehouse_id = filter.to_warehouse_id;
        if (filter.product_variant_id) where.product_variant_id = filter.product_variant_id;
        return where;
    }

    async findAllWithRelations(params: any): Promise<any> {
        const { skip, take, where, orderBy, page, limit } = params;
        const options: Prisma.StockTransferFindManyArgs = {
            where,
            orderBy: typeof orderBy === 'string' ? this.parseSort(orderBy) : orderBy,
            include: {
                from_warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                to_warehouse: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    }
                },
                variant: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    }
                }
            }
        };

        if (skip !== undefined) {
            options.skip = Number(skip);
        }
        if (take !== undefined) {
            options.take = Number(take);
        }

        const [data, total] = await Promise.all([
            this.prisma.stockTransfer.findMany(options),
            this.prisma.stockTransfer.count({ where }),
        ]);

        const pageNum = page ? Number(page) : 1;
        const limitNum = take ? Number(take) : 10;

        return {
            data,
            meta: createPaginationMeta(pageNum, limitNum, total),
        };
    }
}


