ALTER TABLE "articles"
  ADD COLUMN IF NOT EXISTS "seo_title" varchar(255),
  ADD COLUMN IF NOT EXISTS "seo_description" text,
  ADD COLUMN IF NOT EXISTS "seo_keywords" jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS "focus_keyword" varchar(120),
  ADD COLUMN IF NOT EXISTS "canonical_url" text,
  ADD COLUMN IF NOT EXISTS "no_index" boolean NOT NULL DEFAULT false;
