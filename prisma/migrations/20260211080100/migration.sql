/*
  Warnings:

  - You are about to alter the column `section_type` on the `about_sections` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(11))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `about_sections` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(19))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `banner_locations` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `banners` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(41))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `certificates` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(25))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `certificates` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(29))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `chapters` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(12))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `comic_comments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(14))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `comics` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(13))` to `VarChar(30)`.
  - You are about to drop the column `subject` on the `contacts` table. All the data in the column will be lost.
  - You are about to alter the column `category` on the `content_templates` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `content_templates` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `content_templates` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(30))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `coupons` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(39))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `faqs` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(7))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `gallery` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(20))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `menus` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(15))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `menus` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(21))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(4))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(26))` to `VarChar(30)`.
  - You are about to alter the column `order_type` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(36))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(40))` to `VarChar(30)`.
  - You are about to alter the column `payment_status` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(42))` to `VarChar(30)`.
  - You are about to alter the column `shipping_status` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(43))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `partners` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(8))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `partners` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(16))` to `VarChar(30)`.
  - You are about to alter the column `type` on the `payment_methods` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(17))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `payment_methods` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(22))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(30)`.
  - You are about to alter the column `payment_method_type` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(9))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `post_comments` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(23))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `postcategory` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(18))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(27))` to `VarChar(30)`.
  - You are about to alter the column `post_type` on the `posts` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(31))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `posttag` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `product_attributes` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(37))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `product_categories` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(24))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `product_reviews` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(33))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(32))` to `VarChar(30)`.
  - You are about to alter the column `gender` on the `profiles` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(20)`.
  - You are about to alter the column `status` on the `projects` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(35))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `shipping_methods` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(10))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `staff` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(38))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `testimonials` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(34))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(28))` to `VarChar(30)`.
  - You are about to alter the column `status` on the `warehouses` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(44))` to `VarChar(30)`.
  - Made the column `phone` on table `contacts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `about_sections` MODIFY `section_type` VARCHAR(30) NOT NULL DEFAULT 'history',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `banner_locations` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `banners` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `certificates` MODIFY `type` VARCHAR(30) NOT NULL DEFAULT 'license',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `chapters` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `comic_comments` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'visible';

-- AlterTable
ALTER TABLE `comics` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE `contacts` DROP COLUMN `subject`,
    MODIFY `phone` VARCHAR(20) NOT NULL;

-- AlterTable
ALTER TABLE `content_templates` MODIFY `category` VARCHAR(30) NOT NULL DEFAULT 'render',
    MODIFY `type` VARCHAR(30) NOT NULL,
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `coupons` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `faqs` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `gallery` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `menus` MODIFY `type` VARCHAR(30) NOT NULL DEFAULT 'route',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `notifications` MODIFY `type` VARCHAR(30) NOT NULL DEFAULT 'info',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `orders` MODIFY `order_type` VARCHAR(30) NOT NULL DEFAULT 'physical',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    MODIFY `payment_status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    MODIFY `shipping_status` VARCHAR(30) NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `partners` MODIFY `type` VARCHAR(30) NOT NULL DEFAULT 'client',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `payment_methods` MODIFY `type` VARCHAR(30) NOT NULL DEFAULT 'offline',
    MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `payments` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'pending',
    MODIFY `payment_method_type` VARCHAR(30) NOT NULL DEFAULT 'offline';

-- AlterTable
ALTER TABLE `post_comments` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'visible';

-- AlterTable
ALTER TABLE `postcategory` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `posts` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'draft',
    MODIFY `post_type` VARCHAR(30) NOT NULL DEFAULT 'text';

-- AlterTable
ALTER TABLE `posttag` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `product_attributes` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `product_categories` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `product_reviews` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `products` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `profiles` MODIFY `gender` VARCHAR(20) NULL;

-- AlterTable
ALTER TABLE `projects` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'planning';

-- AlterTable
ALTER TABLE `shipping_methods` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `staff` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `testimonials` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `users` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `warehouses` MODIFY `status` VARCHAR(30) NOT NULL DEFAULT 'active';
