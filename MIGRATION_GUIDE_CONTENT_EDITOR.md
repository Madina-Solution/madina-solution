# Database migration — Content Editor / SEO / PIM

Migration `0006_content_metadata` is additive and safe for existing content.

It adds:
- `articles.metadata` JSONB
- `products.metadata` JSONB

It does not delete, truncate, rewrite, reseed, or replace existing article/product rows.

Recommended release order:
```bash
npm install
npm run db:migrate
npm run validate:release
npm run typecheck
npm run lint
npm run build
```

`npm run db:sync` remains idempotent as a schema recovery/safety command, but `npm run db:migrate` is the preferred release migration command.
