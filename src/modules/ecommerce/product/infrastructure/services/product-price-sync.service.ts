import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma/prisma.service';

/**
 * Product price sync service
 * Updates denormalized price fields on Product table when variants change
 */
@Injectable()
export class ProductPriceSyncService {
    private readonly logger = new Logger(ProductPriceSyncService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Update product's denormalized price fields based on its variants
     */
    async syncProductPrice(productId: bigint | number): Promise<void> {
        try {
            const id = typeof productId === 'bigint' ? productId : BigInt(productId);

            // Fast update using raw SQL - COALESCE chooses sale_price if not null, else price
            await this.prisma.$executeRaw`
        UPDATE products p
        SET 
          min_effective_price = (
            SELECT MIN(COALESCE(pv.sale_price, pv.price))
            FROM product_variants pv
            WHERE pv.product_id = p.id
              AND pv.is_active = 1
              AND pv.deleted_at IS NULL
          ),
          max_effective_price = (
            SELECT MAX(COALESCE(pv.sale_price, pv.price))
            FROM product_variants pv
            WHERE pv.product_id = p.id
              AND pv.is_active = 1
              AND pv.deleted_at IS NULL
          )
        WHERE p.id = ${id}
      `;

            this.logger.debug(`Synced price for product ${id}`);
        } catch (error) {
            this.logger.error(`Failed to sync price for product ${productId}`, error);
            throw error;
        }
    }

    /**
     * Sync prices for all products using raw SQL (Bulk operation)
     */
    async syncAllProductPricesRaw(): Promise<void> {
        this.logger.log('Starting bulk price sync with raw SQL...');
        try {
            const startTime = Date.now();
            await this.prisma.$executeRaw`
        UPDATE products p
        SET 
          min_effective_price = (
            SELECT MIN(COALESCE(pv.sale_price, pv.price))
            FROM product_variants pv
            WHERE pv.product_id = p.id
              AND pv.is_active = 1
              AND pv.deleted_at IS NULL
          ),
          max_effective_price = (
            SELECT MAX(COALESCE(pv.sale_price, pv.price))
            FROM product_variants pv
            WHERE pv.product_id = p.id
              AND pv.is_active = 1
              AND pv.deleted_at IS NULL
          )
        WHERE p.deleted_at IS NULL
      `;
            this.logger.log(`Finished bulk price sync in ${Date.now() - startTime}ms`);
        } catch (error) {
            this.logger.error('Failed to perform bulk price sync', error);
            throw error;
        }
    }

    /**
     * Sync multiple products (used for batch updates)
     */
    async syncMultipleProductPrices(productIds: (bigint | number)[]): Promise<void> {
        if (!productIds.length) return;

        // For simplicity and to avoid complex SQL array binding issues, 
        // we sync them in parallel but limited batches if needed.
        await Promise.all(productIds.map(id => this.syncProductPrice(id)));
    }
}
