const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

if (!JWT_SECRET) {
  // Fail loud at boot rather than silently signing tokens with "undefined".
  throw new Error("JWT_SECRET is not set in environment variables.");
}

function signAdminToken(payload) {
  // payload: { id, role }  -- keep it minimal, never put the password hash here
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyAdminToken(token) {
  return jwt.verify(token, JWT_SECRET); // throws if invalid/expired
}

module.exports = { signAdminToken, verifyAdminToken };
