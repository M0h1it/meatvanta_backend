const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const controller = require("../../controllers/adminPasswordReset/adminPasswordReset.controller");

// Deliberately tighter than the login limiter: this endpoint costs real money
// per request once SMS is live, and it targets privileged accounts.
const requestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many reset requests. Please try again later.", errors: null },
});

const verifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again later.", errors: null },
});

// All three are unauthenticated - the whole point is that the admin is locked out.
router.post("/forgot-password", requestLimiter, controller.forgotPassword);
router.post("/verify-reset-otp", verifyLimiter, controller.verifyResetOtp);
router.post("/reset-password", verifyLimiter, controller.resetPassword);

module.exports = router;