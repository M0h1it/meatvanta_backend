const auditLogService = require("../../services/auditLog/auditLog.service");
const { success } = require("../../utils/apiResponse.util");

async function list(req, res, next) {
  try {
    const { adminId, action, entity, from, to, page, pageSize } = req.query;

    const result = await auditLogService.listAuditLogs({
      adminId: adminId ? Number(adminId) : undefined,
      action: action || undefined,
      entity: entity || undefined,
      from: from || undefined,
      to: to || undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 25,
    });

    return success(res, 200, "Audit log fetched.", result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list };
