const { isKnownPermission, isKnownModule } = require("../../utils/permission.util");

function validatePermissionsArray(permissions) {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return "At least one permission is required.";
  }
  for (const p of permissions) {
    if (p === "*") continue;
    if (typeof p !== "string") return `Invalid permission entry: ${p}`;
    if (p.endsWith(":*")) {
      const moduleName = p.split(":")[0];
      if (!isKnownModule(moduleName)) return `Unknown module in wildcard: ${p}`;
      continue;
    }
    if (!isKnownPermission(p)) return `Unknown permission: ${p}`;
  }
  return null;
}

function validateCreateRole(body) {
  const errors = {};
  const { name, label, permissions } = body || {};

  if (!name || typeof name !== "string" || !/^[a-z0-9-]+$/.test(name)) {
    errors.name = "name is required - lowercase letters, numbers, hyphens only (e.g. 'delivery-staff').";
  }
  if (!label || typeof label !== "string" || label.trim().length < 2) {
    errors.label = "label is required (min 2 characters).";
  }
  const permError = validatePermissionsArray(permissions);
  if (permError) errors.permissions = permError;

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateUpdateRole(body) {
  const errors = {};
  const { label, permissions } = body || {};

  if (label !== undefined && (typeof label !== "string" || label.trim().length < 2)) {
    errors.label = "label must be at least 2 characters.";
  }
  if (permissions !== undefined) {
    const permError = validatePermissionsArray(permissions);
    if (permError) errors.permissions = permError;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateCreateRole, validateUpdateRole };
