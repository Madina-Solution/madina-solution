# Firebase Social Authentication Setup

## Required web environment

Set these in Vercel Production/Preview as needed:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`

## Firebase Console

1. Open Firebase Console → Authentication → Sign-in method.
2. Enable Google.
3. Enable Facebook and enter the Meta App ID/App Secret.
4. Add the production and development domains to Firebase Authentication authorized domains.
5. For Facebook Login, register the Firebase OAuth redirect URI shown by Firebase in the Meta app configuration.

The application keeps its existing PostgreSQL/JWT session. Firebase is used only as the identity provider for Google/Facebook; the backend verifies the Firebase ID token and then creates the normal `madina_session` cookie.

## Deployment note

This release intentionally does not include a stale `package-lock.json` because the Firebase web SDK dependency was added in this release. Run `npm install` in the deployment environment to generate a fresh lockfile before committing or deploying.
