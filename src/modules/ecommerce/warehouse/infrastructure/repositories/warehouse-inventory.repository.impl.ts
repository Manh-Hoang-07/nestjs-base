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

    protected override isSoftDelete = false;

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

    protected buildWhere(filter: WarehouseInventoryFilter): Prisma.WarehouseInventoryWhereInput {
        const where: Prisma.WarehouseInventoryWhereInput = {};

        if (filter.warehouseId) where.warehouse_id = this.toPrimaryKey(filter.warehouseId);
        if (filter.productId) where.product_id = this.toPrimaryKey(filter.productId);
        if (filter.productVariantId) where.product_variant_id = this.toPrimaryKey(filter.productVariantId);

        // Prisma doesn't support field-to-field comparison in 'where' easily.
        // If lowStock is needed, it might require a raw query or fetching and filtering.
        // For now, we leave it as is to avoid breaking changes.

        return where;
    }

    async upsertInventory(warehouseId: number | bigint, variantId: number | bigint, quantity: number, minQuantity?: number): Promise<WarehouseInventory> {
        const variant = await this.prisma.productVariant.findUnique({
            where: { id: this.toPrimaryKey(variantId) },
            select: { product_id: true }
        });

        if (!variant) {
            throw new Error(`Product variant with ID ${variantId} not found`);
        }

        const where = {
            warehouse_id_product_id_product_variant_id: {
                warehouse_id: this.toPrimaryKey(warehouseId),
                product_id: variant.product_id,
                product_variant_id: this.toPrimaryKey(variantId)
            }
        };

        const updateData: any = { quantity };
        if (minQuantity !== undefined) {
            updateData.min_quantity = minQuantity;
        }

        const createData = {
            warehouse_id: this.toPrimaryKey(warehouseId),
            product_id: variant.product_id,
            product_variant_id: this.toPrimaryKey(variantId),
            quantity,
            min_quantity: minQuantity ?? 0
        };

        return this.prisma.warehouseInventory.upsert({
            where,
            create: createData,
            update: updateData
        }) as any;
    }
}
