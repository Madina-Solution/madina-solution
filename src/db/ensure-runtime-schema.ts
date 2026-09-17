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
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "product_pricing_tiers" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
          "min_quantity" integer NOT NULL,
          "max_quantity" integer,
          "unit_price" numeric(12,2) NOT NULL,
          "label" varchar(120),
          "sort_order" integer NOT NULL DEFAULT 0,
          "is_active" boolean NOT NULL DEFAULT true,
          "created_at" timestamp NOT NULL DEFAULT now(),
          "updated_at" timestamp NOT NULL DEFAULT now(),
          CONSTRAINT "product_pricing_tiers_product_min_quantity_unique" UNIQUE ("product_id", "min_quantity")
        )
      `);
      await db.execute(sql`CREATE INDEX IF NOT EXISTS "product_pricing_tiers_product_id_idx" ON "product_pricing_tiers" ("product_id")`);
      await db.execute(sql`
        INSERT INTO "product_pricing_tiers" ("product_id", "min_quantity", "unit_price", "sort_order")
        SELECT p.id, (tier->>'minQuantity')::integer, (tier->>'unitPrice')::numeric(12,2),
          (row_number() OVER (PARTITION BY p.id ORDER BY (tier->>'minQuantity')::integer) - 1)::integer
        FROM "products" p
        CROSS JOIN LATERAL jsonb_array_elements(
          CASE WHEN jsonb_typeof(p.metadata #> '{pricing,wholesaleTiers}') = 'array'
          THEN p.metadata #> '{pricing,wholesaleTiers}' ELSE '[]'::jsonb END
        ) AS tier
        WHERE COALESCE(tier->>'minQuantity','') ~ '^[0-9]+$'
          AND COALESCE(tier->>'unitPrice','') ~ '^[0-9]+([.][0-9]+)?$'
        ON CONFLICT ("product_id", "min_quantity") DO NOTHING
      `);
    })().catch((error) => {
      ensured = null;
      throw error;
    });
  }
  return ensured;
}
