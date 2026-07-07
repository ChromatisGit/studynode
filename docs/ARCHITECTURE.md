# Architecture

## Two-Repo Structure

StudyLuma is split across two independent repos — no shared filesystem, no relative paths between them. Only coupling: shared Postgres (content pipeline writes, website reads) and binary assets (Postgres `content_assets` by default, or S3-compatible storage) — see [CONTENT_PIPELINE.md](CONTENT_PIPELINE.md#images--binary-assets).

| Repo | Purpose |
|------|---------|
| `studyluma-website` | React Router v7 SSR web app |
| `studyluma-content` | Markdown content source + build pipeline |

```
studyluma-content          studyluma-website
     │ preview / publish        │ dev / deploy
     └──────► Postgres ◄────────┘
```

## studyluma-website

### Framework

React Router v7, SSR, Vite. `@chromatis/base` (bun-linked locally) provides Vite config, ESLint config, and base tsconfig.

### Source Layout

```
src/core/     Route handlers (thin loaders/actions calling services)
src/features/ UI feature modules, one per feature
src/macros/   Content macro definitions + renderers
src/schema/   Shared TS types, no runtime code
src/server/   Server-only business logic (services, DB layer)
src/ui/       Shared UI components + layout
```

### Layer Rules

Enforced by `checkArchitectureBoundaries.ts` + `eslint-plugin-boundaries`:

- `features/` — no cross-feature imports; may import `ui/`, `macros/`, `schema/`
- `server/` — never imported by `features/` or `ui/`
- `core/` — owns route-level infra: sessions, auth guards, content access, DB access
- `macros/` — may import `features/` for rendering, not `server/`/`core/`

### Core Layer (`src/core/`)

- `db.server.ts` — Postgres singleton; `anonSQL` (no RLS context), `userSQL(user)` (sets RLS session vars per query)
- `auth/` — session cookies, PIN login, route guards (`assertLoggedIn`, `assertAdminAccess`)
- `content.server.ts` — typed accessors for `content_pages` (`getContentPage`, `getWorksheetContent`, `getSlideDeckContent`, …)

### Authentication

Username + PIN, PBKDF2 via Web Crypto (`hashPin`/`verifyPin` from `@chromatis/base/auth`) — no native modules, works on Node and Workers. Session cookie stores only `user_id`; core auth resolves the full `UserDTO` per request.

### Database

Postgres everywhere: Docker Compose locally (`bun run db`), `DATABASE_URL` for Docker deploys, Neon for Cloudflare. `userSQL(user)` sets `app.user_id`/`app.user_role`/`app.group_key` before each query; RLS policies key off these — no app-level filtering needed.

### Content

Pages stored as parsed JSONB in `content_pages`; the website only reads pre-parsed JSON (`core/content.server.ts` fetches the row, the loader passes it to the renderer). Images are content-addressed (`<sha256>.<ext>`), served via `GET /content-assets/:key` → `core/assets.server.ts` (Postgres `content_assets` or S3 — see CONTENT_PIPELINE.md). No per-asset access control beyond the key being unguessable, same as `content_pages`.

### Realtime

Not implemented yet.

## studyluma-content

### Structure

```
content/
├── definitions.yml   Groups, subjects, variant definitions
├── base/             <subject>/<topic>/chapters.md + <chapter>/*.md (worksheet/slide source, independent of any course)
└── courses/          <course-id>/course.yml — which base content to include
pipeline/             Build pipeline (TypeScript)
```

### Pipeline

`bun run preview`/`publish` reads YAML + Markdown, parses to typed JSON, writes course structure + content pages to Postgres. See [CONTENT_PIPELINE.md](CONTENT_PIPELINE.md).
