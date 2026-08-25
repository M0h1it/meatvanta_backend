const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const controller = require("../../controllers/customerAuth/customerAuth.controller");
const addressController = require("../../controllers/customerAddresses/customerAddresses.controller");
const { requireCustomerAuth } = require("../../middlewares/customerAuth.middleware");

// Tighter than the admin login limiter - this endpoint will cost real money
// per request once an SMS provider is wired in.
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many code requests. Please try again shortly.", errors: null },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again shortly.", errors: null },
});

router.post("/request-otp", otpRequestLimiter, controller.requestOtp);
router.post("/verify-otp", otpVerifyLimiter, controller.verifyOtp);
router.post("/refresh", controller.refresh);
router.post("/logout", controller.logout);
router.get("/me", requireCustomerAuth, controller.me);

// Address book - every route is scoped to the signed-in customer.
router.get("/addresses", requireCustomerAuth, addressController.list);
router.post("/addresses", requireCustomerAuth, addressController.create);
router.put("/addresses/:id", requireCustomerAuth, addressController.update);
router.delete("/addresses/:id", requireCustomerAuth, addressController.remove);
router.patch("/addresses/:id/default", requireCustomerAuth, addressController.setDefault);

module.exports = router;
