-- CreateTable
CREATE TABLE `shop_info` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `shop_name` VARCHAR(100) NOT NULL DEFAULT 'Meat Vanta',
    `tagline` VARCHAR(150) NOT NULL DEFAULT 'Fresh Every Morning',
    `years_in_business` INTEGER NOT NULL DEFAULT 35,
    `phone` VARCHAR(20) NOT NULL DEFAULT '',
    `whatsapp_number` VARCHAR(20) NOT NULL DEFAULT '',
    `email` VARCHAR(150) NOT NULL DEFAULT '',
    `address_line` TEXT NOT NULL,
    `map_url` VARCHAR(500) NOT NULL DEFAULT '',
    `shop_hours` VARCHAR(255) NOT NULL DEFAULT '',
    `about_story` TEXT NOT NULL,
    `quality_promise` TEXT NOT NULL,
    `fssai_number` VARCHAR(50) NOT NULL DEFAULT '',
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;