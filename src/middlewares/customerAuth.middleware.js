const { verifyCustomerAccessToken } = require("../utils/customerJwt.util");
const { failure } = require("../utils/apiResponse.util");
const prisma = require("../config/db");

const CUSTOMER_ACCESS_COOKIE = process.env.CUSTOMER_ACCESS_COOKIE || "shm_customer_token";
const CUSTOMER_REFRESH_COOKIE = process.env.CUSTOMER_REFRESH_COOKIE || "shm_customer_refresh";

/**
 * Customer-side equivalent of requireAuth. Re-reads the customer from the DB
 * rather than trusting the token body, so a deactivated account stops working
 * immediately instead of at token expiry.
 */
async function requireCustomerAuth(req, res, next) {
  try {
    const token = req.cookies?.[CUSTOMER_ACCESS_COOKIE];
    // 401 here is the signal the frontend uses to attempt a token refresh.
    if (!token) return failure(res, 401, "Not signed in.");

    const payload = verifyCustomerAccessToken(token);

    const customer = await prisma.customer.findUnique({ where: { id: payload.id } });
    if (!customer || !customer.isActive) {
      return failure(res, 401, "Session is no longer valid.");
    }

    req.customer = { id: customer.id, name: customer.name, phone: customer.phone };
    next();
  } catch {
    return failure(res, 401, "Session expired.");
  }
}

/** For endpoints that work signed in or out (checkout supports both). */
async function attachCustomerIfPresent(req, res, next) {
  try {
    const token = req.cookies?.[CUSTOMER_ACCESS_COOKIE];
    if (token) {
      const payload = verifyCustomerAccessToken(token);
      const customer = await prisma.customer.findUnique({ where: { id: payload.id } });
      if (customer && customer.isActive) {
        req.customer = { id: customer.id, name: customer.name, phone: customer.phone };
      }
    }
  } catch {
    // Ignore - an invalid token here just means "treat as guest".
  }
  next();
}

module.exports = {
  requireCustomerAuth,
  attachCustomerIfPresent,
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
};
