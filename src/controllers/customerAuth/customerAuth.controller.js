const customerAuthService = require("../../services/customerAuth/customerAuth.service");
const {
  validateOtpRequest,
  validateOtpVerification,
} = require("../../validators/customerAuth/customerAuth.validator");
const { success, failure } = require("../../utils/apiResponse.util");
const {
  CUSTOMER_ACCESS_COOKIE,
  CUSTOMER_REFRESH_COOKIE,
} = require("../../middlewares/customerAuth.middleware");

const { baseCookieOptions } = require("../../utils/cookiePolicy.util");

function setSessionCookies(res, tokens) {
  res.cookie(CUSTOMER_ACCESS_COOKIE, tokens.accessToken, {
    ...baseCookieOptions(),
    maxAge: 60 * 60 * 1000, // 1h - matches CUSTOMER_ACCESS_EXPIRES_IN
  });
  res.cookie(CUSTOMER_REFRESH_COOKIE, tokens.refreshToken, {
    ...baseCookieOptions(),
    maxAge: tokens.refreshTokenTtlMs,
  });
}

function clearSessionCookies(res) {
  res.clearCookie(CUSTOMER_ACCESS_COOKIE, baseCookieOptions());
  res.clearCookie(CUSTOMER_REFRESH_COOKIE, baseCookieOptions());
}

async function requestOtp(req, res, next) {
  try {
    const { isValid, errors } = validateOtpRequest(req.body);
    if (!isValid) return failure(res, 422, "Please check the number entered.", errors);

    const result = await customerAuthService.requestOtp(req.body.phone);
    return success(res, 200, "Verification code sent.", result);
  } catch (err) {
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function verifyOtp(req, res, next) {
  try {
    const { isValid, errors } = validateOtpVerification(req.body);
    if (!isValid) return failure(res, 422, "Please check the details entered.", errors);

    const { customer, tokens, isNewCustomer } = await customerAuthService.verifyOtp(req.body);
    setSessionCookies(res, tokens);

    return success(res, 200, isNewCustomer ? "Welcome!" : "Signed in.", { customer, isNewCustomer });
  } catch (err) {
    // Sentinel from the service: the number is new, so we need a name before
    // the account can be created. The frontend shows a name field and retries.
    if (err.message === "NAME_REQUIRED") {
      return failure(res, 422, "Please tell us your name to finish signing up.", {
        nameRequired: true,
      });
    }
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.[CUSTOMER_REFRESH_COOKIE];
    const { customer, tokens } = await customerAuthService.refreshSession(refreshToken);
    setSessionCookies(res, tokens);
    return success(res, 200, "Session refreshed.", { customer });
  } catch (err) {
    clearSessionCookies(res); // a dead refresh token should not linger in the browser
    if (err.expose) return failure(res, err.statusCode, err.message);
    return next(err);
  }
}

async function logout(req, res, next) {
  try {
    await customerAuthService.logout(req.cookies?.[CUSTOMER_REFRESH_COOKIE]);
    clearSessionCookies(res);
    return success(res, 200, "Signed out.");
  } catch (err) {
    return next(err);
  }
}

async function me(req, res, next) {
  try {
    const customer = await customerAuthService.getCustomerById(req.customer.id);
    if (!customer) return failure(res, 401, "Session is no longer valid.");
    return success(res, 200, "Customer fetched.", { customer });
  } catch (err) {
    return next(err);
  }
}

module.exports = { requestOtp, verifyOtp, refresh, logout, me };
