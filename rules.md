# Client App — Project Rules

## Folder & File Naming

- **Folder names** must be lowercase. Use hyphens for multi-word names (e.g., `error-boundary`, `suspense-ui`).
- **File names** must be lowercase. Use hyphens for multi-word names (e.g., `error-boundary.tsx`, `seo.tsx`).
- **Exceptions**: Files that export a single default component may use `index.tsx` inside a dedicated folder (e.g., `routes/main/home/index.tsx`).

## Folder Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Shared/reusable components
│   └── ui/          # Base UI primitives (shadcn-style)
├── lib/             # Utilities, helpers, API clients
├── hooks/           # Custom React hooks
├── routes/          # Route layouts and page components
│   ├── index.tsx    # Router definition (all routes here)
│   ├── root/
│   │   └── layout.tsx   # Root layout (SEO, loading bar, Outlet)
│   ├── main/
│   │   ├── layout.tsx   # Main app layout (Nav, Outlet)
│   │   └── home/        # Example page
│   │       └── index.tsx
│   └── auth/            # Auth-related routes
└── [other feature dirs]
```

## Routes & Pages

### Page creation pattern

Each page is a folder inside `src/routes/<section>/<page-name>/` with an `index.tsx` that **default-exports** the page component:

```tsx
// src/routes/main/home/index.tsx
export default function Home() {
  return <div>...</div>
}
```

### Route registration (in `src/routes/index.tsx`)

- All routes are defined in a single `routes` array using `createBrowserRouter`.
- **Page components must be lazy-loaded** using the `lazy` property with a dynamic `import()`:

```tsx
{
  index: true,
  handle: {
    seo: {
      title: 'Home',
      description: 'See what our students are building.',
    },
  },
  lazy: async () => {
    const { default: Component } = await import('@/routes/main/home')
    return { Component }
  },
}
```

- Layouts (non-page route containers) are imported statically at the top of the file.

### SEO

- Every route with a page (leaf route) **must** include a `handle.seo` object with at least a `title`.
- The `handle` type is inferred from `react-router`'s `RouteObject`. Use `satisfies RouteObject[]` on the route array.
- The root layout (`routes/root/layout.tsx`) reads the deepest match's `handle.seo` and renders it via the `<Seo>` component.
- Supported SEO fields: `title`, `description`, `image`, `url`.

## Component Patterns

- **Default exports** for page components and layouts.
- **Named exports** for utilities, hooks, and reusable helpers.
- Shared components live in `src/components/` and are imported with the `@/components/` alias.
- Route components are imported via `@/routes/` alias.

## Imports

- Use the `@` path alias (maps to `src/`), e.g. `@/components/nav`, `@/routes/main/home`.
- Group imports: external libraries first, then internal aliases, then relative imports.

## Git Workflow

1. **Collaborators must create their own branch** from `develop` or `test` (never from `main`).
2. **Push only to your own branch** — never push directly to `test` or `main`.
3. **Create a pull request** to merge your branch into `test`.
4. **Only `test` branch can be merged into `main`** — never push directly to `main`.
5. Branches should be named with a prefix (e.g., `feature/`, `fix/`, `chore/`) followed by a short kebab-case description.
