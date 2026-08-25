const express = require("express");
const router = express.Router();

const { login, logout, getCurrentAdmin, updateMyPreferences } = require("../../controllers/auth/auth.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { loginRateLimiter } = require("../../middlewares/rateLimiter.middleware");

router.post("/login", loginRateLimiter, login);
router.post("/logout", requireAuth, logout);
router.get("/me", requireAuth, getCurrentAdmin);
router.patch("/me/preferences", requireAuth, updateMyPreferences);

module.exports = router;
