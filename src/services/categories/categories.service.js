const prisma = require("../../config/db");
const { slugify } = require("../../utils/slugify.util");

function notFoundError(message = "Category not found.") {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}

function conflictError(message) {
  const err = new Error(message);
  err.statusCode = 409;
  err.expose = true;
  return err;
}

async function createCategory({ name, sortOrder }) {
  const slug = slugify(name);

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });
  if (existing) {
    throw conflictError("A category with this name already exists.");
  }

  return prisma.category.create({
    data: { name: name.trim(), slug, sortOrder: sortOrder ?? 0 },
  });
}

async function listCategories({ includeInactive = false, countAvailableOnly = false } = {}) {
  return prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          // The customer site advertises "N items available", so its count has
          // to match what the product list will actually show - otherwise the
          // homepage promises items the shop pulled for the day.
          // The admin keeps the unfiltered total, which is what it needs.
          products: countAvailableOnly ? { where: { isActive: true, isInStock: true } } : true,
        },
      },
    },
  });
}

async function getCategoryById(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw notFoundError();
  return category;
}

async function updateCategory(id, { name, sortOrder, isActive }) {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw notFoundError();

  const data = {};
  if (name !== undefined) {
    data.name = name.trim();
    data.slug = slugify(name);
  }
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (isActive !== undefined) data.isActive = isActive;

  return prisma.category.update({ where: { id }, data });
}

/**
 * Categories with products under them are never hard-deleted - that would
 * either orphan or cascade-delete the products, both bad surprises. Deactivate
 * instead; a category with zero products can be hard-deleted safely.
 */
async function deleteCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!category) throw notFoundError();

  if (category._count.products > 0) {
    await prisma.category.update({ where: { id }, data: { isActive: false } });
    return { hardDeleted: false, productCount: category._count.products };
  }

  await prisma.category.delete({ where: { id } });
  return { hardDeleted: true, productCount: 0 };
}

module.exports = { createCategory, listCategories, getCategoryById, updateCategory, deleteCategory };