import { Pool } from "pg";

// Singleton pool, reused across hot-reloads in dev the same way the
// PrismaClient singleton pattern works.
const globalForDb = globalThis as unknown as { __wanderaiPool?: Pool };

export const pool =
  globalForDb.__wanderaiPool ??
  (globalForDb.__wanderaiPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  }));

export async function query<T = unknown>(text: string, params?: unknown[]) {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = unknown>(text: string, params?: unknown[]) {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
