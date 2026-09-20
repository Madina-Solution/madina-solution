# Admin Dashboard Redesign + Dark Mode — 2026-09-20

## What this adds
1. **Header & sidebar redesign** — `admin-shell.tsx` rebuilt to match the
   provided reference screenshot: gradient logo lockup with site name +
   tagline, a header search bar, notification bell, user avatar dropdown,
   and a refined sidebar (colored active-item pill with a left accent bar,
   collapsible rail, unread-message dot on "Pesan").
2. **Dark / light mode** — new admin-only theme system
   (`src/lib/theme/theme-provider.tsx`), toggled from the header. The `.dark`
   class is scoped to a wrapper around the admin shell only (not
   `<html>`/`<body>`), so a night-mode preference set in the back office can
   never leak into the public storefront, which has no dark styling of its
   own. Persisted to `localStorage` (falls back to OS preference on first
   visit). Applied to: the shell, the dashboard page + both charts, every
   shared UI primitive (button, card, badge, input, select, toast,
   confirm-dialog, drawer, skeleton, media-uploader, the WYSIWYG editor,
   options-editor), and — via a scripted pass over ~835 recurring
   light/dark color pairs — every other admin list/detail page (orders,
   products, customers, categories, coupons, services, articles, etc).
3. **Header quick-jump search (⌘K)** — `admin-search.tsx`. Opens with
   Cmd/Ctrl+K or the search bar, filters admin nav pages, arrow-key
   navigation, respects the signed-in role's page permissions.
4. **Notification bell** — `notification-bell.tsx`, wired to the existing
   `/api/notifications` (list + unread count), `PATCH .../read`, and
   `POST .../read-all` endpoints. Polls every 45s.
5. **Dashboard content** — extended, not replaced: kept the existing
   "Produk Terlaris" / "Aktivitas Terbaru" / "Pesanan Terbaru" sections and
   added the reference design's greeting banner + personalized "Selamat
   Datang Kembali, {name}" eyebrow, and gave the revenue chart a real
   7 / 30 / 90-day range dropdown (`revenue-panel.tsx`) — the server now
   fetches 90 days of daily revenue once; the dropdown slices it
   client-side, no extra requests.
6. **Confirm dialogs / toasts / WYSIWYG / media uploader** — these already
   existed and were already wired into articles, products, services,
   portfolio, testimonials, FAQs and settings (`components/admin/wysiwyg-editor.tsx`,
   `components/ui/media-uploader.tsx`, `confirm-dialog.tsx`, `toast.tsx`).
   Nothing here was rebuilt; all of it was made dark-mode aware, and admin
   pages now get their own toast portal nested inside the dark-mode scope
   (root `ToastProvider` still serves the public storefront untouched).

## Known scope limit (please read)
The ~835-substitution dark-mode pass was pattern-based (recurring
`bg-white` / `text-dark-500` / `border-dark-100` / colored-badge pairs →
matching `dark:` classes), applied across every admin page and verified with
`tsc --noEmit` + `eslint` (both clean) — but it was **not a manual visual
review of all 24 pages**. The shell, dashboard, and every shared component
were hand-reviewed; a handful of one-off / unusually-structured spots on the
less-common admin pages could still want a small dark-mode touch-up. If you
spot one, tell me which page and I'll fix it directly.

## Bugs fixed along the way (pre-existing, unrelated to this request)
- `payment-methods/page.tsx`: `EMPTY_FORM`'s inferred type narrowed `type`
  to `"bank_transfer"` only, so both the type `<select>` and `startEdit`
  failed `tsc --noEmit`. Fixed by giving the form state an explicit
  `PaymentMethodForm` type.
- `payment-methods/page.tsx` and `shipping-methods/page.tsx`: their
  fetch-on-mount effect called the async function directly
  (`void fetchData()`), which trips
  `react-hooks/set-state-in-effect` — every other admin page already
  avoids this by wrapping it in an inline async IIFE (see `categories/page.tsx`);
  both files now match that convention.
- `shipping-methods/page.tsx`: two unescaped `"` characters in JSX text
  (`react/no-unescaped-entities`) — switched to typographic quotes.

## Verified
- `npx tsc --noEmit` — 0 errors (project-wide).
- `npx eslint .` — 0 errors, 0 warnings (project-wide).
- `npx next build` — reached Turbopack's bundling stage successfully and
  failed only at the very last step, fetching the `Inter` font from
  `fonts.googleapis.com`, because this sandbox has no general internet
  access. That's an environment restriction here, not a code issue — the
  import was already in `src/app/layout.tsx` before this change, and a
  normal machine/CI with internet access will complete the build.

## Files touched
- `src/app/(admin)/admin/admin-shell.tsx` — rebuilt
- `src/app/(admin)/admin/layout.tsx` — theme/admin-toast wiring, passes
  `siteTagline`/`siteWhatsapp`/`unreadMessages` to the shell
- `src/app/(admin)/admin/page.tsx` — dashboard rebuilt (data-fetching logic
  kept, 30→90-day revenue query, layout/styling updated)
- `src/app/(admin)/admin/nav-config.ts`, `admin-search.tsx`,
  `notification-bell.tsx`, `revenue-panel.tsx` — new
- `src/app/(admin)/admin/revenue-chart.tsx`, `pipeline-chart.tsx` —
  theme-aware recharts colors
- `src/lib/theme/theme-provider.tsx`, `src/lib/use-click-outside.ts`,
  `src/components/ui/theme-toggle.tsx` — new
- `src/components/ui/{button,card,badge,input,select,skeleton,separator,
  toast,confirm-dialog,drawer,media-uploader,media-placeholder,
  media-carousel}.tsx`, `src/components/admin/{wysiwyg-editor,options-editor}.tsx`
  — dark-mode classes added
- `src/app/globals.css` — Tailwind v4 `@custom-variant dark`, `dark-950`
  token, dark overrides for the WYSIWYG editor surface
- `src/app/(admin)/admin/payment-methods/page.tsx` — type fix + lint fix
  (see "Bugs fixed" above), plus dark-mode pass
- `src/app/(admin)/admin/shipping-methods/page.tsx` — lint fixes (see
  above), plus dark-mode pass
- The remaining ~20 admin pages under `src/app/(admin)/admin/**` — scripted
  dark-mode class pass only (see "Known scope limit")
