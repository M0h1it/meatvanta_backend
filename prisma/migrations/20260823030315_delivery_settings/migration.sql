-- CreateTable
CREATE TABLE `delivery_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `available_days` JSON NOT NULL,
    `delivery_start_time` VARCHAR(5) NOT NULL DEFAULT '06:00',
    `delivery_end_time` VARCHAR(5) NOT NULL DEFAULT '11:00',
    `same_day_enabled` BOOLEAN NOT NULL DEFAULT true,
    `next_day_enabled` BOOLEAN NOT NULL DEFAULT true,
    `max_advance_days` INTEGER NOT NULL DEFAULT 3,
    `same_day_cutoff_time` VARCHAR(5) NULL,
    `delivery_charge_mode` VARCHAR(20) NOT NULL DEFAULT 'flat',
    `flat_delivery_charge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `delivery_area_note` VARCHAR(255) NOT NULL DEFAULT 'We deliver across Gurugram.',
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
