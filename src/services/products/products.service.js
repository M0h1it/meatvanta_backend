const prisma = require("../../config/db");
const path = require("path");
const { toPublicUrl, deleteLocalImage, UPLOADS_DIR } = require("../../utils/localImageStorage.util");
const { uploadToR2, deleteFromR2, toR2PublicUrl, isR2Configured } = require("../../utils/r2Storage.util");
const { slugify } = require("../../utils/slugify.util");

function notFoundError(message) {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  variants: { orderBy: { sortOrder: "asc" } },
  optionGroups: {
    orderBy: { sortOrder: "asc" },
    include: { options: { orderBy: { sortOrder: "asc" } } },
  },
};

async function createProduct({ name, categoryId, description, imageUrl, sortOrder, variants }) {
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) throw notFoundError("categoryId does not match any existing category.");

  return prisma.product.create({
    data: {
      name: name.trim(),
      categoryId,
      description: description || null,
      imageUrl: imageUrl || null,
      sortOrder: sortOrder ?? 0,
      variants: {
        create: variants.map((v, index) => ({
          label: v.label.trim(),
          price: Number(v.price),
          isInStock: v.isInStock ?? true,
          sortOrder: v.sortOrder ?? index,
        })),
      },
    },
    include: productInclude,
  });
}

async function listProducts({ categoryId, includeInactive = false, search, inStockOnly = false } = {}) {
  const trimmedSearch = typeof search === "string" ? search.trim() : "";

  return prisma.product.findMany({
    where: {
      ...(categoryId ? { categoryId } : {}),
      ...(includeInactive ? {} : { isActive: true }),
      // Customer-facing calls pass inStockOnly so items pulled for the day vanish
      // from the shop; the admin list still shows them so they can be switched back.
      ...(inStockOnly ? { isInStock: true } : {}),
      // Matches product name or description. MySQL collation is
      // case-insensitive by default, so no extra mode flag is needed.
      ...(trimmedSearch
        ? {
            OR: [
              { name: { contains: trimmedSearch } },
              { description: { contains: trimmedSearch } },
            ],
          }
        : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: productInclude,
  });
}

async function getProductById(id) {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) throw notFoundError("Product not found.");
  return product;
}

async function updateProduct(id, { name, categoryId, description, imageUrl, isActive, isInStock, sortOrder }) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Product not found.");

  if (categoryId !== undefined) {
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) throw notFoundError("categoryId does not match any existing category.");
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (categoryId !== undefined) data.categoryId = categoryId;
  if (description !== undefined) data.description = description;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (isActive !== undefined) data.isActive = isActive;
  if (isInStock !== undefined) data.isInStock = isInStock;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  return prisma.product.update({ where: { id }, data, include: productInclude });
}

/** Soft delete - catalogue history (past orders reference variants) should never hard-vanish. */
async function deleteProduct(id) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Product not found.");

  return prisma.product.update({ where: { id }, data: { isActive: false }, include: productInclude });
}

async function addVariant(productId, { label, price, isInStock, sortOrder }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw notFoundError("Product not found.");

  return prisma.productVariant.create({
    data: {
      productId,
      label: label.trim(),
      price: Number(price),
      isInStock: isInStock ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
}

async function updateVariant(variantId, { label, price, isInStock, sortOrder }) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw notFoundError("Variant not found.");

  const data = {};
  if (label !== undefined) data.label = label.trim();
  if (price !== undefined) data.price = Number(price);
  if (isInStock !== undefined) data.isInStock = isInStock;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  return prisma.productVariant.update({ where: { id: variantId }, data });
}

async function deleteVariant(variantId) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw notFoundError("Variant not found.");

  await prisma.productVariant.delete({ where: { id: variantId } });
  return { deletedId: variantId };
}

async function toggleVariantStock(variantId, isInStock) {
  const existing = await prisma.productVariant.findUnique({ where: { id: variantId } });
  if (!existing) throw notFoundError("Variant not found.");

  return prisma.productVariant.update({ where: { id: variantId }, data: { isInStock } });
}

/**
 * multer's diskStorage already wrote the file to
 * uploads/products/<id>/<timestamp>.<ext> by the time this runs.
 * We just record the path/URL in the DB and clean up the previous file.
 */
async function setProductImage(id, file) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!product) {
    // In disk mode multer has already written the file by the time we get
    // here, so the controller cleans it up when this throws.
    throw notFoundError("Product not found.");
  }

  let storedPath;
  let imageUrl;

  if (isR2Configured) {
    // Same folder-per-category shape as local disk, so the two modes stay
    // readable side by side.
    const ext = (file.originalname.match(/\.[a-z0-9]+$/i) || [".jpg"])[0].toLowerCase();
    storedPath = `${product.category.slug}/${slugify(product.name)}-${Date.now()}${ext}`;
    await uploadToR2(file.buffer, storedPath, file.mimetype);
    imageUrl = toR2PublicUrl(storedPath);
  } else {
    storedPath = path.relative(UPLOADS_DIR, file.path);
    imageUrl = toPublicUrl(storedPath);
  }

  const updated = await prisma.product.update({
    where: { id },
    data: { imageUrl, imagePath: storedPath },
    include: productInclude,
  });

  // Remove the previous image only after the new one is safely stored.
  if (product.imagePath) {
    if (isR2Configured) {
      await deleteFromR2(product.imagePath);
    } else {
      deleteLocalImage(product.imagePath);
    }
  }

  return updated;
}

async function removeProductImage(id) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw notFoundError("Product not found.");

  if (product.imagePath) {
    if (isR2Configured) {
      await deleteFromR2(product.imagePath);
    } else {
      deleteLocalImage(product.imagePath);
    }
  }

  return prisma.product.update({
    where: { id },
    data: { imageUrl: null, imagePath: null },
    include: productInclude,
  });
}

/** Product-level availability - pulls the whole item for the day in one click. */
async function toggleProductStock(id, isInStock) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw notFoundError("Product not found.");

  return prisma.product.update({ where: { id }, data: { isInStock }, include: productInclude });
}

// ---------- Option groups ----------

async function addOptionGroup(productId, { name, isRequired, allowMultiple, sortOrder }) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw notFoundError("Product not found.");

  return prisma.productOptionGroup.create({
    data: {
      productId,
      name: name.trim(),
      isRequired: isRequired ?? false,
      allowMultiple: allowMultiple ?? false,
      sortOrder: sortOrder ?? 0,
    },
    include: { options: true },
  });
}

async function updateOptionGroup(groupId, { name, isRequired, allowMultiple, sortOrder }) {
  const existing = await prisma.productOptionGroup.findUnique({ where: { id: groupId } });
  if (!existing) throw notFoundError("Option group not found.");

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (isRequired !== undefined) data.isRequired = isRequired;
  if (allowMultiple !== undefined) data.allowMultiple = allowMultiple;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  return prisma.productOptionGroup.update({ where: { id: groupId }, data, include: { options: true } });
}

async function deleteOptionGroup(groupId) {
  const existing = await prisma.productOptionGroup.findUnique({ where: { id: groupId } });
  if (!existing) throw notFoundError("Option group not found.");

  // Options cascade with the group. Past orders keep their snapshot, so
  // deleting here never rewrites what a customer actually bought.
  await prisma.productOptionGroup.delete({ where: { id: groupId } });
  return { deletedId: groupId };
}

// ---------- Options ----------

async function addOption(groupId, { name, extraPrice, isAvailable, sortOrder }) {
  const group = await prisma.productOptionGroup.findUnique({ where: { id: groupId } });
  if (!group) throw notFoundError("Option group not found.");

  return prisma.productOption.create({
    data: {
      groupId,
      name: name.trim(),
      extraPrice: Number(extraPrice ?? 0),
      isAvailable: isAvailable ?? true,
      sortOrder: sortOrder ?? 0,
    },
  });
}

async function updateOption(optionId, { name, extraPrice, isAvailable, sortOrder }) {
  const existing = await prisma.productOption.findUnique({ where: { id: optionId } });
  if (!existing) throw notFoundError("Option not found.");

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (extraPrice !== undefined) data.extraPrice = Number(extraPrice);
  if (isAvailable !== undefined) data.isAvailable = isAvailable;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;

  return prisma.productOption.update({ where: { id: optionId }, data });
}

async function deleteOption(optionId) {
  const existing = await prisma.productOption.findUnique({ where: { id: optionId } });
  if (!existing) throw notFoundError("Option not found.");

  await prisma.productOption.delete({ where: { id: optionId } });
  return { deletedId: optionId };
}

module.exports = {
  createProduct,
  listProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addVariant,
  updateVariant,
  deleteVariant,
  toggleVariantStock,
  setProductImage,
  removeProductImage,
  toggleProductStock,
  addOptionGroup,
  updateOptionGroup,
  deleteOptionGroup,
  addOption,
  updateOption,
  deleteOption,
};
