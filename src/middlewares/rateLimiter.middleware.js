const rateLimit = require("express-rate-limit");

// 8 attempts per 15 minutes per IP - tune later once you see real usage patterns.
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many login attempts. Please try again in a few minutes.",
    errors: null,
  },
});

module.exports = { loginRateLimiter };
