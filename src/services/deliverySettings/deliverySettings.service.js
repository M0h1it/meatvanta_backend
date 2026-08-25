const prisma = require("../../config/db");

const SETTINGS_ID = 1; // singleton row

const DAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const DEFAULT_SETTINGS = {
  id: SETTINGS_ID,
  availableDays: ["sunday", "monday", "wednesday", "thursday", "friday"],
  deliveryStartTime: "06:00",
  deliveryEndTime: "11:00",
  sameDayEnabled: true,
  nextDayEnabled: true,
  maxAdvanceDays: 3,
  sameDayCutoffTime: null, // not decided yet - no cutoff enforced until set
  deliveryChargeMode: "flat",
  flatDeliveryCharge: 0,
  deliveryAreaNote: "We deliver across Gurugram.",
  codEnabled: true,
  upiEnabled: true,
  upiId: "starhalal@upi",
  upiPayeeName: "Star Halal Meat Shop",
};

/** Reads the singleton, creating it with sane defaults the first time it's asked for. */
async function getSettings() {
  const existing = await prisma.deliverySettings.findUnique({ where: { id: SETTINGS_ID } });
  if (existing) return existing;
  return prisma.deliverySettings.create({ data: DEFAULT_SETTINGS });
}

async function updateSettings(changes) {
  await getSettings(); // guarantees the row exists before we update it

  const data = {};
  const fields = [
    "availableDays",
    "deliveryStartTime",
    "deliveryEndTime",
    "sameDayEnabled",
    "nextDayEnabled",
    "maxAdvanceDays",
    "sameDayCutoffTime",
    "deliveryChargeMode",
    "deliveryAreaNote",
    "codEnabled",
    "upiEnabled",
    "upiId",
    "upiPayeeName",
  ];
  for (const field of fields) {
    if (changes[field] !== undefined) data[field] = changes[field];
  }
  if (changes.flatDeliveryCharge !== undefined) {
    data.flatDeliveryCharge = Number(changes.flatDeliveryCharge);
  }

  return prisma.deliverySettings.update({ where: { id: SETTINGS_ID }, data });
}

/** "2026-08-23" in local time - avoids the UTC shift toISOString() would introduce. */
function toLocalDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * The single source of truth for "which dates can a customer pick?".
 * Lives server-side so the customer site never re-implements (and never drifts
 * from) these rules - it just renders whatever this returns.
 *
 * Applies, in order: same-day cutoff -> same/next-day toggles ->
 * available weekdays -> maxAdvanceDays window.
 */
async function getAvailableDeliveryDates(now = new Date()) {
  const settings = await getSettings();
  const availableDays = Array.isArray(settings.availableDays) ? settings.availableDays : [];

  // Has the same-day cutoff already passed? (null cutoff = never blocks)
  let sameDayCutoffPassed = false;
  if (settings.sameDayCutoffTime) {
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    sameDayCutoffPassed = currentTime >= settings.sameDayCutoffTime;
  }

  const dates = [];
  for (let offset = 0; offset <= settings.maxAdvanceDays; offset++) {
    const candidate = new Date(now);
    candidate.setDate(candidate.getDate() + offset);
    candidate.setHours(0, 0, 0, 0);

    const dayName = DAY_NAMES[candidate.getDay()];
    if (!availableDays.includes(dayName)) continue; // shop doesn't deliver this weekday

    if (offset === 0) {
      if (!settings.sameDayEnabled) continue;
      if (sameDayCutoffPassed) continue;
    }
    if (offset === 1 && !settings.nextDayEnabled) continue;

    dates.push({
      date: toLocalDateString(candidate),
      dayName,
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : null,
    });
  }

  return {
    dates,
    deliveryWindow: {
      startTime: settings.deliveryStartTime,
      endTime: settings.deliveryEndTime,
    },
    deliveryChargeMode: settings.deliveryChargeMode,
    // Only meaningful in "flat" mode; in "manual" the admin sets it per order.
    flatDeliveryCharge: settings.deliveryChargeMode === "flat" ? Number(settings.flatDeliveryCharge) : null,
    deliveryAreaNote: settings.deliveryAreaNote,
    payment: {
      codEnabled: settings.codEnabled,
      upiEnabled: settings.upiEnabled,
      upiId: settings.upiId,
      upiPayeeName: settings.upiPayeeName,
    },
  };
}

/**
 * Re-checks a customer-submitted date against the same rules at order time -
 * a date that was valid when the page loaded may have expired by submission
 * (cutoff passed, admin changed the days). Used by order creation later.
 */
async function isDateSelectable(dateString, now = new Date()) {
  const { dates } = await getAvailableDeliveryDates(now);
  return dates.some((d) => d.date === dateString);
}

module.exports = {
  getSettings,
  updateSettings,
  getAvailableDeliveryDates,
  isDateSelectable,
  DEFAULT_SETTINGS,
};
