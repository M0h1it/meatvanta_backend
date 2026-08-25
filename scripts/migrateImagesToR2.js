require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");
const { uploadToR2, toR2PublicUrl, isR2Configured } = require("../src/utils/r2Storage.util");

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, "..", "uploads");

const MIME_BY_EXT = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp" };

/**
 * One-time: pushes every product image currently on local disk up to R2 and
 * rewrites the stored URL. Safe to re-run - anything already pointing at R2
 * is skipped, and a missing local file is reported rather than throwing.
 */
async function main() {
  if (!isR2Configured) {
    throw new Error("R2 env vars are not set. Fill them in before running this.");
  }

  const products = await prisma.product.findMany({
    where: { imagePath: { not: null } },
    include: { category: true },
  });

  console.log(`Found ${products.length} products with an image.\n`);

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;

  for (const product of products) {
    if ((product.imageUrl || "").includes("r2.dev") || (product.imageUrl || "").includes(process.env.R2_PUBLIC_URL)) {
      console.log(`  skip   ${product.name} (already on R2)`);
      skipped += 1;
      continue;
    }

    const localPath = path.join(UPLOADS_DIR, product.imagePath);
    if (!fs.existsSync(localPath)) {
      console.log(`  MISSING ${product.name} -> ${product.imagePath}`);
      missing += 1;
      continue;
    }

    const buffer = fs.readFileSync(localPath);
    const ext = path.extname(localPath).toLowerCase();
    // Keep the same key as the local relative path so the folder-per-category
    // layout carries over unchanged.
    const key = product.imagePath.split(path.sep).join("/");

    await uploadToR2(buffer, key, MIME_BY_EXT[ext] || "image/jpeg");

    await prisma.product.update({
      where: { id: product.id },
      data: { imageUrl: toR2PublicUrl(key), imagePath: key },
    });

    console.log(`  ok     ${product.name} -> ${key}`);
    uploaded += 1;
  }

  console.log(`\nUploaded ${uploaded}, skipped ${skipped}, missing ${missing}.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
