-- AlterTable: Thêm cột name và image vào bảng users
ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) NULL AFTER `password`;
ALTER TABLE `users` ADD COLUMN `image` VARCHAR(255) NULL AFTER `name`;

-- Migrate dữ liệu từ profiles sang users
UPDATE `users` u
INNER JOIN `profiles` p ON u.id = p.user_id
SET 
  u.name = COALESCE(p.name, u.name),
  u.image = COALESCE(p.image, u.image)
WHERE p.deleted_at IS NULL;

-- AlterTable: Xóa cột name và image khỏi bảng profiles
ALTER TABLE `profiles` DROP COLUMN `name`;
ALTER TABLE `profiles` DROP COLUMN `image`;

