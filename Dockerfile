# Multi-stage build for a minimal production image.
# Works on Railway, Render, Fly.io, or any Docker-based host.

FROM node:20-slim AS base

# ---- deps ----
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- build ----
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# DATABASE_URL isn't needed at build time (every data-driven page is
# force-dynamic — see README), but Next.js still needs it defined to not
# error while evaluating server modules during the build.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV AUTH_SECRET="build-time-placeholder-not-used-at-runtime"
RUN npm run build

# ---- runtime ----
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Next.js standalone output — a minimal self-contained server, no
# node_modules copy needed beyond what's bundled in .next/standalone.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
