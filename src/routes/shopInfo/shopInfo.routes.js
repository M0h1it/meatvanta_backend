const express = require("express");
const router = express.Router();

const shopInfoController = require("../../controllers/shopInfo/shopInfo.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

router.get("/", requireAuth, requirePermission("shop_info:view"), shopInfoController.get);
router.put("/", requireAuth, requirePermission("shop_info:update"), shopInfoController.update);

module.exports = router;
