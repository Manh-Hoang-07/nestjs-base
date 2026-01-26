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
