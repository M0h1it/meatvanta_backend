const express = require("express");
const router = express.Router();

const rolesController = require("../../controllers/roles/roles.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

// Catalog first so it doesn't collide with GET /:id
router.get(
  "/permission-catalog",
  requireAuth,
  requirePermission("roles:view"),
  rolesController.listPermissionCatalog
);

router.post("/", requireAuth, requirePermission("roles:create"), rolesController.create);
router.get("/", requireAuth, requirePermission("roles:view"), rolesController.list);
router.get("/:id", requireAuth, requirePermission("roles:view"), rolesController.getOne);
router.put("/:id", requireAuth, requirePermission("roles:update"), rolesController.update);
router.delete("/:id", requireAuth, requirePermission("roles:delete"), rolesController.remove);

module.exports = router;
