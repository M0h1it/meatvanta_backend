const fs = require("fs");

const input = "star_halal_latest_backup.sql";
const output = "data_only.sql";

const sql = fs.readFileSync(input, "utf8");

// Extract complete INSERT INTO statements, including multi-line VALUES.
const statements = [];
const regex = /INSERT INTO[\s\S]*?;\s*(?=--|CREATE TABLE|ALTER TABLE|INSERT INTO|$)/gi;

for (const match of sql.matchAll(regex)) {
  const statement = match[0].trim();

  // Don't import Prisma's migration history.
  if (!/INSERT INTO [`']?_prisma_migrations[`']?/i.test(statement)) {
    statements.push(statement);
  }
}

fs.writeFileSync(output, statements.join("\n\n") + "\n", "utf8");

console.log(`Created ${output}`);
console.log(`INSERT statements: ${statements.length}`);
