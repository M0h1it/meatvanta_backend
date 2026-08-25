const prisma = require("../config/db");
const { isKnownPermission } = require("./permission.util");

/**
 * Writes one audit log row. Never throws into the caller's request flow -
 * a logging failure should never break an admin action that already succeeded.
 *
 * @param {Object} entry
 * @param {number|null} entry.adminId
 * @param {string} entry.action     - must be a key from permissions.json ("products:update"),
 *                                    or an auth event like "auth:login" / "auth:loginFailed"
 * @param {string|null} entry.entity
 * @param {number|null} entry.entityId
 * @param {Object|null} entry.metadata
 * @param {string|null} entry.ipAddress
 */
async function writeAuditLog({ adminId = null, action, entity = null, entityId = null, metadata = null, ipAddress = null }) {
  const isAuthEvent = action.startsWith("auth:");
  if (!isAuthEvent && !isKnownPermission(action)) {
    // Dev-time guardrail: catches a typo'd action key before it pollutes the log table.
    console.warn(`[auditLogger] "${action}" is not in permissions.json - logging anyway, but check the key.`);
  }

  try {
    await prisma.auditLog.create({
      data: { adminId, action, entity, entityId, metadata, ipAddress },
    });
  } catch (err) {
    console.error("[auditLogger] failed to write audit log:", err.message);
  }
}

module.exports = { writeAuditLog };
