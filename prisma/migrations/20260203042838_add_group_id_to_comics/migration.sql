-- AlterTable
ALTER TABLE `chapters` ADD COLUMN `group_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `comic_categories` ADD COLUMN `group_id` BIGINT UNSIGNED NULL;

-- AlterTable
ALTER TABLE `comics` ADD COLUMN `group_id` BIGINT UNSIGNED NULL;

-- CreateIndex
CREATE INDEX `idx_chapters_group_id` ON `chapters`(`group_id`);

-- CreateIndex
CREATE INDEX `idx_comic_categories_group_id` ON `comic_categories`(`group_id`);

-- CreateIndex
CREATE INDEX `idx_comics_group_id` ON `comics`(`group_id`);
