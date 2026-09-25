const prisma = require("../../config/db");
const msg91Service = require("../msg91/msg91.service");
const {
  signCustomerAccessToken,
  generateRefreshToken,
  hashRefreshToken,
} = require("../../utils/customerJwt.util");

const REFRESH_TOKEN_TTL_DAYS = 30;

function badRequestError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.expose = true;
  return err;
}

/**
 * Verifies the MSG91 OTP Widget's access-token and logs the customer in,
 * creating the account on first successful verification (no separate signup
 * step). OTP generation/delivery/matching all happen on MSG91's side now
 * (the widget talks to MSG91 directly from the browser) - this function's
 * only job is confirming that access-token server-side before trusting it,
 * then mapping the now-verified phone number onto a Customer row.
 */
async function verifyOtp({ accessToken, name }) {
  const phone = await msg91Service.verifyWidgetAccessToken(accessToken);

  let customer = await prisma.customer.findUnique({ where: { phone } });
  const isNewCustomer = !customer;

  if (!customer) {
    if (!name || name.trim().length < 2) {
      // New number - we need a name before the account can exist. The
      // access-token stays valid for the retry (MSG91's, not ours to expire).
      throw badRequestError("NAME_REQUIRED");
    }
    customer = await prisma.customer.create({
      data: { name: name.trim(), phone, lastLoginAt: new Date() },
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
  verifyOtp,
  refreshSession,
  logout,
  getCustomerById,
  REFRESH_TOKEN_TTL_DAYS,
};