const express = require("express");
const router = express.Router();

const notificationsController = require("../../controllers/notifications/notifications.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

// Specific path first so it doesn't collide with /:id patterns.
router.get("/unread-count", requireAuth, requirePermission("notifications:view"), notificationsController.unreadCount);

router.get("/", requireAuth, requirePermission("notifications:view"), notificationsController.list);
router.patch("/:id/read", requireAuth, requirePermission("notifications:update"), notificationsController.markRead);
router.post("/read-all", requireAuth, requirePermission("notifications:update"), notificationsController.markAllRead);

module.exports = router;
