const express = require("express");
const router = express.Router();

const auditLogController = require("../../controllers/auditLog/auditLog.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

router.get("/", requireAuth, requirePermission("audit_log:view"), auditLogController.list);

module.exports = router;
