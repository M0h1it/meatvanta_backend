const multer = require("multer");
const fs = require("fs");
const path = require("path");
const prisma = require("../config/db");
const { slugify } = require("../utils/slugify.util");

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

const storage = multer.diskStorage({
  // Looks up the product's category before writing to disk, so the file lands
  // in uploads/<category-slug>/ instead of uploads/products/<id>/. Falls back
  // to an "uncategorized" folder if the product id in the URL doesn't exist -
  // the controller cleans that file up once the service confirms it's missing.
  destination: async (req, file, cb) => {
    try {
      const productId = Number(req.params.id);
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: { category: true },
      });

      if (!product) {
        const fallbackDir = path.join(UPLOAD_ROOT, "uncategorized");
        fs.mkdirSync(fallbackDir, { recursive: true });
        req._productNameSlug = "product";
        return cb(null, fallbackDir);
      }

      const categoryDir = path.join(UPLOAD_ROOT, product.category.slug);
      fs.mkdirSync(categoryDir, { recursive: true });
      req._productNameSlug = slugify(product.name); // read by filename() below
      cb(null, categoryDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = req._productNameSlug || "product";
    cb(null, `${base}-${Date.now()}${ext}`); // timestamp keeps re-uploads from colliding
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
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
}).single("image"); // form-data field name must be "image"

module.exports = { uploadProductImage, UPLOAD_ROOT };
