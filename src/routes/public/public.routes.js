const express = require("express");
const router = express.Router();

const publicController = require("../../controllers/public/public.controller");
const deliverySettingsController = require("../../controllers/deliverySettings/deliverySettings.controller");
const shopInfoController = require("../../controllers/shopInfo/shopInfo.controller");
const customerAuthRoutes = require("../customerAuth/customerAuth.routes");
const { requireCustomerAuth, attachCustomerIfPresent } = require("../../middlewares/customerAuth.middleware");

// No requireAuth anywhere in this file - deliberately public.
router.get("/categories", publicController.listCategories);
router.get("/products", publicController.listProducts);
router.get("/products/:id", publicController.getProduct);

// Computed selectable delivery dates + window + charge - the customer site
// renders exactly what this returns rather than re-implementing the rules.
router.get("/delivery-availability", deliverySettingsController.getPublicAvailability);

// Contact details, story and hours - powers the About/Contact/FAQ pages.
router.get("/shop-info", shopInfoController.getPublic);

// Customer accounts, sessions and address book.
router.use("/auth", customerAuthRoutes);

// Checkout works signed in or out - attachCustomerIfPresent links the order
// to an account when there is one, without requiring it.
router.post("/orders", attachCustomerIfPresent, publicController.createOrder);

// Called by the checkout page right after Razorpay's widget reports success.
// No :orderNumber here - for "razorpay" checkouts, no Order exists yet at
// this point (see createPublicOrder / promotePendingCheckout); the
// razorpayOrderId in the body is what identifies which pending checkout to
// turn into a real order.
router.post("/orders/razorpay/verify", publicController.verifyRazorpayPayment);

// Called by Razorpay's servers directly, not the browser - a safety net for a
// payment whose browser closed before the widget's success callback ran.
// No auth (Razorpay can't send our cookies) - the raw-body signature check in
// the controller is what proves this call is genuinely from Razorpay.
router.post("/webhooks/razorpay", publicController.razorpayWebhook);

// Signed-in customers get their order history instead of retyping order numbers.
router.get("/my-orders", requireCustomerAuth, publicController.myOrders);
router.get("/my-orders/:orderNumber", requireCustomerAuth, publicController.myOrderDetail);
// Tracking needs order number AND phone, so orders can't be enumerated.
router.get("/orders/track", publicController.trackOrder);

module.exports = router;