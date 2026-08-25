const isProd = process.env.NODE_ENV === "production";

/**
 * When the API and the frontends sit on different domains (say the API on
 * onrender.com and the site on vercel.app), the browser treats every request
 * as cross-site and silently DROPS a SameSite=Strict cookie - nobody can log
 * in and there is no error to read.
 *
 * CROSS_SITE_COOKIES=true switches to SameSite=None, which requires Secure,
 * which requires HTTPS. Both hosts provide HTTPS, so that holds.
 *
 * Once everything is on one domain (api.example.com + admin.example.com),
 * set it back to false and Strict resumes - a stronger default.
 */
const isCrossSite = process.env.CROSS_SITE_COOKIES === "true";

function baseCookieOptions() {
  return {
    httpOnly: true,
    // SameSite=None is only honoured on secure cookies, so force it on.
    secure: isProd || isCrossSite,
    sameSite: isCrossSite ? "none" : isProd ? "strict" : "lax",
  };
}

module.exports = { baseCookieOptions, isCrossSite };
