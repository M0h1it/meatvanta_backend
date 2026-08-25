-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `options_total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `selected_options` JSON NULL;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `is_in_stock` BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE `product_option_groups` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `product_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `allow_multiple` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_option_groups_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_options` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `group_id` INTEGER NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `extra_price` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_options_group_id_idx`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_option_groups` ADD CONSTRAINT `product_option_groups_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_options` ADD CONSTRAINT `product_options_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `product_option_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
