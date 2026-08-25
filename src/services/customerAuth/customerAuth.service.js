const prisma = require("../../config/db");
const { generateOtp, hashOtp, compareOtp } = require("../../utils/otp.util");
const {
  signCustomerAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../../utils/customerJwt.util");

const OTP_TTL_MINUTES = 10;
const MAX_VERIFY_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const REFRESH_TOKEN_TTL_DAYS = 30;

// Without an SMS provider wired up, dev mode returns the code in the API
// response so the flow is testable. Must be off in production.
const IS_DEV_OTP = process.env.OTP_DEV_MODE === "true";

function badRequestError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  return err;
}

/**
 * Issues an OTP for a phone number. Doesn't reveal whether the number is a
 * known customer - the response is identical either way, so this endpoint
 * can't be used to enumerate who has an account.
 */
async function requestOtp(phone) {
  const normalizedPhone = phone.trim();

  // Cooldown: stops someone hammering the endpoint (and, later, burning SMS credit).
  const recent = await prisma.otpRequest.findFirst({
    where: { phone: normalizedPhone, consumedAt: null },
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

  // Any older unconsumed codes for this number stop working the moment a new
  // one is issued - only the newest code is ever valid.
  await prisma.otpRequest.updateMany({
    where: { phone: normalizedPhone, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.otpRequest.create({
    data: { phone: normalizedPhone, otpHash, expiresAt },
  });

  if (IS_DEV_OTP) {
    console.log(`[otp] ${normalizedPhone} -> ${otp}`);
  }
  // TODO: send via SMS provider once one is configured.

  return {
    expiresInMinutes: OTP_TTL_MINUTES,
    // Only ever populated in dev mode - never leaks the code in production.
    devOtp: IS_DEV_OTP ? otp : undefined,
  };
}

/**
 * Verifies the code and logs the customer in, creating the account on first
 * successful verification (no separate signup step).
 */
async function verifyOtp({ phone, otp, name }) {
  const normalizedPhone = phone.trim();

  const request = await prisma.otpRequest.findFirst({
    where: { phone: normalizedPhone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!request) {
    throw badRequestError("No active code for this number. Please request a new one.");
  }
  if (request.expiresAt < new Date()) {
    throw badRequestError("That code has expired. Please request a new one.");
  }
  if (request.attemptCount >= MAX_VERIFY_ATTEMPTS) {
    throw badRequestError("Too many incorrect attempts. Please request a new code.", 429);
  }

  const matches = await compareOtp(otp.trim(), request.otpHash);
  if (!matches) {
    await prisma.otpRequest.update({
      where: { id: request.id },
      data: { attemptCount: { increment: 1 } },
    });
    throw badRequestError("That code isn't correct.");
  }

  let customer = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  const isNewCustomer = !customer;

  if (!customer) {
    if (!name || name.trim().length < 2) {
      // New number - we need a name before the account can exist. Deliberately
      // thrown BEFORE the code is consumed, so the retry (which arrives with
      // the name) still has a valid code to verify against.
      throw badRequestError("NAME_REQUIRED");
    }
    customer = await prisma.customer.create({
      data: { name: name.trim(), phone: normalizedPhone, lastLoginAt: new Date() },
    });
  } else {
    if (!customer.isActive) {
      throw badRequestError("This account is not active. Please contact the shop.", 403);
    }
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });
  }

  // Consumed only now that login has definitely succeeded - anything that
  // throws above leaves the code usable for the customer's next attempt.
  await prisma.otpRequest.update({
    where: { id: request.id },
    data: { consumedAt: new Date() },
  });

  const tokens = await issueSession(customer.id);
  return { customer: publicCustomer(customer), tokens, isNewCustomer };
}

async function issueSession(customerId) {
  const accessToken = signCustomerAccessToken({ id: customerId });

  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.customerRefreshToken.create({
    data: { customerId, tokenHash: hashRefreshToken(refreshToken), expiresAt },
  });

  return { accessToken, refreshToken, refreshTokenTtlMs: expiresAt.getTime() - Date.now() };
}

/**
 * Rotates the refresh token: the presented one is revoked and a fresh pair
 * issued. If an already-revoked token turns up, treat it as theft and revoke
 * every session for that customer.
 */
async function refreshSession(refreshToken) {
  if (!refreshToken) throw badRequestError("Not signed in.", 401);

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = await prisma.customerRefreshToken.findUnique({
    where: { tokenHash },
    include: { customer: true },
  });

  if (!stored) throw badRequestError("Session is no longer valid.", 401);

  if (stored.revokedAt) {
    await prisma.customerRefreshToken.updateMany({
      where: { customerId: stored.customerId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    throw badRequestError("Session is no longer valid. Please sign in again.", 401);
  }

  if (stored.expiresAt < new Date() || !stored.customer.isActive) {
    throw badRequestError("Session has expired. Please sign in again.", 401);
  }

  await prisma.customerRefreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const tokens = await issueSession(stored.customerId);
  return { customer: publicCustomer(stored.customer), tokens };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  await prisma.customerRefreshToken.updateMany({
    where: { tokenHash: hashRefreshToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

async function getCustomerById(id) {
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: { addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] } },
  });
  if (!customer) return null;
  return { ...publicCustomer(customer), addresses: customer.addresses };
}

function publicCustomer(customer) {
  return { id: customer.id, name: customer.name, phone: customer.phone, email: customer.email };
}

module.exports = {
  requestOtp,
  verifyOtp,
  refreshSession,
  logout,
  getCustomerById,
  REFRESH_TOKEN_TTL_DAYS,
};
