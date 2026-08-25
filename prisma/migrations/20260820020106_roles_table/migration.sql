/*
  Warnings:

  - You are about to drop the column `role` on the `admin_users` table. All the data in the column will be lost.
  - Added the required column `role_id` to the `admin_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin_users` DROP COLUMN `role`,
    ADD COLUMN `role_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `image_path` VARCHAR(500) NULL;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `label` VARCHAR(100) NOT NULL,
    `permissions` JSON NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `admin_users_role_id_idx` ON `admin_users`(`role_id`);

-- AddForeignKey
ALTER TABLE `admin_users` ADD CONSTRAINT `admin_users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
