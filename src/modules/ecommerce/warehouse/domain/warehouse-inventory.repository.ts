import { WarehouseInventory } from '@prisma/client';
import { IRepository } from '@/common/core/repositories';

export const WAREHOUSE_INVENTORY_REPOSITORY = 'IWarehouseInventoryRepository';

export interface WarehouseInventoryFilter {
    warehouseId?: number | bigint;
    productId?: number | bigint;
    productVariantId?: number | bigint;
    lowStock?: boolean;
}

export interface IWarehouseInventoryRepository extends IRepository<WarehouseInventory> {
    findByWarehouseAndProduct(warehouseId: number | bigint, productId: number | bigint, variantId?: number | bigint): Promise<WarehouseInventory | null>;
    upsertInventory(warehouseId: number | bigint, variantId: number | bigint, quantity: number, minQuantity?: number): Promise<WarehouseInventory>;
}


