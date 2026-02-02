/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `chapters` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `comic_categories` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `comic_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `comics` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `comments` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `idx_deleted_at` ON `chapters`;

-- DropIndex
DROP INDEX `idx_deleted_at` ON `comic_categories`;

-- DropIndex
DROP INDEX `idx_deleted_at` ON `comic_reviews`;

-- DropIndex
DROP INDEX `idx_deleted_at` ON `comics`;

-- DropIndex
DROP INDEX `idx_deleted_at` ON `comments`;

-- AlterTable
ALTER TABLE `chapters` DROP COLUMN `deleted_at`;

-- AlterTable
ALTER TABLE `comic_categories` DROP COLUMN `deleted_at`;

-- AlterTable
ALTER TABLE `comic_reviews` DROP COLUMN `deleted_at`;

-- AlterTable
ALTER TABLE `comics` DROP COLUMN `deleted_at`;

-- AlterTable
ALTER TABLE `comments` DROP COLUMN `deleted_at`;
