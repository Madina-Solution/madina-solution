# Fix Blog "Not Found" & Detail Page Polish — 2026-09-18

## Root cause: `ensureRuntimeSchema()` was missing `articles` and `navigation_items`

`src/db/ensure-runtime-schema.ts` is the self-healing helper that runs
automatically on every admin API request (per the project's established
pattern) to add newer JSON columns if they're not yet on the live database.
It already covered `categories`, `products`, `services`, `portfolio`, and
`faqs` `.translations` columns — but **not** `articles` or
`navigation_items`.

The public blog detail page (`blog/[slug]/page.tsx`) selects
`articles.translations` directly, and until `npm run db:sync` is run by
hand against the live Neon database, that column may not exist there yet.
Depending on whether the DB had already picked it up some other way, this
surfaces either as the article legitimately not matching (empty result →
the `notFound()` call fires, showing the "not found" screen) or as a
column-does-not-exist query error. Either way, the fix is the same:

- Added `articles.translations` and `navigation_items.translations` to
  `ensureRuntimeSchema()`, with the same backfill pattern used for the other
  five tables (`translations.id` populated from the existing plain columns
  when empty).
- Called `ensureRuntimeSchema()` at the top of `blog/page.tsx`,
  `blog/[slug]/page.tsx` (`generateMetadata` and the page component) — these
  are public routes, so they can no longer depend on an admin having hit the
  admin API first, or on `db:sync` having been run manually, before the
  columns exist. The call is cheap after the first hit (the helper memoizes
  its promise on the module instance).

**If the "not found" you're seeing is actually a specific article that was
saved but never toggled to "Publish"** in `/admin/articles` (new articles
default to draft), this fix won't change that — that's the intended
draft/publish workflow, not a bug. Worth a quick check in the admin list
(Draft vs Terbit badge) for the exact slug that's failing.

## Blog detail page polish (light/cream theme kept, consistent with
products/FAQ/portfolio)

- Replaced the 2 raw `<img>` tags (hero thumbnail, author avatar) with the
  shared `SiteImage` component (`next/image`-based) — this was flagged by
  `next/next/no-img-element` in the last lint run and is now resolved:
  lint warnings went from 4 → 2 (the 2 remaining are pre-existing and
  unrelated, in `product-gallery.tsx`).
- Fixed the hero image's `alt` text to use `localized.title` instead of the
  always-Indonesian `article.title`, so English-locale readers get a
  correctly localized `alt` attribute.
- Author avatar now gets a meaningful `alt` (the editorial author name)
  instead of an empty string.

## Verified

- `npx tsc --noEmit` — 0 errors.
- `npx eslint .` — 0 errors, 2 warnings (down from 4, both pre-existing and
  outside this fix's scope).

## Not changed (flagged for awareness, not acted on)

- `src/app/globals.css` has some superseded/dead `.rich-editor-content` and
  partial `.rich-article-content` rules left over from an earlier styling
  pass (search `"2026 editorial + luxury commerce layer"` — everything above
  that comment for those two selectors is mostly dead weight, later rules in
  the cascade win). The net visual result is already correct today, so this
  wasn't touched in this pass to avoid a visual regression I can't verify
  without a live browser preview. Worth a dedicated cleanup pass later.
