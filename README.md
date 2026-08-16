# Madina Solution

**Creative Business Platform** — v1.0.0

Professional digital platform for graphic design, digital printing, branding, and advertising services.

## Architecture

```
Customer → Products → Configure → Cart → Checkout → Order
                                                      ↓
Payment → Webhook (idempotent) → Order Paid        Admin → Confirm
                                                      ↓
                                              Designer → Revision
                                                      ↓
                                              Customer → Approve
                                                      ↓
                                              Production → QC → Ready → Ship → Complete
                                                      ↓
                                              Notification + Audit Log (every step)
```

## Technology

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5.9 |
| Database | PostgreSQL (24 tables, 54 indexes) |
| ORM | Drizzle ORM |
| Auth | JWT + bcrypt + jose |
| Validation | Zod |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion |

## Features

### Commerce
- Product catalog with 12 products, 8 categories
- Dynamic product configuration with price modifiers
- URL-based search, filter, sort
- Shopping cart (localStorage + drawer)
- Guest + authenticated checkout
- Server-side price validation

### Order Lifecycle
- 10-state machine: pending → confirmed → design_review → design_approved → production → quality_control → ready → shipping → completed
- Sequential order numbers (MS-2026-000001)
- Strict transition rules (invalid transitions rejected)
- Complete timeline tracking

### Workflow
- Designer workspace with queue and revision management
- Production workspace with pipeline tracking
- Customer design approval (approve/request revision)
- Priority and deadline management
- Assignment system

### Payment
- Provider abstraction (MockProvider active, Midtrans/Xendit ready)
- Webhook idempotency (duplicate events ignored)
- Payment amount always from database
- Manual admin confirmation with audit
- Payment notifications

### Authentication & Authorization
- Register, Login, Logout with JWT sessions
- bcrypt password hashing (12 rounds)
- HTTP-only secure cookies
- 7 roles: super_admin, admin, manager, staff, designer, production, customer
- Server-side RBAC on all endpoints
- IDOR prevention (ownership verification)

### Media
- File upload API with validation (MIME, size, filename)
- Storage provider abstraction (Local active, Cloudinary ready)
- Audit logging on uploads

### Notifications
- In-app notification system
- Auto-notifications on workflow events
- Read/unread tracking
- Ownership enforcement

### SEO
- Dynamic sitemap.xml (products + categories from DB)
- robots.txt
- JSON-LD: Organization, Product, Breadcrumb, WebSite
- OpenGraph + Twitter metadata
- Canonical URLs

### Legal
- Privacy Policy, Terms & Conditions
- Refund Policy, Shipping Policy

### Security
- Rate limiting (auth endpoints)
- Security headers (XFO, XCTO, RP, PP, HSTS)
- Zod validation on all inputs
- Safe error responses
- Audit logging (11+ event types)

## Routes

53 total: 30 pages + 21 API endpoints + sitemap + robots

## Setup

```bash
npm install
cp .env.example .env
npx drizzle-kit push
npm run dev
```

## Environment Variables

See `.env.example` for complete list. Key variables:
- `DATABASE_URL` — PostgreSQL connection
- `SESSION_SECRET` — JWT signing key
- `NEXT_PUBLIC_SITE_URL` — Production URL

## Contact

- **WhatsApp:** +62 813-9300-5035
- **Email:** Perc.madina@gmail.com
- **Address:** Dusun Ngleri, Desa Ngadimulyo, Kecamatan Kedu, Kabupaten Temanggung, Jawa Tengah, Indonesia

© 2026 Madina Solution. All rights reserved.
