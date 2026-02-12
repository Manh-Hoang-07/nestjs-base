-- AlterTable
ALTER TABLE `products` ADD COLUMN `max_effective_price` DECIMAL(15, 2) NULL,
    ADD COLUMN `min_effective_price` DECIMAL(15, 2) NULL;

-- CreateIndex
CREATE INDEX `idx_products_price_range` ON `products`(`min_effective_price`, `max_effective_price`);
