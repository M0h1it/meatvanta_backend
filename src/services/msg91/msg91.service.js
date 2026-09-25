/**
 * Confirms an MSG91 OTP Widget access-token server-side. The widget's own
 * client-side "success" callback can't be trusted by itself - anyone could
 * open devtools and call it directly without ever entering a real code - so
 * every login goes through this check before a session is issued. Uses
 * Node's built-in fetch (Node 18+).
 */
async function verifyWidgetAccessToken(accessToken) {
  const authkey = process.env.MSG91_AUTH_KEY;
  if (!authkey) {
    const err = new Error("MSG91_AUTH_KEY is not configured.");
    err.statusCode = 500;
    throw err;
  }

  let response;
  try {
    response = await fetch("https://control.msg91.com/api/v5/widget/verifyAccessToken", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ authkey, "access-token": accessToken }),
    });
  } catch {
    const err = new Error("Couldn't reach MSG91 to verify the code. Please try again.");
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }

  const json = await response.json().catch(() => null);

  if (!response.ok || !json || json.type !== "success") {
    // Log MSG91's raw reply server-side (never sent to the client) so a
    // rejected login can be diagnosed later - bad authkey, expired token,
    // IP restriction, etc - without needing to reproduce it live.
    console.error("[MSG91 verifyAccessToken] rejected:", {
      httpStatus: response.status,
      body: json,
    });
    const err = new Error("That code couldn't be verified. Please request a new one.");
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  // MSG91 returns the verified mobile number in `message` on success (may
  // carry the "91" country-code prefix) - take the last 10 digits, which is
  // what this app stores/keys customers by everywhere else.
  const verifiedPhone = String(json.message || "").replace(/\D/g, "").slice(-10);

  if (verifiedPhone.length !== 10) {
    const err = new Error("MSG91 didn't return a valid phone number for this code.");
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  return verifiedPhone;
}

module.exports = { verifyWidgetAccessToken };