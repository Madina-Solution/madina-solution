# Product Detail + WYSIWYG Luxury Upgrade — 2026-09-17

## Rich text editor
- Reworked editor selection lifecycle so toolbar clicks preserve the current Range.
- Added reliable keyboard shortcuts (Ctrl/Cmd+B, I, U, K).
- Added sanitized rich paste handling.
- Added direct image upload into the media API using `content_image` purpose.
- Added source/visual mode and fullscreen with deterministic state.
- Added word count and consistent toolbar labels.
- Expanded safe inline style support while blocking URL/expression/javascript CSS.
- Shared editor remains reusable across articles, products, services, portfolio, FAQ, testimonials and site settings.

## Product detail
- Rebuilt product detail into a marketplace/B2B layout inspired by current Alibaba.com information architecture: rich product title, rating, MOQ, tier pricing, lead time, customization signals, structured specifications, buyer FAQ, reviews, shipping, seller/contact panel and request-for-quote CTA.
- Product gallery now uses the same 16:10 visual system as service/portfolio media while retaining desktop thumbnail rail, mobile swipe, video support, autoplay controls and lightbox.
- Product gallery includes configured product gallery media, content video and variant images.
- Wholesale tiers now also affect the live checkout estimate in ProductConfiguration.
- Marketing promo, warranty, return policy, origin, free-shipping flag and package dimensions are surfaced only when present in stored product metadata.
- Removed unnecessary framer-motion from product gallery, shared media carousel and related content cards to reduce client JavaScript and improve mobile performance.

## Safety/data integrity
- No product/article deletion or reseeding changes were introduced.
- `content_image` is now a first-class media purpose with the same RBAC media-upload gate as other content assets.
- Media contract validation was modernized so it no longer requires a specific animation library implementation.

## Validation in workspace
- Navigation contract: PASS
- Integrity scan: PASS
- Media contract: PASS
- UI/architecture contract: 10/10 PASS
- Commerce/media contract: 12/12 PASS
- TypeScript transpile/parse of modified files: PASS
- Full typecheck/build: must be rerun in the project environment after a complete `npm install`.
