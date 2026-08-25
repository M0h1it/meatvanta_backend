const express = require("express");
const router = express.Router();

const productsController = require("../../controllers/products/products.controller");
const { requireAuth } = require("../../middlewares/auth.middleware");
const { requirePermission } = require("../../middlewares/permission.middleware");
const { uploadProductImage } = require("../../middlewares/upload.middleware");

// Products
router.post("/", requireAuth, requirePermission("products:create"), productsController.create);
router.get("/", requireAuth, requirePermission("products:view"), productsController.list);
router.get("/:id", requireAuth, requirePermission("products:view"), productsController.getOne);
router.put("/:id", requireAuth, requirePermission("products:update"), productsController.update);
router.delete("/:id", requireAuth, requirePermission("products:delete"), productsController.remove);

// Product image
router.post(
  "/:id/image",
  requireAuth,
  requirePermission("products:update"),
  uploadProductImage,
  productsController.uploadImage
);
router.delete(
  "/:id/image",
  requireAuth,
  requirePermission("products:update"),
  productsController.removeImage
);

// Product-level availability - hides the whole item from the shop for a day.
router.patch(
  "/:id/stock",
  requireAuth,
  requirePermission("products:toggleStock"),
  productsController.toggleStock
);

// Option groups (e.g. "Marination Style") and their options (Tandoori +Rs.39).
// Nested for creation, flat for edit/delete - same shape as variants.
router.post(
  "/:id/option-groups",
  requireAuth,
  requirePermission("products:update"),
  productsController.addOptionGroup
);
router.put(
  "/option-groups/:groupId",
  requireAuth,
  requirePermission("products:update"),
  productsController.updateOptionGroup
);
router.delete(
  "/option-groups/:groupId",
  requireAuth,
  requirePermission("products:delete"),
  productsController.deleteOptionGroup
);
router.post(
  "/option-groups/:groupId/options",
  requireAuth,
  requirePermission("products:update"),
  productsController.addOption
);
router.put(
  "/options/:optionId",
  requireAuth,
  requirePermission("products:update"),
  productsController.updateOption
);
router.delete(
  "/options/:optionId",
  requireAuth,
  requirePermission("products:delete"),
  productsController.deleteOption
);

// Variants (nested under a product for creation, flat for update/delete/stock)
router.post(
  "/:productId/variants",
  requireAuth,
  requirePermission("products:update"),
  productsController.addVariant
);
router.put(
  "/variants/:variantId",
  requireAuth,
  requirePermission("products:update"),
  productsController.updateVariant
);
router.delete(
  "/variants/:variantId",
  requireAuth,
  requirePermission("products:delete"),
  productsController.deleteVariant
);
router.patch(
  "/variants/:variantId/stock",
  requireAuth,
  requirePermission("products:toggleStock"),
  productsController.toggleVariantStock
);

module.exports = router;
