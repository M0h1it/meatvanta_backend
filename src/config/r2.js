const { S3Client } = require("@aws-sdk/client-s3");

/**
 * Cloudflare R2 is S3-compatible, so the standard AWS SDK talks to it.
 * If these env vars are absent the app falls back to local disk storage,
 * which keeps local development working with no cloud account at all.
 */
const isR2Configured = !!(
  process.env.R2_ACCOUNT_ID &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET
);

let r2Client = null;

if (isR2Configured) {
  r2Client = new S3Client({
    region: "auto", // R2 ignores region but the SDK requires one
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

module.exports = { r2Client, isR2Configured };
