const multer = require("multer");
const fs = require("fs");
const path = require("path");
const prisma = require("../config/db");
const { slugify } = require("../utils/slugify.util");
const { isR2Configured } = require("../config/r2");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

/**
 * Two storage modes:
 *  - R2 configured  -> memory, then streamed to object storage. Required on
 *    hosts with an ephemeral disk (Render free wipes it on every deploy).
 *  - otherwise      -> local disk under uploads/<category-slug>/, which keeps
 *    local development working with no cloud account.
 */
const memoryStorage = multer.memoryStorage();

const diskStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const productId = Number(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      });

      const folder = product ? product.category.slug : "uncategorized";
      const dir = path.join(UPLOAD_ROOT, folder);
      fs.mkdirSync(dir, { recursive: true });

      req._productNameSlug = product ? slugify(product.name) : "product";
      cb(null, dir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${req._productNameSlug || "product"}-${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    const err = new Error("Only JPG, PNG, or WEBP images are allowed.");
    err.statusCode = 422;
    err.expose = true;
    return cb(err);
  }
  cb(null, true);
}

const uploadProductImage = multer({
  storage: isR2Configured ? memoryStorage : diskStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single("image"); // form-data field name must be "image"

module.exports = { uploadProductImage, UPLOAD_ROOT };
