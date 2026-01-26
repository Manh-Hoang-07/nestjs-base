import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { ProductVariant } from '@/shared/entities/product-variant.entity';
import {
  ResourceNotFoundException,
  InsufficientStockException
} from '@/common/exceptions/business.exception';

/**
 * Stock Service - Handles stock management with pessimistic locking
 * to prevent race conditions and overselling
 */
@Injectable()
export class StockService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * Check and reserve stock for multiple items within a transaction
   * Uses pessimistic locking to prevent concurrent modifications
   * 
   * @param manager - EntityManager from transaction
   * @param items - Array of items with variant_id and quantity
   * @throws BadRequestException if insufficient stock
   */
  async checkAndReserveStock(
    manager: EntityManager,
    items: Array<{ variant_id: number; quantity: number; product_name: string }>
  ): Promise<void> {
    for (const item of items) {
      // Lock the variant row for update
      const variant = await manager.findOne(ProductVariant, {
        where: { id: item.variant_id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!variant) {
        throw new ResourceNotFoundException('Product variant', item.product_name);
      }

      // Check if we have enough stock
      if (variant.stock_quantity < item.quantity) {
        throw new InsufficientStockException(
          item.product_name,
          variant.stock_quantity,
          item.quantity
        );
      }

      // Decrement stock atomically
      await manager.decrement(
        ProductVariant,
        { id: item.variant_id },
        'stock_quantity',
        item.quantity
      );
    }
  }

  /**
   * Restore stock for items (e.g., when order is cancelled)
   * Uses atomic increment to prevent race conditions
   * 
   * @param manager - EntityManager from transaction
   * @param items - Array of items with variant_id and quantity
   */
  async restoreStock(
    manager: EntityManager,
    items: Array<{ variant_id: number; quantity: number }>
  ): Promise<void> {
    for (const item of items) {
      // Increment stock atomically
      await manager.increment(
        ProductVariant,
        { id: item.variant_id },
        'stock_quantity',
        item.quantity
      );
    }
  }

  /**
   * Get current stock level with optional pessimistic lock
   * 
   * @param variantId - Product variant ID
   * @param lock - Whether to use pessimistic lock
   * @returns Current stock quantity
   */
  async getStockLevel(
    variantId: number,
    lock: boolean = false
  ): Promise<number> {
    return await this.dataSource.transaction(async (manager) => {
      const variant = await manager.findOne(ProductVariant, {
        where: { id: variantId },
        select: ['stock_quantity'],
        lock: lock ? { mode: 'pessimistic_read' } : undefined,
      });

      return variant?.stock_quantity ?? 0;
    });
  }

  /**
   * Check if stock is available for an item
   * Does NOT lock the row, use for display purposes only
   * 
   * @param variantId - Product variant ID
   * @param quantity - Requested quantity
   * @returns true if stock is available
   */
  async isStockAvailable(
    variantId: number,
    quantity: number
  ): Promise<boolean> {
    const currentStock = await this.getStockLevel(variantId, false);
    return currentStock >= quantity;
  }

  /**
   * Bulk check stock availability for multiple items
   * Does NOT lock rows, use for cart validation display
   * 
   * @param items - Array of items to check
   * @returns Array of results with availability status
   */
  async bulkCheckStockAvailability(
    items: Array<{ variant_id: number; quantity: number; product_name: string }>
  ): Promise<Array<{ variant_id: number; available: boolean; current_stock: number }>> {
    const results = [];

    for (const item of items) {
      const currentStock = await this.getStockLevel(item.variant_id, false);
      results.push({
        variant_id: item.variant_id,
        available: currentStock >= item.quantity,
        current_stock: currentStock,
      });
    }

    return results;
  }
}