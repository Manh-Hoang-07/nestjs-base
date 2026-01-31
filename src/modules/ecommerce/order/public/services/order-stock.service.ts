import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrderStockService {
  /**
   * Restore stock khi cancel order
   */
  async restoreStock(
    tx: Prisma.TransactionClient,
    order: any,
  ): Promise<void> {
    if (!order.items) return;

    for (const item of order.items) {
      if (item.product_variant_id) {
        const variantId = BigInt(item.product_variant_id);
        const quantity = Number(item.quantity);

        // 1. Update Variant total stock
        await tx.productVariant.update({
          where: { id: variantId },
          data: {
            stock_quantity: { increment: quantity },
          },
        });

        // 2. Update Warehouse inventory (Restoring to default warehouse of the group)
        const warehouse = await tx.warehouse.findFirst({
          where: {
            group_id: order.group_id ? BigInt(order.group_id) : null,
            status: 'active'
          },
          orderBy: { priority: 'desc' }
        });

        if (warehouse) {
          // Find or create inventory record
          const where = {
            warehouse_id_product_id_product_variant_id: {
              warehouse_id: warehouse.id,
              product_id: BigInt(item.product_id),
              product_variant_id: variantId
            }
          };

          const existing = await tx.warehouseInventory.findUnique({ where });
          if (existing) {
            await tx.warehouseInventory.update({
              where: { id: existing.id },
              data: { quantity: { increment: quantity } }
            });
          } else {
            await tx.warehouseInventory.create({
              data: {
                warehouse_id: warehouse.id,
                product_id: BigInt(item.product_id),
                product_variant_id: variantId,
                quantity: quantity,
                group_id: order.group_id ? BigInt(order.group_id) : null
              }
            });
          }
        }
      }
    }
  }
}
