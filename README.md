# Techstudio Academy (TSA) Portfolio

Full-stack portfolio platform for Techstudio Academy.

- **Client** — React Router 7 (framework mode) SPA, Vite, Tailwind CSS v4, shadcn/ui
- **Server** — Express 5 API, MongoDB (Mongoose), session auth, Brevo email, Memcachier cache
- **Deployment** — Single Vercel project serving both client and API same-origin (`/api/v1/*`)

> The repo is an npm workspace monorepo: `client/`, `server/` and `shared/` are separate workspaces with one lockfile at the root.

---

## Project structure

```
tsa-portfolio/
├── api/                  # Vercel serverless entry (re-exports the Express app)
├── client/               # React Router 7 SPA (workspace: client)
│   └── src/
│       ├── routes/       # Route modules (+route.tsx conventions, lazy-loaded)
│       ├── components/   # UI components (small-cased folders)
│       ├── lib/          # Utilities, api client
│       └── ...
├── server/               # Express API (workspace: server)
│   └── src/
│       ├── config/       # env keys, db, session, email, logger
│       ├── controllers/  # request handlers
│       ├── middlewares/  # auth, rate-limit, schema validation, error handling
│       ├── models/       # Mongoose models
│       ├── routes/       # route definitions
│       ├── services/     # email, etc.
│       ├── jobs/         # cron jobs (email queue)
│       └── libs/         # utils, options, templates
├── shared/               # Shared schemas + types (workspace: @tsa/shared)
│   ├── src/schemas/      # auth + media validation consumed by client & server
│   └── src/types/        # API response types (ApiSuccessResponse, auth responses, UserProfile)
├── vercel.json           # build/output/cron/rewrite config
├── .env.example          # reference for all environment variables
└── package.json          # workspace root (scripts, engines, allowScripts)
```

**Conventions** (see `client/rules.md` and `server/guide.md`):

- Folder and file names are lowercase.
- Every page defines its own SEO (react-helmet-async) and route modules are **lazy-imported** (see `client/src/routes/index.tsx`).
- Zod request schemas and API response types live in `shared/` (`@tsa/shared`) — `shared/src/schemas/` for validation, `shared/src/types/` for `ApiSuccessResponse`/`ApiErrorResponse`, auth responses, and `UserProfile` — so client and server share one source of truth.
- Collaborators work on their own branch → open a PR into `test` → only `test` merges into `main`. Never push to `main` directly.

---

## Prerequisites

- Node.js **>= 20.19** (npm workspaces + npm 11 `allowScripts`)
- MongoDB (Atlas) — set `MONGO_URI`
- Optional: Brevo API key (email), Memcachier (cache), Cloudinary (uploads)

## Local development

```bash
# 1. Install all workspaces from the root
npm install

# 2. Create env file from the reference
cp .env.example server/.env
# ... then fill in real values (see server/.env.example if present, else server/.env keys)

# 3. Run both apps
npm run dev          # client only (Vite dev server on http://localhost:5178)
npm run dev:client   # same as above
npm run dev:server   # API only (nodemon + tsx, port 3800)
```

Useful scripts (run from root):

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run build`     | Type-check + build the client → `client/dist` |
| `npm run typecheck` | Type-check the server (`tsc --noEmit`)        |
| `npm run lint`      | ESLint the client                             |

**CORS:** the server allow-lists `CLIENT_URL` from env plus local `localhost:5178` / `127.0.0.1:5178` (and a `5199` fallback) and Vercel preview origins (`*.vercel.app`) automatically.

---

## Environment variables

All variables live in one place — see **`.env.example`** at the repo root for the full annotated list. The server loads `server/.env` in development (dotenv); on Vercel, add every key in Project Settings → Environment Variables.

Minimum required for the app to boot: `MONGO_URI`, `SESSION_SECRET`, `NODE_ENV`, `DATABASE_NAME`, `CLIENT_URL`.

---

## Deployment (Vercel — single project)

The client and API are deployed **as one Vercel project** so they share an origin (cookies, no CORS in production). The Express app is served by a single serverless function at `/api/*`; the SPA is served as static files from `client/dist` with a catch-all rewrite.

1. Import the repo root as **one** project in Vercel.
2. Framework preset: **Vite**; Node version **22.x** (matches `engines` in root `package.json`).
   - Vercel reads `vercel.json`: `npm install` → `npm run build` → output `client/dist`, serverless function `api/index.ts`.
3. Add **all** environment variables from `.env.example` (Production + Preview + Development). `SESSION_SECRET` is required — generate with `openssl rand -hex 32`.
4. **MongoDB/Atlas:** allow Vercel egress — add Atlas Network Access rules for Vercel's IP ranges (or `0.0.0.0/0` for prototyping).
5. Deploy. The API responds on `/api/v1/*` and `/health`; the SPA on every other route.

**Cron** — the email queue job hits `GET /api/cron-email` every 10 minutes (defined in `vercel.json`). Cron requires a **paid (Pro) Vercel plan**; on Hobby, run it manually via `CRON_SECRET` (see `server/src/jobs/emailCron.ts`).

**Preview deployments** automatically receive a `*.vercel.app` URL, which the server adds to its CORS allowlist.

---

## Branch workflow

```
feature/<name> ──PR──▶ test ──merge──▶ main
```

- Create a branch off `test` for your work (`git checkout test && git checkout -b feature/your-feature`).
- Open a pull request **into `test`**.
- Only `test` is merged into `main` (reviewed), **after** it's verified on the preview deployment.
- `main` must not be pushed to directly.
