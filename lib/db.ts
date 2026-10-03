import "server-only";
import { Pool } from "pg";

const globalForPostgres = globalThis as typeof globalThis & { gbHimalayanPool?: Pool };

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!globalForPostgres.gbHimalayanPool) {
    globalForPostgres.gbHimalayanPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 8,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
    });
  }
  return globalForPostgres.gbHimalayanPool;
}
