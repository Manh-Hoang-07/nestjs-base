import { Injectable } from '@nestjs/common';
import { WarehouseInventory, Prisma } from '@prisma/client';
import { PrismaService } from '@/core/database/prisma/prisma.service';
import { PrismaRepository } from '@/common/core/repositories';
import { IWarehouseInventoryRepository, WarehouseInventoryFilter } from '../../domain/warehouse-inventory.repository';

@Injectable()
export class WarehouseInventoryRepositoryImpl extends PrismaRepository<
    WarehouseInventory,
    Prisma.WarehouseInventoryWhereInput,
    Prisma.WarehouseInventoryCreateInput,
    Prisma.WarehouseInventoryUpdateInput,
    Prisma.WarehouseInventoryOrderByWithRelationInput
> implements IWarehouseInventoryRepository {
    constructor(private readonly prisma: PrismaService) {
        super(prisma.warehouseInventory as any);
    }

    protected buildWhere(filter: WarehouseInventoryFilter): Prisma.WarehouseInventoryWhereInput {
        const where: Prisma.WarehouseInventoryWhereInput = {};

        if (filter.warehouseId) where.warehouse_id = this.toPrimaryKey(filter.warehouseId);
        if (filter.productId) where.product_id = this.toPrimaryKey(filter.productId);
        if (filter.productVariantId) where.product_variant_id = this.toPrimaryKey(filter.productVariantId);

        if (filter.lowStock) {
            // where.quantity = {
            //    lte:  // Implementation needed: compare quantity with min_quantity field
            // };
        }

        return where;
    }

    async findByWarehouseAndProduct(warehouseId: number | bigint, productId: number | bigint, variantId?: number | bigint): Promise<WarehouseInventory | null> {
        return this.prisma.warehouseInventory.findUnique({
            where: {
                warehouse_id_product_id_product_variant_id: {
                    warehouse_id: this.toPrimaryKey(warehouseId),
                    product_id: this.toPrimaryKey(productId),
                    product_variant_id: variantId ? this.toPrimaryKey(variantId) : null as any
                }
            }
        }) as any;
    }
}
