# Project Memory — tsa-portfolio

Full-stack portfolio platform for Techstudio Academy. This file is a condensed
"memory" of the codebase for future sessions. Companion docs: `README.md`
(overview + deploy), `rules.md` (client conventions), `server/guide.md` (auth
module reference), `server/Progress.md` (historical progress).

## What it is

- **Client** — React Router 7 (framework/data mode via `createBrowserRouter`), React 19, Vite 8 (rolldown), Tailwind CSS v4, shadcn/ui on **Base UI** (`@base-ui/react`), TanStack Query, react-helmet-async.
- **Server** — Express 5 API, MongoDB (Mongoose 9), express-session + connect-mongo, Brevo email, Memcachier (memjs) cache, Cloudinary (unused so far), Pino logging.
- **Deployment** — Single Vercel project (client + API same-origin). API lives at `/api/v1/*`; SPA served as static output from `client/dist`.

## Monorepo (npm workspaces)

- `client/` (name: `client`), `server/` (name: `server`), `shared/` (name: `@tsa/shared`). One lockfile at root.
- `@tsa/shared` exports **Zod schemas + API response types** consumed by both client and server — single source of truth. Files use `.js` extensions in import specifiers (NodeNext), e.g. `import { loginSchema } from '@tsa/shared'` and inside shared `export * from './schemas/auth.js'`.

## Directory layout

```
api/index.ts            # Vercel serverless entry: re-exports server/src/index.js
client/src/
  routes/index.tsx      # ALL routes; pages lazy-imported; layouts static
  routes/<section>/<page>/index.tsx   # default-export page components
  middleware/auth.ts    # requireAuth / sessionMiddleware / guestMiddleware
  lib/api.ts            # axios client, BASE_URL /api/v1, api.get/post/patch/delete
  lib/utils.ts          # cn(), queryClient, Cloudinary image helpers
  components/ui/        # shadcn/Base-UI primitives
server/src/
  config/  keys.ts, database.ts, session.ts, logger.ts, email.ts
  controllers/  auth.controller.ts, email.controller.ts
  middlewares/  auth, error, rateLimit, schema, cache
  models/  user.ts, emailQueue.ts
  routes/  auth.routes.ts (mounted /api/v1/auth), email.routes.ts (mounted /api)
  services/emailService.ts
  jobs/emailCron.ts
  libs/  responseHandler, tryCatchWrapper, utils, options, cache, emailTemplates
shared/src/
  schemas/ auth.ts, media.ts
  types/ auth.ts, response.ts, user.ts
```

## Client conventions (from `rules.md`)

- **Folders & files lowercase, kebab-case.** Exception: single default-export page as `index.tsx` in its own folder.
- Pages/layouts **default-export**; utilities/hooks **named-export**.
- `@` alias → `client/src`. Imports grouped: external → `@/` internal → relative.
- Every leaf route has `handle.seo` (`title` required; `description`, `image`, `url` optional). Root layout (`routes/root/layout.tsx`) reads deepest match's `handle.seo` and renders `<Seo>`.
- Route array ends with `satisfies RouteObject[]` (in `client/src/routes/index.tsx`).
- Auth routes use `guestMiddleware`; main layout uses `sessionMiddleware` (see `middleware/auth.ts` — note `requireAuth` is defined but **not** currently wired into routes).

## Server conventions (from `guide.md` + code)

- Every controller wrapped in `tryCatchWrapper`; responses via `sendTsRestSuccess` / `sendTsRestError`.
- Response shapes: success `{ success: true, message, body? }`, error `{ success: false, message, details? }`.
- Routes mounted in `server/src/index.ts`: auth at `/api/v1/auth`, email cron at `/api` (→ `GET /api/cron-email`), plus `/health`.
- Middleware order in `src/index.ts`: logger → CORS → globalLimiter → session → helmet → json → urlencoded. CORS allowlists `CLIENT_URL` + localhost dev + `VERCEL_URL` preview.

### Auth flow (routes on `/api/v1/auth`)
- `POST /register`, `POST /login`, `POST /verify-account?email=`, `POST /resend-otp`, `POST /forgot-password`, `POST /reset-password?token=`, `GET /me`, `POST /logout`.
- Register: bcrypt(10), OTP (6-digit, 15 min), role `'admin'`, sets session, sends verification email.
- Login: NO `emailVerified` check currently. Failed-attempt tracking → 30-min lockout after 5 fails.
- OTP verify: 5-attempt cap; email passed as **query param**, OTP in body. OTP links use `/auth/verify-account?email=`.
- Reset: token sent raw in email link (query param), SHA-256 hashed for storage, 15-min expiry.
- Sessions stored in MongoDB (`sessions` collection), cookie `_tsaPortfolio`, `sameSite: 'lax'`, `httpOnly`, 24h max age, `rolling` refresh.

### Email module
- `EmailService.sendVerifyAccountEmail` / `sendPasswordResetEmail` → Brevo via `config/email.ts`. On Brevo failure, email is **queued** to `emailQueue` for retry.
- `jobs/emailCron.ts`: drains queue (batch 10), exponential backoff (5ⁿ min, capped 24h), status lifecycle `queued → sending → sent/failed`.
- Cron endpoint `GET /api/cron-email` protected by `CRON_SECRET` header; Vercel cron `*/10 * * * *` (requires paid plan; else manual with secret).

## Env vars (`.env.example`)

Required to boot: `MONGO_URI`, `SESSION_SECRET`, `NODE_ENV`, `LOG_LEVEL`, `DATABASE_NAME`, `CLIENT_URL`, `BREVO_API_KEY`, `EMAIL_OWNER`, `CRON_SECRET`, `MEMCACHIER_*`, `CLOUDINARY_*` (Cloudinary vars are required by `keys.ts` but the feature is unused). Optional: `SERVER_URL` (helmet CSP connect-src). `SESSION_MAX_AGE` optional (24h fallback). `server/.env` holds real local values.

## Scripts (from root)

| Command | Action |
| --- | --- |
| `npm run dev` | client Vite dev server (port 5178) |
| `npm run dev:client` | same as dev |
| `npm run dev:server` | server via nodemon+tsx (port 3800, `--inspect`) |
| `npm run build` | `tsc -b && vite build` client → `client/dist` |
| `npm run typecheck` | `tsc --noEmit` server |
| `npm run lint` | ESLint client |

Vite dev proxies `/api` → `http://localhost:3800`.

## Git workflow (important)

- Branches off `test` (or `develop`), never `main`. Never push to `test`/`main` directly.
- PR → `test` → only `test` merges into `main`.
- Branch naming: `feature/`, `fix/`, `chore/` + kebab-case.

## Current state & gotchas

- Repo is at 5 commits; auth + email modules done. **Working-tree change (uncommitted): `client/src/routes/index.tsx`** adds a stub `about` route (`{ path:'about' }`).
- `client/src/middleware/auth.ts` has `console.log` debug statements and some odd control flow (e.g. `sessionMiddleware` returns `session` instead of `next()`, `guestMiddleware` accesses `session.emailVerified` which could throw if `session` is null). Route guard logic may need cleanup.
- `keys.ts` requires Cloudinary + Memcachier keys even though their features aren't wired up — a missing key will block boot. A `server/.env` exists locally.
- There are two `api/index.ts` files: root `api/` (Vercel entry) and `server/api/index.ts` (redundant/legacy — server uses `server/src/index.ts`).
- Login does not block unverified emails (open decision).
- No tests yet; server `npm test` is a stub. CI at `.github/workflows/ci.yml` (moved from the mislocated `client/github/`) runs typecheck (shared, server) + client build + client lint on push/PR to `test`; a guard job enforces PRs to `main` must come from `test`.
- Root `tsconfig.json` only covers `api/**/*.ts`; client/server have their own tsconfigs.
