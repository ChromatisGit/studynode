# StudyNode Architecture

StudyNode is a Next.js educational platform. This document covers the key architectural decisions, data flow, and conventions that apply across the codebase.

---

## Technology Stack

| Layer     | Technology                                                              |
| --------- | ----------------------------------------------------------------------- |
| Framework | Next.js (App Router + Turbopack)                                        |
| Language  | TypeScript (strict mode)                                                |
| Styling   | CSS Modules                                                             |
| Database  | PostgreSQL via raw SQL (`postgres` locally + `@vercel/postgres` on Vercel) |
| Runtime   | Bun                                                                     |
| Auth      | Custom HttpOnly session cookies + SQL-based rate limiting               |

---

## Directory Structure

```txt
website/
├── src/
│   ├── app/              # Next.js routes, layouts, data fetching
│   ├── features/         # Page-level UI slices (domain-specific)
│   ├── macros/           # Macro system (types, parsers, components)
│   ├── ui/               # Shared UI system
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── layout/
│   │   ├── lib/
│   │   └── styles/
│   ├── schema/           # Shared type definitions (pipeline/rendering types)
│   └── server/
│       ├── actions/      # Server actions ("use server")
│       ├── services/     # Business logic + orchestration
│       ├── db/           # tx.ts + runSQL.ts — the only files importing raw sql
│       ├── lib/          # Server utilities (cookies, crypto, etc.)
│       ├── providers/    # Content JSON loaders (page, practice, slide)
├── pipeline/             # Content processing pipeline
│   ├── configParser/
│   ├── dataTransformer/
│   ├── pageParser/
│   │   └── macros/
│   ├── errorHandling/
│   └── types.ts
├── scripts/
│   ├── schema.sql        # Full DB schema (run to reset DB)
│   ├── seed.ts           # Seeds course data from pipeline output
│   ├── functions/        # SQL functions (\ir'd by schema.sql)
│   └── views/            # SQL views (\ir'd by schema.sql)
├── .generated/           # Pipeline output (JSON content files)
└── docs/
```

---

## Layer Architecture

```txt
app/ ──────────► features/ ──────────► ui/components/
 │                   │
 ▼                   ▼
server/actions   ui/contexts
     │
     ▼
server/services ──► server/providers (content JSON)
     │
     ▼
  Postgres (via anonSQL / userSQL)
```

### Import Rules

| From ↓ \ To → | app/       | features/ | ui/        | macros/    | schema/    | server/            |
| -------------- | ---------- | --------- | ---------- | ---------- | ---------- | ------------------ |
| **app/**       | ✓ internal | ✓         | ✓          | ✓          | ✓          | ✓ actions/services |
| **features/**  | ✗          | ✗         | ✓          | ✓          | ✓          | ✗                  |
| **ui/**        | ✗          | ✗         | ✓ internal | ✗          | ✓          | ✗                  |
| **macros/**    | ✗          | ✓         | ✓          | ✓ internal | ✓          | ✗                  |
| **schema/**    | ✗          | ✗         | ✗          | ✗          | ✓ internal | ✗                  |
| **server/**    | ✗          | ✗         | ✗          | ✗          | ✓          | ✓ internal         |

Key rules:

* **Features cannot cross-import**: `features/A` cannot import from `features/B`
* **Features cannot access server**: only `app/` calls server actions and services
* **Schema is pure**: no runtime dependencies, only type definitions
* All boundaries are enforced by EsLint Rules
---

## Server Layer

### Three Layers, One Responsibility Each

```
Action  = security boundary (auth checks, session gate)
Service = business logic (orchestration, validation, composition)
Database = data + RLS safety net (views, SQL functions, access control)
```

### DB Access: `anonSQL` and `userSQL`

Every service function is one SQL call. Two helpers in `src/server/db/runSQL.ts` hide the transaction callback:

```typescript
// Anonymous context — public reads, SECURITY DEFINER calls, login
export const anonSQL: Tx;

// User RLS context — sets app.user_id / app.user_role / app.group_key
export function userSQL(user: UserCtx): Tx;
```

Usage:

```typescript
// Single query, anon context
const rows = await anonSQL<CourseRow[]>`SELECT * FROM v_course_dto WHERE id = ${courseId}`;

// Single query, user RLS context
const rows = await userSQL(user)<TaskRow[]>`SELECT * FROM task_responses WHERE ...`;

// Complex aggregation via SQL function
const rows = await userSQL(user)<{ get_progress_dto: ProgressDTO }[]>`
  SELECT get_progress_dto(${courseId})
`;
```

`withAnonTx(callback)` and `withUserTx(user, callback)` from `db/tx.ts` are still available for the rare case of **genuine multi-statement atomicity** (e.g., `getAuthenticatedUser` must check rate limits → look up user → clear buckets in one transaction).

### Transaction Wrappers (`src/server/db/tx.ts`)

The only file allowed to import the raw `postgres` connection. Exports:

| Wrapper | When to use |
|---|---|
| `withUserTx(user, fn)` | Authenticated multi-statement transactions — sets `app.user_id`, `app.user_role`, `app.group_key` |
| `withAnonTx(fn)` | Anonymous/bootstrap multi-statement transactions — sets all context to NULL |

RLS policies are fail-safe: `current_setting('app.user_id', true)` returns NULL when unset → all policies return empty results rather than all rows.

### Service Files

| File | Responsibility |
|---|---|
| `courseService.ts` | All course-related: metadata, progress tree, topics, worksheets, navbar, sidebar, registration window |
| `authService.ts` | Session, login/logout, access control helpers (`isAdmin`, `assertLoggedIn`, etc.) |
| `userService.ts` | User creation, enrollment, `UserDTO` type definition |
| `worksheetService.ts` | Task + checkpoint response storage |
| `pageService.ts` | Content JSON loading (delegates to pageProvider, no DB) |
| `practiceService.ts` | Practice task loading (no DB) |
| `slideService.ts` | Slide deck loading (no DB) |

---

## Database Architecture

### Domain Model

* **Definitions (reusable):** `topics`, `chapters`, `worksheets`
* **Course metadata:** `groups`, `subjects`, `course_variants`, `courses`
* **Course structure (course-specific):** `course_topics`, `course_chapters`, `course_worksheets`
* **User responses:** `task_responses`, `checkpoint_responses`
* **Audit/analytics:** `log_audit` (and future `log_*` tables)

The `log_` prefix marks tables that are write-only audit sinks — no RLS policies, INSERT-only via SECURITY DEFINER.

### SQL Views (DTOs)

Views define the DTO shape. TypeScript row types are written manually, co-located with the SQL that reads the view.

| View | Purpose |
|---|---|
| `v_course_dto` | Course metadata + group/subject keys |
| `v_progress_dto` | Per-course topic/chapter progress with statuses |
| `v_worksheets_by_chapter` | Worksheets grouped by chapter, respecting `is_hidden` |
| `v_user_dto` | User with aggregated course IDs |

### SQL Aggregation Functions

Complex data transformations live in the database, not TypeScript:

| Function | Returns | Purpose |
|---|---|---|
| `get_progress_dto(course_id)` | `JSONB` | Full nested progress tree: topics → chapters → worksheets |
| `get_course_access_groups()` | `JSONB` | Courses classified by access: `{ public, accessible, restricted, hidden }` |

postgres.js auto-parses JSONB columns — no `JSON.parse()` needed in TypeScript.

### SECURITY DEFINER Functions

Privileged operations that bypass RLS:

| Function | Called from |
|---|---|
| `get_session_user(user_id)` | `getUserById` (session bootstrap) |
| `get_user_for_login(access_code)` | `getAuthenticatedUser` |
| `get_user_access_code(user_id)` | `getUserAccessCodeById` |
| `create_user_account(...)` | `createUser` (atomic: generates code + inserts) |
| `enroll_user_in_course(...)` | `addCourseToUser` |
| `update_course_progress(...)` | `setCourseProgress` |
| `set_registration_open_until(...)` | `openRegistration`, `closeRegistration` |
| `check_and_record_attempt(...)` | `getAuthenticatedUser` (rate limiting) |
| `generate_access_code()` | `createUser` |

### RLS

Enabled on all domain tables. Key policies:

* `courses_listed_read`: all listed courses readable in any context (`is_listed = true`) — powers the homepage course directory without requiring auth
* `courses_public`: public courses readable by anyone
* `courses_user_enrolled`: enrolled users can read their courses
* `courses_admin_all`: admins read all
* Response tables: users read/write their own rows only

---

## Data Flow Examples

### Page Load (authenticated course page)

```
app/[group]/[course]/layout.tsx
  → getSession()               # reads HttpOnly cookie → withAnonTx → get_session_user()
  → getCourseId(group, course)  # anonSQL → v_course_dto
  → getCourseDTO(courseId)      # anonSQL → v_course_dto
  → getSidebarDTO(courseId, user)
      → userSQL(user) → SELECT id, label, slug FROM v_course_dto WHERE ...  (navbar courses)
      → userSQL(user) → SELECT get_progress_dto(courseId)                   (progress tree)
      → withAnonTx    → SELECT get_user_access_code(userId)                 (access code display)
```

### Worksheet Save (fire-and-forget)

```
WorksheetStorageContext (client)
  → localStorage write (instant)
  → saveTaskResponseAction (server action, "use server")
      → getSession()
      → userSQL(user)`INSERT INTO task_responses ... ON CONFLICT DO UPDATE`
```

### Login Flow

```
continueAccessAction (server action)
  → getAuthenticatedUser(code, pin, ip)
      → withAnonTx (one atomic transaction):
          → check_and_record_attempt(ipKey, false)    # rate limit check
          → check_and_record_attempt(codeKey, false)  # rate limit check
          → get_user_for_login(code)                  # SECURITY DEFINER
          → verifyPin(pin, hash)                      # argon2
          → check_and_record_attempt(*, true)         # clear on success
  → setSessionCookie(user.id)
```

---

## Content Pipeline

The pipeline processes `.typ` educational content files into JSON.

### Pipeline Flow

```
runPipeline()
    ├── loadConfigs()
    ├── buildPagePaths()
    ├── buildChapterContent()
    │       └── parsePage()
    ├── getTopicLabels()
    └── resolveCourses()
```

### Output Structure

```txt
.generated/
└── {subjectId}/
    └── {topicId}/
        ├── {chapterId}.json
        └── {chapterId}/
            └── {worksheetId}.json

.generatedScripts/
└── courses.sql    # generated seed/rebuild SQL for normalized schema
```

The pipeline outputs are read-only at runtime — `pageService.ts`, `practiceService.ts`, and `slideService.ts` load them via providers in `src/server/providers/`.

---

## Macro System

Macros are the building blocks of content rendering. They handle both display and input types.

### Architecture

```txt
src/macros/
├── registry.tsx              # Client-side: types, components, renderMacro()
├── shared/
│   ├── componentTypes.ts     # MacroRenderContext, MacroComponentProps
│   ├── textUtils.ts          # getMarkdown()
│   ├── taskKeyUtils.ts       # normalizeTaskKey()
│   └── codeLanguage.ts       # CodeLanguage type
└── [name]/
    ├── types.ts              # MacroType with "type" discriminant
    ├── parser.ts             # Parser (server/pipeline only)
    ├── Renderer.tsx          # React component
    └── styles.module.css

pipeline/pageParser/macros/
└── macroRegistry.ts          # Server-side: parseMacroType()
```

**Why the split?** Parsers may use Node-only modules (e.g., `fs` for image dimensions). The client registry only imports types and components.

### Macro Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `display` | Stateless rendering | note, highlight, codeRunner, table, image |
| `input` | Persist user responses | gap, mcq, codeTask, textTask, mathTask |

### Adding a New Macro

**Step 1:** Create `src/macros/[name]/` with `types.ts`, `parser.ts`, `Renderer.tsx`.

**Step 2:** Register in `src/macros/registry.tsx`:
```tsx
import type { NewMacro } from "./newMacro/types";
import NewMacroRenderer from "./newMacro/Renderer";
export type Macro = ... | NewMacro;
const macros = { ..., newMacro: { Component: NewMacroRenderer, category: "display" as const } };
```

**Step 3:** Register in `pipeline/pageParser/macros/macroRegistry.ts`:
```ts
import { parser as newMacroParser } from "@macros/newMacro/parser";
parserMap.set("newMacro", newMacroParser);
```

---

## Key Decisions

| Decision | Rationale |
|---|---|
| `anonSQL` / `userSQL` over callback wrappers | One SQL call per service function — no indirection, no boilerplate |
| No ORM | Full control, predictable performance, SQL is the right abstraction for relational data |
| PostgreSQL as source of truth | Course structure, access control, and DTO shape live in the DB |
| SQL functions for complex reads | `get_progress_dto()` and `get_course_access_groups()` — tree building and classification belong in the DB |
| Manual types over code generation | Explicit, non-nullable, named for their purpose — co-located with the SQL that produces them |
| RLS fail-safe | NULL context → empty results (not all rows). Cannot accidentally expose data. |
| `log_` prefix for audit tables | Write-only sinks with no RLS; always INSERT via SECURITY DEFINER |
| HttpOnly cookies, not JWT | Session stored server-side, no client-side token handling |
| localStorage write-through | Worksheet saves hit localStorage first, then DB fire-and-forget; DB is authoritative on load |
| No cross-feature imports | Features are isolated; shared UI in `ui/` |
| Actions = security, Services = business logic | Actions are the `"use server"` RPC boundary; services are private internal logic |

---

## Path Aliases

| Alias              | Target                      |
| ------------------ | --------------------------- |
| `@app/*`           | `./src/app/*`               |
| `@ui/*`            | `./src/ui/*`                |
| `@components/*`    | `./src/ui/components/*`     |
| `@features/*`      | `./src/features/*`          |
| `@schema/*`        | `./src/schema/*`            |
| `@macros/*`        | `./src/macros/*`            |
| `@actions/*`       | `./src/server/actions/*`    |
| `@db/*`            | `./src/server/db/*`         |
| `@services/*`      | `./src/server/services/*`   |
| `@server-lib/*`    | `./src/server/lib/*`        |
| `@server/config/*` | `./src/server/config/*`     |
| `@providers/*`     | `./src/server/providers/*`  |
| `@generated/*`     | `./.generated/*`            |
| `@pipeline/*`      | `./pipeline/*`              |
