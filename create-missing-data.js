const fs = require("fs");

const input = "star_halal_latest_backup.sql";
const output = "missing_data.sql";

const sql = fs.readFileSync(input, "utf8");

const tables = [
  "admin_users",
  "audit_log",
  "product_options",
  "order_items"
];

const statements = [];

// Find every INSERT statement in the backup.
const matches = sql.match(/INSERT INTO[\s\S]*?;\s*/gi) || [];

for (const statement of matches) {
  const match = statement.match(/INSERT INTO\s+[`']?(\w+)[`']?/i);

  if (!match) continue;

  const table = match[1];

  if (tables.includes(table)) {
    statements.push(statement.trim());
    console.log(`Found ${table}`);
  }
}

fs.writeFileSync(
  output,
  statements.join("\n\n") + "\n",
  "utf8"
);

console.log(`\nCreated ${output}`);
console.log(`INSERT statements: ${statements.length}`);
