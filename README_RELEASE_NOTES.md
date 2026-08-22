# Madina Solution — Final Hardening Release Notes

This archive is a **Production Candidate**, not a claim of live production readiness without external credentials.

## Implemented directly
- Production-gated payment provider selection (Midtrans/Xendit; mock blocked in NODE_ENV=production).
- Midtrans payment provider with Snap create/status/cancel/refund and signature-verified webhook.
- Xendit invoice create/status/expire and callback-token verification; refund remains explicitly unsupported until a payment-product-specific Xendit refund API is selected.
- Webhook amount validation against the authoritative database payment amount.
- Production-gated transactional email using Resend (development console provider only outside production).
- Secure password-reset token flow: random token, SHA-256 hash at rest, 30-minute expiry, one-time use, audit logging, dedicated reset page/API.
- Logged-in checkout orders now persist `userId`; guest checkout remains supported.
- Production environment validation now blocks missing/misconfigured payment/email/site URL configuration.

## Required before live release
- Configure a real payment provider and credentials in the deployment environment.
- Configure Resend and a verified sender domain.
- Configure Cloudinary (or another durable storage provider) for production uploads.
- Apply the password reset database migration before first deployment of this build.
- Run an authenticated end-to-end payment/webhook test in the provider sandbox, then production credentials.
