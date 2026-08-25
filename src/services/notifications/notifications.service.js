const prisma = require("../../config/db");

/**
 * Fire-and-forget - a notification failure must never break the action that
 * triggered it (an order is far more important than its alert). Same
 * defensive pattern as the audit logger.
 */
async function createNotification({ type, title, message, entityType = null, entityId = null }) {
  try {
    return await prisma.notification.create({
      data: { type, title, message, entityType, entityId },
    });
  } catch (err) {
    console.error("[notifications] failed to create notification:", err.message);
    return null;
  }
}

async function listNotifications({ unreadOnly = false, limit = 20 } = {}) {
  return prisma.notification.findMany({
    where: unreadOnly ? { isRead: false } : {},
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/** The cheap endpoint the bell badge polls - a count, not a payload. */
async function getUnreadCount() {
  return prisma.notification.count({ where: { isRead: false } });
}

async function markAsRead(id) {
  const existing = await prisma.notification.findUnique({ where: { id } });
  if (!existing) {
    const err = new Error("Notification not found.");
    err.statusCode = 404;
    err.expose = true;
    throw err;
  }
  return prisma.notification.update({
    where: { id },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllAsRead() {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
  return { markedCount: result.count };
}

module.exports = { createNotification, listNotifications, getUnreadCount, markAsRead, markAllAsRead };
