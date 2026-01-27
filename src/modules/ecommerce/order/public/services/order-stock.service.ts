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
        await tx.productVariant.update({
          where: { id: BigInt(item.product_variant_id) },
          data: {
            stock_quantity: { increment: item.quantity },
          },
        });
      }
    }
  }
}
