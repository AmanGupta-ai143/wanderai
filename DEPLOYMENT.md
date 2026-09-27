# Deploying WanderAI

This covers Railway (recommended — app + Postgres in one place, matches
this project's architecture directly) and a Vercel + Neon alternative.
Everything below is exact commands, not "figure it out from the docs" —
follow in order.

Every config file this needs (`Dockerfile`, `.dockerignore`, `railway.json`)
is already in the repo. The Docker build was tested end-to-end in this
project's dev environment against a real Postgres instance — it's not
untested guesswork.

## Option A — Railway (recommended)

### 1. Push this project to GitHub

Railway deploys from a GitHub repo. If you haven't already:

```bash
cd wanderai
git init
git add .
git commit -m "WanderAI"
```

Create a new repo on GitHub, then:

```bash
git remote add origin https://github.com/<you>/wanderai.git
git branch -M main
git push -u origin main
```

### 2. Create the Railway project

1. Go to [railway.app](https://railway.app), sign in, **New Project**
2. **Deploy from GitHub repo** → pick the repo you just pushed
3. Railway detects the `Dockerfile` automatically — no build config needed

### 3. Add Postgres

In the same project: **+ New** → **Database** → **Add PostgreSQL**.
Railway provisions it and exposes a `DATABASE_URL` variable automatically.

### 4. Wire up environment variables

On your app service (not the Postgres one) → **Variables** tab, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Click "Add Reference" → select the Postgres service's `DATABASE_URL` (don't retype it — reference it, so it stays in sync) |
| `AUTH_SECRET` | Generate one: `openssl rand -base64 32` — paste the output |
| `GEMINI_API_KEY` | Your key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (optional — app works without it, falls back to rule-based) |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your key from Google Cloud Console (optional — Map page shows a fallback without it) |

Railway redeploys automatically when you save variables.

### 5. Apply the schema and seed data (one-time)

Get your Postgres connection string: Postgres service → **Connect** tab →
copy the "Postgres Connection URL".

From your local machine (with `psql` installed):

```bash
psql "<paste the connection URL here>" -f prisma/schema.sql
```

Then seed it — from your local project folder:

```bash
DATABASE_URL="<same connection URL>" npx tsx prisma/seed.ts
```

You should see `Seeded Jaipur.` / `Seeded Goa.` / etc. This creates the
demo accounts too (`admin@wanderai.app` / `admin123`,
`demo@wanderai.app` / `traveler123` — **change these after your first
login in production**).

### 6. Get your URL

Railway app service → **Settings** → **Networking** → **Generate Domain**.
That's your live URL.

### 7. Verify

```bash
curl https://<your-app>.up.railway.app/api/destinations
```

Should return real JSON with 4 destinations. Then open the URL in a
browser and click around.

---

## Option B — Vercel + Neon

Vercel is serverless, so it needs an external Postgres (its own connection
pooling model works fine with this app's connection pool).

1. **Database**: [neon.tech](https://neon.tech) → new project → copy the
   connection string (use the **pooled** connection string, not direct)
2. Apply schema + seed exactly as steps 5 above, using the Neon connection
   string
3. **Deploy**: push to GitHub, then [vercel.com](https://vercel.com) → New
   Project → import the repo. Vercel auto-detects Next.js (it'll ignore the
   Dockerfile and use its own Next.js build pipeline, which is fine)
4. **Environment variables**: Vercel project → Settings → Environment
   Variables → add the same four (`DATABASE_URL`, `AUTH_SECRET`,
   `GEMINI_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) as in step 4 above
5. Deploy. Vercel gives you a `*.vercel.app` URL automatically.

---

## After deploying, either option

- **Change the demo account passwords** (or delete those two accounts and
  create your own admin via `/register` + manually promoting yourself —
  see `/admin/users` once you have any admin account, or update the role
  directly: `UPDATE "User" SET role = 'ADMIN' WHERE email = 'you@example.com';`)
- **Rotate `AUTH_SECRET`** if you ever used the placeholder value from
  `.env` in production by mistake — that would let anyone forge a session
- Google Maps and Gemini both work without keys (graceful fallbacks) — add
  them whenever you're ready, no redeploy-breaking required either way
