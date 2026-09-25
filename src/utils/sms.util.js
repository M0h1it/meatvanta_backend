/**
 * Single place every OTP leaves the system through.
 *
 * With MSG91_AUTH_KEY unset the message is logged to the server console and
 * the caller may surface the code on screen (dev mode) - that keeps the flow
 * testable before an SMS account exists. Once the key is set, real SMS is sent
 * and the code is never returned to the client.
 */
const isSmsConfigured = () => !!process.env.MSG91_AUTH_KEY;

/** MSG91 wants a bare country-code-prefixed number: 919876543210 */
function toMsg91Number(phone) {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`; // plain Indian mobile
  return digits; // already carries a country code
}

async function sendOtpSms(phone, otp) {
  if (!isSmsConfigured()) {
    console.log(`[sms:dev] OTP for ${phone} -> ${otp}`);
    return { delivered: false, devMode: true };
  }

  const url = "https://control.msg91.com/api/v5/otp";
  const params = new URLSearchParams({
    template_id: process.env.MSG91_TEMPLATE_ID || "",
    mobile: toMsg91Number(phone),
    otp,
  });

  try {
    const response = await fetch(`${url}?${params.toString()}`, {
      method: "POST",
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        "Content-Type": "application/json",
      },
    });

    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.type === "error") {
      // Logged, not thrown - the caller decides whether a failed send should
      // block the request. It usually should, so we return the flag.
      console.error("[sms] MSG91 rejected the send:", body);
      return { delivered: false, devMode: false, error: body.message || "SMS send failed" };
    }

    return { delivered: true, devMode: false };
  } catch (err) {
    console.error("[sms] send failed:", err.message);
    return { delivered: false, devMode: false, error: err.message };
  }
}

module.exports = { sendOtpSms, isSmsConfigured };