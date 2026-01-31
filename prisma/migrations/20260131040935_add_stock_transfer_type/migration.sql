-- AlterTable
ALTER TABLE `stock_transfers` ADD COLUMN `type` VARCHAR(50) NOT NULL DEFAULT 'transfer',
    MODIFY `to_warehouse_id` BIGINT UNSIGNED NULL;

-- CreateIndex
CREATE INDEX `idx_st_type` ON `stock_transfers`(`type`);
