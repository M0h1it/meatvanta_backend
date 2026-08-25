const express = require("express");
const router = express.Router();

const adminUsersController = require("../../controllers/adminUsers/adminUsers.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

router.post("/", requireAuth, requirePermission("admin_users:create"), adminUsersController.create);
router.get("/", requireAuth, requirePermission("admin_users:view"), adminUsersController.list);
router.get("/:id", requireAuth, requirePermission("admin_users:view"), adminUsersController.getOne);
router.put("/:id", requireAuth, requirePermission("admin_users:update"), adminUsersController.update);

module.exports = router;
