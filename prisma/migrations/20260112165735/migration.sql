-- CreateTable
CREATE TABLE `banner_locations` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `banner_locations_code_key`(`code`),
    INDEX `idx_banner_locations_code`(`code`),
    INDEX `idx_banner_locations_status`(`status`),
    INDEX `idx_banner_locations_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` VARCHAR(255) NULL,
    `image` VARCHAR(500) NOT NULL,
    `mobile_image` VARCHAR(500) NULL,
    `link` VARCHAR(500) NULL,
    `link_target` VARCHAR(20) NOT NULL DEFAULT '_self',
    `description` TEXT NULL,
    `button_text` VARCHAR(100) NULL,
    `button_color` VARCHAR(20) NULL,
    `text_color` VARCHAR(20) NULL,
    `location_id` BIGINT UNSIGNED NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `start_date` DATETIME(0) NULL,
    `end_date` DATETIME(0) NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_banners_title`(`title`),
    INDEX `idx_banners_location_id`(`location_id`),
    INDEX `idx_banners_status`(`status`),
    INDEX `idx_banners_sort_order`(`sort_order`),
    INDEX `idx_banners_start_date`(`start_date`),
    INDEX `idx_banners_end_date`(`end_date`),
    INDEX `idx_banners_status_sort`(`status`, `sort_order`),
    INDEX `idx_banners_location_status`(`location_id`, `status`),
    INDEX `idx_banners_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
CREATE TABLE `general_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `site_name` VARCHAR(255) NOT NULL,
    `site_description` TEXT NULL,
    `site_logo` VARCHAR(500) NULL,
    `site_favicon` VARCHAR(500) NULL,
    `site_email` VARCHAR(255) NULL,
    `site_phone` VARCHAR(20) NULL,
    `site_address` TEXT NULL,
    `site_copyright` VARCHAR(255) NULL,
    `timezone` VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    `locale` VARCHAR(10) NOT NULL DEFAULT 'vi',
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `contact_channels` JSON NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_keywords` TEXT NULL,
    `og_title` VARCHAR(255) NULL,
    `og_description` TEXT NULL,
    `og_image` VARCHAR(500) NULL,
    `canonical_url` VARCHAR(500) NULL,
    `google_analytics_id` VARCHAR(50) NULL,
    `google_search_console` VARCHAR(255) NULL,
    `facebook_pixel_id` VARCHAR(50) NULL,
    `twitter_site` VARCHAR(50) NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_general_configs_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_configs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `smtp_host` VARCHAR(255) NOT NULL,
    `smtp_port` INTEGER NOT NULL DEFAULT 587,
    `smtp_secure` BOOLEAN NOT NULL DEFAULT true,
    `smtp_username` VARCHAR(255) NOT NULL,
    `smtp_password` VARCHAR(500) NOT NULL,
    `from_email` VARCHAR(255) NOT NULL,
    `from_name` VARCHAR(255) NOT NULL,
    `reply_to_email` VARCHAR(255) NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_email_configs_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
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
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `password` VARCHAR(255) NULL,
    `status` ENUM('active', 'pending', 'inactive') NOT NULL DEFAULT 'active',
    `email_verified_at` DATETIME(0) NULL,
    `phone_verified_at` DATETIME(0) NULL,
    `last_login_at` DATETIME(0) NULL,
    `remember_token` VARCHAR(100) NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `birthday` DATE NULL,
    `gender` ENUM('male', 'female', 'other') NULL,
    `address` TEXT NULL,
    `about` TEXT NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `profiles_user_id_key`(`user_id`),
    INDEX `UQ_profiles_user_id`(`user_id`),
    INDEX `idx_profiles_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contexts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `ref_id` BIGINT UNSIGNED NULL,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `contexts_code_key`(`code`),
    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `idx_contexts_type_ref_id`(`type`, `ref_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groups` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(50) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `owner_id` BIGINT UNSIGNED NULL,
    `context_id` BIGINT UNSIGNED NOT NULL,
    `metadata` JSON NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `groups_code_key`(`code`),
    INDEX `idx_deleted_at`(`deleted_at`),
    INDEX `IDX_groups_context_id`(`context_id`),
    UNIQUE INDEX `idx_groups_type_code`(`type`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_groups` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `joined_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_id`(`user_id`),
    INDEX `idx_group_id`(`group_id`),
    PRIMARY KEY (`user_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(120) NOT NULL,
    `scope` VARCHAR(30) NOT NULL DEFAULT 'context',
    `name` VARCHAR(150) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `permissions_code_key`(`code`),
    INDEX `idx_scope`(`scope`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(150) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_deleted_at`(`deleted_at`),
    UNIQUE INDEX `roles_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_has_permissions` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,

    INDEX `idx_role_id`(`role_id`),
    INDEX `idx_permission_id`(`permission_id`),
    PRIMARY KEY (`role_id`, `permission_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_contexts` (
    `role_id` BIGINT UNSIGNED NOT NULL,
    `context_id` BIGINT UNSIGNED NOT NULL,

    INDEX `idx_role_id`(`role_id`),
    INDEX `idx_context_id`(`context_id`),
    PRIMARY KEY (`role_id`, `context_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_role_assignments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `role_id` BIGINT UNSIGNED NOT NULL,
    `group_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_user_group`(`user_id`, `group_id`),
    INDEX `idx_group_id`(`group_id`),
    INDEX `idx_role_id`(`role_id`),
    UNIQUE INDEX `idx_user_role_group_unique`(`user_id`, `role_id`, `group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'Pending',
    `reply` TEXT NULL,
    `replied_at` DATETIME(0) NULL,
    `replied_by` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_contacts_email`(`email`),
    INDEX `idx_contacts_status`(`status`),
    INDEX `idx_contacts_created_at`(`created_at`),
    INDEX `idx_contacts_deleted_at`(`deleted_at`),
    INDEX `idx_contacts_status_created`(`status`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `postcategory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `image` VARCHAR(255) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,
    `og_image` VARCHAR(255) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `postcategory_slug_key`(`slug`),
    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_sort_order`(`sort_order`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_sort_order`(`status`, `sort_order`),
    INDEX `idx_parent_status`(`parent_id`, `status`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posttag` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `posttag_slug_key`(`slug`),
    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_status`(`status`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_created_at`(`status`, `created_at`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NULL,
    `content` LONGTEXT NOT NULL,
    `image` VARCHAR(255) NULL,
    `cover_image` VARCHAR(255) NULL,
    `primary_postcategory_id` BIGINT UNSIGNED NULL,
    `status` ENUM('draft', 'scheduled', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `post_type` ENUM('text', 'video', 'image', 'audio') NOT NULL DEFAULT 'text',
    `video_url` VARCHAR(500) NULL,
    `audio_url` VARCHAR(500) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_pinned` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(0) NULL,
    `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(255) NULL,
    `og_title` VARCHAR(255) NULL,
    `og_description` TEXT NULL,
    `og_image` VARCHAR(255) NULL,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `posts_slug_key`(`slug`),
    INDEX `idx_name`(`name`),
    INDEX `idx_slug`(`slug`),
    INDEX `idx_primary_postcategory_id`(`primary_postcategory_id`),
    INDEX `idx_status`(`status`),
    INDEX `idx_post_type`(`post_type`),
    INDEX `idx_is_featured`(`is_featured`),
    INDEX `idx_is_pinned`(`is_pinned`),
    INDEX `idx_published_at`(`published_at`),
    INDEX `idx_view_count`(`view_count`),
    INDEX `idx_created_at`(`created_at`),
    INDEX `idx_status_published_at`(`status`, `published_at`),
    INDEX `idx_is_featured_status`(`is_featured`, `status`),
    INDEX `idx_primary_category_status`(`primary_postcategory_id`, `status`),
    INDEX `idx_posts_group_id`(`group_id`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_postcategory` (
    `post_id` BIGINT UNSIGNED NOT NULL,
    `postcategory_id` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`post_id`, `postcategory_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_posttag` (
    `post_id` BIGINT UNSIGNED NOT NULL,
    `posttag_id` BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (`post_id`, `posttag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menus` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(120) NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `path` VARCHAR(255) NULL,
    `api_path` VARCHAR(255) NULL,
    `icon` VARCHAR(120) NULL,
    `type` ENUM('route', 'group', 'link') NOT NULL DEFAULT 'route',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `parent_id` BIGINT UNSIGNED NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_public` BOOLEAN NOT NULL DEFAULT false,
    `show_in_menu` BOOLEAN NOT NULL DEFAULT true,
    `required_permission_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `menus_code_key`(`code`),
    INDEX `idx_code`(`code`),
    INDEX `idx_parent_id`(`parent_id`),
    INDEX `idx_required_permission_id`(`required_permission_id`),
    INDEX `idx_status_show_in_menu`(`status`, `show_in_menu`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `menu_permissions` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `menu_id` BIGINT UNSIGNED NOT NULL,
    `permission_id` BIGINT UNSIGNED NOT NULL,

    INDEX `idx_menu_id`(`menu_id`),
    INDEX `idx_permission_id`(`permission_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('info', 'success', 'warning', 'error', 'order_status', 'payment_status', 'promotion') NOT NULL DEFAULT 'info',
    `data` JSON NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `read_at` DATETIME(0) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_notifications_user_id`(`user_id`),
    INDEX `idx_notifications_status`(`status`),
    INDEX `idx_notifications_type`(`type`),
    INDEX `idx_notifications_read`(`is_read`),
    INDEX `idx_deleted_at`(`deleted_at`),
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

-- CreateTable
CREATE TABLE `projects` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `short_description` VARCHAR(500) NULL,
    `cover_image` VARCHAR(500) NULL,
    `location` VARCHAR(255) NULL,
    `area` DECIMAL(15, 2) NULL,
    `start_date` DATETIME(0) NULL,
    `end_date` DATETIME(0) NULL,
    `status` ENUM('planning', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'planning',
    `client_name` VARCHAR(255) NULL,
    `budget` DECIMAL(20, 2) NULL,
    `images` JSON NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(500) NULL,
    `og_image` VARCHAR(500) NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `projects_slug_key`(`slug`),
    INDEX `idx_projects_slug`(`slug`),
    INDEX `idx_projects_status`(`status`),
    INDEX `idx_projects_featured`(`featured`),
    INDEX `idx_projects_sort_order`(`sort_order`),
    INDEX `idx_projects_created_at`(`created_at`),
    INDEX `idx_projects_status_featured`(`status`, `featured`),
    INDEX `idx_projects_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `about_sections` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `image` VARCHAR(500) NULL,
    `video_url` VARCHAR(500) NULL,
    `section_type` ENUM('history', 'mission', 'vision', 'values', 'culture', 'achievement', 'other') NOT NULL DEFAULT 'history',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `about_sections_slug_key`(`slug`),
    INDEX `idx_about_sections_slug`(`slug`),
    INDEX `idx_about_sections_type`(`section_type`),
    INDEX `idx_about_sections_status`(`status`),
    INDEX `idx_about_sections_sort_order`(`sort_order`),
    INDEX `idx_about_sections_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `staff` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `position` VARCHAR(255) NOT NULL,
    `department` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `avatar` VARCHAR(500) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `social_links` JSON NULL,
    `experience` INTEGER NULL,
    `expertise` TEXT NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_staff_status`(`status`),
    INDEX `idx_staff_sort_order`(`sort_order`),
    INDEX `idx_staff_department`(`department`),
    INDEX `idx_staff_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `testimonials` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `client_name` VARCHAR(255) NOT NULL,
    `client_position` VARCHAR(255) NULL,
    `client_company` VARCHAR(255) NULL,
    `client_avatar` VARCHAR(500) NULL,
    `content` TEXT NOT NULL,
    `rating` TINYINT UNSIGNED NULL,
    `project_id` BIGINT UNSIGNED NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_testimonials_status`(`status`),
    INDEX `idx_testimonials_featured`(`featured`),
    INDEX `idx_testimonials_project_id`(`project_id`),
    INDEX `idx_testimonials_sort_order`(`sort_order`),
    INDEX `idx_testimonials_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partners` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `logo` VARCHAR(500) NOT NULL,
    `website` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `type` ENUM('client', 'supplier', 'partner') NOT NULL DEFAULT 'client',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_partners_type`(`type`),
    INDEX `idx_partners_status`(`status`),
    INDEX `idx_partners_sort_order`(`sort_order`),
    INDEX `idx_partners_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `cover_image` VARCHAR(500) NULL,
    `images` JSON NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `gallery_slug_key`(`slug`),
    INDEX `idx_gallery_slug`(`slug`),
    INDEX `idx_gallery_status`(`status`),
    INDEX `idx_gallery_featured`(`featured`),
    INDEX `idx_gallery_sort_order`(`sort_order`),
    INDEX `idx_gallery_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `certificates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `image` VARCHAR(500) NOT NULL,
    `issued_by` VARCHAR(255) NULL,
    `issued_date` DATETIME(0) NULL,
    `expiry_date` DATETIME(0) NULL,
    `certificate_number` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `type` ENUM('iso', 'award', 'license', 'certification', 'other') NOT NULL DEFAULT 'license',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_certificates_type`(`type`),
    INDEX `idx_certificates_status`(`status`),
    INDEX `idx_certificates_sort_order`(`sort_order`),
    INDEX `idx_certificates_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `faqs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `question` TEXT NOT NULL,
    `answer` LONGTEXT NOT NULL,
    `view_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `helpful_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_faqs_status`(`status`),
    INDEX `idx_faqs_sort_order`(`sort_order`),
    INDEX `idx_faqs_view_count`(`view_count`),
    INDEX `idx_faqs_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `banners` ADD CONSTRAINT `banners_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `banner_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groups` ADD CONSTRAINT `groups_context_id_fkey` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_groups` ADD CONSTRAINT `user_groups_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_groups` ADD CONSTRAINT `user_groups_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `permissions` ADD CONSTRAINT `permissions_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `roles_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_has_permissions` ADD CONSTRAINT `role_has_permissions_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_has_permissions` ADD CONSTRAINT `role_has_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_contexts` ADD CONSTRAINT `role_contexts_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_contexts` ADD CONSTRAINT `role_contexts_context_id_fkey` FOREIGN KEY (`context_id`) REFERENCES `contexts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_role_assignments` ADD CONSTRAINT `user_role_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postcategory` ADD CONSTRAINT `postcategory_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `postcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_primary_postcategory_id_fkey` FOREIGN KEY (`primary_postcategory_id`) REFERENCES `postcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_postcategory` ADD CONSTRAINT `post_postcategory_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_postcategory` ADD CONSTRAINT `post_postcategory_postcategory_id_fkey` FOREIGN KEY (`postcategory_id`) REFERENCES `postcategory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_posttag` ADD CONSTRAINT `post_posttag_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_posttag` ADD CONSTRAINT `post_posttag_posttag_id_fkey` FOREIGN KEY (`posttag_id`) REFERENCES `posttag`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_required_permission_id_fkey` FOREIGN KEY (`required_permission_id`) REFERENCES `permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
