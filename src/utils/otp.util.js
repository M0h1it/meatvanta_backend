const bcrypt = require("bcryptjs");

const OTP_LENGTH = 6;
const OTP_SALT_ROUNDS = 8; // lower than passwords - these live for minutes, and
                           // login latency matters more than brute-force cost here

/** Cryptographically fine for a 6-digit code that expires in minutes. */
function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return String(Math.floor(min + Math.random() * (max - min + 1)));
}

async function hashOtp(otp) {
  return bcrypt.hash(otp, OTP_SALT_ROUNDS);
}

async function compareOtp(otp, otpHash) {
  return bcrypt.compare(otp, otpHash);
}

module.exports = { generateOtp, hashOtp, compareOtp, OTP_LENGTH };
