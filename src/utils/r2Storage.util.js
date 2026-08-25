const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { r2Client, isR2Configured } = require("../config/r2");

/**
 * Uploads a buffer to R2 and returns the key it was stored under.
 * The public URL is built from R2_PUBLIC_URL, which is the bucket's public
 * r2.dev address or a custom domain bound to the bucket.
 */
async function uploadToR2(buffer, key, contentType) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

/** Best-effort - a failed cleanup must never break the request that triggered it. */
async function deleteFromR2(key) {
  if (!key) return;
  try {
    await r2Client.send(
      new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: key })
    );
  } catch (err) {
    console.error("[r2] failed to delete object:", err.message);
  }
}

function toR2PublicUrl(key) {
  const base = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  return `${base}/${key}`;
}

module.exports = { uploadToR2, deleteFromR2, toR2PublicUrl, isR2Configured };
