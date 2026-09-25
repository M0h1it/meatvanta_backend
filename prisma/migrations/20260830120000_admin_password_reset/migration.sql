-- AlterTable: admin phone (nullable - existing admins have none yet)
ALTER TABLE `admin_users` ADD COLUMN `phone` VARCHAR(20) NULL;

-- AlterTable: invalidates JWTs issued before a password change
ALTER TABLE `admin_users` ADD COLUMN `password_changed_at` DATETIME(3) NULL;

-- CreateIndex: one phone number maps to one admin account
CREATE UNIQUE INDEX `admin_users_phone_key` ON `admin_users`(`phone`);

-- CreateTable
CREATE TABLE `admin_password_resets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `otp_hash` VARCHAR(255) NOT NULL,
    `reset_token_hash` VARCHAR(255) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `attempt_count` INTEGER NOT NULL DEFAULT 0,
    `consumed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `admin_password_resets_admin_id_idx`(`admin_id`),
    INDEX `admin_password_resets_expires_at_idx`(`expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_password_resets` ADD CONSTRAINT `admin_password_resets_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin_users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
