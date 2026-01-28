-- AlterTable
ALTER TABLE `product_attributes` ADD COLUMN `default_value` VARCHAR(255) NULL,
    ADD COLUMN `description` TEXT NULL,
    ADD COLUMN `is_variation` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_visible_on_frontend` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    ADD COLUMN `validation_rules` TEXT NULL;
