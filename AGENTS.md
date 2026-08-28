# Project Memory — tsa-portfolio

Full-stack portfolio platform for Techstudio Academy. Condensed memory for
future sessions. Companion docs: `README.md` (overview + deploy), `rules.md`
(client conventions), `server/guide.md` (auth module reference),
`server/Progress.md` (historical progress).

## What it is

- **Client** — React Router 7 (data mode via `createBrowserRouter`), React 19, Vite 8 (rolldown), Tailwind CSS v4, shadcn/ui on **Base UI** (`@base-ui/react`), TanStack Query, react-helmet-async.
- **Server** — Express 5 API, MongoDB (Mongoose 9), express-session + connect-mongo, Brevo email, Cloudinary uploads, Memcachier (memjs) response cache, Pino logging.
- **Deployment** — Single Vercel project (client + API same-origin). API lives at `/api/v1/*`; SPA served from `client/dist`.

## Monorepo (npm workspaces)

- `client/`, `server/`, `shared/` (name: `@tsa/shared`). One lockfile at root.
- `@tsa/shared` exports **Zod schemas + API types** consumed by both sides — single source of truth. NodeNext: import specifiers need `.js` extensions (`export * from './schemas/auth.js'`).
- Shared changes are invisible until you run its own typecheck: `npm run typecheck --workspace @tsa/shared`.

## Layout (key files)

```
api/index.ts              # Vercel entry → server/src/index.js
client/src/
  routes/index.tsx        # ALL routes; pages lazy-imported; layouts static
  middleware/auth.ts      # guestMiddleware / sessionMiddleware (requireAuth defined, NOT wired)
  lib/api.ts              # axios client, BASE_URL /api/v1
  hooks/use-project*.ts   # TanStack Query hooks for showcase/detail
server/src/
  controllers/            # thin: tryCatchWrapper + sendTsRestSuccess/Error
  services/               # authService, projectService, emailService (plain named exports)
  models/                 # user, emailQueue, project
  routes/                 # auth, upload, project, email(cron)
  middlewares/            # auth(verifySession, requireRole), schema, cache, rateLimit, error
  libs/cache.ts           # generateCacheKey/getCache/setCache/deleteCache/flushCache
shared/src/
  schemas/                # auth, media, project
  types/                  # auth, response, user, project
```

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | client Vite dev server (port 5178) |
| `npm run dev:server` | server nodemon+tsx (port 3800) |
| `npm run build` | client `tsc -b && vite build` → `client/dist` |
| `npm run typecheck` | **server workspace only** (`tsc --noEmit`) |
| `npm run typecheck --workspace @tsa/shared` | shared package typecheck |
| `npm run lint` | ESLint (client) |

- Client has no `typecheck` script — `build` is what compiles it.
- Vite dev proxies `/api` → `http://localhost:3800`.
- Server must be started from `server/` dir: `config/keys.ts` loads dotenv from cwd, so running elsewhere misses `server/.env`.
- No tests yet (server `npm test` is a stub).

## Client conventions (from `rules.md`)

- Folders/files lowercase kebab-case; exception: page component is `index.tsx` in its own folder.
- Pages/layouts default-export; utilities/hooks named-export.
- `@` alias → `client/src`. Imports grouped: external → `@/` → relative.
- Every leaf route needs `handle.seo` (`title` required). Root layout renders `<Seo>` from deepest match; dynamic pages can override with `<Seo>` inline.
- Route array ends with `satisfies RouteObject[]`.
- Auth routes use `guestMiddleware`; main layout uses `sessionMiddleware`. `middleware/auth.ts` still contains `console.log`s and odd control flow (sessionMiddleware returns `session` instead of calling `next()`; guestMiddleware can throw on null session) — known cleanup debt.

## Server conventions

- Thin controller + plain named-export service functions returning discriminated results: `{ success: true, ... } | { success: false, status, message }` (see `authService.ts`, `projectService.ts`). Controllers unwrap into `sendTsRestSuccess`/`sendTsRestError` inside `tryCatchWrapper`.
- Response shapes: success `{ success: true, message, body? }`, error `{ success: false, message, details? }`.
- Mounted in `src/index.ts`: `/api/v1/auth`, `/api/v1/upload`, `/api/v1/projects`, email cron at `/api` (→ `GET /api/cron-email`), plus `/health`.
- Middleware order: logger → CORS → globalLimiter → session → helmet → json/urlencoded (25mb limit). CORS allowlists `CLIENT_URL`, localhost ports, `VERCEL_URL`.
- `validateFormData(schema)` **replaces `req.body` with the zod-parsed output** — unknown keys are stripped silently. If a field isn't in the shared schema it will vanish; add it there first.
- Mongoose 9: `FilterQuery` no longer exists — use `import { type QueryFilter } from "mongoose"`.
- Import Node builtins with the `node:` protocol (lint rule): `node:crypto`, etc.

### Caching
- GET routes get `cacheMiddleware(ttl)`; mutations call `flushCache()` after success.
- Key = `ev:v1:<path>:<sorted-query>`; TTL seconds.
- memjs degrades gracefully: if Memcachier is unreachable/unauthenticated (typical locally), it logs WARN and serves uncached — repeat requests showing `x-cache: MISS` locally is expected, not a bug.

### Auth (routes on `/api/v1/auth`)
- `POST /register`, `/login`, `/verify-account?email=`, `/resend-otp`, `/forgot-password`, `/reset-password?token=`, `GET /me`, `POST /logout`.
- Register: bcrypt(10), 6-digit OTP (15 min), role `'admin'`, sets session, sends verification email.
- Login does **not** block unverified emails (open decision). Lockout: 30 min after 5 failed attempts.
- OTP/reset tokens: raw token in email link (query param), SHA-256 hashed in DB, 15-min expiry; OTP capped at 5 attempts.
- Sessions in MongoDB (`sessions` collection), cookie `_tsaPortfolio`, `sameSite: 'lax'`, httpOnly, 24h rolling.
- Route guards: `verifySession` then `requireRole('admin', 'super_admin')` for admin-only endpoints.

### Uploads (`/api/v1/upload`)
- `POST /` (admin/super_admin, `validateFormData(UploadSchema)`) and `DELETE` — Cloudinary-backed via `config/upload.ts`.

### Projects (`/api/v1/projects`)
- `GET /` — public, paginated (`?page&limit&category&sort=Newest|Oldest`), **published only**; `category` validated against `PROJECT_DEPARTMENTS`.
- `GET /:projectId` — published only (draft/invalid id → 404).
- `POST /add` — admin/super_admin, `createProjectSchema`; duplicate title+cohort+academicYear → 409.
- `status` defaults to `"draft"` unless explicitly sent as `"published"` (schema field, not just model default).
- Stored model ≠ client shape: `projectService.toProjectView` maps `department[0]`→`category`, `thumbnail`→`gallery`, `academicYear`→`year`, `fullName`→`name`, derives `slug`. Client consumes only the showcase `Project` type from `@tsa/shared`.

### Email
- Brevo via `config/email.ts`; on Brevo failure the email is queued to `emailQueue`.
- `jobs/emailCron.ts`: drains queue (batch 10), exponential backoff (5ⁿ min, cap 24h), lifecycle `queued → sending → sent/failed`.
- Cron endpoint protected by `CRON_SECRET` header; Vercel cron `*/10 * * * *`.

## Env vars

Required to boot: `MONGO_URI`, `SESSION_SECRET`, `NODE_ENV`, `LOG_LEVEL`, `DATABASE_NAME`, `CLIENT_URL`, `BREVO_API_KEY`, `EMAIL_OWNER`, `CRON_SECRET`, `MEMCACHIER_*`, `CLOUDINARY_*`. Optional: `SERVER_URL` (helmet CSP), `SESSION_MAX_AGE` (24h fallback). Real values live in `server/.env` (gitignored).

## Git workflow

- Branch off `test` (or `develop`), never `main`. PR → `test`; only `test` merges into `main`.
- Branch naming: `feature/`, `fix/`, `chore/` + kebab-case.
- CI (`.github/workflows/ci.yml`) on push/PR to `test`: typecheck (shared, server) + client build + client lint; guard job enforces PRs to `main` come from `test`.

## Gotchas

- Two `api/index.ts` exist: root `api/` is the real Vercel entry; `server/api/index.ts` is legacy/redundant.
- Root `tsconfig.json` only covers `api/**/*.ts`; client/server have their own tsconfigs — run each workspace's check separately.
- Dev DB is `Tsa-portfolioDev` (collections: `sessions`, `email_queue`, `user`, `project`).
