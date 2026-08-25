const permissionsConfig = require("../permissions/permissions.json");

/**
 * Checks whether a permissions array (from a Role row's `permissions` JSON
 * column) grants a given permission. Supports:
 *   "*"            -> everything
 *   "products:*"   -> everything inside the "products" module
 *   "products:view" -> exact match
 * This replaced a role-name lookup against a static JSON file - roles now
 * live in the DB, so the caller passes the admin's actual permissions array.
 */
function roleArrayHasPermission(permissionsArray, requiredPermission) {
  if (!Array.isArray(permissionsArray)) return false;

  if (permissionsArray.includes("*")) return true;
  if (permissionsArray.includes(requiredPermission)) return true;

  const [requiredModule] = requiredPermission.split(":");
  if (permissionsArray.includes(`${requiredModule}:*`)) return true;

  return false;
}

/** Confirms a permission key actually exists in the registry (catches typos early). */
function isKnownPermission(permissionKey) {
  const [moduleName] = permissionKey.split(":");
  const modulePermissions = permissionsConfig.modules[moduleName];
  return Array.isArray(modulePermissions) && modulePermissions.includes(permissionKey);
}

/** Confirms a "module:*" wildcard refers to a real module in the catalog. */
function isKnownModule(moduleName) {
  return Object.prototype.hasOwnProperty.call(permissionsConfig.modules, moduleName);
}

function listAllPermissionKeys() {
  return Object.values(permissionsConfig.modules).flat();
}

function listModules() {
  return permissionsConfig.modules;
}

module.exports = { roleArrayHasPermission, isKnownPermission, isKnownModule, listAllPermissionKeys, listModules };
