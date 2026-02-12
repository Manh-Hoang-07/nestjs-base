-- CreateIndex
CREATE INDEX `idx_product_variants_is_active` ON `product_variants`(`is_active`);

-- CreateIndex
CREATE INDEX `idx_product_variants_deleted_at` ON `product_variants`(`deleted_at`);

-- CreateIndex
CREATE INDEX `idx_product_variants_active_price` ON `product_variants`(`is_active`, `deleted_at`, `price`);

-- CreateIndex
CREATE INDEX `idx_product_variants_active_sale_price` ON `product_variants`(`is_active`, `deleted_at`, `sale_price`);
