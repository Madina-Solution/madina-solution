-- Additive content metadata for SEO, editorial controls and ecommerce PIM.
-- This migration never deletes, rewrites or resets existing rows.
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb;
