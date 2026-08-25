const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Deliberately a different secret from the admin's. If they shared one, an
// admin token would authenticate as a customer and vice versa.
const CUSTOMER_JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.CUSTOMER_ACCESS_EXPIRES_IN || "1h";

if (!CUSTOMER_JWT_SECRET) {
  throw new Error("CUSTOMER_JWT_SECRET is not set in environment variables.");
}

function signCustomerAccessToken(payload) {
  // payload: { id } - nothing else is trusted from the token; the middleware
  // re-reads the customer from the DB on every request.
  return jwt.sign(payload, CUSTOMER_JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

function verifyCustomerAccessToken(token) {
  return jwt.verify(token, CUSTOMER_JWT_SECRET); // throws if invalid/expired
}

/** Refresh tokens are opaque random strings, not JWTs - they only need to be
 *  unguessable and revocable, and we store only their hash. */
function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

module.exports = {
  signCustomerAccessToken,
  verifyCustomerAccessToken,
  generateRefreshToken,
  hashRefreshToken,
};
