const crypto = require("crypto");
const Razorpay = require("razorpay");

// Lazily constructed so a missing key doesn't crash the whole server at
// require-time - it only breaks the specific request that needed it, with a
// clear error, which is easier to diagnose on a fresh deploy.
let client = null;
function getClient() {
  if (client) return client;

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    const err = new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).");
    err.statusCode = 500;
    err.expose = false; // don't leak config details to the customer
    throw err;
  }

  client = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return client;
}

/** Public key id - safe to send to the browser, needed to open the widget. */
function getPublicKeyId() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    const err = new Error("Razorpay is not configured (missing RAZORPAY_KEY_ID).");
    err.statusCode = 500;
    err.expose = false;
    throw err;
  }
  return keyId;
}

/**
 * Creates a Razorpay order for the given amount. `amountInRupees` is our own
 * server-computed order total - Razorpay wants paise (integer), so it's
 * rounded and multiplied here, in one place, rather than at every call site.
 */
async function createRazorpayOrder({ amountInRupees, receipt, notes }) {
  const amountInPaise = Math.round(Number(amountInRupees) * 100);
  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    const err = new Error("Cannot create a payment for a zero or invalid amount.");
    err.statusCode = 400;
    err.expose = true;
    throw err;
  }

  return getClient().orders.create({
    amount: amountInPaise,
    currency: "INR",
    receipt,
    notes,
  });
}

/**
 * Verifies the signature Razorpay's checkout widget hands back after a
 * successful payment. This is what actually proves the payment happened -
 * everything else in the payload is just IDs a client could type in by hand.
 */
function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  // Constant-time compare - a plain `===` here would leak timing information
  // an attacker could use to guess the signature byte by byte.
  const expectedBuffer = Buffer.from(expected);
  const givenBuffer = Buffer.from(razorpaySignature || "");
  if (expectedBuffer.length !== givenBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, givenBuffer);
}

/**
 * Verifies a webhook call's signature. Razorpay signs the *raw* request body
 * with the separate webhook secret (set in the Razorpay dashboard, not the
 * same as the API key secret) - app.js captures req.rawBody for this.
 */
function verifyWebhookSignature({ rawBody, signature }) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expected = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const givenBuffer = Buffer.from(signature || "");
  if (expectedBuffer.length !== givenBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, givenBuffer);
}

module.exports = {
  getPublicKeyId,
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
};
