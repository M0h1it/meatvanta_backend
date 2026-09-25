const PHONE_PATTERN = /^[0-9]{10}$/;

function validateCreateAdminUser(body) {
  const errors = {};
  const { name, email, password, roleId, phone } = body || {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.name = "Name is required (min 2 characters).";
  }
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = "A valid email is required.";
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    errors.password = "Password is required (min 6 characters).";
  }
  if (!roleId || typeof roleId !== "number") {
    errors.roleId = "roleId is required.";
  }
  // Optional, but without it this admin can never reset their own password.
  if (phone !== undefined && phone !== null && phone !== "" && !PHONE_PATTERN.test(String(phone).trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateUpdateAdminUser(body) {
  const errors = {};
  const { name, roleId, isActive, phone } = body || {};

  if (name !== undefined && (typeof name !== "string" || name.trim().length < 2)) {
    errors.name = "Name must be at least 2 characters.";
  }
  if (roleId !== undefined && typeof roleId !== "number") {
    errors.roleId = "roleId must be a number.";
  }
  if (isActive !== undefined && typeof isActive !== "boolean") {
    errors.isActive = "isActive must be true or false.";
  }
  if (phone !== undefined && phone !== null && phone !== "" && !PHONE_PATTERN.test(String(phone).trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCreateAdminUser, validateUpdateAdminUser };