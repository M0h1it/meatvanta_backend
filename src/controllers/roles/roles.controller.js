const { validateCreateRole, validateUpdateRole } = require("../../validators/roles/roles.validator");
const rolesService = require("../../services/roles/roles.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");
const { listAllPermissionKeys, listModules } = require("../../utils/permission.util");

function handleServiceError(err, next, res) {
  if (err.expose) return failure(res, err.statusCode, err.message);
  return next(err);
}

async function create(req, res, next) {
  try {
    const { isValid, errors } = validateCreateRole(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const role = await rolesService.createRole(req.body);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "roles:create",
      entity: "Role",
      entityId: role.id,
      ipAddress: req.ip,
    });

    return success(res, 201, "Role created.", { role });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function list(req, res, next) {
  try {
    const roles = await rolesService.listRoles();
    return success(res, 200, "Roles fetched.", { roles });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const role = await rolesService.getRoleById(Number(req.params.id));
    return success(res, 200, "Role fetched.", { role });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function update(req, res, next) {
  try {
    const { isValid, errors } = validateUpdateRole(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const role = await rolesService.updateRole(Number(req.params.id), req.body);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "roles:update",
      entity: "Role",
      entityId: role.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    return success(res, 200, "Role updated.", { role });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function remove(req, res, next) {
  try {
    const id = Number(req.params.id);
    const result = await rolesService.deleteRole(id);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "roles:delete",
      entity: "Role",
      entityId: id,
      ipAddress: req.ip,
    });

    return success(res, 200, "Role deleted.", result);
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

/** Gives the frontend the full permission catalog (grouped by module) to build the role-builder checkboxes from. */
async function listPermissionCatalog(req, res) {
  return success(res, 200, "Permission catalog fetched.", {
    modules: listModules(),
    allKeys: listAllPermissionKeys(),
  });
}

module.exports = { create, list, getOne, update, remove, listPermissionCatalog };
