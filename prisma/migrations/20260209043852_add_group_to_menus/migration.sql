-- AlterTable
ALTER TABLE `menus` ADD COLUMN `group` VARCHAR(50) NOT NULL DEFAULT 'admin';

-- CreateIndex
CREATE INDEX `idx_group` ON `menus`(`group`);
