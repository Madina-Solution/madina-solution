# Changelog

## [1.0.0] - Production Release

### Golden E2E Verified
- Complete order lifecycle: Register → Order → Payment → Confirm → Design → Approve → Production → QC → Ready → Ship → Complete
- 9 status transitions, 11 audit entries, 2 notifications — all verified

### Release Highlights
- **53 routes** (30 pages + 21 APIs + SEO)
- **24 database tables** with 54 indexes
- **7 roles** with server-side RBAC
- **10-state order machine** with strict transitions
- **Payment abstraction** with webhook idempotency
- **Media abstraction** with provider architecture
- **In-app notifications** with ownership protection
- **Design revision workflow** with customer approval
- **Production pipeline** with QC
- **SEO** with sitemap, robots, JSON-LD
- **Security** with rate limiting, headers, IDOR prevention
- **Sequential order numbers** (MS-YYYY-NNNNNN)

### Added in v1.0.0
- Sequential order number generation (MS-2026-000001)
- Admin order detail: payment section + design revisions section
- Server/client boundary fix for order utilities

### Security
- Rate limiting on auth endpoints (429)
- Security headers middleware
- RBAC enforcement verified
- IDOR prevention verified
- Audit trail on all sensitive operations

---

## [0.10.0] - Security + Performance Hardening
## [0.9.0] - SEO + Legal Foundation
## [0.8.0] - Payment Architecture
## [0.7.0] - Media + Notification + Design Workflow
## [0.6.0] - Designer + Production Workspace
## [0.5.0] - Order Workflow + Customer Tracking
## [0.4.0] - Admin Dashboard
## [0.3.0] - Authentication + Customer Dashboard
## [0.2.0] - Checkout + Order Creation
## [0.1.0] - Cart Foundation
## [0.0.1] - Foundation through Platform Shell
