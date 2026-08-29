const MIN_ADDRESS_LENGTH = 10;

function validateAddress(body, { partial = false } = {}) {
  const errors = {};
  const { label, addressLine, area, pincode, latitude, longitude, isDefault } = body || {};

  const provided = (value) => value !== undefined && value !== null;

  if (!partial || provided(addressLine)) {
    const trimmed = typeof addressLine === "string" ? addressLine.trim() : "";
    if (!trimmed) {
      errors.addressLine = "Please enter your delivery address.";
    } else if (trimmed.length < MIN_ADDRESS_LENGTH) {
      // Say the actual rule - "Please enter the full address" left the
      // customer retyping the same short value and failing again.
      errors.addressLine = `Please add a bit more detail (at least ${MIN_ADDRESS_LENGTH} characters) — house or flat number, building and street.`;
    }
  }

  if (label !== undefined && (typeof label !== "string" || label.trim().length < 1 || label.length > 50)) {
    errors.label = "Label must be 1-50 characters.";
  }
  if (area !== undefined && area !== null && (typeof area !== "string" || area.length > 150)) {
    errors.area = "Area must be 150 characters or fewer.";
  }
  if (pincode !== undefined && pincode !== null && pincode !== "" && !/^[0-9]{6}$/.test(String(pincode))) {
    errors.pincode = "Pincode must be 6 digits.";
  }

  // Coordinates are optional (typed address) but must be sane if present -
  // they drive distance-based delivery pricing later.
  if (latitude !== undefined && latitude !== null) {
    const lat = Number(latitude);
    if (Number.isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Invalid latitude.";
  }
  if (longitude !== undefined && longitude !== null) {
    const lng = Number(longitude);
    if (Number.isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Invalid longitude.";
  }
  if (isDefault !== undefined && typeof isDefault !== "boolean") {
    errors.isDefault = "isDefault must be true or false.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateAddress, MIN_ADDRESS_LENGTH };