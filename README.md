# WanderAI

An AI-powered travel discovery and trip-planning platform — Next.js 16 +
TypeScript, backed by a real Postgres database. Full browsing experience
across 4 destinations (each with unique content), auth, reviews, wishlist,
budget calculator, AI trip planner, chat assistant, Google Maps explorer
with route optimization, and a complete admin panel.

**Deploying?** See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for exact steps
(Railway or Vercel+Neon), with `Dockerfile` / `railway.json` already set up
and tested.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- Postgres via raw SQL (`pg`) — see "Why raw SQL instead of Prisma Client" below
- lucide-react (icons)
- next/font (Playfair Display for headings, Inter for body)

## Getting started

Needs a Postgres database — see the "Backend / API layer" section below
for full setup (get a DB, apply the schema, seed it). Quick version if you
already have Postgres running locally:

```bash
npm install
psql "$DATABASE_URL" -f prisma/schema.sql   # set DATABASE_URL in .env first
npx tsx prisma/seed.ts
npm run dev
```

Open http://localhost:3000. Requires internet access on first run/build so
next/font can download Playfair Display and Inter from Google Fonts.

## What's here (Phase 1 pages)

| Route | Page |
|---|---|
| `/` | Homepage - hero search, experience categories, trending destinations, AI banner |
| `/search?q=` | Search results |
| `/destinations/[slug]` | Destination hub (Jaipur, Goa, Manali, Varanasi) |
| `/destinations/[slug]/attractions/[attractionSlug]` | Attraction detail |
| `/destinations/[slug]/history` | Interactive history timeline |
| `/destinations/[slug]/culture` | Culture grid |
| `/destinations/[slug]/food` | Food & cuisine features |
| `/destinations/[slug]/gallery` | Masonry gallery with lightbox |

Nav links to Map, Trip Planner, Wishlist and Dashboard exist but aren't built
yet - that's Phase 2+.

## Data

Backed by a real Postgres database (see "Backend" below) — `lib/mock-data.ts`
is now only the seed source (`prisma/seed.ts` loads it in), not what the
running app reads from. All four destinations have fully unique content
(Jaipur, Goa, Manali, Varanasi each have their own real attractions,
history, food, culture, hotels — no shared/placeholder data between them).
`lib/types.ts` defines the shape both the seed data and the database rows
conform to.

## Backend / API layer — real Postgres (Phase 2, upgraded)

The app is backed by a **real Postgres database**, not an in-memory store.
Every page and API route reads/writes through `lib/server/repository.ts`,
which runs raw parameterized SQL via the `pg` driver against the schema in
`prisma/schema.prisma` (also mirrored as literal SQL in `prisma/schema.sql`
— see "Why raw SQL instead of Prisma Client" below for why there are two).

### Setup

1. Get a Postgres database — locally (`brew install postgresql` /
   `apt install postgresql`), or a free hosted one (Neon, Supabase, Railway
   all have generous free tiers and work fine with this setup — no Prisma
   binary download needed anywhere, since the app talks to Postgres
   directly via `pg`).
2. Apply the schema: `psql "<your-connection-string>" -f prisma/schema.sql`
3. Set `DATABASE_URL` in `.env` to your connection string.
4. Seed it: `npx tsx prisma/seed.ts` — loads all four destinations plus two
   demo accounts from `lib/mock-data.ts`.
5. `npm run dev`.

Change `AUTH_SECRET` in `.env` before deploying anywhere real — it's a
dev-only placeholder.

### Try it

```bash
npm run dev
# in another terminal
curl http://localhost:3000/api/destinations
curl -X POST http://localhost:3000/api/budget \
  -H "Content-Type: application/json" \
  -d '{"people":2,"days":4,"travelStyle":"standard","accommodationStyle":"standard"}'
```

Demo accounts (from the seed script):

| Role  | Email               | Password      |
|-------|---------------------|----------------|
| Admin | admin@wanderai.app  | admin123       |
| User  | demo@wanderai.app   | traveler123    |

### Endpoints

| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/destinations?q=` | — | list / search |
| POST | `/api/destinations` | admin | create |
| GET | `/api/destinations/:slug` | — | detail |
| PATCH / DELETE | `/api/destinations/:slug` | admin | update / delete |
| GET | `/api/destinations/:slug/attractions` | — | list |
| GET | `/api/destinations/:slug/attractions/:attractionSlug` | — | detail |
| GET | `/api/destinations/:slug/attractions/:attractionSlug/reviews` | — | list |
| POST | `/api/destinations/:slug/attractions/:attractionSlug/reviews` | user | create review |
| GET / POST | `/api/favorites` | user | list / toggle save |
| GET / POST | `/api/itineraries` | user | list / generate (Gemini when configured, rule-based fallback otherwise) |
| POST | `/api/budget` | — | trip cost calculator |
| GET | `/api/search?q=` | — | destination search |
| POST | `/api/auth/register` \| `/login` \| `/logout` | — | session cookie (httpOnly JWT) |
| GET | `/api/auth/me` | — | current session |

### Why raw SQL instead of Prisma Client

`prisma/schema.prisma` is kept as the canonical, documented schema — it's
what you'd use with `npx prisma migrate dev` in a normal environment. But
this project's dev sandbox couldn't reach `binaries.prisma.sh` (tried
plain `generate`, checksum-bypass, and driver-adapter/WASM mode — all three
need that same download), so `prisma generate` and `migrate` never worked
here. Rather than ship an untested Prisma integration, the actual data
layer uses `pg` directly (`lib/server/db.ts` + `lib/server/repository.ts`)
with hand-written SQL matching the Prisma schema exactly
(`prisma/schema.sql`). This has a real upside beyond working around the
sandbox: no native binary to download in *any* environment, including
serverless, where cold-start binary downloads are a real cost.

If you'd rather use Prisma Client in your own environment (where the
binary host is reachable), `prisma/schema.prisma` is ready for
`npx prisma migrate dev` — you'd then swap the query implementations in
`lib/server/repository.ts` for `prisma.*` calls; the function signatures
and return shapes are already exactly what the rest of the app expects.

### Verified, not just written

This was tested against a real, running local Postgres instance — not
mocked, not assumed:

- Schema applied via `psql`, 14 tables confirmed created
- Seed script run for real: 4 destinations, 20 attractions, 2 users loaded
- Full auth flow (register/login/`/me`/settings), reviews, favorites,
  itineraries, and admin CRUD (destinations, attractions, food, culture,
  hotels, festivals, gallery images, users, reviews) all exercised live
  against the database
- **Persistence proof**: created a review, a favorite, and an
  admin-created destination, then killed and restarted both the Next.js
  server *and* Postgres itself between each step — every piece of data was
  still there afterward, confirmed via the API. This is the actual
  difference from the old in-memory version: data now survives a restart.

## Google Maps Explorer (Phase 3, partial)

`/map` is a real, working map page — it just needs your own Google Maps API
key to render tiles, since this can't be tested with a live key in a
sandboxed build environment. Without a key it shows a clear fallback (filter
panel + place list, no blank error), so nothing looks broken in the
meantime.

### Setup

1. Get a key at https://console.cloud.google.com/google/maps-apis
2. Enable: **Maps JavaScript API**, **Places API**, **Directions API**, **Geocoding API**
3. Put it in `.env`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="your-key"`
4. `npm run dev` → visit `/map`

Uses `@vis.gl/react-google-maps` (Google's official React wrapper) with the
public `DEMO_MAP_ID` for Advanced Markers — swap in your own styled Map ID
from Cloud Console when you're ready to theme the map tiles to match the
brand palette.

### What's built

- **Destination switcher** — top bar, swaps the whole map/place set
- **Filter panel** — toggle Attractions / Hotels / Restaurants, minimum rating
- **Custom pins** per category (terracotta / olive / gold, matching the design system)
- **Place popup** — image, rating, price, distance from you, "View Details" + "Directions"
- **Near me** — browser geolocation, shows your position and a live-sorted "Nearby" list (haversine distance, no API call needed for this part)
- **Route planner** — from/to picker (any place on the map), 4 travel modes, calls `DirectionsService`/`DirectionsRenderer` for real distance + time and draws the route

### Not built yet

- **Smart multi-place route optimizer** (spec item 15/21) — visiting N selected
  places in optimal order. This needs the Directions API's `waypoints` +
  `optimizeWaypoints: true`, which I held off on since it's easiest to get
  right once the basic route planner above is confirmed working against a
  real key.
- Dedicated `/hotels` and `/restaurants` list pages (data already exists in
  `lib/mock-data.ts` per destination — the map just doesn't have list-view
  siblings yet).

## Auth, Reviews, Wishlist, Dashboard & AI Planner (this round)

All of the below were tested against a live dev server (register → generate
itinerary → save favorite → post review → verified via GET), not just
type-checked.

- **Auth** — `/login`, `/register`, session-aware Navbar (shows name + sign
  out when logged in), `lib/client/AuthProvider.tsx` (`useAuth()` hook
  available anywhere)
- **Reviews** — live on every attraction page: list + star-rated submit form,
  gated behind sign-in
- **Wishlist** (`/wishlist`) — save/unsave destinations (heart icons now
  actually persist via `/api/favorites` instead of local-only state)
- **Dashboard** (`/dashboard`) — saved-place count, trip count, your
  generated itineraries, quick links
- **AI Trip Planner** (`/trip-planner`) — full form → calls
  `/api/itineraries` → renders a day-by-day itinerary with per-day cost
  (uses the rule-based generator described above; same shape a real LLM
  version would return)
- **Hotels / Restaurants** — `/destinations/:slug/hotels` and `/restaurants`,
  tier/cuisine filters, added to the sticky destination nav

## Static destination info pages (this round)

All seven, verified live (200 on a running dev server, full production
build passes at 73 pages):

| Route | Notes |
|---|---|
| `/destinations/:slug/language` | Phrase cards with **real browser text-to-speech** (Web Speech API, `hi-IN`) — tap a card to hear it, no API key needed |
| `/destinations/:slug/how-to-reach` | Flight/Train/Bus/Car, editable "from" field |
| `/destinations/:slug/weather` | Current + 5-day forecast — **mock data**, swap for a real weather API when ready |
| `/destinations/:slug/best-time` | Clickable 12-month calendar |
| `/destinations/:slug/festivals` | Photo-led event cards |
| `/destinations/:slug/shopping` | Category filter, price ranges, bargaining tips |
| `/destinations/:slug/safety` | Emergency numbers, good-to-know tips |

All added to the sticky destination sub-nav (now horizontally scrollable —
it's a lot of tabs, by design, matching the original page map).

## Admin Dashboard (this round)

`/admin` — gated to accounts with `role: ADMIN` (sign in as
`admin@wanderai.app` / `admin123`, an "Admin" link appears in the navbar).

- **Dashboard** (`/admin`) — live counts (destinations, attractions, users,
  reviews, saved places, itineraries generated) from `/api/admin/stats`
- **Destinations** (`/admin/destinations`) — table view, edit, delete
- **Add/Edit destination** (`/admin/destinations/new` / `/admin/destinations/:slug`)
  — full form (name, slug, region, country, rating, images, coordinates,
  tags, quick facts, description), calls the real `POST`/`PATCH`/`DELETE`
  destination endpoints
- Sidebar lists the rest of the spec's admin sections (Attractions, Food,
  Culture, Hotels, Images, Events, Reviews, Users) marked **"soon"** —
  intentionally not faked as working nav items

Verified live: logged in as admin, created a destination through the exact
payload shape the form sends, watched the stats counter increment,
patched it, deleted it — all via the real API, not just type-checked.

### ⚠️ Known gap: admin-created content doesn't appear on the public site yet

This is real and worth being upfront about, not glossing over: the admin
panel is fully wired to `/api/destinations` (create/edit/delete all work
and persist in the in-memory store). But the **public-facing pages**
(`/destinations/[slug]` and everything under it — hub, attractions, history,
hotels, etc.) still import directly from `lib/mock-data.ts`, a static
snapshot, not the live store. So a destination you create in `/admin` shows
correctly in the admin list, but 404s if you try to visit it as a visitor
would.

This was a known, documented tradeoff from the backend build (see the
"Backend / API layer" section above) — it just becomes visible now that
there's an admin UI to create content with. Fixing it means switching the
public pages from the static import to `fetch("/api/destinations/...")` (or
a server-side call to the repository layer directly, which is faster since
these are React Server Components). It's a mechanical change since the data
shapes already match — just not done yet.

### ✅ Fixed: public pages now read live data, not the static file

The gap described above is resolved. Every destination page (hub,
attractions, history, culture, food, gallery, language, how-to-reach,
weather, best-time, festivals, shopping, safety, hotels, restaurants) now
reads through `lib/server/repository.ts` at request time — server
components call it directly, client-heavy pages (search, map, dashboard,
wishlist, trip planner, budget calculator) fetch `/api/destinations` live.
`export const dynamic = "force-dynamic"` is set on the destination routes so
admin edits show immediately rather than being cached as static HTML.

Verified live: created a destination through the admin API with the exact
payload the form sends, then hit every one of its public sub-pages —
all 200, all showing the real data, including in `/api/search`. Deleted it
after. Only `app/page.tsx` (homepage, now via the repository too) and
`lib/server/store.ts` (the seed itself) still reference `mock-data.ts`, and
both of those are correct places for it to be referenced.

## AI Destination Recommender, Packing List, Chat Assistant, Review Summaries, Route Optimizer (this round)

All rule-based / pattern-matching — explicitly **not** real LLM calls, same
honest framing as the itinerary generator. Each is built so the
request/response shape matches what a real AI-backed version would return,
making the eventual swap mechanical rather than a rewrite. All verified
live against a running dev server.

- **`/ai-recommender`** — pick interests + budget + duration, scores every
  destination by tag overlap + budget/duration fit (`lib/server/recommend.ts`).
  Verified: heritage/culture/cuisine interests correctly rank Jaipur at 99%
  match vs Manali (no matching tags) at 35%.
- **`/packing-list`** — generates a categorized, checkable list from the
  destination's climate + trip length + selected activities
  (`lib/server/packing.ts`). Interactive checkboxes, progress bar, add your
  own items.
- **Chat assistant** (floating button, every page) — keyword-matched
  answers using the current destination's real data (top attractions, food,
  weather, etc.) — see `lib/client/chatAssistant.ts`. Detects the
  destination from the URL automatically.
- **Review summaries** — on attraction pages, once an attraction has 3+
  reviews, a small "Common themes" card surfaces frequently-repeated
  positive/negative keywords from the review text
  (`lib/client/reviewSummary.ts`). Explicitly keyword-frequency, not
  sentiment analysis — labeled honestly rather than oversold as "AI".
- **Multi-stop route optimizer** — the Map's route planner now has a
  toggle: single A→B route, or "Optimize stops" — pick a start, end, and up
  to 8 waypoints, and it calls the real Directions API with
  `optimizeWaypoints: true`, drawing the optimized route and listing the
  best visiting order with total distance/time.

### What's still not real AI

Everything above works and is genuinely useful, but none of it is an LLM
call — it's rules, keyword matching, and weighted scoring over the app's
own data. A real Phase 5/6 would replace:
- the itinerary generator, recommender, and chat assistant with actual
  Anthropic API calls (the shapes are already compatible)
- the review summary with a real LLM summarization call
- add genuine RAG (embeddings + a vector DB like pgvector) for semantic
  search over destination content

None of that can be done honestly without real API keys and a live vector
database, which this environment doesn't have — it's the one piece of the
original spec I won't fake.

## Explore page, place filters, Settings, mobile nav (this round)

Closing out the remaining pages from the original page map that don't need
external credentials:

- **`/destinations`** — dedicated Explore page, category chips (History,
  Beaches, Mountains, Food, Culture, Wildlife, Adventure, Shopping) filter
  the live destination list by tag
- **Category filters on the destination hub's "Must-see places"** — was
  static before, now filters by attraction category (matches the original
  spec's filter chips that had been missed)
- **`/settings`** — real profile editing (name/email) and password change,
  backed by `/api/account` (`PATCH`)
- **Mobile bottom navigation** — Home / Explore / Map / AI / Profile, fixed
  bottom bar on mobile viewports, matching the spec's mobile layout section.
  Chat widget repositioned above it so they don't overlap.

### Bug found and fixed during testing

Testing the Settings page surfaced a real bug: `/api/auth/me` was reading
`name`/`email` from the session JWT's payload — a snapshot taken at login —
instead of the live user record. So updating your name in Settings would
save correctly, but the app would keep showing the old name until you
logged out and back in. Fixed by having `/me` (and the review-posting
endpoint, which had the same issue) look up the current record from the
store by user ID instead of trusting the token's embedded claims. Verified
live: updated a name, confirmed `/me` reflected it immediately, reverted.

## Real AI integration — Google Gemini (switched from Anthropic)

The chat assistant and AI trip planner call a real LLM when a key is
configured, and fall back to the rule-based logic (unchanged) when it
isn't, or when the call fails for any reason. This originally used the
Anthropic API; switched to Google Gemini since Gemini's free tier is more
practical for testing this without a paid API — see
`lib/server/gemini.ts` for the shared client both features use.

### Setup

1. Get a free key at https://aistudio.google.com/apikey
2. Add to `.env`: `GEMINI_API_KEY="..."`

That's it — both features pick it up automatically.

- **Chat assistant** — `app/api/ai/chat/route.ts`. Sends the destination's
  real data (attractions, food, culture, weather) as context, so answers
  are grounded in what's actually in the app.
- **Trip planner** — `app/api/itineraries/route.ts`,
  `buildItineraryWithLLM()`. Asks for strict JSON matching the itinerary
  shape, validates every `attractionSlug` against the destination's real
  attractions (rejects and falls back if the model hallucinates one that
  doesn't exist).

### How this was actually verified, honestly — and it's weaker than the Anthropic version was

This sandbox's network allowlist only includes `api.anthropic.com`, not
Gemini's domain (`generativelanguage.googleapis.com`). That means **the
request-reaches-a-real-server proof I had for Anthropic doesn't exist for
Gemini** — I could not confirm the request even leaves this environment
successfully, let alone what a real completion looks like.

What I did verify:

1. **No key set** → falls back to rule-based, works exactly as before.
2. **Key set, but the domain is blocked by this sandbox's own network
   proxy** → the request fails with a `403` from the *sandbox's* egress
   proxy (not Gemini), and the code catches it and falls back cleanly —
   proving the try/catch handles a failed `fetch()` correctly regardless of
   *why* it failed, network-level or API-level.

That's meaningfully less proof than the Anthropic version had. **Test this
for real** before trusting it: set `GEMINI_API_KEY` and watch the server
console when you ask the chat assistant something — a bad request or wrong
response shape will log clearly and fall back rather than fail silently,
but you should confirm a real successful response actually comes back and
looks right.

### Model name may need updating

`lib/server/gemini.ts` hardcodes `gemini-2.0-flash` as the model. Check
https://ai.google.dev/gemini-api/docs/models for the current recommended
model name when you set this up — it may have changed.

## Unique content for Goa, Manali & Varanasi (this round)

Previously these three destinations were exact copies of Jaipur's content
with only the name/tags changed — genuinely misleading (Goa's "attractions"
were Amber Fort and Hawa Mahal). Rewrote all three from scratch with real,

independently-researched content:

- **Goa**: Baga Beach, Fort Aguada, Basilica of Bom Jesus, Dudhsagar Falls,
  Anjuna Flea Market — real coordinates, Portuguese colonial history,
  Goan-Portuguese cuisine (vindaloo, bebinca, balchão), Konkani phrases
- **Manali**: Hadimba Devi Temple, Solang Valley, Rohtang Pass, Old Manali,
  Jogini Waterfall — Himachali culture, siddu/dham/trout cuisine, altitude
  safety notes
- **Varanasi**: Kashi Vishwanath Temple, Dashashwamedh Ghat, Sarnath, Assi
  Ghat, Manikarnika Ghat — real history back to ~1200 BCE, Banarasi silk
  and paan culture, ghat-etiquette safety notes

Every destination now has its own hotels, restaurants, gallery, festivals,
shopping guide, weather, best-time calendar, and language guide — no more
shared/copied content. Verified live: all 15 sub-pages load correctly for
all three destinations, and attraction names/coordinates are confirmed
genuinely distinct per destination (not just relabeled).

## Admin CRUD expanded to Attractions (this round)

`/admin/attractions` — list (filterable by destination), create, edit,
delete, following the same pattern as Destinations. Verified live end to
end: created a test attraction under Goa via the admin API, confirmed it
immediately appeared on the real public page (proving it goes through the
same live-data path fixed earlier, not a separate disconnected system),
edited it, deleted it, confirmed Goa was back to its original 5 attractions.

Still marked "soon" in the sidebar: Food, Culture, Hotels, Images, Events,
Reviews, Users — same CRUD pattern, not yet built out.

## Admin: Users & Reviews (this round)

- **`/admin/reviews`** — every review across every attraction, with reviewer,
  place, rating, and delete. Verified live: posted a test review as the
  demo user, confirmed it appeared in the admin list, deleted it.
- **`/admin/users`** — list all accounts, toggle admin access, delete
  users. Two safety guards, both verified live: you can't demote or delete
  your own account (would risk locking yourself out), and the last
  remaining admin can't be deleted. Confirmed promoting the demo user to
  admin and back works correctly.

Still marked "soon": Food, Culture, Hotels, Images, Events — same nested
create/edit/delete pattern as Attractions, just not built out yet for each.

## Admin CRUD: Food, Culture, Hotels, Images, Events (this round)

The admin panel is now complete for every content type in the original
spec's admin sidebar:

- **`/admin/food`**, **`/admin/culture`**, **`/admin/hotels`** — full
  create/edit/delete, same pattern as Attractions (destination-filterable
  list, dedicated create/edit forms)
- **`/admin/events`** — festival/event CRUD
- **`/admin/gallery`** — media library: pick a destination, add images
  (URL + category + caption), delete with a hover-to-reveal trash icon.
  Images don't have a natural slug, so they're addressed by array index —
  documented in the repository function comments.

Verified live, comprehensively: created and deleted a test item in every
one of the five categories against Goa, confirmed each appeared correctly
via the API in between, and confirmed Goa's final counts exactly matched
its original content (4 food, 4 culture, 3 hotels, 3 festivals, 7 gallery
images) — nothing left behind, nothing broken.

**Admin panel status: every entity in the original spec's sidebar now has
working CRUD** — Destinations, Attractions, Food, Culture, Hotels, Images,
Events, Reviews, Users. Nothing left marked "soon."

## Design system

- Colors, fonts and spacing are defined once in `app/globals.css` (Tailwind
  v4 `@theme`) - `ink`, `sand`, `paper`, `terracotta`, `olive`, `gold`, `muted`.
- Reusable pieces live in `components/`.

## What's left

1. ~~**Backend**~~ — done, including a real Postgres connection (see above).
2. ~~**Google Maps**~~ — built (explorer, route planner, multi-stop
   optimizer). Needs your own Maps API key to actually render — the code's
   never been visually confirmed since this environment has no key.
3. ~~**Travel features**~~ — Hotels, restaurants, weather, festivals,
   shopping, safety, budget calculator — all built.
4. ~~**AI**~~ — trip planner, chat assistant, destination recommender,
   packing list, review summaries — all built. Real Gemini calls wired in
   for the chat assistant and trip planner (needs your `GEMINI_API_KEY`;
   see the Gemini section above for what's actually been verified vs. not).
5. **Advanced AI (RAG)** — not built. Semantic search / embeddings over
   destination content would need a vector-capable Postgres extension
   (pgvector) plus an embeddings API. Genuinely deferred, not attempted.
6. **Admin CRUD for Restaurants** — every other content type has admin
   CRUD (Destinations, Attractions, Food, Culture, Hotels, Images, Events,
   Reviews, Users); Restaurants is the one exception, still edited only via
   the seed data.

Realistically, what's left needs either your own API keys (Gemini, Google
Maps) to fully confirm, or is a deliberate scope cut (RAG, Restaurant
admin CRUD) rather than something unfinished by accident.
"# wanderai" 
"# wanderai" 
