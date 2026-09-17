# MADINA SOLUTION — Menu + Editor + Blog Data Safety

## Fixed desktop Mega Menu
The previous desktop implementation rendered all three navigation groups in one panel regardless of the active trigger. This release changes the component API to `activeGroup`, so exactly one group is rendered at a time:
- Layanan: service discovery and service links.
- Produk: product catalog/category links and custom-product CTA.
- Eksplor: portfolio, blog, FAQ/company and consultation.

All three groups still read the same admin-managed navigation source.

## Legacy blog data
- Existing article content is loaded into the admin editor when editing.
- No article data is reset or deleted by the upgrade.
- `articles.metadata` is additive and defaults to `{}`.
- `scripts/ensure-db-schema.mjs` adds the column only when it does not exist.
- `src/db/ensure-runtime-schema.ts` prevents older deployments from crashing while the additive column is being introduced.

Run once before production deploy:
`npm run db:sync`

Then run:
`npm run validate:release`
`npm run typecheck`
`npm run lint`
`npm run build`

## Reusable WYSIWYG
`RichTextEditor` is available for long-form fields in products, services, portfolio, FAQs, testimonials, homepage hero and articles. The editor sanitizes HTML before persistence/rendering.

## Branding
PNG/SVG logos are displayed at their natural aspect ratio with no forced white square / rounded-button background in the public header, mobile menu and footer.

## Performance direction
Desktop and mobile navigation avoid heavy motion for menu opening. Images continue through `next/image` where supported. The release does not claim a specific Lighthouse score; measure the deployed build with Lighthouse/PageSpeed after deployment.
