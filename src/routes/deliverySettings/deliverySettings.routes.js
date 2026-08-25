const express = require("express");
const router = express.Router();

const deliverySettingsController = require("../../controllers/deliverySettings/deliverySettings.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

router.get("/", requireAuth, requirePermission("delivery_settings:view"), deliverySettingsController.get);
router.put("/", requireAuth, requirePermission("delivery_settings:update"), deliverySettingsController.update);

module.exports = router;
