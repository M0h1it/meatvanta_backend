const { validateUpdateDeliverySettings } = require("../../validators/deliverySettings/deliverySettings.validator");
const deliverySettingsService = require("../../services/deliverySettings/deliverySettings.service");
const { success, failure } = require("../../utils/apiResponse.util");
const { writeAuditLog } = require("../../utils/auditLogger.util");

async function get(req, res, next) {
  try {
    const settings = await deliverySettingsService.getSettings();
    return success(res, 200, "Delivery settings fetched.", { settings });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const { isValid, errors } = validateUpdateDeliverySettings(req.body);
    if (!isValid) return failure(res, 422, "Please check the submitted details.", errors);

    const settings = await deliverySettingsService.updateSettings(req.body);

    await writeAuditLog({
      adminId: req.admin.id,
      action: "delivery_settings:update",
      entity: "DeliverySettings",
      entityId: settings.id,
      metadata: req.body,
      ipAddress: req.ip,
    });

    return success(res, 200, "Delivery settings updated.", { settings });
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

/** Public - returns computed selectable dates, not the raw rule set. */
async function getPublicAvailability(req, res, next) {
  try {
    const availability = await deliverySettingsService.getAvailableDeliveryDates();
    return success(res, 200, "Delivery availability fetched.", availability);
  } catch (err) {
    return next(err);
  }
}

module.exports = { get, update, getPublicAvailability };
