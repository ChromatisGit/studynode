# StudyNode Architecture

This document describes the architecture of the StudyNode educational web platform.

## Overview

StudyNode is a Next.js web application for interactive learning content. It features:

* Course management with topics, chapters, worksheets
* Interactive worksheets with various macro types (MCQ, gap fill, code tasks)
* Admin dashboard for course management
* Content pipeline that processes `.typ` files into JSON

**Database direction:** PostgreSQL is the source of truth for course metadata/structure, access control (RLS), and DTO shapes (views). The pipeline still produces page/worksheet content JSON.

---

## Technology Stack

| Layer     | Technology                                                                 |
| --------- | ---------------------------------------------------------------------------|
| Framework | Next.js (App Router + Turbopack)                                           |
| Language  | TypeScript (strict mode)                                                   |
| Styling   | CSS Modules                                                                |
| Database  | PostgreSQL via raw SQL (`postgres` locally + `@vercel/postgres` on Vercel) |
| Runtime   | Bun                                                                        |
| Auth      | Custom HttpOnly session cookies + DB rate limiting                         |

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
│   ├── schema/           # Shared type definitions + generated DB/view types
│   └── server/
│       ├── actions/      # Server actions ("use server")
│       ├── services/     # Business logic + orchestration
│       ├── queries/      # Raw SQL queries + tx wrapper + RLS context setter
│       ├── lib/          # Server utilities (cookies, crypto wrappers, etc.)
│       └── config/       # Server configuration
├── pipeline/             # Content processing pipeline
│   ├── configParser/
│   ├── dataTransformer/
│   ├── pageParser/
│   │   └── macros/
│   ├── errorHandling/
│   └── types.ts
├── .generated/           # Pipeline output (JSON content files + seed SQL)
└── docs/
```

---

## Layer Architecture

### Dependency Diagram

```txt
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   app/  ──────────► features/  ──────────► ui/components/   │
│    │                    │                      │            │
│    │                    │                      │            │
│    ▼                    ▼                      ▼            │
│  server/actions     ui/contexts            schema/          │
│        │                                        │           │
│        ▼                                        ▼           │
│  server/services ───────────────► server/queries (SQL)      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Import Rules

| From ↓ \ To → | app/       | features/ | ui/        | macros/    | schema/    | server/            |
| ------------- | ---------- | --------- | ---------- | ---------- | ---------- | ------------------ |
| **app/**      | ✓ internal | ✓         | ✓          | ✓          | ✓          | ✓ actions/services |
| **features/** | ✗          | ✗         | ✓          | ✓          | ✓          | ✗                  |
| **ui/**       | ✗          | ✗         | ✓ internal | ✗          | ✓          | ✗                  |
| **macros/**   | ✗          | ✓         | ✓          | ✓ internal | ✓          | ✗                  |
| **schema/**   | ✗          | ✗         | ✗          | ✗          | ✓ internal | ✗                  |
| **server/**   | ✗          | ✗         | ✗          | ✗          | ✓          | ✓ internal         |
Key rules:

* **Features cannot cross-import**: `features/A` cannot import from `features/B`
* **Features cannot access server**: only `app/` can call server actions and services
* **Schema is pure**: no runtime dependencies, only type definitions

---

## Server Layer Architecture

```txt
actions/ ──► services/ ──► queries/ ──► Postgres
                   │
                   ▼
             .generated/ (content JSON)
```

* **actions/**: Server actions with `"use server"` directive
* **services/**: orchestration + business rules + composition of queries
* **queries/**: raw SQL, transaction wrapper, RLS context setter, typed view queries
* **.generated/**: page/worksheet content JSON (read-only)
* **.generatedScripts/**: generated seed scripts

---

## Database Architecture

### Domain model

* **Definitions (reusable):** `topics`, `chapters`, `worksheets`
* **Course metadata:** `groups`, `subjects`, `course_variants`, `courses`
* **Course structure (course-specific):** `course_topics`, `course_chapters`, `course_worksheets`

### RLS

RLS is enabled on domain tables that represent user-facing data:

* `courses`, `course_topics`, `course_chapters`, `course_worksheets`
* `users`, `user_courses`
* definition tables can be readable by all (`topics`, `chapters`, `worksheets`), still under RLS for consistent access rules

---

## Path Aliases

| Alias              | Target                    |
| ------------------ | ------------------------- |
| `@app/*`           | `./src/app/*`             |
| `@ui/*`            | `./src/ui/*`              |
| `@components/*`    | `./src/ui/components/*`   |
| `@features/*`      | `./src/features/*`        |
| `@schema/*`        | `./src/schema/*`          |
| `@macros/*`        | `./src/macros/*`          |
| `@actions/*`       | `./src/server/actions/*`  |
| `@services/*`      | `./src/server/services/*` |
| `@queries/*`       | `./src/server/queries/*`  |
| `@server-lib/*`    | `./src/server/lib/*`      |
| `@server/config/*` | `./src/server/config/*`   |
| `@pipeline/*`      | `./pipeline/*`            |
| `@generated/*`     | `./.generated/*`          |

---

## Features

### Homepage (`features/homepage/`)

Landing page with hero section, about section, course listing, and footer.

### Coursepage (`features/coursepage/`)

Course overview with roadmap navigation showing topics, chapters, and worksheets.

### Contentpage (`features/contentpage/`)

Content rendering system with:

* Renderers: `ContentPageRenderer` (read-only) and `WorksheetRenderer` (interactive)
* Macro system: Extensible content components
* Task macros: Interactive exercises
* Storage: localStorage-based persistence with content signature invalidation

### Admin (`features/admin/`)

Admin dashboard for course management:

* Course overview with statistics
* Progress control (moves current chapter/topic via `update_course_progress`)
* Registration window management
* Worksheet visibility toggling (`is_hidden`)

### Access (`features/access/`)

Authentication flow:

* Login with access code + PIN
* Course join with registration
* Access code confirmation modal

### Practise (`features/practise/`)

Practice mode for exercises (stub implementation).

---

## Macro System

Macros are the building blocks for content rendering. They handle both display (note, highlight, image, table, codeRunner) and input (gap, mcq, codeTask, textTask, mathTask) content types.

### Architecture

The macro system is split between client and server:

```txt
src/macros/
├── registry.tsx              # Client-side: types, components, renderMacro()
├── shared/
│   ├── componentTypes.ts     # MacroRenderContext, MacroComponentProps
│   ├── textUtils.ts          # getMarkdown()
│   ├── taskKeyUtils.ts       # normalizeTaskKey()
│   └── codeLanguage.ts       # CodeLanguage type
├── note/
│   ├── types.ts              # NoteMacro type
│   ├── parser.ts             # Parser (server-only)
│   ├── Renderer.tsx          # React component
│   └── styles.module.css     # Styles
└── ... (other macros)

pipeline/pageParser/macros/
└── macroRegistry.ts          # Server-side: parseMacroType()
```

**Why the split?** Parsers may use Node-only modules (e.g., `fs` for image dimensions). The client registry only imports types and components, keeping the bundle browser-safe.

### Adding a New Macro

**Step 1:** Create folder `src/macros/[name]/` with:

| File | Purpose |
|------|---------|
| `types.ts` | Type definition with `type: "[name]"` discriminant |
| `parser.ts` | Parser using `defineMacro()` from pipeline |
| `Renderer.tsx` | React component (default export) |
| `styles.module.css` | Styles (optional) |

**Step 2:** Update `src/macros/registry.tsx`:

```tsx
// Add type import
import type { NewMacro } from "./newMacro/types";

// Add component import
import NewMacroRenderer from "./newMacro/Renderer";

// Add to Macro union
export type Macro = ... | NewMacro;

// Add to macros object
const macros = {
  ...
  newMacro: { Component: NewMacroRenderer, category: "display" as const },
};
```

**Step 3:** Update `pipeline/pageParser/macros/macroRegistry.ts`:

```ts
import { parser as newMacroParser } from "@macros/newMacro/parser";

const parserMap: Map<string, ParserDef> = new Map([
  ...
  ["newMacro", newMacroParser],
] as [string, ParserDef][]);
```

### Macro Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| `display` | Stateless rendering | note, highlight, codeRunner, table, image |
| `input` | Persist user responses | gap, mcq, codeTask, textTask, mathTask |

Input macros receive `MacroRenderContext` with `persistState`, `storageKey`, `taskNumber`, and `checkTrigger` for worksheet integration.

---

## Content Pipeline

The pipeline processes educational content from `.typ` files into JSON.

### Pipeline Flow

```txt
runPipeline()
    │
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
├── scripts/
│   └── courses.sql               # generated seed/rebuild SQL
└── {subjectId}/
    └── {topicId}/
        ├── {chapterId}.json
        └── {chapterId}/
            └── {worksheetId}.json
```

---

## Key Decisions (updated)

| Decision                             | Description                                                         |
| ------------------------------------ | ------------------------------------------------------------------- |
| No cross-feature imports             | Features are isolated; shared UI in `ui/`                           |
| Server actions only from app/        | App routes call actions/services; features stay UI-only             |
| Raw SQL over ORM                     | Full control, simple stack, predictable performance                 |
| PostgreSQL as source of truth        | Course structure + access + DTO shape live in DB                    |
| RLS for domain tables                | Isolation enforced at DB level with request context                 |
| No RLS for technical tables          | `auth_attempts` + `audit_log` are not user-facing domain data       |
| DTOs from SQL views                  | View schema defines DTO shape; TS types are generated               |
| Junction status is truth             | `status='current'` determines current; no duplicate current columns |
| Rebuild per course preserves current | Save current → rebuild junctions → restore or fallback              |
| Pooling-safe context                 | `set_config(..., true)` + per-request transaction (`withTx`)        |
| Cookies, not JWT                     | HttpOnly session cookies; services set tx-local context             |


