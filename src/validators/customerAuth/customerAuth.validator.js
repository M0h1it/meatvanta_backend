const PHONE_PATTERN = /^[0-9]{10}$/;

function validateOtpRequest(body) {
  const errors = {};
  const { phone } = body || {};

  if (!phone || typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

function validateOtpVerification(body) {
  const errors = {};
  const { phone, otp, name } = body || {};

  if (!phone || typeof phone !== "string" || !PHONE_PATTERN.test(phone.trim())) {
    errors.phone = "Enter a valid 10-digit mobile number.";
  }
  if (!otp || typeof otp !== "string" || !/^[0-9]{6}$/.test(otp.trim())) {
    errors.otp = "Enter the 6-digit code.";
  }
  // name is optional - only required for a phone number with no account yet,
  // which the service decides since only it knows if the customer exists.
  if (name !== undefined && name !== null && typeof name !== "string") {
    errors.name = "Name must be text.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateOtpRequest, validateOtpVerification };
