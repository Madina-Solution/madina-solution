# Changelog

## 2026-08-21 — Navigation + Integrity Hardening (1.0.0-pc.3)
- Centralized public navigation in `src/lib/navigation.ts`.
- Fixed invalid Mega Menu and Mobile Nav service/category routes.
- Fixed invalid Service page category links and Footer service links.
- Updated homepage service cards to use the same canonical navigation contract.
- Added `npm run validate:navigation` automated route/slug validation.
- Added `npm run validate:integrity` automated placeholder/dead-route/security-pattern scan.
- Added keyboard focus and Escape behavior for desktop Mega Menu.
- Removed placeholder `href="#"` public footer links.

 — Final Hardening Archive (1.0.0-pc.1)

### Security / Auth
- Added production server-side admin layout authorization.
- Replaced development password reset with expiring one-time token flow.
- Added audit trail for password reset requests/completions.
- Persisted authenticated customer ownership on newly created orders.

### Payment
- Added Midtrans provider adapter with signature verification.
- Added Xendit invoice provider adapter with callback-token verification.
- Blocked Mock payment provider in production.
- Added authoritative payment amount verification on webhook.
- Added database uniqueness for provider/event webhook idempotency.

### Email
- Replaced fake production SMTP implementation with Resend HTTPS provider.
- Console email is development-only; production requires Resend.

### Operations / Infrastructure
- Tightened production environment validation.
- Added password reset database migration.
- Updated health status to distinguish Production Candidate from Production Ready.
- Updated project documentation to reflect actual release gates.

### Release status
**LEVEL 3 — PRODUCTION CANDIDATE.** External provider configuration and final E2E verification remain required.

# Changelog

## 2026-08-21 — Final Hardening Archive
- Added production-gated Midtrans/Xendit payment provider selection.
- Added Midtrans signature verification and provider API integration.
- Added Xendit invoice integration and callback-token verification.
- Added payment webhook amount validation.
- Added Resend transactional email provider; console email is development-only.
- Replaced development-only password reset with expiring one-time token flow and reset-password page/API.
- Persisted `userId` for authenticated checkout orders.
- Added server-side admin layout authorization.
- Added password reset token schema and migration.
- Added unique payment webhook event constraint.
- Added production environment validation and health reporting.

## Prior versions

## Iteration 05 — Email + Notification Service → LEVEL 4

### Added
- `EmailProvider` interface with `ConsoleEmailProvider` (dev) and `SmtpEmailProvider` (prod)
- `getEmailProvider()` factory with env-based switching (SMTP_*)
- Email templates: order created, payment received, design ready, order completed, password reset
- Centralized `notify()` service combining in-app + email notifications
- Error isolation: notification failures never break main operations

### Architecture
- All 3 provider abstractions now complete: Payment + Storage + Email
- Each switches automatically based on environment variables
- Development uses mock/local/console providers
- Production activates real providers via env config

### Release Level
- Advanced from LEVEL 3 (Production Candidate) to LEVEL 4 (Production Ready)
- 5 consecutive iterations with zero P0 issues
- 42/42 pages verified 200
- All provider abstractions complete

## Iterations 01–04

### Established
- 113 routes, 60 APIs, 50 pages, 24 DB tables
- JWT + bcrypt + RBAC + 30+ permissions
- 12 admin CRUD modules with ConfirmDialog
- 5 customer CRUD modules
- Order 10-state machine
- Design revision workflow
- Payment + Cloudinary + proxy migration
- SEO + legal pages
- Zero security anti-patterns across all iterations

## [Unreleased] - Final Hardening Pass
- Fixed React 19 `set-state-in-effect` lint pattern across admin, account, and search screens without disabling the ESLint rule.
- Restored `.env.example` with current production configuration requirements.
- Added `npm run validate:release` to run navigation, integrity, TypeScript, ESLint, and production-build gates in sequence.
- Hardened media provider selection: production now requires Cloudinary and uploaded media records the actual storage provider instead of always recording `local`.
- Added accessible decorative image attributes and removed remaining navigation placeholder patterns.
