const { roleArrayHasPermission } = require("../utils/permission.util");
const { failure } = require("../utils/apiResponse.util");
const { writeAuditLog } = require("../utils/auditLogger.util");

/**
 * Usage: router.post("/products", requireAuth, requirePermission("products:create"), controller)
 * Must run AFTER requireAuth (needs req.admin.permissions, attached from the
 * admin's Role row - see auth.middleware.js).
 */
function requirePermission(permissionKey) {
  return async (req, res, next) => {
    const admin = req.admin;
    if (!admin) {
      return failure(res, 401, "Not authenticated.");
    }

    if (!roleArrayHasPermission(admin.permissions, permissionKey)) {
      await writeAuditLog({
        adminId: admin.id,
        action: "auth:permissionDenied",
        metadata: { attempted: permissionKey, role: admin.role },
        ipAddress: req.ip,
      });
      return failure(res, 403, "You don't have permission to do that.");
    }

    next();
  };
}

module.exports = { requirePermission };
