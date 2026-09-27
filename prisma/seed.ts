// Seeds a connected Postgres database from lib/mock-data.ts — the same
// content the app previously ran from an in-memory store. Uses raw SQL via
// `pg` (not Prisma Client) to match lib/server/repository.ts — see README
// for why Prisma's CLI couldn't be used to generate/migrate in the
// environment this was built in.
//
// Run with: npx tsx prisma/seed.ts
// Requires: the schema already applied — see prisma/schema.sql

import fs from "fs";
import path from "path";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { destinations } from "../lib/mock-data";

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

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. Create a .env file in the project root with:\n" +
      'DATABASE_URL="your-neon-connection-string"'
  );
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const adminId = randomUUID();
  const demoId = randomUUID();

  await pool.query(
    `INSERT INTO "User" (id, name, email, "passwordHash", role) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO NOTHING`,
    [adminId, "WanderAI Admin", "admin@wanderai.app", await bcrypt.hash("admin123", 10), "ADMIN"]
  );
  await pool.query(
    `INSERT INTO "User" (id, name, email, "passwordHash", role) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (email) DO NOTHING`,
    [demoId, "Demo Traveler", "demo@wanderai.app", await bcrypt.hash("traveler123", 10), "USER"]
  );

  for (const d of destinations) {
    const existing = await pool.query(`SELECT id FROM "Destination" WHERE slug = $1`, [d.slug]);
    if (existing.rows.length > 0) {
      console.log(`Skipping ${d.slug} — already seeded.`);
      continue;
    }

    const destId = randomUUID();
    await pool.query(
      `INSERT INTO "Destination"
        (id, slug, name, tagline, region, country, rating, "heroImage", "cardImage", tags, "bestTime", intro, "didYouKnow",
         "quickFacts", center, "languageGuide", weather, "bestTimeCalendar", shopping, safety, transport)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
      [
        destId, d.slug, d.name, d.tagline, d.region, d.country, d.rating, d.heroImage, d.cardImage,
        d.tags, d.bestTime, d.intro, d.didYouKnow,
        JSON.stringify(d.quickFacts), JSON.stringify(d.center), JSON.stringify(d.languageGuide),
        JSON.stringify(d.weather), JSON.stringify(d.bestTimeCalendar), JSON.stringify(d.shopping),
        JSON.stringify(d.safety), JSON.stringify(d.transport),
      ]
    );

    for (const a of d.attractions) {
      await pool.query(
        `INSERT INTO "Attraction" (id, slug, "destinationId", name, category, rating, image, duration, ticket, hours, "bestTime", about, architecture, location, lat, lng)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
        [randomUUID(), a.slug, destId, a.name, a.category, a.rating, a.image, a.duration, a.ticket, a.hours, a.bestTime, a.about, a.architecture, a.location, a.lat, a.lng]
      );
    }
    for (const [order, h] of d.history.entries()) {
      await pool.query(
        `INSERT INTO "HistoricalEvent" (id, "destinationId", year, title, description, "order") VALUES ($1,$2,$3,$4,$5,$6)`,
        [randomUUID(), destId, h.year, h.title, h.description, order]
      );
    }
    for (const f of d.food) {
      await pool.query(
        `INSERT INTO "Food" (id, slug, "destinationId", name, origin, image, description, ingredients, taste, significance, "whereToTry")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [randomUUID(), f.slug, destId, f.name, f.origin, f.image, f.description, f.ingredients, f.taste, f.significance, f.whereToTry]
      );
    }
    for (const c of d.culture) {
      await pool.query(
        `INSERT INTO "CultureItem" (id, slug, "destinationId", title, category, image, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), c.slug, destId, c.title, c.category, c.image, c.description]
      );
    }
    for (const h of d.hotels) {
      await pool.query(
        `INSERT INTO "Hotel" (id, slug, "destinationId", name, tier, "pricePerNight", rating, image, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [randomUUID(), h.slug, destId, h.name, h.tier, h.pricePerNight, h.rating, h.image, h.lat, h.lng]
      );
    }
    for (const r of d.restaurants) {
      await pool.query(
        `INSERT INTO "Restaurant" (id, slug, "destinationId", name, cuisine, "priceLevel", rating, image, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [randomUUID(), r.slug, destId, r.name, r.cuisine, r.priceLevel, r.rating, r.image, r.lat, r.lng]
      );
    }
    for (const f of d.festivals) {
      await pool.query(
        `INSERT INTO "Festival" (id, slug, "destinationId", name, "dateLabel", image, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), f.slug, destId, f.name, f.dateLabel, f.image, f.description]
      );
    }
    for (const [order, img] of d.gallery.entries()) {
      await pool.query(
        `INSERT INTO "Image" (id, "destinationId", url, category, caption, tall, "order") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [randomUUID(), destId, img.image, img.category, img.caption, img.tall ?? false, order]
      );
    }

    console.log(`Seeded ${d.name}.`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => pool.end());
