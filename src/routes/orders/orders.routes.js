const express = require("express");
const router = express.Router();

const ordersController = require("../../controllers/orders/orders.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");

// Dashboard stats - any logged-in admin can see aggregate counts, no fine-grained
// permission needed since nothing sensitive (PII, prices per-customer) is exposed here.
router.get("/stats/summary", requireAuth, ordersController.stats);

router.post("/", requireAuth, requirePermission("orders:create"), ordersController.create);
router.get("/", requireAuth, requirePermission("orders:view"), ordersController.list);
router.get("/:id", requireAuth, requirePermission("orders:view"), ordersController.getOne);
router.patch("/:id/status", requireAuth, requirePermission("orders:updateStatus"), ordersController.updateStatus);
router.post("/:id/cancel", requireAuth, requirePermission("orders:cancel"), ordersController.cancel);
router.patch("/:id/payment", requireAuth, requirePermission("orders:updateStatus"), ordersController.verifyPayment);
router.patch("/:id/delivery-charge", requireAuth, requirePermission("orders:updateStatus"), ordersController.setDeliveryCharge);
router.patch("/:id/delivery-person", requireAuth, requirePermission("orders:updateStatus"), ordersController.assignDeliveryPerson);

module.exports = router;
