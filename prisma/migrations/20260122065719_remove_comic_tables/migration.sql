/*
  Warnings:

  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chapter_pages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `chapters` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_follows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_reviews` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_stats` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comic_views` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reading_histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `chapter_pages` DROP FOREIGN KEY `chapter_pages_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `chapters` DROP FOREIGN KEY `chapters_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_category` DROP FOREIGN KEY `comic_category_comic_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_category` DROP FOREIGN KEY `comic_category_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_follows` DROP FOREIGN KEY `comic_follows_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_follows` DROP FOREIGN KEY `comic_follows_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_reviews` DROP FOREIGN KEY `comic_reviews_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_reviews` DROP FOREIGN KEY `comic_reviews_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_stats` DROP FOREIGN KEY `comic_stats_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_views` DROP FOREIGN KEY `comic_views_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_views` DROP FOREIGN KEY `comic_views_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comic_views` DROP FOREIGN KEY `comic_views_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `comics` DROP FOREIGN KEY `comics_last_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_parent_id_fkey`;

-- DropForeignKey
ALTER TABLE `comments` DROP FOREIGN KEY `comments_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `reading_histories` DROP FOREIGN KEY `reading_histories_chapter_id_fkey`;

-- DropForeignKey
ALTER TABLE `reading_histories` DROP FOREIGN KEY `reading_histories_comic_id_fkey`;

-- DropForeignKey
ALTER TABLE `reading_histories` DROP FOREIGN KEY `reading_histories_user_id_fkey`;

-- DropTable
DROP TABLE `bookmarks`;

-- DropTable
DROP TABLE `chapter_pages`;

-- DropTable
DROP TABLE `chapters`;

-- DropTable
DROP TABLE `comic_categories`;

-- DropTable
DROP TABLE `comic_category`;

-- DropTable
DROP TABLE `comic_follows`;

-- DropTable
DROP TABLE `comic_reviews`;

-- DropTable
DROP TABLE `comic_stats`;

-- DropTable
DROP TABLE `comic_views`;

-- DropTable
DROP TABLE `comics`;

-- DropTable
DROP TABLE `comments`;

-- DropTable
DROP TABLE `reading_histories`;
