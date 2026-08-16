import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __dbPool?: Pool;
  __db?: NodePgDatabase;
};

function createDb(): NodePgDatabase {
  if (globalForDb.__db) return globalForDb.__db;

  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const pool = new Pool({ connectionString: url });
  const instance = drizzle(pool);

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__dbPool = pool;
    globalForDb.__db = instance;
  }

  return instance;
}

// Use a Proxy so the db object can be imported without immediately
// requiring DATABASE_URL. The actual pool is created on first use.
export const db: NodePgDatabase = new Proxy({} as NodePgDatabase, {
  get(_target, prop, receiver) {
    const real = createDb();
    return Reflect.get(real, prop, receiver);
  },
});
