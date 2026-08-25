const prisma = require("../../config/db");
const { comparePassword } = require("../../utils/password.util");
const { signAdminToken } = require("../../utils/jwt.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");

/**
 * Returns { admin, token } on success, or throws an Error with .statusCode + .expose
 * set so the error handler / controller can return a safe message.
 */
async function loginAdmin({ email, password, ipAddress }) {
  const admin = await prisma.adminUser.findUnique({
    where: { email },
    include: { role: true },
  });

  // Same generic message whether the email doesn't exist or the password is wrong -
  // don't leak which one it was.
  const invalidCredentialsError = () => {
    const err = new Error("Invalid email or password.");
    err.statusCode = 401;
    err.expose = true;
    return err;
  };

  if (!admin || !admin.isActive || !admin.role) {
    await writeAuditLog({ action: "auth:loginFailed", metadata: { email }, ipAddress });
    throw invalidCredentialsError();
  }

  const passwordMatches = await comparePassword(password, admin.passwordHash);
  if (!passwordMatches) {
    await writeAuditLog({
      adminId: admin.id,
      action: "auth:loginFailed",
      metadata: { email },
      ipAddress,
    });
    throw invalidCredentialsError();
  }

  // Payload stays minimal - role/permissions are never trusted from the token,
  // requireAuth re-fetches them from the DB on every request.
  const token = signAdminToken({ id: admin.id });

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await writeAuditLog({ adminId: admin.id, action: "auth:login", ipAddress });

  return {
    token,
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role.name,
      permissions: admin.role.permissions, // frontend checks this directly - no local mirror anymore
      preferences: admin.preferences || {},
    },
  };
}

/**
 * Merges the given partial preferences into the admin's existing ones -
 * a PATCH-style update, not a full replace, so setting one preference never
 * wipes out others the frontend didn't send.
 */
async function updatePreferences(adminId, partialPreferences) {
  const admin = await prisma.adminUser.findUnique({ where: { id: adminId } });
  if (!admin) {
    const err = new Error("Admin not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }

  const merged = { ...(admin.preferences || {}), ...(partialPreferences || {}) };

  const updated = await prisma.adminUser.update({
    where: { id: adminId },
    data: { preferences: merged },
  });

  return updated.preferences;
}

module.exports = { loginAdmin, updatePreferences };
