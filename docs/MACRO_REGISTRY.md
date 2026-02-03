# Macro System Refactor Plan

## Problem Statement

Adding a new macro currently requires modifying **6-8 files**:
1. `pipeline/pageParser/macros/[component|task]/newMacro.ts` - parser
2. `pipeline/pageParser/macros/macroRegistry.ts` - register parser
3. `src/schema/macroTypes.ts` - type definition + union
4. `src/schema/macroRegistry.ts` - add to INPUT/DISPLAY array
5. `src/features/contentpage/macros/[display|input]/NewMacro.tsx` - component
6. `src/features/contentpage/macros/registry.tsx` - register component
7. `WorksheetRenderer.tsx` - duplicate DISPLAY_MACRO_TYPES (bug!)
8. `TaskSetComponent.tsx` - switch statement for task keys (INPUT only)

**Issues:**
- Types defined twice (pipeline parser + schema)
- DISPLAY_MACRO_TYPES duplicated in WorksheetRenderer
- No single source of truth
- Easy to forget a registration step

---

## Goals

1. **Single folder per macro** - All macro code lives in one place
2. **Minimal registration** - Add new macro by creating folder, touch 1 central file
3. **Single source of truth for types** - Define type once, use everywhere
4. **Auto-derive unions and arrays** - INPUT_MACRO_TYPES, DISPLAY_MACRO_TYPES generated from metadata
5. **Remove duplicate definitions** - Eliminate WorksheetRenderer's hardcoded copy
6. **Big refactors are permitted when improving maintainability** - The software is still in alpha and not in use: Therefore no data migration is needed and big breaking changes are acceptable

---

## Proposed Architecture

### New Folder Structure

```
src/macros/
├── index.ts              # Central registry - THE ONE FILE to modify
├── types.ts              # Auto-exports: Macro union, MacroType, etc.
├── registry.ts           # Generated arrays: INPUT_MACRO_TYPES, DISPLAY_MACRO_TYPES
├── renderers.tsx         # Component registry for frontend
├── shared/
│   ├── parserUtils.ts    # defineMacro, parseRawText
│   └── componentTypes.ts # MacroComponentProps, MacroRenderContext
│
├── note/
│   ├── index.ts          # Barrel export with metadata
│   ├── types.ts          # NoteMacro type definition
│   ├── parser.ts         # Parser function
│   ├── NoteMacro.tsx     # React component
│   ├── NoteMacro.module.css  # Styles
│   ├── strings.json      # Localization
│   └── README.md         # Usage docs
│
├── gap/
│   ├── index.ts
│   ├── types.ts
│   ├── parser.ts
│   ├── GapMacro.tsx
│   ├── GapMacro.module.css
│   ├── strings.json
│   └── README.md
│
└── ... (other macros follow same pattern)
```

### Macro Folder Structure

Each macro folder contains:

**`types.ts`** - Type definition (single source of truth)
```ts
import type { Markdown } from "@schema/page";

export type NoteMacro = {
  type: "note";
  content: Markdown;
};
```

**`parser.ts`** - Pipeline parser
```ts
import { defineMacro } from "@macros/shared/parserUtils";
import { parseRawText } from "@macros/shared/parserUtils";
import type { NoteMacro } from "./types";

export const noteParser = defineMacro({
  type: "note" as const,
  parser: (node): NoteMacro => ({
    type: "note",
    content: parseRawText(node.content!, node.protectedBlocks),
  }),
});
```

**`NoteMacro.tsx`** - React component
```ts
import type { NoteMacro } from "./types";
import type { MacroComponentProps } from "@macros/shared/componentTypes";
import styles from "./NoteMacro.module.css";
import TEXT from "./strings.json";

export function NoteMacroComponent({ macro }: MacroComponentProps<NoteMacro>) {
  // ... render using styles and TEXT
}
```

**`NoteMacro.module.css`** - Colocated styles
```css
.note {
  /* styles */
}
```

**`strings.json`** - Macro-specific localization
```json
{
  "label": "Hinweis"
}
```

**`README.md`** - Usage documentation
```md
# Note Macro

Displays an informational note box.

## Syntax
\`\`\`typ
#note[
  Content here
]
\`\`\`

## Parameters
None
```

**`index.ts`** - Barrel export with metadata
```ts
export { NoteMacro } from "./types";
export { noteParser } from "./parser";
export { NoteMacroComponent as Component } from "./NoteMacro";

export const metadata = {
  type: "note" as const,
  category: "display" as const,  // or "input"
};
```

### Central Registry (`src/macros/index.ts`)

**This is the ONE file you edit when adding a new macro:**

```ts
// Import all macro modules
import * as note from "./note";
import * as highlight from "./highlight";
import * as codeRunner from "./codeRunner";
import * as table from "./table";
import * as image from "./image";
import * as gap from "./gap";
import * as mcq from "./mcq";
import * as codeTask from "./codeTask";
import * as textTask from "./textTask";
import * as mathTask from "./mathTask";

// Single registration point
export const macros = {
  note,
  highlight,
  codeRunner,
  table,
  image,
  gap,
  mcq,
  codeTask,
  textTask,
  mathTask,
} as const;

export type MacroName = keyof typeof macros;
```

### Derived Types (`src/macros/types.ts`)

Auto-generated from registry:

```ts
import { macros } from "./index";

// Extract all macro types from the registry
type MacroModules = typeof macros;
type MacroTypeFromModule<M> = M extends { metadata: { type: infer T } } ? T : never;

// Union of all macro types
export type Macro = {
  [K in keyof MacroModules]: ReturnType<MacroModules[K]["parser"]["parser"]>
}[keyof MacroModules];

// Macro type literal union
export type MacroType = Macro["type"];

// Re-export individual types for convenience
export type { NoteMacro } from "./note/types";
export type { GapMacro, GapField } from "./gap/types";
// ... etc
```

### Derived Arrays (`src/macros/registry.ts`)

```ts
import { macros } from "./index";

// Build arrays from metadata
const macroEntries = Object.values(macros);

export const INPUT_MACRO_TYPES = macroEntries
  .filter(m => m.metadata.category === "input")
  .map(m => m.metadata.type) as const;

export const DISPLAY_MACRO_TYPES = macroEntries
  .filter(m => m.metadata.category === "display")
  .map(m => m.metadata.type) as const;

export const ALL_MACRO_TYPES = [...INPUT_MACRO_TYPES, ...DISPLAY_MACRO_TYPES] as const;

// Type guards
export function isInputMacro(macro: Macro): macro is InputMacro {
  return (INPUT_MACRO_TYPES as readonly string[]).includes(macro.type);
}
```

### Component Registry (`src/macros/renderers.tsx`)

```ts
import { macros, type MacroName } from "./index";
import type { Macro } from "./types";
import type { MacroRenderContext } from "./shared/componentTypes";

// Build component map from registry
const macroComponents = Object.fromEntries(
  Object.entries(macros).map(([name, mod]) => [name, mod.Component])
) as Record<MacroName, React.ComponentType<any>>;

export function renderMacro(
  macro: Macro,
  context: MacroRenderContext,
  key?: string | number
): React.ReactNode {
  const Component = macroComponents[macro.type as MacroName];
  return <Component key={key} macro={macro} context={context} />;
}
```

### Pipeline Integration

Update pipeline to import from new location:

**`pipeline/pageParser/macros/macroRegistry.ts`**
```ts
import { macros } from "@macros/index";

// Build parser map from registry
const macroMap = Object.fromEntries(
  Object.entries(macros).map(([name, mod]) => [name, mod.parser])
);

export function parseMacroType(macro: RawMacro) {
  const definition = macroMap[macro.type];
  if (!definition) throw new Error(`Unknown macro ${macro.type}`);
  return definition.parser(macro);
}
```

---

## TSConfig Path Alias

Add to `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@macros/*": ["./src/macros/*"]
    }
  }
}
```

---

## Migration Steps

### Phase 1: Create New Structure
- [ ] Create `src/macros/` folder
- [ ] Create `src/macros/shared/` with parser utilities
- [ ] Create `src/macros/shared/componentTypes.ts`

### Phase 2: Migrate Macros (one at a time)
For each macro:
- [ ] Create `src/macros/[name]/` folder
- [ ] Move type from `schema/macroTypes.ts` to `src/macros/[name]/types.ts`
- [ ] Move parser from `pipeline/` to `src/macros/[name]/parser.ts`
- [ ] Move component from `features/contentpage/macros/` to `src/macros/[name]/`
- [ ] Create `src/macros/[name]/index.ts` with metadata

### Phase 3: Update Registries
- [ ] Create `src/macros/index.ts` with all imports
- [ ] Create `src/macros/types.ts` with union export
- [ ] Create `src/macros/registry.ts` with derived arrays
- [ ] Create `src/macros/renderers.tsx` with component map

### Phase 4: Update All Imports (Find & Replace)
- [ ] Replace all `@schema/macroTypes` → `@macros/types`
- [ ] Replace all `@schema/macroRegistry` → `@macros/registry`
- [ ] Replace all `@features/contentpage/macros/registry` → `@macros/renderers`
- [ ] Update `WorksheetRenderer.tsx` - import from `@macros/registry`
- [ ] Update `TaskSetComponent.tsx` - use registry lookup instead of switch

### Phase 5: Delete Old Files (Clean Break)
- [ ] Delete `src/schema/macroTypes.ts`
- [ ] Delete `src/schema/macroRegistry.ts`
- [ ] Delete `pipeline/pageParser/macros/components/` folder
- [ ] Delete `pipeline/pageParser/macros/tasks/` folder
- [ ] Delete `pipeline/pageParser/macros/macroDefinition.ts`
- [ ] Delete `src/features/contentpage/macros/display/` folder
- [ ] Delete `src/features/contentpage/macros/input/` folder
- [ ] Delete `src/features/contentpage/macros/registry.tsx`
- [ ] Delete `src/features/contentpage/macros/types.ts`

### Phase 6: Update Documentation
- [ ] Update `docs/ARCHITECTURE.md` with macro system section
- [ ] Add `@macros/*` to path aliases table
- [ ] Update directory structure diagram
- [ ] Update import rules table

---

## Adding a New Macro (After Refactor)

**Step 1:** Create folder `src/macros/newMacro/` with these files:

```
src/macros/newMacro/
├── index.ts              # Exports + metadata
├── types.ts              # Type definition
├── parser.ts             # Pipeline parser
├── NewMacro.tsx          # React component
├── NewMacro.module.css   # Styles
├── strings.json          # Localization
└── README.md             # Usage documentation
```

**Step 2:** Add one import to `src/macros/index.ts`:
```ts
import * as newMacro from "./newMacro";
// ...
export const macros = {
  // ...existing
  newMacro,  // ← ADD THIS LINE
};
```

**Done!** Everything else is auto-derived.

---

## Documentation Updates (ARCHITECTURE.md)

### 1. Add to Directory Structure

Update the tree to include `macros/`:

```txt
├── src/
│   ├── app/
│   ├── features/
│   ├── macros/           # Macro system (types, parsers, components)
│   ├── ui/
│   ├── schema/
│   └── server/
```

### 2. Add Path Alias

Add to the Path Aliases table:

```
| `@macros/*`        | `./src/macros/*`          |
```

### 3. Add New Section: "Macro System"

Add after "Content Pipeline" section:

```md
## Macro System

Macros are the building blocks for interactive content. Each macro is self-contained in `src/macros/[name]/`.

### Macro Structure

\`\`\`txt
src/macros/
├── index.ts          # Central registry
├── types.ts          # Union type exports
├── registry.ts       # INPUT/DISPLAY arrays
├── renderers.tsx     # React component registry
├── shared/           # Shared utilities
└── [macroName]/      # One folder per macro
    ├── index.ts
    ├── types.ts
    ├── parser.ts
    ├── Component.tsx
    ├── Component.module.css
    ├── strings.json
    └── README.md
\`\`\`

### Macro Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| Display  | Stateless rendering | note, highlight, codeRunner, table, image |
| Input    | Persist user responses | gap, mcq, codeTask, textTask, mathTask |

### Adding a New Macro

1. Create folder `src/macros/[name]/` with required files
2. Add import to `src/macros/index.ts`

See `src/macros/note/README.md` for a complete example.
```

### 4. Update Import Rules Table

Add macros to the import rules:

```
| From ↓ \ To → | app/ | features/ | ui/ | macros/ | schema/ | server/ |
| **macros/**   | ✗    | ✗         | ✗   | ✓       | ✓       | ✗       |
```

Macros can only import from themselves and schema (for Markdown type).

---

## Verification

- [ ] All 10 existing macros work after migration
- [ ] Pipeline builds without errors
- [ ] Frontend renders all macros correctly
- [ ] Type checking passes
- [ ] WorksheetRenderer uses imported DISPLAY_MACRO_TYPES
- [ ] Adding test macro only requires 1 folder + 1 line change

---

## Files Summary

### NEW FILES (Create)
| File | Purpose |
|------|---------|
| `src/macros/index.ts` | Central registry |
| `src/macros/types.ts` | Union type exports |
| `src/macros/registry.ts` | INPUT/DISPLAY arrays, type guards |
| `src/macros/renderers.tsx` | renderMacro() function |
| `src/macros/shared/parserUtils.ts` | defineMacro, parseRawText, etc. |
| `src/macros/shared/componentTypes.ts` | MacroComponentProps, MacroRenderContext |
| `src/macros/[name]/index.ts` | Barrel export per macro (x10) |
| `src/macros/[name]/types.ts` | Type definition per macro (x10) |
| `src/macros/[name]/parser.ts` | Parser per macro (x10) |
| `src/macros/[name]/[Name]Macro.tsx` | Component per macro (x10) |
| `src/macros/[name]/[Name]Macro.module.css` | Colocated styles (x10) |
| `src/macros/[name]/strings.json` | Macro-specific localization (x10) |
| `src/macros/[name]/README.md` | Usage documentation (x10) |

### DELETE FILES (Clean Break)
| File | Reason |
|------|--------|
| `pipeline/pageParser/macros/macroRegistry.ts` | Replaced by `@macros/index` |
| `pipeline/pageParser/macros/macroDefinition.ts` | Moved to shared |
| `pipeline/pageParser/macros/components/*.ts` | Moved to macro folders |
| `pipeline/pageParser/macros/tasks/*.ts` | Moved to macro folders |
| `src/schema/macroTypes.ts` | Replaced by `@macros/types` |
| `src/schema/macroRegistry.ts` | Replaced by `@macros/registry` |
| `src/features/contentpage/macros/registry.tsx` | Replaced by `@macros/renderers` |
| `src/features/contentpage/macros/types.ts` | Moved to shared |
| `src/features/contentpage/macros/display/*.tsx` | Moved to macro folders |
| `src/features/contentpage/macros/display/*.module.css` | Moved to macro folders |
| `src/features/contentpage/macros/input/*.tsx` | Moved to macro folders |
| `src/features/contentpage/macros/input/*.module.css` | Moved to macro folders |

### UPDATE FILES (Extract Content)
| File | Change |
|------|--------|
| `src/features/contentpage/contentpage.de.json` | Extract macro strings to per-macro strings.json |

### UPDATE FILES (Fix Imports)
| File | Change |
|------|--------|
| `pipeline/pageParser/parseContent.ts` | Import from `@macros` |
| `pipeline/pageParser/parseMacro.ts` | Import from `@macros` |
| `src/features/contentpage/renderers/*.tsx` | Import from `@macros` |
| `src/features/contentpage/components/Group/*.tsx` | Import from `@macros` |
| Any file importing `@schema/macroTypes` | Change to `@macros/types` |
| Any file importing `@schema/macroRegistry` | Change to `@macros/registry` |
