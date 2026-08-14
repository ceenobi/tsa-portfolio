# Contributing to Techstudio Academy Portfolio

Thanks for your interest in contributing! This is a proprietary, internal
portfolio platform for Techstudio Academy, but internal and trusted
contributors are welcome. Please read this guide before opening issues or
pull requests.

> Developer-facing conventions live in `client/rules.md`, `server/guide.md`,
> and `AGENTS.md`. This file is the entry point for the contribution workflow.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [Project layout](#project-layout)
- [Branch & pull-request workflow](#branch--pull-request-workflow)
- [Code conventions](#code-conventions)
- [Verifying changes](#verifying-changes)
- [Reporting bugs & requesting features](#reporting-bugs--requesting-features)

## Code of conduct

By participating you agree to abide by our
[Code of Conduct](CODE_OF_CONDUCT.md). Please report unacceptable behavior to
the `EMAIL_OWNER` address configured for the project.

## Getting started

Prerequisites: Node.js >= 20.19, MongoDB (Atlas), and optionally Brevo /
Memcachier / Cloudinary keys.

```bash
# Install all workspaces from the repo root
npm install

# Create your env file from the reference
cp .env.example server/.env

# Run both apps
npm run dev          # client (Vite, http://localhost:5178)
npm run dev:server   # API (port 3800)
```

See [README.md](README.md) for full environment-variable and deployment notes.

## Project layout

This is an **npm workspace monorepo**:

- `client/` — React Router 7 SPA (workspace: `client`)
- `server/` — Express 5 API (workspace: `server`)
- `shared/` — shared Zod schemas + API types (workspace: `@tsa/shared`)

A single lockfile lives at the root.

## Branch & pull-request workflow

```
feature/<name> ──PR──▶ test ──merge──▶ main
```

- **Never** push directly to `main`. Only `test` merges into `main`.
- Create a branch **off `test`**:

  ```bash
  git checkout test
  git pull
  git checkout -b feature/your-feature
  ```

- Open a pull request **into `test`**.
- `test` is reviewed and verified on a preview deployment before it is merged
  into `main`.

## Code conventions

- Folders and files are **lowercase, kebab-case**.
- Pages/layouts are default-exported; utilities/hooks are named-exported.
- The `@` alias points to `client/src`.
- Every leaf route defines `handle.seo` (title required).
- Zod request schemas and API response types live in `shared/`
  (`@tsa/shared`) so client and server share one source of truth.
- Follow the detailed rules in `client/rules.md` and `server/guide.md`.

## Verifying changes

Run these from the repo root before opening a PR:

```bash
npm run build        # type-check + build the client
npm run typecheck    # type-check the server
npm run lint         # ESLint the client
```

CI runs these checks automatically on every push/PR to `test` and `main`.

## Reporting bugs & requesting features

Use the issue templates in `.github/ISSUE_TEMPLATE/`:

- **Bug report** — describe the expected vs. actual behavior, steps to
  reproduce, and environment.
- **Feature request** — describe the motivation, expected behavior, and
  any alternatives you considered.

For security vulnerabilities, do **not** open a public issue — see
[SECURITY.md](SECURITY.md).
