import { randomUUID } from "crypto";
import { query, queryOne } from "./db";
import {
  Destination,
  Attraction,
  FoodItem,
  CultureItem,
  Hotel,
  Restaurant,
  Festival,
  GalleryImage,
  HistoryEvent,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Real Postgres repository layer — raw parameterized SQL via `pg`
// (lib/server/db.ts), not Prisma Client. See README for why: this project's
// Prisma schema (prisma/schema.prisma) is kept as the documented source of
// truth for the data shape, but `prisma generate`/`migrate` need a
// downloaded native binary that this environment's network couldn't reach.
// The SQL here was written to match that schema exactly and has been
// tested against a real local Postgres instance.
// ---------------------------------------------------------------------------

type DestRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  region: string;
  country: string;
  rating: number;
  heroImage: string;
  cardImage: string;
  tags: string[];
  bestTime: string;
  intro: string;
  didYouKnow: string[];
  quickFacts: Destination["quickFacts"];
  center: Destination["center"];
  languageGuide: Destination["languageGuide"];
  weather: Destination["weather"];
  bestTimeCalendar: Destination["bestTimeCalendar"];
  shopping: Destination["shopping"];
  safety: Destination["safety"];
  transport: Destination["transport"];
};

async function hydrateDestination(row: DestRow): Promise<Destination> {
  const id = row.id;
  const [attractions, history, food, culture, hotels, restaurants, festivals, images] =
    await Promise.all([
      query<Attraction & { id: string }>(
        `SELECT slug, name, category, rating, image, duration, ticket, hours, "bestTime", about, architecture, location, lat, lng FROM "Attraction" WHERE "destinationId" = $1 ORDER BY name`,
        [id]
      ),
      query<HistoryEvent>(
        `SELECT year, title, description FROM "HistoricalEvent" WHERE "destinationId" = $1 ORDER BY "order"`,
        [id]
      ),
      query<FoodItem>(
        `SELECT slug, name, origin, image, description, ingredients, taste, significance, "whereToTry" FROM "Food" WHERE "destinationId" = $1 ORDER BY name`,
        [id]
      ),
      query<CultureItem>(
        `SELECT slug, title, category, image, description FROM "CultureItem" WHERE "destinationId" = $1 ORDER BY title`,
        [id]
      ),
      query<Hotel>(
        `SELECT slug, name, tier, "pricePerNight", rating, image, lat, lng FROM "Hotel" WHERE "destinationId" = $1 ORDER BY name`,
        [id]
      ),
      query<Restaurant>(
        `SELECT slug, name, cuisine, "priceLevel", rating, image, lat, lng FROM "Restaurant" WHERE "destinationId" = $1 ORDER BY name`,
        [id]
      ),
      query<Festival>(
        `SELECT slug, name, "dateLabel", image, description FROM "Festival" WHERE "destinationId" = $1 ORDER BY name`,
        [id]
      ),
      query<{ url: string; category: string; caption: string; tall: boolean }>(
        `SELECT url, category, caption, tall FROM "Image" WHERE "destinationId" = $1 ORDER BY "order", id`,
        [id]
      ),
    ]);

  return {
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    region: row.region,
    country: row.country,
    rating: row.rating,
    heroImage: row.heroImage,
    cardImage: row.cardImage,
    tags: row.tags,
    bestTime: row.bestTime,
    quickFacts: row.quickFacts,
    intro: row.intro,
    didYouKnow: row.didYouKnow,
    center: row.center,
    attractions,
    history,
    culture,
    food,
    gallery: images.map((i) => ({ image: i.url, category: i.category, caption: i.caption, tall: i.tall })),
    hotels,
    restaurants,
    languageGuide: row.languageGuide,
    transport: row.transport,
    weather: row.weather,
    bestTimeCalendar: row.bestTimeCalendar,
    festivals,
    shopping: row.shopping,
    safety: row.safety,
  };
}

// -- Destinations -------------------------------------------------------
export async function listDestinations(q?: string): Promise<Destination[]> {
  const rows = q
    ? await query<DestRow>(
        `SELECT * FROM "Destination" WHERE name ILIKE $1 OR region ILIKE $1 OR $2 ILIKE ANY(tags) ORDER BY name`,
        [`%${q}%`, q]
      )
    : await query<DestRow>(`SELECT * FROM "Destination" ORDER BY name`);
  return Promise.all(rows.map(hydrateDestination));
}

async function getDestRow(slug: string) {
  return queryOne<DestRow & { id: string }>(`SELECT * FROM "Destination" WHERE slug = $1`, [slug]);
}

export async function getDestinationBySlug(slug: string): Promise<Destination | undefined> {
  const row = await getDestRow(slug);
  if (!row) return undefined;
  return hydrateDestination(row);
}

export async function createDestination(data: Destination): Promise<Destination> {
  const existing = await getDestRow(data.slug);
  if (existing) throw new Error("A destination with this slug already exists");

  const id = randomUUID();
  await query(
    `INSERT INTO "Destination"
      (id, slug, name, tagline, region, country, rating, "heroImage", "cardImage", tags, "bestTime", intro, "didYouKnow",
       "quickFacts", center, "languageGuide", weather, "bestTimeCalendar", shopping, safety, transport)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
    [
      id, data.slug, data.name, data.tagline, data.region, data.country, data.rating,
      data.heroImage, data.cardImage, data.tags, data.bestTime, data.intro, data.didYouKnow,
      JSON.stringify(data.quickFacts), JSON.stringify(data.center), JSON.stringify(data.languageGuide),
      JSON.stringify(data.weather), JSON.stringify(data.bestTimeCalendar), JSON.stringify(data.shopping),
      JSON.stringify(data.safety), JSON.stringify(data.transport),
    ]
  );

  for (const a of data.attractions ?? []) await createAttraction(data.slug, a, id);
  for (const h of data.history ?? []) {
    await query(
      `INSERT INTO "HistoricalEvent" (id, "destinationId", year, title, description) VALUES ($1,$2,$3,$4,$5)`,
      [randomUUID(), id, h.year, h.title, h.description]
    );
  }
  for (const f of data.food ?? []) await createFood(data.slug, f, id);
  for (const c of data.culture ?? []) await createCultureItem(data.slug, c, id);
  for (const h of data.hotels ?? []) await createHotel(data.slug, h, id);
  for (const f of data.festivals ?? []) await createFestival(data.slug, f, id);
  for (const img of data.gallery ?? []) await addGalleryImage(data.slug, img, id);

  return (await getDestinationBySlug(data.slug))!;
}

export async function updateDestination(
  slug: string,
  patch: Partial<Destination>
): Promise<Destination | undefined> {
  const row = await getDestRow(slug);
  if (!row) return undefined;

  const fieldMap: Record<string, string> = {
    name: "name", tagline: "tagline", region: "region", country: "country", rating: "rating",
    heroImage: '"heroImage"', cardImage: '"cardImage"', tags: "tags", bestTime: '"bestTime"',
    intro: "intro", didYouKnow: '"didYouKnow"',
  };
  const jsonFieldMap: Record<string, string> = {
    quickFacts: '"quickFacts"', center: "center", languageGuide: '"languageGuide"',
    weather: "weather", bestTimeCalendar: '"bestTimeCalendar"', shopping: "shopping",
    safety: "safety", transport: "transport",
  };

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;

  for (const [key, col] of Object.entries(fieldMap)) {
    if (key in patch) {
      sets.push(`${col} = $${i++}`);
      values.push((patch as Record<string, unknown>)[key]);
    }
  }
  for (const [key, col] of Object.entries(jsonFieldMap)) {
    if (key in patch) {
      sets.push(`${col} = $${i++}`);
      values.push(JSON.stringify((patch as Record<string, unknown>)[key]));
    }
  }
  if (sets.length === 0) return getDestinationBySlug(slug);

  sets.push(`"updatedAt" = now()`);
  values.push(slug);
  await query(`UPDATE "Destination" SET ${sets.join(", ")} WHERE slug = $${i}`, values);

  return getDestinationBySlug(slug);
}

export async function deleteDestination(slug: string): Promise<boolean> {
  const rows = await query(`DELETE FROM "Destination" WHERE slug = $1 RETURNING id`, [slug]);
  return rows.length > 0;
}

// -- Attractions ----------------------------------------------------------
export async function listAttractions(destSlug: string): Promise<Attraction[]> {
  const dest = await getDestinationBySlug(destSlug);
  return dest?.attractions ?? [];
}

export async function getAttraction(destSlug: string, attractionSlug: string) {
  const dest = await getDestinationBySlug(destSlug);
  const attraction = dest?.attractions.find((a) => a.slug === attractionSlug);
  return dest && attraction ? { dest, attraction } : undefined;
}

export async function createAttraction(destSlug: string, a: Attraction, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  try {
    await query(
      `INSERT INTO "Attraction" (id, slug, "destinationId", name, category, rating, image, duration, ticket, hours, "bestTime", about, architecture, location, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [randomUUID(), a.slug, id, a.name, a.category, a.rating, a.image, a.duration, a.ticket, a.hours, a.bestTime, a.about, a.architecture, a.location, a.lat, a.lng]
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("An attraction with this slug already exists for this destination");
    throw e;
  }
  return a;
}

export async function updateAttraction(destSlug: string, attractionSlug: string, patch: Partial<Attraction>) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return undefined;
  const cols: Record<string, string> = {
    name: "name", category: "category", rating: "rating", image: "image", duration: "duration",
    ticket: "ticket", hours: "hours", bestTime: '"bestTime"', about: "about",
    architecture: "architecture", location: "location", lat: "lat", lng: "lng",
  };
  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) {
      sets.push(`${col} = $${i++}`);
      values.push((patch as Record<string, unknown>)[key]);
    }
  }
  if (sets.length === 0) return (await getAttraction(destSlug, attractionSlug))?.attraction;
  values.push(destId, attractionSlug);
  await query(`UPDATE "Attraction" SET ${sets.join(", ")} WHERE "destinationId" = $${i++} AND slug = $${i}`, values);
  return (await getAttraction(destSlug, attractionSlug))?.attraction;
}

export async function deleteAttraction(destSlug: string, attractionSlug: string) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query(`DELETE FROM "Attraction" WHERE "destinationId" = $1 AND slug = $2 RETURNING id`, [destId, attractionSlug]);
  return rows.length > 0;
}

// -- Food ----------------------------------------------------------------
export async function createFood(destSlug: string, f: FoodItem, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  try {
    await query(
      `INSERT INTO "Food" (id, slug, "destinationId", name, origin, image, description, ingredients, taste, significance, "whereToTry")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [randomUUID(), f.slug, id, f.name, f.origin, f.image, f.description, f.ingredients, f.taste, f.significance, f.whereToTry]
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("A food item with this slug already exists for this destination");
    throw e;
  }
  return f;
}
export async function updateFood(destSlug: string, foodSlug: string, patch: Partial<FoodItem>) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return undefined;
  const cols: Record<string, string> = {
    name: "name", origin: "origin", image: "image", description: "description",
    ingredients: "ingredients", taste: "taste", significance: "significance", whereToTry: '"whereToTry"',
  };
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) { sets.push(`${col} = $${i++}`); values.push((patch as Record<string, unknown>)[key]); }
  }
  if (sets.length > 0) {
    values.push(destId, foodSlug);
    await query(`UPDATE "Food" SET ${sets.join(", ")} WHERE "destinationId" = $${i++} AND slug = $${i}`, values);
  }
  const dest = await getDestinationBySlug(destSlug);
  return dest?.food.find((f) => f.slug === foodSlug);
}
export async function deleteFood(destSlug: string, foodSlug: string) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query(`DELETE FROM "Food" WHERE "destinationId" = $1 AND slug = $2 RETURNING id`, [destId, foodSlug]);
  return rows.length > 0;
}

// -- Culture ----------------------------------------------------------------
export async function createCultureItem(destSlug: string, c: CultureItem, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  try {
    await query(
      `INSERT INTO "CultureItem" (id, slug, "destinationId", title, category, image, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [randomUUID(), c.slug, id, c.title, c.category, c.image, c.description]
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("A culture item with this slug already exists for this destination");
    throw e;
  }
  return c;
}
export async function updateCultureItem(destSlug: string, itemSlug: string, patch: Partial<CultureItem>) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return undefined;
  const cols: Record<string, string> = { title: "title", category: "category", image: "image", description: "description" };
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) { sets.push(`${col} = $${i++}`); values.push((patch as Record<string, unknown>)[key]); }
  }
  if (sets.length > 0) {
    values.push(destId, itemSlug);
    await query(`UPDATE "CultureItem" SET ${sets.join(", ")} WHERE "destinationId" = $${i++} AND slug = $${i}`, values);
  }
  const dest = await getDestinationBySlug(destSlug);
  return dest?.culture.find((c) => c.slug === itemSlug);
}
export async function deleteCultureItem(destSlug: string, itemSlug: string) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query(`DELETE FROM "CultureItem" WHERE "destinationId" = $1 AND slug = $2 RETURNING id`, [destId, itemSlug]);
  return rows.length > 0;
}

// -- Hotels ----------------------------------------------------------------
export async function createHotel(destSlug: string, h: Hotel, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  try {
    await query(
      `INSERT INTO "Hotel" (id, slug, "destinationId", name, tier, "pricePerNight", rating, image, lat, lng) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [randomUUID(), h.slug, id, h.name, h.tier, h.pricePerNight, h.rating, h.image, h.lat, h.lng]
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("A hotel with this slug already exists for this destination");
    throw e;
  }
  return h;
}
export async function updateHotel(destSlug: string, hotelSlug: string, patch: Partial<Hotel>) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return undefined;
  const cols: Record<string, string> = {
    name: "name", tier: "tier", pricePerNight: '"pricePerNight"', rating: "rating", image: "image", lat: "lat", lng: "lng",
  };
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) { sets.push(`${col} = $${i++}`); values.push((patch as Record<string, unknown>)[key]); }
  }
  if (sets.length > 0) {
    values.push(destId, hotelSlug);
    await query(`UPDATE "Hotel" SET ${sets.join(", ")} WHERE "destinationId" = $${i++} AND slug = $${i}`, values);
  }
  const dest = await getDestinationBySlug(destSlug);
  return dest?.hotels.find((h) => h.slug === hotelSlug);
}
export async function deleteHotel(destSlug: string, hotelSlug: string) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query(`DELETE FROM "Hotel" WHERE "destinationId" = $1 AND slug = $2 RETURNING id`, [destId, hotelSlug]);
  return rows.length > 0;
}

// -- Gallery Images ----------------------------------------------------------------
export async function addGalleryImage(destSlug: string, image: GalleryImage, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  await query(
    `INSERT INTO "Image" (id, "destinationId", url, category, caption, tall) VALUES ($1,$2,$3,$4,$5,$6)`,
    [randomUUID(), id, image.image, image.category, image.caption, image.tall ?? false]
  );
  return image;
}
export async function deleteGalleryImage(destSlug: string, index: number) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query<{ id: string }>(
    `SELECT id FROM "Image" WHERE "destinationId" = $1 ORDER BY "order", id`,
    [destId]
  );
  const target = rows[index];
  if (!target) return false;
  await query(`DELETE FROM "Image" WHERE id = $1`, [target.id]);
  return true;
}

// -- Events / Festivals ----------------------------------------------------------------
export async function createFestival(destSlug: string, f: Festival, destinationId?: string) {
  const id = destinationId ?? (await getDestRow(destSlug))?.id;
  if (!id) throw new Error("Destination not found");
  try {
    await query(
      `INSERT INTO "Festival" (id, slug, "destinationId", name, "dateLabel", image, description) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [randomUUID(), f.slug, id, f.name, f.dateLabel, f.image, f.description]
    );
  } catch (e) {
    if ((e as { code?: string }).code === "23505") throw new Error("A festival with this slug already exists for this destination");
    throw e;
  }
  return f;
}
export async function updateFestival(destSlug: string, festivalSlug: string, patch: Partial<Festival>) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return undefined;
  const cols: Record<string, string> = { name: "name", dateLabel: '"dateLabel"', image: "image", description: "description" };
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) { sets.push(`${col} = $${i++}`); values.push((patch as Record<string, unknown>)[key]); }
  }
  if (sets.length > 0) {
    values.push(destId, festivalSlug);
    await query(`UPDATE "Festival" SET ${sets.join(", ")} WHERE "destinationId" = $${i++} AND slug = $${i}`, values);
  }
  const dest = await getDestinationBySlug(destSlug);
  return dest?.festivals.find((f) => f.slug === festivalSlug);
}
export async function deleteFestival(destSlug: string, festivalSlug: string) {
  const destId = (await getDestRow(destSlug))?.id;
  if (!destId) return false;
  const rows = await query(`DELETE FROM "Festival" WHERE "destinationId" = $1 AND slug = $2 RETURNING id`, [destId, festivalSlug]);
  return rows.length > 0;
}

// -- Reviews ----------------------------------------------------------------
export async function listReviews(destSlug: string, attractionSlug: string) {
  return query<{ id: string; userId: string; userName: string; rating: number; text: string; createdAt: string }>(
    `SELECT r.id, r."userId", u.name as "userName", r.rating, r.text, r."createdAt"
     FROM "Review" r
     JOIN "Attraction" a ON a.id = r."attractionId"
     JOIN "Destination" d ON d.id = a."destinationId"
     JOIN "User" u ON u.id = r."userId"
     WHERE d.slug = $1 AND a.slug = $2
     ORDER BY r."createdAt" DESC`,
    [destSlug, attractionSlug]
  );
}

export async function createReview(input: {
  userId: string;
  destinationSlug: string;
  attractionSlug: string;
  rating: number;
  text: string;
}) {
  const attr = await queryOne<{ id: string }>(
    `SELECT a.id FROM "Attraction" a JOIN "Destination" d ON d.id = a."destinationId" WHERE d.slug = $1 AND a.slug = $2`,
    [input.destinationSlug, input.attractionSlug]
  );
  if (!attr) throw new Error("Attraction not found");

  const id = randomUUID();
  await query(
    `INSERT INTO "Review" (id, "userId", "attractionId", rating, text) VALUES ($1,$2,$3,$4,$5)`,
    [id, input.userId, attr.id, input.rating, input.text]
  );
  const row = await queryOne<{ id: string; userId: string; userName: string; rating: number; text: string; createdAt: string }>(
    `SELECT r.id, r."userId", u.name as "userName", r.rating, r.text, r."createdAt" FROM "Review" r JOIN "User" u ON u.id = r."userId" WHERE r.id = $1`,
    [id]
  );
  return row!;
}

export async function listAllReviews() {
  return query<{
    id: string; userName: string; destinationName: string; attractionName: string; rating: number; text: string; createdAt: string;
  }>(
    `SELECT r.id, u.name as "userName", d.name as "destinationName", a.name as "attractionName", r.rating, r.text, r."createdAt"
     FROM "Review" r
     JOIN "User" u ON u.id = r."userId"
     JOIN "Attraction" a ON a.id = r."attractionId"
     JOIN "Destination" d ON d.id = a."destinationId"
     ORDER BY r."createdAt" DESC`
  );
}
export async function deleteReview(reviewId: string) {
  const rows = await query(`DELETE FROM "Review" WHERE id = $1 RETURNING id`, [reviewId]);
  return rows.length > 0;
}

// -- Users (admin management) ------------------------------------------------
export type DbUser = { id: string; name: string; email: string; passwordHash: string; role: "USER" | "ADMIN"; createdAt: string };

export async function findUserByEmail(email: string) {
  return queryOne<DbUser>(`SELECT * FROM "User" WHERE email ILIKE $1`, [email]);
}
export async function findUserById(id: string) {
  return queryOne<DbUser>(`SELECT * FROM "User" WHERE id = $1`, [id]);
}
export async function createUser(input: { name: string; email: string; passwordHash: string; role?: "USER" | "ADMIN" }) {
  const id = randomUUID();
  await query(
    `INSERT INTO "User" (id, name, email, "passwordHash", role) VALUES ($1,$2,$3,$4,$5)`,
    [id, input.name, input.email, input.passwordHash, input.role ?? "USER"]
  );
  return (await findUserById(id))!;
}
export async function updateUserProfile(id: string, patch: { name?: string; email?: string; passwordHash?: string }) {
  const cols: Record<string, string> = { name: "name", email: "email", passwordHash: '"passwordHash"' };
  const sets: string[] = []; const values: unknown[] = []; let i = 1;
  for (const [key, col] of Object.entries(cols)) {
    if (key in patch) { sets.push(`${col} = $${i++}`); values.push((patch as Record<string, unknown>)[key]); }
  }
  if (sets.length === 0) return findUserById(id);
  values.push(id);
  await query(`UPDATE "User" SET ${sets.join(", ")} WHERE id = $${i}`, values);
  return findUserById(id);
}
export async function listUsers() {
  return query<Omit<DbUser, "passwordHash">>(`SELECT id, name, email, role, "createdAt" FROM "User" ORDER BY "createdAt" DESC`);
}
export async function setUserRole(userId: string, role: "USER" | "ADMIN") {
  const rows = await query<Omit<DbUser, "passwordHash">>(
    `UPDATE "User" SET role = $1 WHERE id = $2 RETURNING id, name, email, role, "createdAt"`,
    [role, userId]
  );
  return rows[0];
}
export async function deleteUser(userId: string) {
  const rows = await query(`DELETE FROM "User" WHERE id = $1 RETURNING id`, [userId]);
  return rows.length > 0;
}

// -- Favorites ----------------------------------------------------------------
export async function listFavorites(userId: string) {
  return query<{ id: string; destinationSlug: string | null; attractionSlug: string | null }>(
    `SELECT f.id, d.slug as "destinationSlug", a.slug as "attractionSlug"
     FROM "Favorite" f
     LEFT JOIN "Destination" d ON d.id = f."destinationId"
     LEFT JOIN "Attraction" a ON a.id = f."attractionId"
     WHERE f."userId" = $1
     ORDER BY f."createdAt" DESC`,
    [userId]
  );
}

export async function toggleFavorite(
  userId: string,
  target: { destinationSlug?: string; attractionSlug?: string }
) {
  let destinationId: string | null = null;
  let attractionId: string | null = null;
  if (target.destinationSlug) destinationId = (await getDestRow(target.destinationSlug))?.id ?? null;
  if (target.attractionSlug) {
    const row = await queryOne<{ id: string }>(`SELECT id FROM "Attraction" WHERE slug = $1`, [target.attractionSlug]);
    attractionId = row?.id ?? null;
  }

  const existing = await queryOne<{ id: string }>(
    `SELECT id FROM "Favorite" WHERE "userId" = $1 AND "destinationId" IS NOT DISTINCT FROM $2 AND "attractionId" IS NOT DISTINCT FROM $3`,
    [userId, destinationId, attractionId]
  );

  if (existing) {
    await query(`DELETE FROM "Favorite" WHERE id = $1`, [existing.id]);
    return { saved: false };
  }
  const id = randomUUID();
  await query(
    `INSERT INTO "Favorite" (id, "userId", "destinationId", "attractionId") VALUES ($1,$2,$3,$4)`,
    [id, userId, destinationId, attractionId]
  );
  return { saved: true };
}

// -- Itineraries ----------------------------------------------------------------
export async function createItinerary(input: {
  userId: string;
  destinationSlug: string;
  title: string;
  days: number;
  budget: number;
  travelStyle: string;
  interests: string[];
  items: { day: number; time: string; label: string; attractionSlug?: string; estimatedCost: number }[];
}) {
  const dest = await getDestRow(input.destinationSlug);
  if (!dest) throw new Error("Destination not found");

  const id = randomUUID();
  await query(
    `INSERT INTO "Itinerary" (id, "userId", "destinationId", title, days, budget, "travelStyle", interests)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, input.userId, dest.id, input.title, input.days, input.budget, input.travelStyle, input.interests]
  );

  for (const [order, item] of input.items.entries()) {
    let attractionId: string | null = null;
    if (item.attractionSlug) {
      const row = await queryOne<{ id: string }>(
        `SELECT id FROM "Attraction" WHERE "destinationId" = $1 AND slug = $2`,
        [dest.id, item.attractionSlug]
      );
      attractionId = row?.id ?? null;
    }
    await query(
      `INSERT INTO "ItineraryItem" (id, "itineraryId", day, time, "attractionId", label, "estimatedCost", "order")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [randomUUID(), id, item.day, item.time, attractionId, item.label, item.estimatedCost, order]
    );
  }

  return { id, ...input };
}

export async function listItineraries(userId: string) {
  const itineraries = await query<{
    id: string; destinationSlug: string; title: string; days: number; budget: number; travelStyle: string; interests: string[]; createdAt: string;
  }>(
    `SELECT i.id, d.slug as "destinationSlug", i.title, i.days, i.budget, i."travelStyle", i.interests, i."createdAt"
     FROM "Itinerary" i JOIN "Destination" d ON d.id = i."destinationId"
     WHERE i."userId" = $1 ORDER BY i."createdAt" DESC`,
    [userId]
  );

  return Promise.all(
    itineraries.map(async (it) => {
      const items = await query<{ day: number; time: string; label: string; attractionSlug: string | null; estimatedCost: number }>(
        `SELECT ii.day, ii.time, ii.label, a.slug as "attractionSlug", ii."estimatedCost"
         FROM "ItineraryItem" ii LEFT JOIN "Attraction" a ON a.id = ii."attractionId"
         WHERE ii."itineraryId" = $1 ORDER BY ii."order"`,
        [it.id]
      );
      return { ...it, items };
    })
  );
}
