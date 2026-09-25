const { verifyAdminToken } = require("../utils/jwt.util");
const { failure } = require("../utils/apiResponse.util");
const prisma = require("../config/db");

const COOKIE_NAME = process.env.COOKIE_NAME || "shm_admin_token";

/**
 * Reads the JWT from the httpOnly cookie, verifies it, and re-fetches the
 * admin (with their Role) from the DB - not just trusting the token payload -
 * so a deactivated account, a role reassignment, or an edited permission set
 * all take effect immediately instead of waiting for token expiry.
 */
async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) {
      return failure(res, 401, "Not authenticated.");
    }

    const payload = verifyAdminToken(token); // throws if invalid/expired

    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.id },
      include: { role: true },
    });

    if (!admin || !admin.isActive || !admin.role) {
      return failure(res, 401, "Session is no longer valid.");
    }

    // A password reset must end every existing session. JWTs can't be revoked,
    // so any token issued before the last password change is rejected here -
    // otherwise a stolen token would keep working until it expired naturally.
    if (admin.passwordChangedAt && payload.iat) {
      const issuedAtMs = payload.iat * 1000; // iat is in seconds
      if (issuedAtMs < admin.passwordChangedAt.getTime()) {
        return failure(res, 401, "Your password was changed. Please sign in again.");
      }
    }

    req.admin = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      roleId: admin.roleId,
      role: admin.role.name, // e.g. "owner", "manager", or a custom role name
      permissions: admin.role.permissions, // array, read by requirePermission
      preferences: admin.preferences || {}, // personal UI settings, e.g. showAuditLog
    };
    next();
  } catch (err) {
    return failure(res, 401, "Invalid or expired session.");
  }
}

module.exports = { requireAuth, COOKIE_NAME };