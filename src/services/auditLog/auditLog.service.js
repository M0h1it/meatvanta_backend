const prisma = require("../../config/db");

async function listAuditLogs({ adminId, action, entity, from, to, page = 1, pageSize = 25 }) {
  const where = {};
  if (adminId) where.adminId = adminId;
  if (action) where.action = { contains: action };
  if (entity) where.entity = entity;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
      include: { admin: { select: { id: true, name: true, email: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

module.exports = { listAuditLogs };
