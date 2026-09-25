const crypto = require("crypto");
const prisma = require("../../config/db");
const { generateOtp, hashOtp, compareOtp } = require("../../utils/otp.util");
const { hashPassword } = require("../../utils/password.util");
const { sendOtpSms, isSmsConfigured } = require("../../utils/sms.util");

const OTP_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MIN_PASSWORD_LENGTH = 8;

function badRequestError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  return err;
}

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

/**
 * Sends a reset code.
 *
 * Responds identically whether or not the number belongs to an admin - if it
 * differed, this endpoint would become a way to discover which numbers have
 * admin access.
 */
async function requestReset(phone) {
  const normalizedPhone = String(phone).trim();
  const genericResult = { expiresInMinutes: OTP_TTL_MINUTES };

  const admin = await prisma.adminUser.findUnique({ where: { phone: normalizedPhone } });
  if (!admin || !admin.isActive) {
    return genericResult; // silently a no-op
  }

  const recent = await prisma.adminPasswordReset.findFirst({
    where: { adminId: admin.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    const secondsSince = (Date.now() - recent.createdAt.getTime()) / 1000;
    if (secondsSince < RESEND_COOLDOWN_SECONDS) {
      throw badRequestError(
        `Please wait ${Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince)}s before requesting another code.`,
        429
      );
    }
  }

  // Only the newest code is ever valid.
  await prisma.adminPasswordReset.updateMany({
    where: { adminId: admin.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const otp = generateOtp();
  await prisma.adminPasswordReset.create({
    data: {
      adminId: admin.id,
      otpHash: await hashOtp(otp),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  await sendOtpSms(normalizedPhone, otp);

  return {
    ...genericResult,
    // Only ever populated with no SMS provider configured, so the flow stays
    // testable before MSG91 is live. Never present in a configured production.
    devOtp: isSmsConfigured() ? undefined : otp,
  };
}

/**
 * Verifies the code and hands back a short-lived reset token. The OTP is NOT
 * consumed here - only the final password change consumes it, so a failure at
 * the last step doesn't strand the admin with a dead code.
 */
async function verifyResetOtp({ phone, otp }) {
  const normalizedPhone = String(phone).trim();

  const admin = await prisma.adminUser.findUnique({ where: { phone: normalizedPhone } });
  if (!admin) throw badRequestError("That code isn't correct.");

  const request = await prisma.adminPasswordReset.findFirst({
    where: { adminId: admin.id, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!request) throw badRequestError("No active code. Please request a new one.");
  if (request.expiresAt < new Date()) throw badRequestError("That code has expired. Please request a new one.");
  if (request.attemptCount >= MAX_VERIFY_ATTEMPTS) {
    throw badRequestError("Too many incorrect attempts. Please request a new code.", 429);
  }

  const matches = await compareOtp(String(otp).trim(), request.otpHash);
  if (!matches) {
    await prisma.adminPasswordReset.update({
      where: { id: request.id },
      data: { attemptCount: { increment: 1 } },
    });
    throw badRequestError("That code isn't correct.");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  await prisma.adminPasswordReset.update({
    where: { id: request.id },
    data: { resetTokenHash: hashToken(resetToken) },
  });

  return { resetToken };
}

/**
 * Sets the new password. Stamping passwordChangedAt invalidates every JWT
 * issued before now, so a stolen session can't survive the reset.
 */
async function resetPassword({ resetToken, newPassword }) {
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) {
    throw badRequestError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`, 422);
  }

  const request = await prisma.adminPasswordReset.findFirst({
    where: { resetTokenHash: hashToken(resetToken), consumedAt: null },
    include: { admin: true },
  });

  if (!request) throw badRequestError("This reset link is no longer valid. Please start again.", 401);
  if (request.expiresAt < new Date()) {
    throw badRequestError("This reset request has expired. Please start again.", 401);
  }

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: request.adminId },
      data: {
        passwordHash: await hashPassword(newPassword),
        passwordChangedAt: new Date(),
      },
    }),
    prisma.adminPasswordReset.update({
      where: { id: request.id },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { email: request.admin.email };
}

module.exports = { requestReset, verifyResetOtp, resetPassword, MIN_PASSWORD_LENGTH };