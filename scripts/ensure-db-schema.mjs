import dotenv from "dotenv";
import pg from "pg";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });
dotenv.config({ path: ".env.production.local" });

const { Client } = pg;

const requiredColumns = [
  { table: "services", column: "options", sql: 'ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "options" jsonb DEFAULT \'[]\'::jsonb' },
  { table: "services", column: "process_steps", sql: 'ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "process_steps" jsonb DEFAULT \'[]\'::jsonb' },
  { table: "services", column: "fulfillment_type", sql: 'ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "fulfillment_type" varchar(12) DEFAULT \'physical\' NOT NULL' },
  { table: "articles", column: "metadata", sql: `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb` },
  { table: "products", column: "metadata", sql: `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb` },
  { table: "products", column: "options", sql: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "options" jsonb DEFAULT \'[]\'::jsonb' },
  { table: "products", column: "fulfillment_type", sql: 'ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "fulfillment_type" varchar(12) DEFAULT \'physical\' NOT NULL' },
  { table: "order_items", column: "fulfillment_type", sql: 'ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "fulfillment_type" varchar(12) DEFAULT \'physical\' NOT NULL' },
  // i18n content layer (migrations 0008_i18n_content / 0009_catalog_i18n).
  // categories.translations is included here because no migration file ever
  // adds it, even though schema.ts and validate-db-schema.mjs both expect it.
  { table: "categories", column: "translations", sql: `ALTER TABLE "categories" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "products", column: "translations", sql: `ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "services", column: "translations", sql: `ALTER TABLE "services" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "portfolio", column: "translations", sql: `ALTER TABLE "portfolio" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "articles", column: "translations", sql: `ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "faqs", column: "translations", sql: `ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
  { table: "navigation_items", column: "translations", sql: `ALTER TABLE "navigation_items" ADD COLUMN IF NOT EXISTS "translations" jsonb DEFAULT '{}'::jsonb` },
];

// DDL that isn't a plain "ADD COLUMN IF NOT EXISTS" (enum type + new table for
// the admin-managed Mega Menu / Mobile Nav). Postgres has no
// `CREATE TYPE IF NOT EXISTS`, so the enum is guarded with a pg_type check.
const requiredStatements = [
  `DO $$
   BEGIN
     IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'navigation_group') THEN
       CREATE TYPE navigation_group AS ENUM ('services', 'products', 'explore');
     END IF;
   END $$;`,
  `CREATE TABLE IF NOT EXISTS "navigation_items" (
     "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     "group" navigation_group NOT NULL,
     "name" varchar(120) NOT NULL,
     "href" varchar(255) NOT NULL,
     "icon" varchar(40) NOT NULL DEFAULT 'sparkles',
     "description" varchar(160),
     "sort_order" integer NOT NULL DEFAULT 0,
     "is_active" boolean NOT NULL DEFAULT true,
     "created_at" timestamp NOT NULL DEFAULT now(),
     "updated_at" timestamp NOT NULL DEFAULT now()
   );`,
  `CREATE TABLE IF NOT EXISTS "product_pricing_tiers" (
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
   );`,
  `CREATE INDEX IF NOT EXISTS "product_pricing_tiers_product_id_idx" ON "product_pricing_tiers" USING btree ("product_id");`,
  `INSERT INTO "product_pricing_tiers" ("product_id", "min_quantity", "unit_price", "sort_order")
   SELECT p.id, (tier->>'minQuantity')::integer, (tier->>'unitPrice')::numeric(12,2), (row_number() OVER (PARTITION BY p.id ORDER BY (tier->>'minQuantity')::integer) - 1)::integer
   FROM "products" p
   CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN jsonb_typeof(p.metadata #> '{pricing,wholesaleTiers}') = 'array' THEN p.metadata #> '{pricing,wholesaleTiers}' ELSE '[]'::jsonb END) AS tier
   WHERE COALESCE(tier->>'minQuantity','') ~ '^[0-9]+$'
     AND COALESCE(tier->>'unitPrice','') ~ '^[0-9]+([.][0-9]+)?$'
   ON CONFLICT ("product_id", "min_quantity") DO NOTHING;`,];

// One-time seed matching the static QUICK_NAV_* baseline in src/lib/navigation.ts,
// so the new admin-managed table starts populated instead of empty and the
// public Mega Menu/Mobile Nav keep showing the same items after this migration.
const NAV_SEED = [
  { group: "services", name: "Logo Design", href: "/services/logo-design", icon: "logo-design", description: "Identitas visual awal brand Anda", sortOrder: 0 },
  { group: "services", name: "Brand Identity", href: "/services/brand-identity", icon: "brand-identity", description: "Panduan visual brand menyeluruh", sortOrder: 1 },
  { group: "services", name: "Social Media Design", href: "/services/social-media-design", icon: "social-media", description: "Konten visual media sosial", sortOrder: 2 },
  { group: "services", name: "Packaging Design", href: "/services/packaging-design", icon: "packaging", description: "Desain kemasan produk", sortOrder: 3 },
  { group: "products", name: "Banner & Spanduk", href: "/products?category=banner", icon: "banner", description: null, sortOrder: 0 },
  { group: "products", name: "Sticker", href: "/products?category=sticker", icon: "sticker", description: null, sortOrder: 1 },
  { group: "products", name: "Kartu Nama", href: "/products?category=kartu-nama", icon: "business-card", description: null, sortOrder: 2 },
  { group: "products", name: "Brosur", href: "/products?category=brosur", icon: "brochure", description: null, sortOrder: 3 },
  { group: "products", name: "Undangan", href: "/products?category=undangan", icon: "invitation", description: null, sortOrder: 4 },
  { group: "products", name: "Poster", href: "/products?category=poster", icon: "poster", description: null, sortOrder: 5 },
  { group: "products", name: "Kalender", href: "/products?category=kalender", icon: "calendar", description: null, sortOrder: 6 },
  { group: "products", name: "Signage", href: "/products?category=signage", icon: "signage", description: null, sortOrder: 7 },
  { group: "explore", name: "Portfolio", href: "/portfolio", icon: "portfolio", description: "Hasil karya & studi kasus kami", sortOrder: 0 },
  { group: "explore", name: "Artikel & Insight", href: "/blog", icon: "blog", description: "Tips seputar branding & percetakan", sortOrder: 1 },
  { group: "explore", name: "FAQ", href: "/faq", icon: "faq", description: "Pertanyaan yang sering diajukan", sortOrder: 2 },
  { group: "explore", name: "Tentang Kami", href: "/about", icon: "about", description: "Kenali Madina Solution", sortOrder: 3 },
  { group: "explore", name: "Kontak", href: "/contact", icon: "contact", description: "Hubungi tim kami", sortOrder: 4 },
];

// Derived from DATABASE_URL instead of `inet_server_host()`: on pooled/proxied
// connections (e.g. Neon's PgBouncer endpoint) that server-side function is not
// available and errors with 42883. Parsing the host client-side is safe (no
// credentials are logged) and works identically on direct and pooled connections.
function describeConnectionTarget(connectionString) {
  try {
    const url = new URL(connectionString);
    return { host: url.hostname, database: url.pathname.replace(/^\//, "") || null };
  } catch {
    return { host: "unknown", database: null };
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });

  try {
    await client.connect();
    const target = await client.query(`SELECT current_database() AS database, current_user AS user`);
    console.log("Schema sync target:", {
      ...target.rows[0],
      host: describeConnectionTarget(process.env.DATABASE_URL).host,
    });
    await client.query("BEGIN");

    for (const item of requiredColumns) {
      await client.query(item.sql);
    }

    for (const sql of requiredStatements) {
      await client.query(sql);
    }

    const { rows: navCountRows } = await client.query(`SELECT count(*)::int AS count FROM "navigation_items"`);
    if (navCountRows[0].count === 0) {
      for (const item of NAV_SEED) {
        await client.query(
          `INSERT INTO "navigation_items" ("group", "name", "href", "icon", "description", "sort_order") VALUES ($1, $2, $3, $4, $5, $6)`,
          [item.group, item.name, item.href, item.icon, item.description, item.sortOrder]
        );
      }
      console.log(`Seeded ${NAV_SEED.length} navigation_items rows (table was empty).`);
    }

    await client.query("COMMIT");

    const result = await client.query(
      `SELECT table_name, column_name, data_type
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND ((table_name = 'services' AND column_name IN ('options','process_steps','fulfillment_type','translations'))
           OR (table_name = 'products' AND column_name IN ('options','fulfillment_type','translations'))
           OR (table_name = 'order_items' AND column_name = 'fulfillment_type')
           OR (table_name = 'product_pricing_tiers' AND column_name IN ('product_id','min_quantity','max_quantity','unit_price','is_active'))
           OR (table_name IN ('categories','portfolio','articles','faqs','navigation_items') AND column_name = 'translations'))
       ORDER BY table_name, ordinal_position`
    );

    console.table(result.rows);
    console.log("Database schema synchronization completed successfully.");
  } catch (error) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error("Database schema synchronization failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
