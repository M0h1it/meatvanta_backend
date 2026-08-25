const { validateCreateAdminUser, validateUpdateAdminUser } = require("../../validators/adminUsers/adminUsers.validator");
const adminUsersService = require("../../services/adminUsers/adminUsers.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");

function handleServiceError(err, next, res) {
  if (err.expose) return failure(res, err.statusCode, err.message);
  return next(err);
}

async function create(req, res, next) {
  try {
    const { isValid, errors } = validateCreateAdminUser(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const admin = await adminUsersService.createAdminUser(req.body);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "admin_users:create",
      entity: "AdminUser",
      entityId: admin.id,
      ipAddress: req.ip,
    });

    return success(res, 201, "Admin user created.", { admin });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function list(req, res, next) {
  try {
    const admins = await adminUsersService.listAdminUsers();
    return success(res, 200, "Admin users fetched.", { admins });
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const admin = await adminUsersService.getAdminUserById(Number(req.params.id));
    return success(res, 200, "Admin user fetched.", { admin });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

async function update(req, res, next) {
  try {
    const { isValid, errors } = validateUpdateAdminUser(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const admin = await adminUsersService.updateAdminUser(Number(req.params.id), req.body, req.admin.id);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "admin_users:update",
      entity: "AdminUser",
      entityId: admin.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    return success(res, 200, "Admin user updated.", { admin });
  } catch (err) {
    return handleServiceError(err, next, res);
  }
}

module.exports = { create, list, getOne, update };
