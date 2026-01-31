-- CreateTable
CREATE TABLE `comics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `cover_image` VARCHAR(500) NULL,
    `author` VARCHAR(255) NULL,
    `status` ENUM('draft', 'published', 'completed', 'hidden') NOT NULL DEFAULT 'draft',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,
    `last_chapter_id` BIGINT UNSIGNED NULL,
    `last_chapter_updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `comics_slug_key`(`slug`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_status`(`status`),
    INDEX `idx_author`(`author`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_created_user_id`(`created_user_id`),
    INDEX `idx_updated_user_id`(`updated_user_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    INDEX `idx_last_chapter_updated_at`(`last_chapter_updated_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_stats` (
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `follow_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `rating_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `rating_sum` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `updated_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_view_count`(`view_count`),
    INDEX `idx_follow_count`(`follow_count`),
    INDEX `idx_updated_at`(`updated_at`),
    PRIMARY KEY (`comic_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapters` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `team_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `chapter_index` INTEGER NOT NULL,
    `chapter_label` VARCHAR(50) NULL,
    `status` ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_comic_chapter_index`(`comic_id`, `chapter_index`),
    INDEX `idx_team_id`(`team_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_view_count`(`view_count`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_created_user_id`(`created_user_id`),
    INDEX `idx_updated_user_id`(`updated_user_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `idx_comic_chapter_unique`(`comic_id`, `chapter_index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `comic_categories_slug_key`(`slug`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_name`(`name`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_created_user_id`(`created_user_id`),
    INDEX `idx_updated_user_id`(`updated_user_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_category` (
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `comic_category_id` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`comic_id`, `comic_category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `chapter_id` BIGINT UNSIGNED NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_chapter_id`(`chapter_id`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_comic_created`(`comic_id`, `created_at`),
    INDEX `idx_chapter_created`(`chapter_id`, `created_at`),
    INDEX `idx_created_user_id`(`created_user_id`),
    INDEX `idx_updated_user_id`(`updated_user_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `content` TEXT NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_rating`(`rating`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_created_user_id`(`created_user_id`),
    INDEX `idx_updated_user_id`(`updated_user_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `idx_user_comic`(`user_id`, `comic_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapter_pages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `chapter_id` BIGINT UNSIGNED NOT NULL,
    `page_number` INTEGER NOT NULL,
    `image_url` VARCHAR(500) NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `file_size` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_chapter_id`(`chapter_id`),
    INDEX `idx_chapter_page`(`chapter_id`, `page_number`),
    UNIQUE INDEX `idx_chapter_page_unique`(`chapter_id`, `page_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_views` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `chapter_id` BIGINT UNSIGNED NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `ip` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_chapter_id`(`chapter_id`),
    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_comic_created`(`comic_id`, `created_at`),
    INDEX `idx_chapter_created`(`chapter_id`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comic_follows` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_created_at`(`created_at`),
    UNIQUE INDEX `idx_user_comic`(`user_id`, `comic_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reading_histories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `chapter_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_comic_id`(`comic_id`),
    INDEX `idx_chapter_id`(`chapter_id`),
    INDEX `idx_updated_at`(`updated_at`),
    UNIQUE INDEX `idx_user_comic`(`user_id`, `comic_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookmarks` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `chapter_id` BIGINT UNSIGNED NOT NULL,
    `page_number` INTEGER NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_chapter_id`(`chapter_id`),
    INDEX `idx_user_chapter`(`user_id`, `chapter_id`),
    INDEX `idx_created_at`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `comics` ADD CONSTRAINT `comics_last_chapter_id_fkey` FOREIGN KEY (`last_chapter_id`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_stats` ADD CONSTRAINT `comic_stats_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapters` ADD CONSTRAINT `chapters_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_category` ADD CONSTRAINT `comic_category_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_category` ADD CONSTRAINT `comic_category_comic_category_id_fkey` FOREIGN KEY (`comic_category_id`) REFERENCES `comic_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comments` ADD CONSTRAINT `comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_reviews` ADD CONSTRAINT `comic_reviews_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_reviews` ADD CONSTRAINT `comic_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapter_pages` ADD CONSTRAINT `chapter_pages_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_views` ADD CONSTRAINT `comic_views_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_views` ADD CONSTRAINT `comic_views_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_views` ADD CONSTRAINT `comic_views_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_follows` ADD CONSTRAINT `comic_follows_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comic_follows` ADD CONSTRAINT `comic_follows_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading_histories` ADD CONSTRAINT `reading_histories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading_histories` ADD CONSTRAINT `reading_histories_comic_id_fkey` FOREIGN KEY (`comic_id`) REFERENCES `comics`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reading_histories` ADD CONSTRAINT `reading_histories_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_chapter_id_fkey` FOREIGN KEY (`chapter_id`) REFERENCES `chapters`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
