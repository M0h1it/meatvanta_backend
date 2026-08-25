const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "..", "..", "uploads");

/** relativePath e.g. "chicken/chicken-curry-cut-1719900000000.jpg" -> full public URL */
function toPublicUrl(relativePath) {
  const base = process.env.SERVER_BASE_URL || "http://localhost:4000";
  return `${base}/uploads/${relativePath.split(path.sep).join("/")}`;
}

/** Best-effort delete - never let a failed cleanup block the main request. */
function deleteLocalImage(relativePath) {
  if (!relativePath) return;
  const fullPath = path.join(UPLOADS_DIR, relativePath);
  fs.unlink(fullPath, (err) => {
    if (err && err.code !== "ENOENT") {
      console.error("[localImageStorage] failed to delete file:", err.message);
    }
  });
}

module.exports = { toPublicUrl, deleteLocalImage, UPLOADS_DIR };
