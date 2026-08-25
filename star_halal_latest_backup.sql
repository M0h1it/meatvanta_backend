-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 25, 2026 at 01:49 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `star_halal`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `role_id` int(11) NOT NULL,
  `preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`preferences`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`id`, `name`, `email`, `password_hash`, `is_active`, `last_login_at`, `created_at`, `updated_at`, `role_id`, `preferences`) VALUES
(1, 'Owner', 'owner@starhalalmeat.com', '$2a$12$6.ufq7i0q1QuE.cTmh4zVOHYh2tyulMyO5Z8tNDDoxC2T4UmTowSq', 1, '2026-08-24 15:45:16.191', '2026-08-20 02:01:14.270', '2026-08-24 15:54:50.592', 1, '{\"showAuditLog\":false}');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `entity` varchar(100) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`id`, `admin_id`, `action`, `entity`, `entity_id`, `metadata`, `ip_address`, `created_at`) VALUES
(1, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-20 02:03:46.453'),
(2, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-21 00:56:36.635'),
(3, 1, 'auth:logout', NULL, NULL, 'null', '::1', '2026-08-21 00:57:43.828'),
(4, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-21 00:57:51.448'),
(5, 1, 'categories:create', 'Category', 1, 'null', '::1', '2026-08-21 01:01:02.505'),
(6, 1, 'categories:create', 'Category', 2, 'null', '::1', '2026-08-21 01:01:19.170'),
(7, 1, 'categories:create', 'Category', 3, 'null', '::1', '2026-08-21 01:01:34.513'),
(8, 1, 'products:create', 'Product', 1, 'null', '::1', '2026-08-21 01:03:12.334'),
(9, 1, 'products:update', 'Product', 1, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:15:08.178'),
(10, 1, 'products:update', 'Product', 1, '{\"name\":\"Chicken Curry Cut\",\"categoryId\":1,\"description\":\"Fresh, halal chicken curry cut prepared from quality chicken and cut into convenient pieces for everyday cooking. \\nPerfect for curries, biryani, korma, masala dishes, and traditional Indian recipes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:16:02.982'),
(11, 1, 'products:update', 'Product', 1, '{\"name\":\"Chicken Curry Cut\",\"categoryId\":1,\"description\":\"Fresh, halal chicken curry cut prepared from quality chicken and cut into convenient pieces for everyday cooking. \\nPerfect for curries, biryani, korma, masala dishes, and traditional Indian recipes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:16:06.392'),
(12, 1, 'products:update', 'Product', 1, '{\"name\":\"Chicken Curry Cut\",\"categoryId\":1,\"description\":\"Fresh, halal chicken curry cut prepared from quality chicken and cut into convenient pieces for everyday cooking. \\nPerfect for curries, biryani, korma, masala dishes, and traditional Indian recipes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:16:11.410'),
(13, 1, 'products:update', 'Product', 2, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:18:37.915'),
(14, 1, 'products:update', 'Product', 2, '{\"name\":\"Chicken Chest Boneless\",\"categoryId\":1,\"description\":\"Fresh halal chicken breast meat, carefully prepared and completely boneless for convenient cooking. \\nTender and versatile, it is ideal for grilling, frying, curries, kebabs, wraps, sandwiches, and healthy everyday meals. \\nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:19:09.208'),
(15, 1, 'products:update', 'Product', 3, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:21:50.155'),
(16, 1, 'products:update', 'Product', 3, '{\"imageRemoved\":true}', '::1', '2026-08-21 01:21:54.890'),
(17, 1, 'products:update', 'Product', 3, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:22:47.651'),
(18, 1, 'products:update', 'Product', 3, '{\"name\":\"Chicken Thai Boneless\",\"categoryId\":1,\"description\":\"Fresh halal Thai-style boneless chicken, carefully prepared for easy cooking with tender, juicy meat and no bones. \\nPerfect for grilling, stir-frying, curries, kebabs, wraps, and other flavorful dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:23:19.267'),
(19, 1, 'products:update', 'Product', 4, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:24:03.042'),
(20, 1, 'products:update', 'Product', 4, '{\"name\":\"Chicken Wings\",\"categoryId\":1,\"description\":\"Fresh halal chicken wings, carefully cleaned and prepared with tender meat and a naturally flavorful texture. \\nPerfect for frying, grilling, roasting, BBQ, spicy wings, and other delicious chicken dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:24:21.246'),
(21, 1, 'products:update', 'Product', 5, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:25:28.269'),
(22, 1, 'products:update', 'Product', 5, '{\"name\":\"Chicken Leg Piece\",\"categoryId\":1,\"description\":\"Fresh halal chicken leg pieces, carefully cleaned and prepared with tender, juicy meat and rich natural flavor. \\nIdeal for curries, grilling, roasting, tandoori, frying, and traditional Indian chicken dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:25:48.972'),
(23, 1, 'products:update', 'Product', 6, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:38:24.484'),
(24, 1, 'products:update', 'Product', 6, '{\"name\":\"POTA Kaleji\",\"categoryId\":1,\"description\":\"Fresh halal chicken POTA Kaleji, carefully cleaned and prepared for convenient cooking. \\nRich in natural flavor and tender in texture, it is perfect for spicy masala, curry, fry, and traditional Indian-style liver dishes. \\nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:38:50.350'),
(25, 1, 'products:update', 'Product', 7, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:39:18.459'),
(26, 1, 'products:update', 'Product', 7, '{\"name\":\"Chicken Keema\",\"categoryId\":1,\"description\":\"Fresh halal chicken keema, finely minced from quality chicken and prepared fresh for convenient cooking. \\nPerfect for keema curry, kebabs, samosas, stuffed parathas, meatballs, biryani, and a variety of flavorful Indian dishes. \\nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:39:46.934'),
(27, 1, 'products:update', 'Product', 8, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:40:25.080'),
(28, 1, 'products:update', 'Product', 8, '{\"name\":\"Chicken Marinated\",\"categoryId\":1,\"description\":\"Fresh halal chicken marinated with a flavorful blend of aromatic spices and carefully selected seasonings. \\nPrepared fresh and ready to cook, making it convenient for grilling, roasting, frying, BBQ, and delicious Indian-style dishes.\\nPerfect for quick and flavorful meals at home. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:40:51.792'),
(29, 1, 'products:update', 'Product', 18, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:41:37.809'),
(30, 1, 'products:update', 'Product', 18, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:42:38.607'),
(31, 1, 'products:update', 'Product', 18, '{\"name\":\"Mutton Paya (Without Skin)\",\"categoryId\":3,\"description\":\"\"}', '::1', '2026-08-21 01:42:41.566'),
(32, 1, 'products:update', 'Product', 18, '{\"name\":\"Mutton Paya (Without Skin)\",\"categoryId\":3,\"description\":\"Fresh halal mutton paya without skin, carefully cleaned and prepared for convenient cooking. \\nRich in flavor and traditionally enjoyed in slow-cooked curries and nourishing paya preparations. \\nIdeal for making traditional mutton paya, spicy gravies, and hearty Indian-style dishes. Pack contains 4 pieces.\"}', '::1', '2026-08-21 01:43:05.078'),
(33, 1, 'products:update', 'Product', 19, '{\"imageUpdated\":true}', '::1', '2026-08-21 01:43:33.417'),
(34, 1, 'products:update', 'Product', 19, '{\"name\":\"Mutton Steak\",\"categoryId\":3,\"description\":\"Fresh halal mutton steak, carefully prepared and cut into convenient portions for easy cooking. \\nTender, flavorful, and ideal for grilling, pan-searing, roasting, BBQ, and rich Indian-style preparations. Perfect for a satisfying meal with your favorite marinades, spices, or sauces.\\nAvailable in 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-21 01:44:06.414'),
(35, 1, 'auth:logout', NULL, NULL, 'null', '::1', '2026-08-21 01:44:42.831'),
(36, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-21 01:45:08.822'),
(37, 1, 'auth:logout', NULL, NULL, 'null', '::1', '2026-08-21 01:55:45.810'),
(38, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-21 08:48:19.399'),
(39, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-22 01:04:57.204'),
(40, 1, 'auth:logout', NULL, NULL, 'null', '::1', '2026-08-22 01:05:44.262'),
(41, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-22 01:05:51.073'),
(42, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-22 12:31:44.011'),
(43, 1, 'products:update', 'Product', 1, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:44:03.479'),
(44, 1, 'products:update', 'Product', 1, '{\"imageRemoved\":true}', '::1', '2026-08-22 12:44:06.322'),
(45, 1, 'products:update', 'Product', 2, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:44:16.292'),
(46, 1, 'products:update', 'Product', 2, '{\"name\":\"Chicken Chest Boneless\",\"categoryId\":1,\"description\":\"Fresh halal chicken breast meat, carefully prepared and completely boneless for convenient cooking. \\nTender and versatile, it is ideal for grilling, frying, curries, kebabs, wraps, sandwiches, and healthy everyday meals. \\nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-22 12:44:18.921'),
(47, 1, 'products:update', 'Product', 3, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:45:03.250'),
(48, 1, 'products:update', 'Product', 3, '{\"name\":\"Chicken Thai Boneless\",\"categoryId\":1,\"description\":\"Fresh halal Thai-style boneless chicken, carefully prepared for easy cooking with tender, juicy meat and no bones. \\nPerfect for grilling, stir-frying, curries, kebabs, wraps, and other flavorful dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-22 12:45:09.549'),
(49, 1, 'products:update', 'Product', 6, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:45:33.479'),
(50, 1, 'products:update', 'Product', 6, '{\"name\":\"POTA Kaleji\",\"categoryId\":1,\"description\":\"Fresh halal chicken POTA Kaleji, carefully cleaned and prepared for convenient cooking. \\nRich in natural flavor and tender in texture, it is perfect for spicy masala, curry, fry, and traditional Indian-style liver dishes. \\nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-22 12:45:35.572'),
(51, 1, 'products:update', 'Product', 5, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:46:07.686'),
(52, 1, 'products:update', 'Product', 4, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:46:35.825'),
(53, 1, 'products:update', 'Product', 4, '{\"name\":\"Chicken Wings\",\"categoryId\":1,\"description\":\"Fresh halal chicken wings, carefully cleaned and prepared with tender meat and a naturally flavorful texture. \\nPerfect for frying, grilling, roasting, BBQ, spicy wings, and other delicious chicken dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.\"}', '::1', '2026-08-22 12:46:38.220'),
(54, 1, 'products:update', 'Product', 7, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:47:13.866'),
(55, 1, 'products:update', 'Product', 15, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:47:23.757'),
(56, 1, 'products:update', 'Product', 1, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:47:50.860'),
(57, 1, 'products:update', 'Product', 8, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:48:24.145'),
(58, 1, 'products:update', 'Product', 12, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:48:43.660'),
(59, 1, 'products:update', 'Product', 16, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:49:04.209'),
(60, 1, 'products:update', 'Product', 19, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:49:30.802'),
(61, 1, 'products:update', 'Product', 10, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:49:52.703'),
(62, 1, 'products:update', 'Product', 14, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:50:12.910'),
(63, 1, 'products:update', 'Product', 9, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:50:27.515'),
(64, 1, 'products:update', 'Product', 18, '{\"imageUpdated\":true}', '::1', '2026-08-22 12:50:43.879'),
(65, 1, 'products:update', 'Product', 11, '{\"imageUpdated\":true}', '::1', '2026-08-22 13:26:04.232'),
(66, 1, 'products:update', 'Product', 17, '{\"imageUpdated\":true}', '::1', '2026-08-22 13:26:25.936'),
(67, 1, 'products:update', 'Product', 13, '{\"imageUpdated\":true}', '::1', '2026-08-22 13:26:42.648'),
(68, 1, 'auth:logout', NULL, NULL, 'null', '::1', '2026-08-22 13:50:06.656'),
(69, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-22 13:50:11.967'),
(70, 1, 'products:toggleStock', 'ProductVariant', 1, '{\"isInStock\":false}', '::1', '2026-08-22 13:51:52.757'),
(71, 1, 'products:toggleStock', 'ProductVariant', 1, '{\"isInStock\":true}', '::1', '2026-08-22 13:51:53.656'),
(72, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-23 02:41:53.011'),
(73, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"11:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":null,\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\"}', '::1', '2026-08-23 03:04:15.046'),
(74, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"11:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":null,\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\",\"codEnabled\":true,\"upiEnabled\":true,\"upiId\":\"starhalal@upi\",\"upiPayeeName\":\"Star Halal Meat Shop\"}', '::1', '2026-08-23 03:24:49.443'),
(75, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"11:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":null,\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\",\"codEnabled\":true,\"upiEnabled\":false,\"upiId\":\"starhalal@upi\",\"upiPayeeName\":\"Star Halal Meat Shop\"}', '::1', '2026-08-23 03:28:41.937'),
(76, 1, 'orders:updateStatus', 'Order', 1, '{\"status\":\"preparing\"}', '::1', '2026-08-23 03:33:45.914'),
(77, 1, 'orders:updateStatus', 'Order', 1, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 03:34:21.310'),
(78, 1, 'orders:updateStatus', 'Order', 1, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 03:34:48.374'),
(79, 1, 'orders:updateStatus', 'Order', 1, '{\"status\":\"delivered\"}', '::1', '2026-08-23 03:35:21.358'),
(80, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"11:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":null,\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\",\"codEnabled\":true,\"upiEnabled\":true,\"upiId\":\"starhalal@upi\",\"upiPayeeName\":\"Star Halal Meat Shop\"}', '::1', '2026-08-23 03:35:56.918'),
(81, 1, 'orders:updateStatus', 'Order', 2, '{\"paymentStatus\":\"verified\"}', '::1', '2026-08-23 03:37:16.997'),
(82, 1, 'orders:updateStatus', 'Order', 2, '{\"status\":\"preparing\"}', '::1', '2026-08-23 03:37:53.213'),
(83, 1, 'orders:updateStatus', 'Order', 2, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 03:38:31.166'),
(84, 1, 'orders:updateStatus', 'Order', 2, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 03:38:33.473'),
(85, 1, 'orders:updateStatus', 'Order', 2, '{\"status\":\"delivered\"}', '::1', '2026-08-23 03:39:16.164'),
(86, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"11:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":\"20:10\",\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\",\"codEnabled\":true,\"upiEnabled\":true,\"upiId\":\"starhalal@upi\",\"upiPayeeName\":\"Star Halal Meat Shop\"}', '::1', '2026-08-23 03:40:40.890'),
(87, 1, 'orders:updateStatus', 'Order', 3, '{\"status\":\"preparing\"}', '::1', '2026-08-23 03:52:17.145'),
(88, 1, 'orders:updateStatus', 'Order', 3, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 03:52:45.014'),
(89, 1, 'orders:updateStatus', 'Order', 3, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 03:52:58.709'),
(90, 1, 'orders:updateStatus', 'Order', 3, '{\"status\":\"delivered\"}', '::1', '2026-08-23 03:54:29.926'),
(91, 1, 'orders:updateStatus', 'Order', 4, '{\"paymentStatus\":\"verified\"}', '::1', '2026-08-23 03:56:57.642'),
(92, 1, 'orders:updateStatus', 'Order', 4, '{\"status\":\"preparing\"}', '::1', '2026-08-23 03:57:31.796'),
(93, 1, 'orders:updateStatus', 'Order', 4, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 03:57:37.019'),
(94, 1, 'orders:updateStatus', 'Order', 4, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 03:57:38.178'),
(95, 1, 'orders:updateStatus', 'Order', 4, '{\"status\":\"delivered\"}', '::1', '2026-08-23 04:02:08.624'),
(96, 1, 'orders:updateStatus', 'Order', 7, '{\"status\":\"preparing\"}', '::1', '2026-08-23 08:22:30.103'),
(97, 1, 'orders:updateStatus', 'Order', 7, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 08:22:40.890'),
(98, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-23 13:34:40.815'),
(99, 1, 'orders:updateStatus', 'Order', 5, '{\"status\":\"preparing\"}', '::1', '2026-08-23 13:40:16.048'),
(100, 1, 'orders:updateStatus', 'Order', 5, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 13:40:28.089'),
(101, 1, 'orders:updateStatus', 'Order', 5, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 13:40:31.981'),
(102, 1, 'orders:updateStatus', 'Order', 5, '{\"status\":\"delivered\"}', '::1', '2026-08-23 13:40:33.800'),
(103, 1, 'orders:updateStatus', 'Order', 6, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 13:40:38.682'),
(104, 1, 'orders:updateStatus', 'Order', 7, '{\"deliveryPersonName\":\"rahul\"}', '::1', '2026-08-23 13:40:43.497'),
(105, 1, 'orders:updateStatus', 'Order', 7, '{\"status\":\"delivered\"}', '::1', '2026-08-23 13:40:48.064'),
(106, 1, 'orders:updateStatus', 'Order', 6, '{\"status\":\"preparing\"}', '::1', '2026-08-23 13:40:50.020'),
(107, 1, 'orders:updateStatus', 'Order', 6, '{\"status\":\"out_for_delivery\"}', '::1', '2026-08-23 13:40:50.501'),
(108, 1, 'orders:updateStatus', 'Order', 6, '{\"status\":\"delivered\"}', '::1', '2026-08-23 13:40:51.883'),
(109, 1, 'categories:update', 'Category', 1, '{\"name\":\"Chicken\",\"sortOrder\":1,\"isActive\":true}', '::1', '2026-08-23 14:18:14.062'),
(110, 1, 'categories:update', 'Category', 2, '{\"name\":\"Mutton\",\"sortOrder\":2,\"isActive\":true}', '::1', '2026-08-23 14:18:21.306'),
(111, 1, 'products:update', 'ProductOptionGroup', 1, '{\"productId\":8,\"created\":{\"name\":\"Tandoori\",\"isRequired\":false,\"allowMultiple\":false}}', '::1', '2026-08-23 14:33:57.480'),
(112, 1, 'products:update', 'ProductOption', 1, '{\"name\":\"Tandoori\",\"extraPrice\":39}', '::1', '2026-08-23 14:34:15.916'),
(113, 1, 'products:update', 'ProductOption', 2, '{\"name\":\"Lemon\",\"extraPrice\":39}', '::1', '2026-08-23 14:34:34.769'),
(114, 1, 'products:update', 'ProductOption', 3, '{\"name\":\"Korma\",\"extraPrice\":39}', '::1', '2026-08-23 14:34:40.100'),
(115, 1, 'products:update', 'ProductOption', 4, '{\"name\":\"Sahi Korma\",\"extraPrice\":39}', '::1', '2026-08-23 14:34:51.030'),
(116, 1, 'products:update', 'ProductOption', 5, '{\"name\":\"Fry\",\"extraPrice\":39}', '::1', '2026-08-23 14:35:01.095'),
(117, 1, 'products:update', 'ProductOption', 6, '{\"name\":\"Handi chicken\",\"extraPrice\":79}', '::1', '2026-08-23 14:35:12.878'),
(118, 1, 'products:update', 'ProductOptionGroup', 2, '{\"productId\":16,\"created\":{\"name\":\"Marinations\",\"isRequired\":false,\"allowMultiple\":false}}', '::1', '2026-08-23 14:36:19.403'),
(119, 1, 'products:update', 'ProductOption', 7, '{\"name\":\"Afghani\",\"extraPrice\":49}', '::1', '2026-08-23 14:36:29.510'),
(120, 1, 'products:update', 'ProductOption', 8, '{\"name\":\"Korma\",\"extraPrice\":49}', '::1', '2026-08-23 14:36:37.153'),
(121, 1, 'products:update', 'ProductOption', 9, '{\"name\":\"Handi mutton\",\"extraPrice\":49}', '::1', '2026-08-23 14:36:45.909'),
(122, 1, 'products:update', 'ProductOption', 10, '{\"name\":\"Sahi korma\",\"extraPrice\":49}', '::1', '2026-08-23 14:36:52.910'),
(123, 1, 'products:update', 'ProductOption', 11, '{\"name\":\"Biryani\",\"extraPrice\":49}', '::1', '2026-08-23 14:36:58.576'),
(124, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-24 14:30:42.336'),
(125, 1, 'auth:login', NULL, NULL, 'null', '::1', '2026-08-24 15:45:16.201'),
(126, 1, 'delivery_settings:update', 'DeliverySettings', 1, '{\"availableDays\":[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"],\"deliveryStartTime\":\"06:00\",\"deliveryEndTime\":\"22:00\",\"sameDayEnabled\":true,\"nextDayEnabled\":true,\"maxAdvanceDays\":3,\"sameDayCutoffTime\":\"20:10\",\"deliveryChargeMode\":\"flat\",\"flatDeliveryCharge\":30,\"deliveryAreaNote\":\"We deliver across Gurugram.\",\"codEnabled\":true,\"upiEnabled\":true,\"upiId\":\"starhalal@upi\",\"upiPayeeName\":\"Star Halal Meat Shop\"}', '::1', '2026-08-24 15:45:31.867'),
(127, 1, 'products:toggleStock', 'Product', 9, '{\"isInStock\":false}', '::1', '2026-08-24 15:49:45.103'),
(128, 1, 'products:toggleStock', 'Product', 9, '{\"isInStock\":true}', '::1', '2026-08-24 15:50:30.111');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(120) NOT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Chicken', 'chicken', 1, 1, '2026-08-21 01:01:02.499', '2026-08-23 14:18:14.058'),
(2, 'Mutton', 'mutton', 2, 1, '2026-08-21 01:01:19.167', '2026-08-23 14:18:21.303'),
(3, 'Special Items', 'special-items', 0, 1, '2026-08-21 01:01:34.508', '2026-08-21 01:01:34.508');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Mohit kumar', '8826671540', NULL, 1, '2026-08-24 15:44:06.305', '2026-08-23 08:20:50.224', '2026-08-24 15:44:06.306');

-- --------------------------------------------------------

--
-- Table structure for table `customer_addresses`
--

CREATE TABLE `customer_addresses` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `label` varchar(50) NOT NULL DEFAULT 'Home',
  `address_line` text NOT NULL,
  `area` varchar(150) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `is_default` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_addresses`
--

INSERT INTO `customer_addresses` (`id`, `customer_id`, `label`, `address_line`, `area`, `pincode`, `latitude`, `longitude`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Home', '53/1 g block , saraswati enclave,', 'sector 37 A', '122001', NULL, NULL, 1, '2026-08-23 08:23:41.634', '2026-08-23 08:23:41.634');

-- --------------------------------------------------------

--
-- Table structure for table `customer_refresh_tokens`
--

CREATE TABLE `customer_refresh_tokens` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `token_hash` varchar(255) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_refresh_tokens`
--

INSERT INTO `customer_refresh_tokens` (`id`, `customer_id`, `token_hash`, `expires_at`, `revoked_at`, `created_at`) VALUES
(1, 1, 'd621f2c73a406c231a6726ae6e0844bc9a5378752c49f96fa20aa0affcaec7cb', '2026-09-22 08:20:50.234', '2026-08-23 13:14:46.270', '2026-08-23 08:20:50.236'),
(2, 1, '8d9d8cf6b2cd54b4bb185b5a41311b0daac5ef91c6354aafa9d71439c280e4fd', '2026-09-22 13:14:46.325', '2026-08-23 14:17:33.465', '2026-08-23 13:14:46.327'),
(3, 1, '395a803bdfdc6c21f5f112789b7a22f6841b8beefea3e30b9788c4c785887f2d', '2026-09-22 14:17:33.474', '2026-08-24 14:30:41.236', '2026-08-23 14:17:33.475'),
(4, 1, '55b49813d10b7dd9c3faac90ebe1b208c8dbaeafba8a242039ba9754ced57b34', '2026-09-23 14:30:41.273', '2026-08-24 15:33:48.582', '2026-08-24 14:30:41.274'),
(5, 1, '8db4ec835c3aec42a33b9b7333be61322daff7b39b99c88045805ff47e158ae4', '2026-09-23 15:33:48.609', '2026-08-24 15:34:09.294', '2026-08-24 15:33:48.611'),
(6, 1, '3d0916e6c701874c590b6eac2438b4eba41a0acdb411192ffeb969ce8e76fb91', '2026-09-23 15:44:06.321', NULL, '2026-08-24 15:44:06.322');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_settings`
--

CREATE TABLE `delivery_settings` (
  `id` int(11) NOT NULL DEFAULT 1,
  `available_days` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`available_days`)),
  `delivery_start_time` varchar(5) NOT NULL DEFAULT '06:00',
  `delivery_end_time` varchar(5) NOT NULL DEFAULT '11:00',
  `same_day_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `next_day_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `max_advance_days` int(11) NOT NULL DEFAULT 3,
  `same_day_cutoff_time` varchar(5) DEFAULT NULL,
  `delivery_charge_mode` varchar(20) NOT NULL DEFAULT 'flat',
  `flat_delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `delivery_area_note` varchar(255) NOT NULL DEFAULT 'We deliver across Gurugram.',
  `updated_at` datetime(3) NOT NULL,
  `cod_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `upi_enabled` tinyint(1) NOT NULL DEFAULT 1,
  `upi_id` varchar(100) NOT NULL DEFAULT 'starhalal@upi',
  `upi_payee_name` varchar(100) NOT NULL DEFAULT 'Star Halal Meat Shop'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `delivery_settings`
--

INSERT INTO `delivery_settings` (`id`, `available_days`, `delivery_start_time`, `delivery_end_time`, `same_day_enabled`, `next_day_enabled`, `max_advance_days`, `same_day_cutoff_time`, `delivery_charge_mode`, `flat_delivery_charge`, `delivery_area_note`, `updated_at`, `cod_enabled`, `upi_enabled`, `upi_id`, `upi_payee_name`) VALUES
(1, '[\"sunday\",\"monday\",\"wednesday\",\"thursday\",\"friday\"]', '06:00', '22:00', 1, 1, 3, '20:10', 'flat', 30.00, 'We deliver across Gurugram.', '2026-08-24 15:45:31.860', 1, 1, 'starhalal@upi', 'Star Halal Meat Shop');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(150) NOT NULL,
  `message` varchar(500) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(11) DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `title`, `message`, `entity_type`, `entity_id`, `is_read`, `read_at`, `created_at`) VALUES
(1, 'new_order', 'New order ORD-1005', 'Mohit kumar · Rs.269 · COD — 1x Mutton Curry Cut', 'Order', 5, 1, '2026-08-23 04:20:58.525', '2026-08-23 04:20:33.480'),
(2, 'new_order', 'New order ORD-1006', 'Mohit kumar · Rs.279 · COD — 1x Mutton Shoulder Cut', 'Order', 6, 1, '2026-08-23 04:27:41.663', '2026-08-23 04:27:28.111'),
(3, 'new_order', 'New order ORD-1007', 'Mohit kumar · Rs.279 · COD — 1x Mutton Shoulder Cut', 'Order', 7, 1, '2026-08-23 13:41:04.850', '2026-08-23 08:21:00.822');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_number` varchar(20) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_phone` varchar(20) NOT NULL,
  `delivery_address` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'placed',
  `payment_method` varchar(20) NOT NULL DEFAULT 'cod',
  `payment_status` varchar(20) NOT NULL DEFAULT 'unpaid',
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_charge` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by_admin_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `delivery_charge_status` varchar(20) NOT NULL DEFAULT 'confirmed',
  `delivery_date` date DEFAULT NULL,
  `delivery_end_time` varchar(5) DEFAULT NULL,
  `delivery_person_name` varchar(100) DEFAULT NULL,
  `delivery_start_time` varchar(5) DEFAULT NULL,
  `payment_note` varchar(255) DEFAULT NULL,
  `payment_verified_at` datetime(3) DEFAULT NULL,
  `upi_receipt_text` text DEFAULT NULL,
  `upi_transaction_id` varchar(100) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `delivery_address`, `status`, `payment_method`, `payment_status`, `subtotal`, `delivery_charge`, `discount`, `total`, `notes`, `created_by_admin_id`, `created_at`, `updated_at`, `delivery_charge_status`, `delivery_date`, `delivery_end_time`, `delivery_person_name`, `delivery_start_time`, `payment_note`, `payment_verified_at`, `upi_receipt_text`, `upi_transaction_id`, `customer_id`) VALUES
(1, 'ORD-1001', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'cod', 'paid', 407.00, 30.00, 0.00, 437.00, NULL, NULL, '2026-08-23 03:33:07.387', '2026-08-23 03:35:21.350', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, NULL, NULL, NULL, 1),
(2, 'ORD-1002', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'upi', 'verified', 99.00, 30.00, 0.00, 129.00, NULL, NULL, '2026-08-23 03:36:52.228', '2026-08-23 03:39:16.158', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, '2026-08-23 03:37:16.988', NULL, '528193746205', 1),
(3, 'ORD-1003', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'cod', 'paid', 577.00, 30.00, 0.00, 607.00, NULL, NULL, '2026-08-23 03:49:58.965', '2026-08-23 03:54:29.919', 'confirmed', '2026-08-25', '11:00', 'rahul', '06:00', NULL, NULL, NULL, NULL, 1),
(4, 'ORD-1004', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'upi', 'verified', 268.00, 30.00, 0.00, 298.00, NULL, NULL, '2026-08-23 03:56:26.017', '2026-08-23 04:02:08.617', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, '2026-08-23 03:56:57.632', NULL, '331057928461', 1),
(5, 'ORD-1005', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'cod', 'paid', 239.00, 30.00, 0.00, 269.00, NULL, NULL, '2026-08-23 04:20:33.467', '2026-08-23 13:40:33.795', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, NULL, NULL, NULL, 1),
(6, 'ORD-1006', 'Mohit kumar', '08826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'cod', 'paid', 249.00, 30.00, 0.00, 279.00, NULL, NULL, '2026-08-23 04:27:28.099', '2026-08-23 13:40:51.878', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, NULL, NULL, NULL, 1),
(7, 'ORD-1007', 'Mohit kumar', '8826671540', '53/1 g block\nsaraswati enclave gurugram harayana', 'delivered', 'cod', 'paid', 249.00, 30.00, 0.00, 279.00, NULL, NULL, '2026-08-23 08:21:00.810', '2026-08-23 13:40:48.059', 'confirmed', '2026-08-22', '11:00', 'rahul', '06:00', NULL, NULL, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_variant_id` int(11) DEFAULT NULL,
  `product_name` varchar(150) NOT NULL,
  `variant_label` varchar(50) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `line_total` decimal(10,2) NOT NULL,
  `options_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `selected_options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`selected_options`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_variant_id`, `product_name`, `variant_label`, `unit_price`, `quantity`, `line_total`, `options_total`, `selected_options`) VALUES
(1, 1, 1, 'Chicken Curry Cut', '250 GM', 79.00, 1, 79.00, 0.00, NULL),
(2, 1, 29, 'Chicken Marinated', '250 GM', 149.00, 1, 149.00, 0.00, NULL),
(3, 1, 6, 'Chicken Chest Boneless', '500 GM', 179.00, 1, 179.00, 0.00, NULL),
(4, 2, 9, 'Chicken Thai Boneless', '250 GM', 99.00, 1, 99.00, 0.00, NULL),
(5, 3, 1, 'Chicken Curry Cut', '250 GM', 79.00, 1, 79.00, 0.00, NULL),
(6, 3, 69, 'Mutton Paya (Without Skin)', '4 Pieces', 249.00, 1, 249.00, 0.00, NULL),
(7, 3, 70, 'Mutton Steak', '500 GM', 249.00, 1, 249.00, 0.00, NULL),
(8, 4, 25, 'Chicken Keema', '250 GM', 89.00, 1, 89.00, 0.00, NULL),
(9, 4, 26, 'Chicken Keema', '500 GM', 179.00, 1, 179.00, 0.00, NULL),
(10, 5, 33, 'Mutton Curry Cut', '250 GM', 239.00, 1, 239.00, 0.00, NULL),
(11, 6, 37, 'Mutton Shoulder Cut', '250 GM', 249.00, 1, 249.00, 0.00, NULL),
(12, 7, 37, 'Mutton Shoulder Cut', '250 GM', 249.00, 1, 249.00, 0.00, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `otp_requests`
--

CREATE TABLE `otp_requests` (
  `id` int(11) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `otp_hash` varchar(255) NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `attempt_count` int(11) NOT NULL DEFAULT 0,
  `consumed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_requests`
--

INSERT INTO `otp_requests` (`id`, `phone`, `otp_hash`, `expires_at`, `attempt_count`, `consumed_at`, `created_at`) VALUES
(1, '8826671540', '$2a$08$MocKeikJBSlpVCq3XBb4.eC2kFxyobhEdhQD6x78C8auVlgHBCuJW', '2026-08-23 08:23:52.244', 0, '2026-08-23 08:13:55.719', '2026-08-23 08:13:52.245'),
(2, '8826671540', '$2a$08$2EngoqhMEwhVIQnxSsELIOcbxWHxyGFhoxuPM9VtPgJXFL0ml4iF6', '2026-08-23 08:30:38.142', 0, '2026-08-23 08:20:50.228', '2026-08-23 08:20:38.144'),
(3, '8826671540', '$2a$08$lK.37nd0E.FeMHd3Rpetf.R0mmlNpsDCUqNvGgzjFozWD.naVLY8G', '2026-08-24 15:53:59.651', 0, '2026-08-24 15:44:06.313', '2026-08-24 15:43:59.652');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `image_path` varchar(500) DEFAULT NULL,
  `is_in_stock` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `image_url`, `is_active`, `sort_order`, `created_at`, `updated_at`, `image_path`, `is_in_stock`) VALUES
(1, 1, 'Chicken Curry Cut', 'Fresh, halal chicken curry cut prepared from quality chicken and cut into convenient pieces for everyday cooking. \nPerfect for curries, biryani, korma, masala dishes, and traditional Indian recipes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-curry-cut-1787402870850.jpeg', 1, 0, '2026-08-21 01:03:12.325', '2026-08-22 12:47:50.854', 'chicken\\chicken-curry-cut-1787402870850.jpeg', 1),
(2, 1, 'Chicken Chest Boneless', 'Fresh halal chicken breast meat, carefully prepared and completely boneless for convenient cooking. \nTender and versatile, it is ideal for grilling, frying, curries, kebabs, wraps, sandwiches, and healthy everyday meals. \nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-chest-boneless-1787402656283.jpeg', 1, 1, '2026-08-21 06:35:35.591', '2026-08-22 12:44:18.916', 'chicken\\chicken-chest-boneless-1787402656283.jpeg', 1),
(3, 1, 'Chicken Thai Boneless', 'Fresh halal Thai-style boneless chicken, carefully prepared for easy cooking with tender, juicy meat and no bones. \nPerfect for grilling, stir-frying, curries, kebabs, wraps, and other flavorful dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-thai-boneless-1787402703243.jpeg', 1, 2, '2026-08-21 06:35:35.591', '2026-08-22 12:45:09.543', 'chicken\\chicken-thai-boneless-1787402703243.jpeg', 1),
(4, 1, 'Chicken Wings', 'Fresh halal chicken wings, carefully cleaned and prepared with tender meat and a naturally flavorful texture. \nPerfect for frying, grilling, roasting, BBQ, spicy wings, and other delicious chicken dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-wings-1787402795817.jpeg', 1, 3, '2026-08-21 06:35:35.591', '2026-08-22 12:46:38.213', 'chicken\\chicken-wings-1787402795817.jpeg', 1),
(5, 1, 'Chicken Leg Piece', 'Fresh halal chicken leg pieces, carefully cleaned and prepared with tender, juicy meat and rich natural flavor. \nIdeal for curries, grilling, roasting, tandoori, frying, and traditional Indian chicken dishes. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-leg-piece-1787402767675.jpeg', 1, 4, '2026-08-21 06:35:35.591', '2026-08-22 12:46:07.679', 'chicken\\chicken-leg-piece-1787402767675.jpeg', 1),
(6, 1, 'POTA Kaleji', 'Fresh halal chicken POTA Kaleji, carefully cleaned and prepared for convenient cooking. \nRich in natural flavor and tender in texture, it is perfect for spicy masala, curry, fry, and traditional Indian-style liver dishes. \nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/pota-kaleji-1787402733470.jpeg', 1, 5, '2026-08-21 06:35:35.591', '2026-08-22 12:45:35.565', 'chicken\\pota-kaleji-1787402733470.jpeg', 1),
(7, 1, 'Chicken Keema', 'Fresh halal chicken keema, finely minced from quality chicken and prepared fresh for convenient cooking. \nPerfect for keema curry, kebabs, samosas, stuffed parathas, meatballs, biryani, and a variety of flavorful Indian dishes. \nAvailable in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-keema-1787402833853.jpeg', 1, 6, '2026-08-21 06:35:35.591', '2026-08-22 12:47:13.859', 'chicken\\chicken-keema-1787402833853.jpeg', 1),
(8, 1, 'Chicken Marinated', 'Fresh halal chicken marinated with a flavorful blend of aromatic spices and carefully selected seasonings. \nPrepared fresh and ready to cook, making it convenient for grilling, roasting, frying, BBQ, and delicious Indian-style dishes.\nPerfect for quick and flavorful meals at home. Available in convenient 250 GM, 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/chicken/chicken-marinated-1787402904133.jpeg', 1, 7, '2026-08-21 06:35:35.591', '2026-08-22 12:48:24.139', 'chicken\\chicken-marinated-1787402904133.jpeg', 1),
(9, 2, 'Mutton Curry Cut', NULL, 'http://localhost:4000/uploads/mutton/mutton-curry-cut-1787403027504.jpeg', 1, 0, '2026-08-21 06:35:35.624', '2026-08-24 15:50:30.102', 'mutton\\mutton-curry-cut-1787403027504.jpeg', 1),
(10, 2, 'Mutton Shoulder Cut', NULL, 'http://localhost:4000/uploads/mutton/mutton-shoulder-cut-1787402992694.jpeg', 1, 1, '2026-08-21 06:35:35.624', '2026-08-22 12:49:52.699', 'mutton\\mutton-shoulder-cut-1787402992694.jpeg', 1),
(11, 2, 'Mutton Boneless', NULL, 'http://localhost:4000/uploads/mutton/mutton-boneless-1787405164221.jpeg', 1, 2, '2026-08-21 06:35:35.624', '2026-08-22 13:26:04.227', 'mutton\\mutton-boneless-1787405164221.jpeg', 1),
(12, 2, 'Mutton Chaap', NULL, 'http://localhost:4000/uploads/mutton/mutton-chaap-1787402923650.jpeg', 1, 3, '2026-08-21 06:35:35.624', '2026-08-22 12:48:43.653', 'mutton\\mutton-chaap-1787402923650.jpeg', 1),
(13, 2, 'Mutton Nalli', NULL, 'http://localhost:4000/uploads/mutton/mutton-nalli-1787405202638.jpeg', 1, 4, '2026-08-21 06:35:35.624', '2026-08-22 13:26:42.643', 'mutton\\mutton-nalli-1787405202638.jpeg', 1),
(14, 2, 'Mutton Chaap & Nalli', NULL, 'http://localhost:4000/uploads/mutton/mutton-chaap-nalli-1787403012900.jpeg', 1, 5, '2026-08-21 06:35:35.624', '2026-08-22 12:50:12.905', 'mutton\\mutton-chaap-nalli-1787403012900.jpeg', 1),
(15, 2, 'Mutton Keema', NULL, 'http://localhost:4000/uploads/mutton/mutton-keema-1787402843748.jpeg', 1, 6, '2026-08-21 06:35:35.624', '2026-08-22 12:47:23.752', 'mutton\\mutton-keema-1787402843748.jpeg', 1),
(16, 2, 'Mutton Marinated', NULL, 'http://localhost:4000/uploads/mutton/mutton-marinated-1787402944199.jpeg', 1, 7, '2026-08-21 06:35:35.624', '2026-08-22 12:49:04.204', 'mutton\\mutton-marinated-1787402944199.jpeg', 1),
(17, 2, 'Mutton Liver', NULL, 'http://localhost:4000/uploads/mutton/mutton-liver-1787405185924.jpeg', 1, 8, '2026-08-21 06:35:35.624', '2026-08-22 13:26:25.929', 'mutton\\mutton-liver-1787405185924.jpeg', 1),
(18, 3, 'Mutton Paya (Without Skin)', 'Fresh halal mutton paya without skin, carefully cleaned and prepared for convenient cooking. \nRich in flavor and traditionally enjoyed in slow-cooked curries and nourishing paya preparations. \nIdeal for making traditional mutton paya, spicy gravies, and hearty Indian-style dishes. Pack contains 4 pieces.', 'http://localhost:4000/uploads/special-items/mutton-paya-without-skin-1787403043870.jpeg', 1, 0, '2026-08-21 06:35:35.666', '2026-08-22 12:50:43.874', 'special-items\\mutton-paya-without-skin-1787403043870.jpeg', 1),
(19, 3, 'Mutton Steak', 'Fresh halal mutton steak, carefully prepared and cut into convenient portions for easy cooking. \nTender, flavorful, and ideal for grilling, pan-searing, roasting, BBQ, and rich Indian-style preparations. Perfect for a satisfying meal with your favorite marinades, spices, or sauces.\nAvailable in 500 GM, 750 GM and 1 KG packs.', 'http://localhost:4000/uploads/special-items/mutton-steak-1787402970791.jpeg', 1, 1, '2026-08-21 06:35:35.666', '2026-08-22 12:49:30.797', 'special-items\\mutton-steak-1787402970791.jpeg', 1);

-- --------------------------------------------------------

--
-- Table structure for table `product_options`
--

CREATE TABLE `product_options` (
  `id` int(11) NOT NULL,
  `group_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `extra_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_options`
--

INSERT INTO `product_options` (`id`, `group_id`, `name`, `extra_price`, `is_available`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, 'Tandoori', 39.00, 1, 0, '2026-08-23 14:34:15.911', '2026-08-23 14:34:15.911'),
(2, 1, 'Lemon', 39.00, 1, 0, '2026-08-23 14:34:34.766', '2026-08-23 14:34:34.766'),
(3, 1, 'Korma', 39.00, 1, 0, '2026-08-23 14:34:40.094', '2026-08-23 14:34:40.094'),
(4, 1, 'Sahi Korma', 39.00, 1, 0, '2026-08-23 14:34:51.025', '2026-08-23 14:34:51.025'),
(5, 1, 'Fry', 39.00, 1, 0, '2026-08-23 14:35:01.091', '2026-08-23 14:35:01.091'),
(6, 1, 'Handi chicken', 79.00, 1, 0, '2026-08-23 14:35:12.873', '2026-08-23 14:35:12.873'),
(7, 2, 'Afghani', 49.00, 1, 0, '2026-08-23 14:36:29.506', '2026-08-23 14:36:29.506'),
(8, 2, 'Korma', 49.00, 1, 0, '2026-08-23 14:36:37.149', '2026-08-23 14:36:37.149'),
(9, 2, 'Handi mutton', 49.00, 1, 0, '2026-08-23 14:36:45.904', '2026-08-23 14:36:45.904'),
(10, 2, 'Sahi korma', 49.00, 1, 0, '2026-08-23 14:36:52.905', '2026-08-23 14:36:52.905'),
(11, 2, 'Biryani', 49.00, 1, 0, '2026-08-23 14:36:58.571', '2026-08-23 14:36:58.571');

-- --------------------------------------------------------

--
-- Table structure for table `product_option_groups`
--

CREATE TABLE `product_option_groups` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `is_required` tinyint(1) NOT NULL DEFAULT 0,
  `allow_multiple` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_option_groups`
--

INSERT INTO `product_option_groups` (`id`, `product_id`, `name`, `is_required`, `allow_multiple`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 8, 'Marinations', 0, 0, 0, '2026-08-23 14:33:57.474', '2026-08-23 14:33:57.474'),
(2, 16, 'Marinations', 0, 0, 0, '2026-08-23 14:36:19.395', '2026-08-23 14:36:19.395');

-- --------------------------------------------------------

--
-- Table structure for table `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `label` varchar(50) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `is_in_stock` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `product_variants`
--

INSERT INTO `product_variants` (`id`, `product_id`, `label`, `price`, `is_in_stock`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 1, '250 GM', 79.00, 1, 0, '2026-08-21 01:03:12.325', '2026-08-22 13:51:53.652'),
(2, 1, '500 GM', 159.00, 1, 1, '2026-08-21 01:03:12.325', '2026-08-21 01:03:12.325'),
(3, 1, '750 GM', 219.00, 1, 2, '2026-08-21 01:03:12.325', '2026-08-21 01:03:12.325'),
(4, 1, '299', 1.00, 1, 3, '2026-08-21 01:03:12.325', '2026-08-21 01:03:12.325'),
(5, 2, '250 GM', 89.00, 1, 0, '2026-08-21 06:35:35.596', '2026-08-21 06:35:35.596'),
(6, 2, '500 GM', 179.00, 1, 1, '2026-08-21 06:35:35.597', '2026-08-21 06:35:35.597'),
(7, 2, '750 GM', 269.00, 1, 2, '2026-08-21 06:35:35.598', '2026-08-21 06:35:35.598'),
(8, 2, '1 KG', 359.00, 1, 3, '2026-08-21 06:35:35.599', '2026-08-21 06:35:35.599'),
(9, 3, '250 GM', 99.00, 1, 0, '2026-08-21 06:35:35.600', '2026-08-21 06:35:35.600'),
(10, 3, '500 GM', 199.00, 1, 1, '2026-08-21 06:35:35.601', '2026-08-21 06:35:35.601'),
(11, 3, '750 GM', 299.00, 1, 2, '2026-08-21 06:35:35.602', '2026-08-21 06:35:35.602'),
(12, 3, '1 KG', 399.00, 1, 3, '2026-08-21 06:35:35.603', '2026-08-21 06:35:35.603'),
(13, 4, '250 GM', 99.00, 1, 0, '2026-08-21 06:35:35.604', '2026-08-21 06:35:35.604'),
(14, 4, '500 GM', 199.00, 1, 1, '2026-08-21 06:35:35.605', '2026-08-21 06:35:35.605'),
(15, 4, '750 GM', 299.00, 1, 2, '2026-08-21 06:35:35.606', '2026-08-21 06:35:35.606'),
(16, 4, '1 KG', 399.00, 1, 3, '2026-08-21 06:35:35.607', '2026-08-21 06:35:35.607'),
(17, 5, '250 GM', 89.00, 1, 0, '2026-08-21 06:35:35.608', '2026-08-21 06:35:35.608'),
(18, 5, '500 GM', 179.00, 1, 1, '2026-08-21 06:35:35.609', '2026-08-21 06:35:35.609'),
(19, 5, '750 GM', 269.00, 1, 2, '2026-08-21 06:35:35.610', '2026-08-21 06:35:35.610'),
(20, 5, '1 KG', 379.00, 1, 3, '2026-08-21 06:35:35.610', '2026-08-21 06:35:35.610'),
(21, 6, '250 GM', 59.00, 1, 0, '2026-08-21 06:35:35.611', '2026-08-21 06:35:35.611'),
(22, 6, '500 GM', 119.00, 1, 1, '2026-08-21 06:35:35.612', '2026-08-21 06:35:35.612'),
(23, 6, '750 GM', 179.00, 1, 2, '2026-08-21 06:35:35.613', '2026-08-21 06:35:35.613'),
(24, 6, '1 KG', 240.00, 1, 3, '2026-08-21 06:35:35.614', '2026-08-21 06:35:35.614'),
(25, 7, '250 GM', 89.00, 1, 0, '2026-08-21 06:35:35.615', '2026-08-21 06:35:35.615'),
(26, 7, '500 GM', 179.00, 1, 1, '2026-08-21 06:35:35.616', '2026-08-21 06:35:35.616'),
(27, 7, '750 GM', 269.00, 1, 2, '2026-08-21 06:35:35.617', '2026-08-21 06:35:35.617'),
(28, 7, '1 KG', 359.00, 1, 3, '2026-08-21 06:35:35.618', '2026-08-21 06:35:35.618'),
(29, 8, '250 GM', 149.00, 1, 0, '2026-08-21 06:35:35.619', '2026-08-21 06:35:35.619'),
(30, 8, '500 GM', 299.00, 1, 1, '2026-08-21 06:35:35.620', '2026-08-21 06:35:35.620'),
(31, 8, '750 GM', 449.00, 1, 2, '2026-08-21 06:35:35.621', '2026-08-21 06:35:35.621'),
(32, 8, '1 KG', 599.00, 1, 3, '2026-08-21 06:35:35.623', '2026-08-21 06:35:35.623'),
(33, 9, '250 GM', 239.00, 1, 0, '2026-08-21 06:35:35.625', '2026-08-21 06:35:35.625'),
(34, 9, '500 GM', 479.00, 1, 1, '2026-08-21 06:35:35.626', '2026-08-21 06:35:35.626'),
(35, 9, '750 GM', 719.00, 1, 2, '2026-08-21 06:35:35.627', '2026-08-21 06:35:35.627'),
(36, 9, '1 KG', 959.00, 1, 3, '2026-08-21 06:35:35.628', '2026-08-21 06:35:35.628'),
(37, 10, '250 GM', 249.00, 1, 0, '2026-08-21 06:35:35.629', '2026-08-21 06:35:35.629'),
(38, 10, '500 GM', 499.00, 1, 1, '2026-08-21 06:35:35.630', '2026-08-21 06:35:35.630'),
(39, 10, '750 GM', 749.00, 1, 2, '2026-08-21 06:35:35.631', '2026-08-21 06:35:35.631'),
(40, 10, '1 KG', 999.00, 1, 3, '2026-08-21 06:35:35.633', '2026-08-21 06:35:35.633'),
(41, 11, '250 GM', 275.00, 1, 0, '2026-08-21 06:35:35.634', '2026-08-21 06:35:35.634'),
(42, 11, '500 GM', 550.00, 1, 1, '2026-08-21 06:35:35.635', '2026-08-21 06:35:35.635'),
(43, 11, '750 GM', 829.00, 1, 2, '2026-08-21 06:35:35.636', '2026-08-21 06:35:35.636'),
(44, 11, '1 KG', 1099.00, 1, 3, '2026-08-21 06:35:35.637', '2026-08-21 06:35:35.637'),
(45, 12, '250 GM', 249.00, 1, 0, '2026-08-21 06:35:35.638', '2026-08-21 06:35:35.638'),
(46, 12, '500 GM', 499.00, 1, 1, '2026-08-21 06:35:35.640', '2026-08-21 06:35:35.640'),
(47, 12, '750 GM', 749.00, 1, 2, '2026-08-21 06:35:35.641', '2026-08-21 06:35:35.641'),
(48, 12, '1 KG', 999.00, 1, 3, '2026-08-21 06:35:35.642', '2026-08-21 06:35:35.642'),
(49, 13, '250 GM', 249.00, 1, 0, '2026-08-21 06:35:35.643', '2026-08-21 06:35:35.643'),
(50, 13, '500 GM', 499.00, 1, 1, '2026-08-21 06:35:35.644', '2026-08-21 06:35:35.644'),
(51, 13, '750 GM', 749.00, 1, 2, '2026-08-21 06:35:35.646', '2026-08-21 06:35:35.646'),
(52, 13, '1 KG', 999.00, 1, 3, '2026-08-21 06:35:35.647', '2026-08-21 06:35:35.647'),
(53, 14, '250 GM', 249.00, 1, 0, '2026-08-21 06:35:35.648', '2026-08-21 06:35:35.648'),
(54, 14, '500 GM', 499.00, 1, 1, '2026-08-21 06:35:35.649', '2026-08-21 06:35:35.649'),
(55, 14, '750 GM', 749.00, 1, 2, '2026-08-21 06:35:35.650', '2026-08-21 06:35:35.650'),
(56, 14, '1 KG', 999.00, 1, 3, '2026-08-21 06:35:35.651', '2026-08-21 06:35:35.651'),
(57, 15, '250 GM', 275.00, 1, 0, '2026-08-21 06:35:35.653', '2026-08-21 06:35:35.653'),
(58, 15, '500 GM', 549.00, 1, 1, '2026-08-21 06:35:35.654', '2026-08-21 06:35:35.654'),
(59, 15, '750 GM', 829.00, 1, 2, '2026-08-21 06:35:35.654', '2026-08-21 06:35:35.654'),
(60, 15, '1 KG', 1099.00, 1, 3, '2026-08-21 06:35:35.655', '2026-08-21 06:35:35.655'),
(61, 16, '250 GM', 349.00, 1, 0, '2026-08-21 06:35:35.656', '2026-08-21 06:35:35.656'),
(62, 16, '500 GM', 699.00, 1, 1, '2026-08-21 06:35:35.658', '2026-08-21 06:35:35.658'),
(63, 16, '750 GM', 1049.00, 1, 2, '2026-08-21 06:35:35.659', '2026-08-21 06:35:35.659'),
(64, 16, '1 KG', 1399.00, 1, 3, '2026-08-21 06:35:35.660', '2026-08-21 06:35:35.660'),
(65, 17, '250 GM', 209.00, 1, 0, '2026-08-21 06:35:35.661', '2026-08-21 06:35:35.661'),
(66, 17, '500 GM', 419.00, 1, 1, '2026-08-21 06:35:35.662', '2026-08-21 06:35:35.662'),
(67, 17, '750 GM', 629.00, 1, 2, '2026-08-21 06:35:35.663', '2026-08-21 06:35:35.663'),
(68, 17, '1 KG', 839.00, 1, 3, '2026-08-21 06:35:35.664', '2026-08-21 06:35:35.664'),
(69, 18, '4 Pieces', 249.00, 1, 0, '2026-08-21 06:35:35.667', '2026-08-21 06:35:35.667'),
(70, 19, '500 GM', 249.00, 1, 0, '2026-08-21 06:35:35.668', '2026-08-21 06:35:35.668'),
(71, 19, '750 GM', 749.00, 1, 1, '2026-08-21 06:35:35.669', '2026-08-21 06:35:35.669'),
(72, 19, '1 KG', 999.00, 1, 2, '2026-08-21 06:35:35.670', '2026-08-21 06:35:35.670');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `label`, `permissions`, `is_system`, `created_at`, `updated_at`) VALUES
(1, 'owner', 'Owner', '[\"*\"]', 1, '2026-08-20 02:01:14.030', '2026-08-23 14:54:21.434'),
(2, 'manager', 'Manager', '[\"products:*\",\"categories:*\",\"roles:view\",\"admin_users:view\",\"orders:*\",\"delivery_settings:*\",\"coupons:*\",\"reports:view\",\"audit_log:view\",\"notifications:*\",\"customers:view\",\"shop_info:*\"]', 1, '2026-08-20 02:01:14.038', '2026-08-23 14:54:21.440'),
(3, 'staff', 'Staff', '[\"orders:create\",\"orders:view\",\"orders:updateStatus\",\"products:view\",\"products:toggleStock\",\"categories:view\",\"notifications:*\"]', 1, '2026-08-20 02:01:14.041', '2026-08-23 14:54:21.443');

-- --------------------------------------------------------

--
-- Table structure for table `shop_info`
--

CREATE TABLE `shop_info` (
  `id` int(11) NOT NULL DEFAULT 1,
  `shop_name` varchar(100) NOT NULL DEFAULT 'Meat Vanta',
  `tagline` varchar(150) NOT NULL DEFAULT 'Fresh Every Morning',
  `years_in_business` int(11) NOT NULL DEFAULT 35,
  `phone` varchar(20) NOT NULL DEFAULT '',
  `whatsapp_number` varchar(20) NOT NULL DEFAULT '',
  `email` varchar(150) NOT NULL DEFAULT '',
  `address_line` text NOT NULL DEFAULT '',
  `map_url` varchar(500) NOT NULL DEFAULT '',
  `shop_hours` varchar(255) NOT NULL DEFAULT '',
  `about_story` text NOT NULL DEFAULT '',
  `quality_promise` text NOT NULL DEFAULT '',
  `fssai_number` varchar(50) NOT NULL DEFAULT '',
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_info`
--

INSERT INTO `shop_info` (`id`, `shop_name`, `tagline`, `years_in_business`, `phone`, `whatsapp_number`, `email`, `address_line`, `map_url`, `shop_hours`, `about_story`, `quality_promise`, `fssai_number`, `updated_at`) VALUES
(1, 'Meat Vanta', 'Fresh Every Morning', 35, '', '', '', '', '', '', '', '', '', '2026-08-23 14:54:50.330');

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('13ac390e-be76-4e4e-93a4-0bbfd3f5ca91', 'b4023b7ad916e50abd7f10b4a548d9044302f5aaa34eb5ffa7c5d6f1f34a8b5e', '2026-08-21 08:43:20.846', '20260821084318_orders_table', NULL, NULL, '2026-08-21 08:43:18.875', 1),
('23c98454-6512-473e-9776-f0444528e047', '53a5257d46ed4e0222e94f7ef6e1f988f833b0bf1f65994509ce72622e16bc75', '2026-08-23 04:17:25.619', '20260823041725_notifications', NULL, NULL, '2026-08-23 04:17:25.605', 1),
('44b87bc7-26aa-4192-8287-e00ea8e14654', '0ccb016c8c12819e63c069b1d743f91340bd9d8778045e8944a1ec7bcae3d855', '2026-08-23 14:53:56.654', '20260823145356_shop_info', NULL, NULL, '2026-08-23 14:53:56.648', 1),
('4c004455-ded8-4418-bf98-5581ea97b506', 'd78ceca570d3b45dfba89262d9abf03226c425e277b966f000ce93775fb8a6b3', '2026-08-23 03:03:15.101', '20260823030315_delivery_settings', NULL, NULL, '2026-08-23 03:03:15.095', 1),
('5bdabd8f-e590-4207-ba0e-a0b416134828', '5ac5085a67faed915ffd613d2f963d319e4c61c12218ba0da9c8545283eea7ea', '2026-08-22 01:24:26.466', '20260822012426_admin_preferences', NULL, NULL, '2026-08-22 01:24:26.457', 1),
('628407ff-0efe-4a78-bf95-10e4d5de4b0d', 'e28ea93bdcd70639825183a2c9d9e30b3c10db6ad50f885c75c119162cc1dd2f', '2026-08-23 03:23:56.306', '20260823032356_checkout_and_upi', NULL, NULL, '2026-08-23 03:23:56.291', 1),
('85a0c710-de24-4c65-9537-2bc19525ddd8', 'b42ccba711f92f559690bc7a6d1cca71cad6f833058d87e6d66288307fc1b423', '2026-08-23 14:24:36.013', '20260823142435_product_options', NULL, NULL, '2026-08-23 14:24:35.914', 1),
('8bca872a-1d05-4134-94cb-3f90cef2be86', '1c5d963b7ed03734ca481b56bcc7766b73092176ad598a8f39916db43bf548f4', '2026-08-20 02:00:43.415', '20260819013115_init', NULL, NULL, '2026-08-20 02:00:43.356', 1),
('bc883f0f-7f74-4b71-a65e-73cdd25fdcff', '0eb81d95b486ba669b473e5dba4795c9ebbd06766ceeba99772ebf4cb9574ff9', '2026-08-20 02:00:43.516', '20260819020232_init', NULL, NULL, '2026-08-20 02:00:43.416', 1),
('c304c37f-f99c-4f43-a3b5-d1c3a592b3f4', '292d7a2cf78c8971b52773ef5b75fff5f20256b73b85bde323d4d4a07e03d25f', '2026-08-23 07:40:05.549', '20260823074005_customer_accounts', NULL, NULL, '2026-08-23 07:40:05.363', 1),
('ee78f70a-b10b-4c90-aca3-de0d894bc724', 'bf1421c39f8f228c4cfc8ff3c1f42ed99ca9b081854635e358746eb7ec529c66', '2026-08-20 02:01:06.808', '20260820020106_roles_table', NULL, NULL, '2026-08-20 02:01:06.744', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `admin_users_email_key` (`email`),
  ADD KEY `admin_users_role_id_idx` (`role_id`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `audit_log_admin_id_idx` (`admin_id`),
  ADD KEY `audit_log_action_idx` (`action`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_key` (`name`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customers_phone_key` (`phone`);

--
-- Indexes for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_addresses_customer_id_idx` (`customer_id`);

--
-- Indexes for table `customer_refresh_tokens`
--
ALTER TABLE `customer_refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_refresh_tokens_token_hash_key` (`token_hash`),
  ADD KEY `customer_refresh_tokens_customer_id_idx` (`customer_id`);

--
-- Indexes for table `delivery_settings`
--
ALTER TABLE `delivery_settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_is_read_idx` (`is_read`),
  ADD KEY `notifications_created_at_idx` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_order_number_key` (`order_number`),
  ADD KEY `orders_status_idx` (`status`),
  ADD KEY `orders_created_at_idx` (`created_at`),
  ADD KEY `orders_created_by_admin_id_fkey` (`created_by_admin_id`),
  ADD KEY `orders_customer_id_idx` (`customer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_order_id_idx` (`order_id`),
  ADD KEY `order_items_product_variant_id_fkey` (`product_variant_id`);

--
-- Indexes for table `otp_requests`
--
ALTER TABLE `otp_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `otp_requests_phone_idx` (`phone`),
  ADD KEY `otp_requests_expires_at_idx` (`expires_at`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_category_id_idx` (`category_id`);

--
-- Indexes for table `product_options`
--
ALTER TABLE `product_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_options_group_id_idx` (`group_id`);

--
-- Indexes for table `product_option_groups`
--
ALTER TABLE `product_option_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_option_groups_product_id_idx` (`product_id`);

--
-- Indexes for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_variants_product_id_idx` (`product_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_key` (`name`);

--
-- Indexes for table `shop_info`
--
ALTER TABLE `shop_info`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=129;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer_refresh_tokens`
--
ALTER TABLE `customer_refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `otp_requests`
--
ALTER TABLE `otp_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `product_options`
--
ALTER TABLE `product_options`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `product_option_groups`
--
ALTER TABLE `product_option_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD CONSTRAINT `admin_users_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `audit_log_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `customer_addresses`
--
ALTER TABLE `customer_addresses`
  ADD CONSTRAINT `customer_addresses_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customer_refresh_tokens`
--
ALTER TABLE `customer_refresh_tokens`
  ADD CONSTRAINT `customer_refresh_tokens_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_created_by_admin_id_fkey` FOREIGN KEY (`created_by_admin_id`) REFERENCES `admin_users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_product_variant_id_fkey` FOREIGN KEY (`product_variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `product_options`
--
ALTER TABLE `product_options`
  ADD CONSTRAINT `product_options_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `product_option_groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_option_groups`
--
ALTER TABLE `product_option_groups`
  ADD CONSTRAINT `product_option_groups_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
