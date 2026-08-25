const { validateLoginInput } = require("../../validators/auth/auth.validator");
const { loginAdmin, updatePreferences } = require("../../services/auth/auth.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");
const { COOKIE_NAME } = require("../../middlewares/auth.middleware");

const { baseCookieOptions } = require("../../utils/cookiePolicy.util");

const cookieOptions = {
  ...baseCookieOptions(),
  maxAge: 8 * 60 * 60 * 1000, // 8 hours, keep in sync with JWT_EXPIRES_IN
};

async function login(req, res, next) {
  try {
    const { isValid, errors } = validateLoginInput(req.body);
    if (!isValid) {
      return failure(res, 422, "Please check the submitted details.", errors);
    }

    const { email, password } = req.body;
    const { token, admin } = await loginAdmin({ email, password, ipAddress: req.ip });

    res.cookie(COOKIE_NAME, token, cookieOptions);
    return success(res, 200, "Logged in successfully.", { admin });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    if (req.admin) {
      await writeAuditLog({ adminId: req.admin.id, action: "auth:logout", ipAddress: req.ip });
    }
    return success(res, 200, "Logged out.");
  } catch (err) {
    return next(err);
  }
}

async function getCurrentAdmin(req, res) {
  // req.admin is set by requireAuth middleware
  return success(res, 200, "Current admin fetched.", { admin: req.admin });
}

/** Updates the logged-in admin's own UI preferences (e.g. showAuditLog). Merges, doesn't replace. */
async function updateMyPreferences(req, res, next) {
  try {
    const preferences = await updatePreferences(req.admin.id, req.body);
    return success(res, 200, "Preferences updated.", { preferences });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

module.exports = { login, logout, getCurrentAdmin, updateMyPreferences };
