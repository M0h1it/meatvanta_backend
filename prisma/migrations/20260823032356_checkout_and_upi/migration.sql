-- AlterTable
ALTER TABLE `delivery_settings` ADD COLUMN `cod_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `upi_enabled` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `upi_id` VARCHAR(100) NOT NULL DEFAULT 'starhalal@upi',
    ADD COLUMN `upi_payee_name` VARCHAR(100) NOT NULL DEFAULT 'Star Halal Meat Shop';

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `delivery_charge_status` VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    ADD COLUMN `delivery_date` DATE NULL,
    ADD COLUMN `delivery_end_time` VARCHAR(5) NULL,
    ADD COLUMN `delivery_person_name` VARCHAR(100) NULL,
    ADD COLUMN `delivery_start_time` VARCHAR(5) NULL,
    ADD COLUMN `payment_note` VARCHAR(255) NULL,
    ADD COLUMN `payment_verified_at` DATETIME(3) NULL,
    ADD COLUMN `upi_receipt_text` TEXT NULL,
    ADD COLUMN `upi_transaction_id` VARCHAR(100) NULL;
