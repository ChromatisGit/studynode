# Content Pipeline

`studyluma-content` is a standalone build tool: reads Markdown + YAML, writes parsed course structure and content pages to Postgres.

## Repo Structure

```
content/
├── definitions.yml   Groups, subjects, variant definitions
├── base/<subject>/<topic>/chapters.md + <chapter>/*.md   Worksheet/slide source, independent of any course
└── courses/<course-id>/course.yml   Which topics/chapters to include
pipeline/
├── preview.ts / publish.ts   Entry points (local / production)
├── main.ts             Orchestrator
├── config.ts           Reads CONFIG.yaml for DB URLs
├── configParser/       Loads/validates YAML
├── markdownParser/     Markdown → typed JSON
├── pageParser/         Parsed content → DB format
├── dataTransformer/    Resolves course structure
└── db/                 Database write operations
```

## Running

```sh
bun run preview   # local — starts Docker, uses CONFIG.yaml local profile
bun run publish   # production — uses CONFIG.yaml production profile, asks for confirmation
```

## What It Does

1. Load `definitions.yml` + all `courses/*/course.yml`
2. Resolve each course's topic/chapter refs to Markdown paths under `base/`
3. Parse each `.md` to a typed `Page` (title + sections + macro content)
4. Build hierarchy: course → topics → chapters → worksheets
5. Write to DB: `deployCourseStructure` upserts `groups`/`subjects`/`courses`/`topics`/`chapters`/`worksheets` + junction tables; `deployContentPages` upserts `content_pages` (only rows whose `content_hash` changed)
6. `flushPendingMathAssets`: every unique Typst math span is compiled to SVG, uploaded content-addressed by hash of the trimmed source — the website resolves the same hash independently at render time, no key stored in `content_json`
7. `deployContentPdfs`: each `@pdf` section → Typst markup → compiled to PDF, uploaded content-addressed (unchanged PDFs skipped), asset key stored in the DB

## PDF Generation

Typst CLI compiles worksheets directly to PDF — native vector text/layout/math, no `@react-pdf/renderer`, no rasterized math, no browser dependency. Stored in the AssetStore like images, keyed by SHA-256 of the PDF bytes; unchanged content hash skips regeneration. Served via the existing `GET /content-assets/:key` route. Every page footer links to `<site_url>/w/<contentKey>` (course-independent, see below), where `site_url` is the deploying instance's own domain (e.g. `https://holst.studyluma.org` or `https://studyluma.org` for the demo) — configured per profile in `studyluma-content`'s `CONFIG.yaml`, not hardcoded.

## `/w/:contentKey` Redirect Route

Resolves a content key to the logged-in student's course-specific worksheet URL:

1. `GET /w/:contentKey` → not logged in: redirect to login with return URL
2. Logged in: query enrolled courses containing this key (RLS-enforced)
3. One match → redirect to the course worksheet URL
4. Multiple matches → course picker (edge case: teacher enrolled in two courses)
5. No match → 404

Keeps the PDF URL permanently stable and course-independent; the same PDF is reused across courses sharing a worksheet.

## Content Key Convention

`<kind>:<subject>:<topicId>:<chapterId>[:<worksheetId>]`, e.g. `worksheet:math:differenzialrechnung:sekanten:grundaufgaben`. Looked up via `platform/content.server.ts`.

## `definitions.yml`

Global lookup tables: `groups`, `subjects`, `variants`, each entry with `id`/`label` plus a type-specific field (`color` for groups, `icon` for subjects, `short` for variants). See the file itself for the current values.

## `course.yml`

A single course instance: `id`, `group`, `subject`, `label`, `slug`, `color`, `icon`, `worksheetFormat`, plus a `topics` tree (`status` + `chapters`, each with `status` + `worksheets`, each optionally `hidden`). See any existing `content/courses/*/course.yml` for a concrete example.

## Adding a New Course

1. Create `content/courses/<course-id>/course.yml`
2. Ensure the referenced `topicId`/`chapterId` dirs exist under `content/base/<subject>/`
3. Run `bun run preview`

Idempotent — safe to re-run; unchanged pages (same hash) aren't rewritten.

## Images / Binary Assets

Standard Markdown syntax (`![](./diagram.svg)`, relative to the `.md` file). The two repos share no filesystem, so images are never copied — each is content-addressed (`<sha256>.<ext>`) and uploaded via `AssetStore` (`pipeline/assets/`); the website resolves a key back to bytes via `GET /content-assets/:key`.

Backend chosen by `asset_driver` in `CONFIG.yaml` (must match in both repos):

- `postgres` (default) — stored in `content_assets`, fine for small/medium content
- `s3` — any S3-compatible endpoint (Cloudflare R2, MinIO, AWS S3) via Bun's built-in client; needs `asset_s3_endpoint`/`bucket`/`region`/`access_key_id`/`secret_access_key`

No per-asset access control — an unguessable key is the trust model, same as a public CDN link. Course-level access (public vs. gated) is enforced earlier, before a content page (and the asset URLs it contains) is ever sent to the client.

## Content Format

See [MARKDOWN_CONTENT_FORMAT.md](MARKDOWN_CONTENT_FORMAT.md) for the full Markdown syntax reference.
