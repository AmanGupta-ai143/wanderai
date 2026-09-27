import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  await pool.query(
    `UPDATE "Destination" SET "heroImage" = $1 WHERE slug = $2`,
    ["/images/jaipur-hero.jpg", "jaipur"]
  );
  console.log("Updated jaipur heroImage.");
  await pool.end();
}

main();