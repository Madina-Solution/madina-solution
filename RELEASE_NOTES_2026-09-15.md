# Madina Solution — Release Notes 2026-09-15

## Scope
Product review workflow and full HTML/SEO blog content editing.

## Data / API
- `POST /api/reviews` requires an authenticated customer.
- Eligibility: the customer must have a `completed` order containing the target product.
- Reviews are verified at submission and queued for admin approval.
- Admin review PATCH can only change approval status.

## Product rating source of truth
Public product rating and count are calculated from approved `reviews` records. Legacy `products.rating` and `products.review_count` remain in the database for backward compatibility but are not used as the public source of truth.

## Blog CMS
The admin article editor now supports:
- visual rich-text editing and raw HTML/source mode
- headings, bold/italic/underline/strike
- ordered/unordered lists
- alignment
- links
- images by URL
- code blocks
- blockquotes and horizontal rules
- undo/redo
- fullscreen editor
- rich HTML paste

## Blog SEO
Per article:
- SEO title
- meta description
- focus keyword
- SEO keywords
- canonical URL
- noindex
- Article JSON-LD dateModified
- sitemap exclusion for noindex

## Security
Persisted/rendered article HTML is sanitized server-side using an explicit tag/attribute allowlist. Script-capable containers, event handlers, unsafe URLs, and arbitrary CSS are not allowed.

## Database
Migration: `drizzle/0006_blog_rich_seo_content/migration.sql`.

## Release 1.1.1 — blocker repair

This patch addresses the actual release-gate failures observed after Release 1.1.0: ESLint's `react-hooks/set-state-in-effect` finding in the admin article page and production prerender failure caused by missing article SEO columns in the database. `npm run build` now invokes `npm run db:sync` first, and `validate:release` performs the same sync before validating the database schema. The DB schema validator now explicitly checks all article SEO columns.


## Verification status — 1.1.1
- Static validation suite rerun successfully: navigation, integrity, media, social auth, access control, persistence, UI architecture, commerce/reviews, and SEO contracts all pass.
- JavaScript release scripts pass syntax checks.
- Full dependency-backed `lint`, `typecheck`, and `build` could not be rerun in this sandbox because `npm install` timed out; the uploaded local log is the authoritative evidence of the original blockers, and this patch directly addresses both blockers.
