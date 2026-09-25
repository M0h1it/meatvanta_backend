/**
 * The only thing the widget-based OTP flow hands our backend is the
 * access-token MSG91 issued once the customer entered the right code -
 * there's no phone/otp pair to validate here anymore (see
 * customerAuth.service.js verifyOtp / msg91.service.js).
 */
function validateOtpVerification(body) {
  const errors = {};
  const { accessToken, name } = body || {};

  if (!accessToken || typeof accessToken !== "string" || accessToken.trim().length < 10) {
    errors.accessToken = "Missing verification token.";
  }
  // name is optional - only required for a phone number with no account yet,
  // which the service decides since only it knows if the customer exists.
  if (name !== undefined && name !== null && typeof name !== "string") {
    errors.name = "Name must be text.";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

module.exports = { validateOtpVerification };