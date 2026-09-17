import { sql } from "drizzle-orm";
import { db } from "@/db";

let ensured: Promise<void> | null = null;

/**
 * Keeps older deployments compatible with additive JSON metadata columns.
 * Safe to call before reads/writes; IF NOT EXISTS never removes or changes
 * existing article data.
 */
export function ensureRuntimeSchema() {
  if (!ensured) {
    ensured = (async () => {
      await db.execute(sql`ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb`);
      await db.execute(sql`ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb`);
    })().catch((error) => {
      ensured = null;
      throw error;
    });
  }
  return ensured;
}
