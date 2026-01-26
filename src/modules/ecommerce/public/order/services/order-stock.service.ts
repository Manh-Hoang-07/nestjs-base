import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Order } from '@/shared/entities/order.entity';
import { ProductVariant } from '@/shared/entities/product-variant.entity';

@Injectable()
export class OrderStockService {
  /**
   * Restore stock khi cancel order
   */
  async restoreStock(
    manager: EntityManager,
    order: Order,
  ): Promise<void> {
    for (const item of order.items) {
      if (item.product_variant_id) {
        await manager.increment(
          ProductVariant,
          { id: item.product_variant_id },
          'stock_quantity',
          item.quantity,
        );
      }
    }
  }
}
