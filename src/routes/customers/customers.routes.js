const express = require("express");
const router = express.Router();

const customersController = require("../../controllers/customers/customers.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

// Read-only. Customer records are edited by the customer, not by staff -
// there is no admin path to change someone's name, phone or addresses.
router.get("/", requireAuth, requirePermission("customers:view"), customersController.list);
router.get("/:id", requireAuth, requirePermission("customers:view"), customersController.getOne);

module.exports = router;
