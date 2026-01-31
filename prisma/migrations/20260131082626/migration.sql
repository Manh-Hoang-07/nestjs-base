-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(20) NULL,
    `password` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `image` VARCHAR(255) NULL,
    `googleId` VARCHAR(255) NULL,
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
    UNIQUE INDEX `users_googleId_key`(`googleId`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
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
CREATE TABLE `post_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `guest_name` VARCHAR(255) NULL,
    `guest_email` VARCHAR(255) NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `content` TEXT NOT NULL,
    `status` ENUM('visible', 'hidden') NOT NULL DEFAULT 'visible',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_post_comment_post_id`(`post_id`),
    INDEX `idx_post_comment_user_id`(`user_id`),
    INDEX `idx_post_comment_parent_id`(`parent_id`),
    INDEX `idx_post_comment_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `post_view_stats` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `post_id` BIGINT UNSIGNED NOT NULL,
    `view_date` DATE NOT NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(0) NOT NULL,

    UNIQUE INDEX `idx_post_date_unique`(`post_id`, `view_date`),
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

-- CreateTable
CREATE TABLE `content_templates` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `category` ENUM('render', 'file') NOT NULL DEFAULT 'render',
    `type` ENUM('email', 'telegram', 'zalo', 'sms', 'pdf_generated', 'file_word', 'file_excel', 'file_pdf') NOT NULL,
    `content` LONGTEXT NULL,
    `file_path` VARCHAR(500) NULL,
    `metadata` JSON NULL,
    `variables` JSON NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `content_templates_code_key`(`code`),
    INDEX `idx_content_templates_code`(`code`),
    INDEX `idx_content_templates_status`(`status`),
    INDEX `idx_content_templates_category`(`category`),
    INDEX `idx_content_templates_type`(`type`),
    INDEX `idx_content_templates_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `parent_id` BIGINT UNSIGNED NULL,
    `image` VARCHAR(500) NULL,
    `icon` VARCHAR(100) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(500) NULL,
    `og_image` VARCHAR(500) NULL,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `product_categories_slug_key`(`slug`),
    INDEX `idx_product_categories_name`(`name`),
    INDEX `idx_product_categories_parent_id`(`parent_id`),
    INDEX `idx_product_categories_status`(`status`),
    INDEX `idx_product_categories_sort_order`(`sort_order`),
    INDEX `idx_product_categories_group_id`(`group_id`),
    INDEX `idx_product_categories_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `description` LONGTEXT NULL,
    `short_description` TEXT NULL,
    `min_stock_level` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(500) NULL,
    `gallery` JSON NULL,
    `status` ENUM('active', 'inactive', 'draft', 'archived') NOT NULL DEFAULT 'active',
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `is_variable` BOOLEAN NOT NULL DEFAULT true,
    `is_digital` BOOLEAN NOT NULL DEFAULT false,
    `download_limit` INTEGER NULL,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `canonical_url` VARCHAR(500) NULL,
    `og_title` VARCHAR(255) NULL,
    `og_description` TEXT NULL,
    `og_image` VARCHAR(500) NULL,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `products_slug_key`(`slug`),
    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `idx_products_name`(`name`),
    INDEX `idx_products_status`(`status`),
    INDEX `idx_products_is_featured`(`is_featured`),
    INDEX `idx_products_group_id`(`group_id`),
    INDEX `idx_products_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_category` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_category_id` BIGINT UNSIGNED NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_ppc_product_id`(`product_id`),
    INDEX `idx_ppc_category_id`(`product_category_id`),
    UNIQUE INDEX `uk_ppc_product_category`(`product_id`, `product_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variants` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `price` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `sale_price` DECIMAL(15, 2) NULL,
    `stock_quantity` INTEGER NOT NULL DEFAULT 0,
    `image` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `product_variants_sku_key`(`sku`),
    INDEX `idx_product_variants_product_id`(`product_id`),
    INDEX `idx_product_variants_sku`(`sku`),
    INDEX `idx_product_variants_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attributes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'text',
    `default_value` VARCHAR(255) NULL,
    `is_filterable` BOOLEAN NOT NULL DEFAULT true,
    `is_required` BOOLEAN NOT NULL DEFAULT true,
    `is_variation` BOOLEAN NOT NULL DEFAULT false,
    `is_visible_on_frontend` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `validation_rules` TEXT NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `product_attributes_code_key`(`code`),
    INDEX `idx_product_attributes_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attribute_values` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_attribute_id` BIGINT UNSIGNED NOT NULL,
    `value` VARCHAR(255) NOT NULL,
    `label` VARCHAR(255) NOT NULL,
    `color_code` VARCHAR(100) NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_product_attribute_values_attr_id`(`product_attribute_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_variant_attributes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_variant_id` BIGINT UNSIGNED NOT NULL,
    `product_attribute_id` BIGINT UNSIGNED NOT NULL,
    `product_attribute_value_id` BIGINT UNSIGNED NOT NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_pva_variant_id`(`product_variant_id`),
    INDEX `idx_pva_attribute_id`(`product_attribute_id`),
    INDEX `idx_pva_value_id`(`product_attribute_value_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_headers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uuid` VARCHAR(36) NULL,
    `owner_key` VARCHAR(120) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'VND',
    `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `shipping_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `coupon_code` VARCHAR(50) NULL,
    `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `cart_headers_uuid_key`(`uuid`),
    INDEX `idx_cart_headers_owner_key`(`owner_key`),
    INDEX `idx_cart_headers_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `carts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cart_header_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) NOT NULL,
    `variant_name` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `product_attributes` JSON NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_carts_cart_header_id`(`cart_header_id`),
    INDEX `idx_carts_product_id`(`product_id`),
    UNIQUE INDEX `uk_carts_header_product_variant`(`cart_header_id`, `product_id`, `product_variant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupons` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(50) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'fixed_amount',
    `value` DECIMAL(15, 2) NOT NULL,
    `min_order_value` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `max_discount` DECIMAL(15, 2) NULL,
    `start_date` DATETIME(0) NULL,
    `end_date` DATETIME(0) NULL,
    `usage_limit` INTEGER NULL,
    `used_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `coupons_code_key`(`code`),
    INDEX `idx_coupons_code`(`code`),
    INDEX `idx_coupons_status`(`status`),
    INDEX `idx_coupons_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coupon_usages` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `coupon_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `order_id` BIGINT UNSIGNED NULL,
    `discount_amount` DECIMAL(15, 2) NOT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_coupon_usages_coupon_id`(`coupon_id`),
    INDEX `idx_coupon_usages_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_reviews` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `customer_name` VARCHAR(255) NULL,
    `customer_email` VARCHAR(255) NULL,
    `rating` TINYINT UNSIGNED NOT NULL,
    `comment` TEXT NULL,
    `helpful_count` INTEGER NOT NULL DEFAULT 0,
    `is_verified_purchase` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_product_reviews_product_id`(`product_id`),
    INDEX `idx_product_reviews_status`(`status`),
    INDEX `idx_product_reviews_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shipping_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `shipping_methods_code_key`(`code`),
    INDEX `idx_shipping_methods_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouses` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `address` TEXT NULL,
    `city` VARCHAR(100) NULL,
    `district` VARCHAR(100) NULL,
    `latitude` DOUBLE NULL,
    `longitude` DOUBLE NULL,
    `phone` VARCHAR(20) NULL,
    `manager_name` VARCHAR(255) NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `contact_name` VARCHAR(255) NULL,
    `contact_phone` VARCHAR(20) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `warehouses_code_key`(`code`),
    INDEX `idx_warehouses_code`(`code`),
    INDEX `idx_warehouses_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouse_inventory` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `warehouse_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `min_quantity` INTEGER NOT NULL DEFAULT 0,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_wi_warehouse_id`(`warehouse_id`),
    INDEX `idx_wi_product_id`(`product_id`),
    INDEX `idx_wi_group_id`(`group_id`),
    UNIQUE INDEX `uk_warehouse_product_variant`(`warehouse_id`, `product_id`, `product_variant_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_transfers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `from_warehouse_id` BIGINT UNSIGNED NULL,
    `to_warehouse_id` BIGINT UNSIGNED NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NULL,
    `quantity` INTEGER NOT NULL,
    `type` VARCHAR(50) NOT NULL DEFAULT 'transfer',
    `status` VARCHAR(50) NOT NULL DEFAULT 'pending',
    `notes` TEXT NULL,
    `group_id` BIGINT UNSIGNED NULL,
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `idx_st_from`(`from_warehouse_id`),
    INDEX `idx_st_to`(`to_warehouse_id`),
    INDEX `idx_st_product`(`product_id`),
    INDEX `idx_st_type`(`type`),
    INDEX `idx_st_group_id`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `provider` VARCHAR(100) NULL,
    `config` JSON NULL,
    `type` ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_user_id` BIGINT UNSIGNED NULL,
    `updated_user_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `payment_methods_code_key`(`code`),
    INDEX `idx_payment_methods_status`(`status`),
    INDEX `idx_payment_methods_type`(`type`),
    INDEX `idx_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_number` VARCHAR(50) NOT NULL,
    `user_id` BIGINT UNSIGNED NULL,
    `session_token` VARCHAR(255) NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(20) NOT NULL,
    `shipping_address` JSON NOT NULL,
    `billing_address` JSON NOT NULL,
    `shipping_method_id` BIGINT UNSIGNED NULL,
    `payment_method_id` BIGINT UNSIGNED NULL,
    `order_type` ENUM('physical', 'digital') NOT NULL DEFAULT 'physical',
    `status` ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    `payment_status` ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `shipping_status` ENUM('pending', 'processing', 'shipped', 'delivered', 'returned', 'cancelled') NOT NULL DEFAULT 'pending',
    `subtotal` DECIMAL(15, 2) NOT NULL,
    `tax_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `shipping_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `total_amount` DECIMAL(15, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'VND',
    `notes` TEXT NULL,
    `tracking_number` VARCHAR(100) NULL,
    `shipped_at` DATETIME(0) NULL,
    `delivered_at` DATETIME(0) NULL,
    `group_id` BIGINT UNSIGNED NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,
    `deleted_at` DATETIME(0) NULL,

    UNIQUE INDEX `orders_order_number_key`(`order_number`),
    INDEX `idx_orders_user_id`(`user_id`),
    INDEX `idx_orders_status`(`status`),
    INDEX `idx_orders_payment_status`(`payment_status`),
    INDEX `idx_orders_deleted_at`(`deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `product_id` BIGINT UNSIGNED NOT NULL,
    `product_variant_id` BIGINT UNSIGNED NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `product_sku` VARCHAR(100) NOT NULL,
    `variant_name` VARCHAR(255) NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `unit_price` DECIMAL(15, 2) NOT NULL,
    `total_price` DECIMAL(15, 2) NOT NULL,
    `product_attributes` JSON NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_order_items_order_id`(`order_id`),
    INDEX `idx_order_items_product_id`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `payment_method_id` BIGINT UNSIGNED NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `status` ENUM('pending', 'processing', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `payment_method_type` ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
    `transaction_id` VARCHAR(255) NULL,
    `payment_method_code` VARCHAR(100) NULL,
    `paid_at` DATETIME(0) NULL,
    `refunded_at` DATETIME(0) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `idx_payments_order_id`(`order_id`),
    INDEX `idx_payments_method_id`(`payment_method_id`),
    INDEX `idx_payments_status`(`status`),
    INDEX `idx_payments_method_type`(`payment_method_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tracking_history` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT UNSIGNED NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `location` VARCHAR(255) NULL,
    `raw_data` JSON NULL,
    `created_at` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_th_order_id`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
ALTER TABLE `menus` ADD CONSTRAINT `menus_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `menus`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menus` ADD CONSTRAINT `menus_required_permission_id_fkey` FOREIGN KEY (`required_permission_id`) REFERENCES `permissions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_menu_id_fkey` FOREIGN KEY (`menu_id`) REFERENCES `menus`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `menu_permissions` ADD CONSTRAINT `menu_permissions_permission_id_fkey` FOREIGN KEY (`permission_id`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `banners` ADD CONSTRAINT `banners_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `banner_locations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_comments` ADD CONSTRAINT `post_comments_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `post_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_view_stats` ADD CONSTRAINT `post_view_stats_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `testimonials` ADD CONSTRAINT `testimonials_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `product_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category` ADD CONSTRAINT `product_category_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category` ADD CONSTRAINT `product_category_product_category_id_fkey` FOREIGN KEY (`product_category_id`) REFERENCES `product_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_product_attribute_id_fkey` FOREIGN KEY (`product_attribute_id`) REFERENCES `product_attributes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_attributes` ADD CONSTRAINT `product_variant_attributes_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variant_attributes` ADD CONSTRAINT `product_variant_attributes_product_attribute_value_id_fkey` FOREIGN KEY (`product_attribute_value_id`) REFERENCES `product_attribute_values`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_cart_header_id_fkey` FOREIGN KEY (`cart_header_id`) REFERENCES `cart_headers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coupon_usages` ADD CONSTRAINT `coupon_usages_coupon_id_fkey` FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warehouse_inventory` ADD CONSTRAINT `warehouse_inventory_warehouse_id_fkey` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warehouse_inventory` ADD CONSTRAINT `warehouse_inventory_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `warehouse_inventory` ADD CONSTRAINT `warehouse_inventory_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_from_warehouse_id_fkey` FOREIGN KEY (`from_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_to_warehouse_id_fkey` FOREIGN KEY (`to_warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_transfers` ADD CONSTRAINT `stock_transfers_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_shipping_method_id_fkey` FOREIGN KEY (`shipping_method_id`) REFERENCES `shipping_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_payment_method_id_fkey` FOREIGN KEY (`payment_method_id`) REFERENCES `payment_methods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tracking_history` ADD CONSTRAINT `tracking_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
