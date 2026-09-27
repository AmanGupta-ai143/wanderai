-- WanderAI database schema, applied directly via psql (Prisma's migration
-- engine couldn't be used in this project's dev environment — see README).
-- Kept structurally identical to prisma/schema.prisma; if you'd rather use
-- Prisma Migrate in your own environment (where binaries.prisma.sh is
-- reachable), that schema file is the source of truth and this file can be
-- regenerated from it with `npx prisma migrate dev`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE role AS ENUM ('USER', 'ADMIN');

CREATE TABLE "User" (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  role          role NOT NULL DEFAULT 'USER',
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Destination" (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug         TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  tagline      TEXT NOT NULL,
  region       TEXT NOT NULL,
  country      TEXT NOT NULL,
  rating       DOUBLE PRECISION NOT NULL DEFAULT 0,
  "heroImage"  TEXT NOT NULL,
  "cardImage"  TEXT NOT NULL,
  tags         TEXT[] NOT NULL DEFAULT '{}',
  "bestTime"   TEXT NOT NULL,
  intro        TEXT NOT NULL,
  "didYouKnow" TEXT[] NOT NULL DEFAULT '{}',
  "quickFacts"       JSONB NOT NULL,
  center             JSONB NOT NULL,
  "languageGuide"    JSONB NOT NULL,
  weather            JSONB NOT NULL,
  "bestTimeCalendar" JSONB NOT NULL,
  shopping           JSONB NOT NULL,
  safety             JSONB NOT NULL,
  transport          JSONB NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Attraction" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  category        TEXT NOT NULL,
  rating          DOUBLE PRECISION NOT NULL,
  image           TEXT NOT NULL,
  duration        TEXT NOT NULL,
  ticket          TEXT NOT NULL,
  hours           TEXT NOT NULL,
  "bestTime"      TEXT NOT NULL,
  about           TEXT NOT NULL,
  architecture    TEXT NOT NULL,
  location        TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "HistoricalEvent" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  year            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL,
  "order"         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "Food" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  origin          TEXT NOT NULL,
  image           TEXT NOT NULL,
  description     TEXT NOT NULL,
  ingredients     TEXT[] NOT NULL DEFAULT '{}',
  taste           TEXT NOT NULL,
  significance    TEXT NOT NULL,
  "whereToTry"    TEXT NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "CultureItem" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        TEXT NOT NULL,
  image           TEXT NOT NULL,
  description     TEXT NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "Hotel" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  tier            TEXT NOT NULL,
  "pricePerNight" INTEGER NOT NULL,
  rating          DOUBLE PRECISION NOT NULL,
  image           TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "Restaurant" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  cuisine         TEXT NOT NULL,
  "priceLevel"    INTEGER NOT NULL,
  rating          DOUBLE PRECISION NOT NULL,
  image           TEXT NOT NULL,
  lat             DOUBLE PRECISION NOT NULL,
  lng             DOUBLE PRECISION NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "Festival" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  slug            TEXT NOT NULL,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  "dateLabel"     TEXT NOT NULL,
  image           TEXT NOT NULL,
  description     TEXT NOT NULL,
  UNIQUE ("destinationId", slug)
);

CREATE TABLE "Image" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  category        TEXT NOT NULL,
  caption         TEXT NOT NULL,
  tall            BOOLEAN NOT NULL DEFAULT false,
  "order"         INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE "Review" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "attractionId"  TEXT NOT NULL REFERENCES "Attraction"(id) ON DELETE CASCADE,
  rating          INTEGER NOT NULL,
  text            TEXT NOT NULL,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "Favorite" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "destinationId" TEXT REFERENCES "Destination"(id) ON DELETE CASCADE,
  "attractionId"  TEXT REFERENCES "Attraction"(id) ON DELETE CASCADE,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE ("userId", "destinationId", "attractionId")
);

CREATE TABLE "Itinerary" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"        TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  "destinationId" TEXT NOT NULL REFERENCES "Destination"(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  days            INTEGER NOT NULL,
  budget          INTEGER NOT NULL,
  "travelStyle"   TEXT NOT NULL,
  interests       TEXT[] NOT NULL DEFAULT '{}',
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE "ItineraryItem" (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "itineraryId"   TEXT NOT NULL REFERENCES "Itinerary"(id) ON DELETE CASCADE,
  day             INTEGER NOT NULL,
  time            TEXT NOT NULL,
  "attractionId"  TEXT REFERENCES "Attraction"(id),
  label           TEXT NOT NULL,
  "estimatedCost" INTEGER NOT NULL DEFAULT 0,
  "order"         INTEGER NOT NULL DEFAULT 0
);
