// Applies prisma/schema.sql directly via the `pg` package — an alternative
// to `psql -f prisma/schema.sql` for machines that don't have the
// PostgreSQL command-line tools installed (e.g. plain Windows).
//
// Run with: npx tsx prisma/apply-schema.ts
// Requires: DATABASE_URL set in a .env file in the project root (or in
// the environment already).

import fs from "fs";
import path from "path";
import { Pool } from "pg";

// --- tiny .env loader (no extra dependency) ---
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  let raw = fs.readFileSync(envPath, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1); // strip BOM (Notepad adds this)
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
// --- end loader ---

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is not set. Create a .env file in the project root with:\n" +
        'DATABASE_URL="your-neon-connection-string"'
    );
    process.exit(1);
  }

  const dbUrl = process.env.DATABASE_URL;
  const masked = dbUrl!.replace(/:\/\/([^:]+):[^@]+@/, "://$1:****@");
  console.log("Using connection string:", masked);

  const schemaPath = path.join(process.cwd(), "prisma", "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    console.log("Applying prisma/schema.sql ...");
    await pool.query(sql);
    console.log("Schema applied successfully.");
  } finally {
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Failed to apply schema:");
  console.error(e.message ?? e);
  process.exit(1);
});
