-- AlterTable
ALTER TABLE `orders` ADD COLUMN `razorpay_order_id` VARCHAR(100) NULL,
    ADD COLUMN `razorpay_payment_id` VARCHAR(100) NULL;