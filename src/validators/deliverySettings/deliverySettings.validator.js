const VALID_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const VALID_CHARGE_MODES = ["flat", "manual"];

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour "HH:MM"

function validateUpdateDeliverySettings(body) {
  const errors = {};
  const {
    availableDays,
    deliveryStartTime,
    deliveryEndTime,
    sameDayEnabled,
    nextDayEnabled,
    maxAdvanceDays,
    sameDayCutoffTime,
    deliveryChargeMode,
    flatDeliveryCharge,
    deliveryAreaNote,
    codEnabled,
    upiEnabled,
    upiId,
    upiPayeeName,
  } = body || {};

  if (availableDays !== undefined) {
    if (!Array.isArray(availableDays) || availableDays.length === 0) {
      errors.availableDays = "Select at least one delivery day.";
    } else {
      const invalid = availableDays.filter((d) => !VALID_DAYS.includes(d));
      if (invalid.length > 0) errors.availableDays = `Unknown day(s): ${invalid.join(", ")}`;
    }
  }

  if (deliveryStartTime !== undefined && !TIME_PATTERN.test(deliveryStartTime)) {
    errors.deliveryStartTime = "Start time must be in HH:MM 24-hour format.";
  }
  if (deliveryEndTime !== undefined && !TIME_PATTERN.test(deliveryEndTime)) {
    errors.deliveryEndTime = "End time must be in HH:MM 24-hour format.";
  }
  if (
    deliveryStartTime !== undefined &&
    deliveryEndTime !== undefined &&
    TIME_PATTERN.test(deliveryStartTime) &&
    TIME_PATTERN.test(deliveryEndTime) &&
    deliveryStartTime >= deliveryEndTime // string compare is safe for zero-padded HH:MM
  ) {
    errors.deliveryEndTime = "End time must be after start time.";
  }

  if (sameDayEnabled !== undefined && typeof sameDayEnabled !== "boolean") {
    errors.sameDayEnabled = "sameDayEnabled must be true or false.";
  }
  if (nextDayEnabled !== undefined && typeof nextDayEnabled !== "boolean") {
    errors.nextDayEnabled = "nextDayEnabled must be true or false.";
  }

  if (maxAdvanceDays !== undefined) {
    if (!Number.isInteger(maxAdvanceDays) || maxAdvanceDays < 0 || maxAdvanceDays > 30) {
      errors.maxAdvanceDays = "maxAdvanceDays must be a whole number between 0 and 30.";
    }
  }

  // null is meaningful here - it means "no cutoff decided yet", so allow it explicitly.
  if (sameDayCutoffTime !== undefined && sameDayCutoffTime !== null && !TIME_PATTERN.test(sameDayCutoffTime)) {
    errors.sameDayCutoffTime = "Cutoff time must be in HH:MM 24-hour format, or left empty.";
  }

  if (deliveryChargeMode !== undefined && !VALID_CHARGE_MODES.includes(deliveryChargeMode)) {
    errors.deliveryChargeMode = `deliveryChargeMode must be one of: ${VALID_CHARGE_MODES.join(", ")}`;
  }

  if (flatDeliveryCharge !== undefined) {
    const value = Number(flatDeliveryCharge);
    if (Number.isNaN(value) || value < 0) {
      errors.flatDeliveryCharge = "flatDeliveryCharge must be a non-negative number.";
    }
  }

  if (deliveryAreaNote !== undefined && (typeof deliveryAreaNote !== "string" || deliveryAreaNote.length > 255)) {
    errors.deliveryAreaNote = "Area note must be text, 255 characters or fewer.";
  }

  if (codEnabled !== undefined && typeof codEnabled !== "boolean") {
    errors.codEnabled = "codEnabled must be true or false.";
  }
  if (upiEnabled !== undefined && typeof upiEnabled !== "boolean") {
    errors.upiEnabled = "upiEnabled must be true or false.";
  }
  // Guard against the shop accidentally having no way to take money at all.
  if (codEnabled === false && upiEnabled === false) {
    errors.codEnabled = "At least one payment method must stay enabled.";
  }
  if (upiId !== undefined && (typeof upiId !== "string" || upiId.trim().length < 3)) {
    errors.upiId = "UPI ID is required when UPI is enabled.";
  }
  if (upiPayeeName !== undefined && (typeof upiPayeeName !== "string" || upiPayeeName.trim().length < 2)) {
    errors.upiPayeeName = "Payee name must be at least 2 characters.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { VALID_DAYS, VALID_CHARGE_MODES, validateUpdateDeliverySettings };
