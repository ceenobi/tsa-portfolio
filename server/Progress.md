# Project Progress

> Tracked at commit `522724c` (initial commit — starter files setup).

## Overview

**Techstudio Portfolio** — a platform showcasing what Techstudio Academy students are building. Monorepo with a Node/Express API (`server/`) and a React Router 7 + Vite SPA (`client/`), deployed on Vercel (serverless) with MongoDB Atlas, Memcachier, and Brevo (email).

---

## Server — Progress

### ✅ Completed

#### Infrastructure & Configuration (`src/config/`)

| File          | What it does                                                                                                                                                                                                                                               |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `keys.ts`     | Loads `.env`, validates required env keys (Mongo, Brevo, Memcachier, Cloudinary, `CLIENT_URL`, `SESSION_SECRET`, `CRON_SECRET`); throws on missing required vars. Optional `SERVER_URL` (used for helmet CSP) documented                                   |
| `database.ts` | Mongoose connection with retry logic (max 5, 5s backoff), connection reuse, graceful shutdown, `SIGINT`/`SIGTERM` handlers                                                                                                                                 |
| `session.ts`  | `express-session` with MongoStore (TTL cleanup), cookie `_tsaPortfolio`, 24h max age, `httpOnly`, `sameSite: 'lax'`, `rolling` refresh                                                                                                                     |
| `logger.ts`   | Pino logger with pretty-printing in dev; `logError()` / `logRequest()` helpers                                                                                                                                                                             |
| `email.ts`    | Brevo SMTP API integration — sends HTML + plain-text fallback, optional attachments; named export `sendEmail(to, subject, html)` for cron, default export `sendEmail(options)` for the service; returns `{ success, messageId?, error? }` without throwing |

#### Auth Module (`src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts`)

All mounted at `/api/v1/auth`, every controller wrapped in `tryCatchWrapper`:

| Route                         | Controller        | Status                                                           |
| ----------------------------- | ----------------- | ---------------------------------------------------------------- |
| `POST /register`              | `registerAccount` | ✅ Creates user (`role: 'admin'`), sends OTP email, sets session |
| `POST /login`                 | `loginUser`       | ✅ Password compare, failed-attempt tracking, 30-min lockout     |
| `POST /verify-account?email=` | `verifyEmail`     | ✅ OTP verification (expiry + 5-attempt limit)                   |
| `POST /resend-otp`            | `resendOtp`       | ✅ Cooldown while current OTP valid, regenerates + resends       |
| `POST /forgot-password`       | `forgotPassword`  | ✅ Enumerates safely, stores hashed token (15 min expiry)        |
| `POST /reset-password?token=` | `resetPassword`   | ✅ Validates + hashes token, resets password, clears lockout     |
| `GET /me`                     | `getUser`         | ✅ Returns current user from session                             |
| `POST /logout`                | `logoutUser`      | ✅ Destroys session, clears cookie                               |

Security features implemented: bcrypt hashing (salt 10), OTP expiry (15 min) + max attempts (5), lockout after 5 failed logins (30 min), reset-token hashing (SHA-256) with 15 min expiry, email enumeration protection, Zod validation on every body, rate limiting.

#### Email Module

| Piece                          | Status                                                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/services/emailService.ts` | ✅ `EmailService.sendVerifyAccountEmail` / `sendPasswordResetEmail` — sends via Brevo, **queues to `EmailQueue` on failure** for retry     |
| `src/libs/emailTemplates.ts`   | ✅ Branded HTML templates (`verifyAccountTemplate`, `resetPasswordTemplate`) with base layout, logo, responsive styles                     |
| `src/models/emailQueue.ts`     | ✅ Queue model: priority, status lifecycle (`queued → sending → sent/failed`), retry count/max, backoff tracking; indexed for cron queries |
| `src/jobs/emailCron.ts`        | ✅ Processes due queued/failed emails (batch 10), exponential backoff (5ⁿ min capped at 24h), updates failure state                        |
| `GET /api/cron-email`          | ✅ Trigger endpoint protected by `CRON_SECRET` header (Vercel cron every 10 min)                                                           |

#### Middleware (`src/middlewares/`)

| File                      | What it does                                                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rateLimit.middleware.ts` | `globalLimiter` (100/15min, whole app), `strictLimiter` (10/15min, auth routes), `customRateLimiter(max, window)`; keyed by session user or IP                    |
| `schema.middleware.ts`    | `validateFormData(schema)` — Zod parse of `req.body`, returns `400` with issue details on failure                                                                 |
| `auth.middleware.ts`      | `verifySession`, `requireRole`, `requireAdmin`, `verifyUser`                                                                                                      |
| `error.middleware.ts`     | Pino HTTP logging (request IDs, sanitized headers), global handlers, `appErrorHandler` (CastError → 404, duplicate key → 400, ValidationError → 400), 404 handler |
| `cache.middleware.ts`     | `cacheMiddleware(ttl)` caches GET responses with `x-cache` header, `clearCache(suffix)` invalidation helper                                                       |

#### Caching (`src/libs/cache.ts`)

✅ Memcachier (memjs) client with SASL auth — `getCache` / `setCache` / `deleteCache` / `flushCache`, consistent key generation from path + sorted query string (`ev:v1:` prefix). Survives serverless warm starts.

#### Cross-cutting

- ✅ Standard response shapes via `src/libs/responseHandler.ts`: success `{ success: true, message, body? }`, error `{ success: false, message, details? }`
- ✅ Typed responses in `src/types.d.ts` (`AuthResponse`, `ForgotPasswordResponse`, etc. built on `ApiSuccessResponse<T>`)
- ✅ Security hardening in `src/index.ts` & `src/libs/options.ts`: helmet (CSP, HSTS, frame deny, COOP/CORP), CORS allowlist, compression (level 9), `x-powered-by` disabled, 25mb body limit, `/health` endpoint, graceful shutdown

---

## Client — Progress

- ✅ React Router 7 (framework conventions via `createBrowserRouter`), React 19, Vite 8 (rolldown), Tailwind v4, shadcn/ui (Base UI), React Query, react-helmet-async
- ✅ Route skeleton with **lazy-loaded pages** + **SEO via route `handle`** — `src/routes/index.tsx` defines `root` and `main` layouts, `home` page lazy-imported; SEO read from deepest match and rendered by `<Seo>` (see `client/rules.md`)
- ✅ Shared components: `Nav`, `Seo`, `ErrorBoundary`, `SuspenseUi`; `lib/api.ts`, `lib/utils.ts`

---

## Deployment — Vercel (single full-stack project)

Deployed as **one Vercel project** (repo root): the Express API runs as a serverless function, the client SPA is served as static output, and the API routes are served same-origin (`/api/v1/*`) so session cookies work without CORS.

### Root-level config (new)

| File                 | Purpose                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `package.json`       | npm workspaces (`client`, `server`), root scripts (`dev`, `dev:client`, `dev:server`, `build`, `lint`, `typecheck`), `engines.node >=20.19.0`, merged `allowScripts` (npm 11) |
| `vercel.json`        | `installCommand: npm install`, `buildCommand: npm run build`, `outputDirectory: client/dist`, function config for `api/index.ts` (`maxDuration: 30`), SPA rewrite (`/(.*)` → `/index.html`), cron `GET /api/cron-email` every 10 min |
| `api/index.ts`       | Serverless entry — `export { default } from '../server/src/index.js'` (Vercel auto-detects the root `api/` dir)                |
| `tsconfig.json`      | Type-checks the serverless entry (NodeNext, `noEmit`), root-only `.gitignore` (`.env`, `.vercel`, `dist`, `node_modules`)      |

### Server changes

- ❌ Deleted obsolete `server/vercel.json` (legacy v2 config that routed everything to the API function — would have shadowed the SPA).
- ✅ `src/index.ts` CORS allowlist updated: dev origins (`http://localhost:5173` / `:5199` and `127.0.0.1` variants) for local development, `https://${VERCEL_URL}` for preview deployments, `CLIENT_URL` deduped (was pushed twice in production).
- ✅ `src/index.ts` already branches on `process.env.VERCEL`: skips `app.listen()`, calls `connectToDB().catch(...)`, exports `app` for the serverless runtime.
- ✅ Added `typecheck` script (`tsc --noEmit`) to `server/package.json` so the root `npm run typecheck` works.

### Deploy notes

- **Vercel env vars** — copy `server/.env` keys into the Vercel project (must include `SESSION_SECRET`; `CLIENT_URL` optional since same-origin). `VERCEL_URL` is injected automatically for previews.
- **Cron** — `*/10 * * * *` cron requires a paid Vercel plan; the endpoint is protected by the `CRON_SECRET` header.
- **MongoDB Atlas** — allow Vercel function egress IPs (or `0.0.0.0/0` for dev) so serverless connections succeed.
- **Monorepo note** — the API function bundles the `server` workspace because `server/src/index.ts` imports deps via the root `node_modules` (hoisted by npm workspaces).

---

## Known Issues / Cleanup

- ~~`src/models/user.ts` indexes `{ isOnboarded: 1 }` but no `isOnboarded` field exists on the schema (leftover).~~ ✅ Resolved — stray index removed.
- ~~`auth.middleware.ts` `requireRole` accepts `'attendee' | 'organizer' | 'admin'` but the session role model is `'admin' | 'super_admin'` — role types are inconsistent across files.~~ ✅ Resolved — `requireRole`/`verifyUser` now use `'admin' | 'super_admin'` throughout, matching `models/user.ts`, the `express-session` augmentation, and the `req.user` type.
- ~~`keys.ts` requires `SESSION_SECRET`/`SESSION_MAX_AGE` are used by `session.ts` but **not** validated in `ENV_VARS` — missing `SESSION_SECRET` will fail at runtime, not at boot.~~ ✅ Resolved — `SESSION_SECRET` is now a required env var (`SESSION_MAX_AGE` intentionally optional; `session.ts` has a 24h fallback).
- ~~`options.ts` reads `env.serverUrl` which isn't defined in `keys.ts` (falls back to `http://localhost:3900`).~~ ✅ Resolved — now reads `env.SERVER_URL` (optional key added to `keys.ts`), fallback corrected to `http://localhost:3800` to match the server's actual dev port.

## Next Steps (suggested)

- ⚠️ **Env setup**: add `SESSION_SECRET` (required — server won't boot without it) and optionally `SERVER_URL` to local `.env` and Vercel env vars. (Local `.env` already has `SESSION_SECRET`.)
- ✅ **Deploy scaffold** (root `vercel.json`, `api/index.ts`, workspaces, CORS) is done locally — next step is creating the Vercel project from the repo root, adding env vars, and deploying. Follow the branch/PR workflow in `client/rules.md` (no direct pushes to `main`).

- Add remaining feature modules (portfolios/projects showcase endpoints, Cloudinary media upload).
- `GET /api/v1/auth/users` (admin-only listing) is scoped but not implemented.
- Decide whether login should block unverified emails (currently no `emailVerified` check on login).
- Add tests (unit + integration) and CI for the server.
