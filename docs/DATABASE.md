# Database

## Technology

Postgres 16 via the `postgres` npm package (v3). Local: Docker Compose (`bun run db`). Docker deploy: `DATABASE_URL`. Cloudflare: Neon serverless Postgres.

## Schema Overview

### Lookup tables

| Table | Purpose |
|-------|---------|
| `groups` | Student groups (e.g. "TG1", "FTR", "Public") |
| `subjects` | Subject areas (e.g. "math", "info") |
| `course_variants` | Curriculum variants (e.g. "gk", "lk") |

### Course structure

| Table | Purpose |
|-------|---------|
| `courses` | A course instance (group × subject × variant) |
| `topics` | Named topic (e.g. "Differentialrechnung") |
| `chapters` | Named chapter within a topic |
| `worksheets` | A worksheet or slide deck within a chapter |
| `course_topics` | Topic membership + display order + status per course |
| `course_chapters` | Chapter membership + status per course × topic |
| `course_worksheets` | Worksheet membership + visibility flags per course × chapter |

Hierarchy: `course → topics → chapters → worksheets`. Worksheet `status`: `current`/`finished`/`planned`/`locked`. Chapter `status`: `current`/`finished`/`locked`.

### Users and authentication

| Table | Purpose |
|-------|---------|
| `users` | User accounts (username + PBKDF2 PIN hash) |
| `user_courses` | Which courses a user is enrolled in |

### Content

| Table | Purpose |
|-------|---------|
| `content_pages` | Parsed Markdown pages stored as JSONB |
| `content_assets` | Binary assets (images), content-addressed by hash. Only populated when `asset_driver: postgres` (default) — see [CONTENT_PIPELINE.md](CONTENT_PIPELINE.md#images--binary-assets) |

### Quiz (TODO, temp, will be removed from DB)

| Table | Purpose |
|-------|---------|
| `quiz_sessions` | Live quiz session (questions, current phase, current index) |
| `quiz_participants` | Students who have joined a session |
| `quiz_responses` | Individual student answer submissions |

## `content_pages` Table

```sql
CREATE TABLE content_pages (
  content_key   TEXT PRIMARY KEY,
  page_kind     TEXT NOT NULL CHECK (page_kind IN ('chapter', 'worksheet', 'practice', 'slides', 'overview')),
  subject_id    TEXT REFERENCES subjects(subject_id),
  topic_id      TEXT REFERENCES topics(topic_id),
  chapter_id    TEXT REFERENCES chapters(chapter_id),
  worksheet_id  TEXT REFERENCES worksheets(worksheet_id),
  title         TEXT NOT NULL DEFAULT '',
  source_format TEXT NOT NULL DEFAULT 'markdown',
  source_path   TEXT NOT NULL DEFAULT '',
  content_json  JSONB NOT NULL,
  content_hash  TEXT NOT NULL DEFAULT '',
  published_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

`content_key` pattern: `<kind>:<subject>:<topicId>:<chapterId>[:<worksheetId>]`, kinds are `chapter`/`worksheet`/`slides`/`practice`. Example: `worksheet:math:differenzialrechnung:sekanten:sekanten-aufgaben`.

`content_json` holds the full parsed page as a `Page` object (`src/schema/page.ts`): title + array of sections, each with markdown blocks and/or macro groups.

## Row-Level Security (RLS)

Enabled on all user-facing tables, driven by three session params set by `userSQL(user)` (`platform/db.server.ts`): `app.user_id`, `app.user_role`, `app.group_key`. `anonSQL` skips these — only for context-free ops like login lookups.

## Migrations

`sql/migrations/`, applied in lexicographic filename order (`app_schema_migrations` tracks applied versions; each runs in a transaction, all-or-nothing).

To add one: create `sql/migrations/<version>__description.sql` with idempotent SQL (`IF NOT EXISTS` etc.), run `bun run db` locally, then `bun run db:deploy` before the next production deployment.
