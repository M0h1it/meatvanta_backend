const service = require("../../services/adminPasswordReset/adminPasswordReset.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");

const PHONE_PATTERN = /^[0-9]{10}$/;

async function forgotPassword(req, res, next) {
  try {
    const { phone } = req.body || {};
    if (!phone || !PHONE_PATTERN.test(String(phone).trim())) {
      return failure(res, 422, "Enter a valid 10-digit mobile number.", {
        phone: "Enter a valid 10-digit mobile number.",
      });
    }

    const result = await service.requestReset(phone);

    // Wording is intentionally non-committal: it must not confirm whether the
    // number belongs to an admin account.
    return success(res, 200, "If that number has an admin account, a code has been sent.", result);
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function verifyResetOtp(req, res, next) {
  try {
    const { phone, otp } = req.body || {};
    if (!phone || !otp) return failure(res, 422, "Phone number and code are both required.");

    const result = await service.verifyResetOtp({ phone, otp });
    return success(res, 200, "Code verified.", result);
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { resetToken, newPassword } = req.body || {};
    if (!resetToken) return failure(res, 422, "Reset token is missing. Please start again.");

    const { email } = await service.resetPassword({ resetToken, newPassword });

    // No req.admin here - this endpoint is unauthenticated by design - so the
    // entry is attributed to the account whose password changed.
    await writeAuditLog({
      action: "auth:passwordReset",
      entity: "AdminUser",
      metadata: { email },
      ipAddress: req.ip,
    });

    return success(res, 200, "Password updated. You can sign in with your new password.");
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

module.exports = { forgotPassword, verifyResetOtp, resetPassword };