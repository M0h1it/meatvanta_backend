const notificationsService = require("../../services/notifications/notifications.service");
const { success, failure } = require("../../utils/apiResponse.util");

async function list(req, res, next) {
  try {
    const unreadOnly = req.query.unreadOnly === "true";
    const limit = req.query.limit ? Number(req.query.limit) : 20;
    const notifications = await notificationsService.listNotifications({ unreadOnly, limit });
    return success(res, 200, "Notifications fetched.", { notifications });
  } catch (err) {
    return next(err);
  }
}

async function unreadCount(req, res, next) {
  try {
    const count = await notificationsService.getUnreadCount();
    return success(res, 200, "Unread count fetched.", { count });
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationsService.markAsRead(Number(req.params.id));
    return success(res, 200, "Notification marked as read.", { notification });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    const result = await notificationsService.markAllAsRead();
    return success(res, 200, "All notifications marked as read.", result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, unreadCount, markRead, markAllRead };
