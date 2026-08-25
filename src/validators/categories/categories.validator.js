function validateCreateCategory(body) {
  const errors = {};
  const { name } = body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Category name is required (min 2 characters).";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateUpdateCategory(body) {
  const errors = {};
  const { name, sortOrder, isActive } = body || {};

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.name = "Category name must be at least 2 characters.";
  }
  if (sortOrder !== undefined && typeof sortOrder !== "number") {
    errors.sortOrder = "sortOrder must be a number.";
  }
  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.isActive = "isActive must be true or false.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCreateCategory, validateUpdateCategory };
