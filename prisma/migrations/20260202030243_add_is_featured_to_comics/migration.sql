-- AlterTable
ALTER TABLE `comics` ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `idx_is_featured` ON `comics`(`is_featured`);
