-- CreateTable
CREATE TABLE `pending_checkouts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `razorpay_order_id` VARCHAR(100) NOT NULL,
    `customer_id` INTEGER NULL,
    `payload` JSON NOT NULL,
    `amount` DECIMAL(10,2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pending_checkouts_razorpay_order_id_key`(`razorpay_order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;