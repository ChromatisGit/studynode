# StudyNode Architecture

This document describes the architecture of the StudyNode educational web platform.

## Overview

StudyNode is a Next.js web application for interactive learning content. It features:

- Course management with topics and chapters
- Interactive worksheets with various macro types (MCQ, gap fill, code tasks)
- Admin dashboard for course management
- Content pipeline that processes `.typ` files into JSON

## Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router + Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | CSS Modules |
| Database | PostgreSQL via raw SQL (`postgres` + `@vercel/postgres`), manual row types (no ORM) |
| Runtime | Bun |
| Auth | Custom session cookies |

## Directory Structure

```txt
website/
├── src/
│   ├── app/           # Next.js routes, layouts, data fetching
│   ├── features/      # Page-level UI slices (domain-specific)
│   ├── ui/            # Shared UI system
│   │   ├── components/   # Reusable / shared components
│   │   ├── contexts/     # React contexts
│   │   ├── layout/       # Layout shell (Navbar, Sidebar, Breadcrumbs)
│   │   ├── lib/          # UI utilities and hooks
│   │   └── styles/       # Global styles and tokens
│   ├── schema/        # Shared type definitions and DTOs
│   └── server/        # Server-only code
│       ├── actions/      # Server actions ("use server")
│       ├── services/     # Business logic
│       ├── repo/         # Repository facades (dev/prod switch)
│       ├── db/           # Production database implementations (raw SQL)
│       ├── dev/          # Development file-based implementations
│       ├── providers/    # Static data providers
│       ├── lib/          # Server utilities
│       └── config/       # Server configuration
├── pipeline/          # Content processing pipeline
│   ├── configParser/     # Course config loading
│   ├── dataTransformer/  # Data transformation
│   ├── pageParser/       # .typ file parsing
│   │   └── macros/       # Macro definitions
│   │       ├── components/
│   │       └── tasks/
│   ├── errorHandling/    # Error collection and formatting
│   └── types.ts          # Pipeline-only types
├── .generated/        # Pipeline output (JSON content files)
└── docs/              # Documentation
```

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
│                     ui/layout                               │
│                     ui/lib                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Import Rules

| From ↓ \ To → | app/       | features/ | ui/        | schema/    | server/           |
| ------------- | ---------- | --------- | ---------- | ---------- | ----------------- |
| **app/**      | ✓ internal | ✓         | ✓          | ✓          | ✓ actions/services |
| **features/** | ✗          | ✗         | ✓          | ✓          | ✗                 |
| **ui/**       | ✗          | ✗         | ✓ internal | ✓          | ✗                 |
| **schema/**   | ✗          | ✗         | ✗          | ✓ internal | ✗                 |
| **server/**   | ✗          | ✗         | ✗          | ✓          | ✓ internal        |

Key rules:

* **Features cannot cross-import**: `features/A` cannot import from `features/B`
* **Features cannot access server**: only `app/` can call server actions and services (not lib/repo/db)
* **Schema is pure**: no runtime dependencies, only type definitions

### Server Layer Architecture

```txt
actions/ ──► services/ ──► repo/ ──► db/
                │           │
                ▼           ▼
           providers/     dev/
```

* **actions/**: Server actions with `"use server"` directive
* **services/**: Business logic, DTO builders
* **repo/**: Repository facades that switch between db/ and dev/ based on `NODE_ENV`
* **db/**: Production implementations using raw SQL with PostgreSQL
* **dev/**: Development implementations using JSON files in `.data/`
* **providers/**: Static data providers reading from `.generated/`

## Path Aliases

| Alias              | Target                     |
| ------------------ | -------------------------- |
| `@app/*`           | `./src/app/*`              |
| `@ui/*`            | `./src/ui/*`               |
| `@components/*`    | `./src/ui/components/*`    |
| `@features/*`      | `./src/features/*`         |
| `@schema/*`        | `./src/schema/*`           |
| `@actions/*`       | `./src/server/actions/*`   |
| `@services/*`      | `./src/server/services/*`  |
| `@repo/*`          | `./src/server/repo/*`      |
| `@db/*`            | `./src/server/db/*`        |
| `@dev/*`           | `./src/server/dev/*`       |
| `@providers/*`     | `./src/server/providers/*` |
| `@server-lib/*`    | `./src/server/lib/*`       |
| `@server/config/*` | `./src/server/config/*`    |
| `@pipeline/*`      | `./pipeline/*`             |
| `@generated/*`     | `./.generated/*`           |

## Features

### Homepage (`features/homepage/`)

Landing page with hero section, about section, course listing, and footer.

### Coursepage (`features/coursepage/`)

Course overview with roadmap navigation showing topics, chapters, and worksheets.

Shared components used by Coursepage (e.g. **Roadmap**, **WorksheetCards**) live in `ui/components/` to respect the no cross-feature import rule.

### Contentpage (`features/contentpage/`)

Content rendering system with:

* **Renderers**: `ContentPageRenderer` (read-only) and `WorksheetRenderer` (interactive)
* **Macro system**: Extensible content components (notes, tables, images, code runners)
* **Task macros**: Interactive exercises (MCQ, gap fill, text tasks, code tasks)
* **Storage**: localStorage-based persistence with content signature invalidation

### Admin (`features/admin/`)

Admin dashboard for course management:

* Course overview with statistics
* Chapter progress control
* Registration window management

### Access (`features/access/`)

Authentication flow:

* Login with access code + PIN
* Course join with registration
* Access code confirmation modal

### Practise (`features/practise/`)

Practice mode for exercises (stub implementation).

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
├── config/
│   └── courses.json
└── {subjectId}/
    └── {topicId}/
        ├── {chapterId}.json
        └── worksheets/
            └── {worksheetId}.json
```

## Key Decisions

| Decision                       | Rationale                                  |
| ------------------------------ | ------------------------------------------ |
| No cross-feature imports       | Maintain feature isolation                 |
| `ui/` as shared boundary       | Single source for reusable UI              |
| Server actions only from app/  | Proper separation of concerns              |
| Repository facade pattern      | Dev/prod parity without code duplication   |
| Raw SQL over ORM               | Simpler, faster, full control over queries |
| Bun runtime everywhere         | Unified tooling, faster startup            |
| Content signature invalidation | Handle content updates gracefully          |
| CSS Modules over CSS-in-JS     | Performance, familiar patterns             |
