-- Add address/location fields to warehouses
ALTER TABLE `warehouses`
  ADD COLUMN `city` VARCHAR(100) NULL AFTER `address`,
  ADD COLUMN `district` VARCHAR(100) NULL AFTER `city`,
  ADD COLUMN `latitude` DOUBLE NULL AFTER `district`,
  ADD COLUMN `longitude` DOUBLE NULL AFTER `latitude`,
  ADD COLUMN `phone` VARCHAR(20) NULL AFTER `longitude`,
  ADD COLUMN `manager_name` VARCHAR(255) NULL AFTER `phone`,
  ADD COLUMN `priority` INTEGER NOT NULL DEFAULT 0 AFTER `manager_name`,
  ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true AFTER `priority`;


