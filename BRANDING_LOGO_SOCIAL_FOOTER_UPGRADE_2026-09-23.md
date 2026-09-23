# Branding, App Icon, Contact & Footer Upgrade — 2026-09-23

- Canonical supplied logo: `/public/brand/madina-logo.png`.
- Replaced favicon, Apple touch icons, Next.js app icon and PWA icon set with the supplied transparent logo.
- `BrandMark` now falls back to the canonical local logo instead of a generated initial.
- WhatsApp and Email remain the only active public contact channels; both use device-native actionable URLs and 44px touch targets.
- Footer/newsletter/buttons are centered below desktop breakpoints and remain left-aligned on large desktop.
- Optional social settings (Instagram/Facebook/TikTok/YouTube/LinkedIn) were added to the admin configuration, but empty links are not rendered.
- Next image qualities support 75 and 78.
- One-time database note: existing `site_logo` / `site_icon` values may continue to override local fallbacks. To force the new canonical assets in an existing database, set `site_logo=/brand/madina-logo.png` and `site_icon=/icons/madina-512.png` through Admin Settings.
