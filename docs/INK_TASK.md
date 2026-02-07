## Ink Task Macro Architecture Plan

### Guiding principles

1. **Macro-first integration**
   `#ink` is a task macro in `.typ` files and flows through the same parser, schema, and renderer as `#textTask`, `#mcq`, and `#gap`.

2. **Inline stays lightweight; editing happens full-screen**
   The worksheet view never initializes the drawing engine. The editor is loaded only when the user opens it.

3. **Persist vectors, not pixels**
   Store the drawing document as JSON. Thumbnails are derived artifacts.

4. **WorksheetStorage is the local source of truth**
   Save ink answers using the same local persistence layer as other task macros.

5. **Deterministic writes**
   The local value is a single JSON blob; last-write-wins is acceptable for v1.

6. **Versioned schema**
   Every stored answer includes a `version` field and must be migratable.

7. **No layout shifts**
   The inline preview renders inside a fixed box.

8. **Client-only engine**
   The drawing engine must never be referenced during SSR.

---

## Goals

1. Add an `#ink` task macro that works in `.typ` worksheets.
2. Render a lightweight inline preview and open a full-screen editor on demand.
3. Persist answers locally via `WorksheetStorage` (same as other tasks).
4. Use a versioned answer schema with deterministic serialization.
5. Support hints and solutions using inline macros.
6. Keep editor loading client-only (dynamic import).
7. Provide clear size limits and safe fallbacks.
8. Keep the integration consistent with existing macro registry and task numbering.

---

## Details

### 1) Target platform

* Web (Next.js)
* iPad Safari
* Full-screen editor is client-only (no SSR)

---

### 2) Task macro definition (`#ink`)

**Constraint:** Must follow the current macro syntax and inline macro rules.
**Invariant:** `#ink` is a task macro and can be grouped inside `#group`.

#### 2.1 Macro syntax (authoring)

```typ
#ink(previewHeight: 160, background: "grid", openLabel: "Vollbild", engine: "excalidraw", maxSize: 900)[
  Zeichne das Diagramm sauber.

  #hint[
    Nutze Hilfslinien und beschrifte die Achsen.
  ]

  #solution[
    Eine saubere Skizze mit markierten Punkten und Vektoren.
  ]
]
```

#### 2.2 Parameters

* `previewHeight: number` (default `160`)
* `background: "plain" | "grid" | "dots"` (default `"grid"`)
* `openLabel: string` (default `"Vollbild"`)
* `engine: "excalidraw"` (default `"excalidraw"`)
* `maxSize: number` (default `900`)

#### 2.3 Inline macros

* `#hint[...]` (required)
* `#solution[...]` (required)

---

### 3) Pipeline parsing (macro system)

Add a parser entry for `ink` in the page parser, just like other task macros.

* File: `website/pipeline/pageParser/macros/tasks/ink.ts`
* Add to registry: `website/pipeline/pageParser/macros/macroRegistry.ts`

Example parser signature:

```ts
export type InkTaskMacro = {
  type: "ink";
  instruction: Markdown;
  hint: Markdown;
  solution: Markdown;
  previewHeight: number;
  background: "plain" | "grid" | "dots";
  openLabel: string;
  engine: "excalidraw";
  maxSize: number;
};
```

**Invariant:** Missing required inline macros throws a parser error (same as `#textTask`).

---

### 4) Schema + macro registry (web runtime)

Add `InkTaskMacro` to the shared schema and register it as an input macro.

* `website/src/schema/macroTypes.ts`
* `website/src/schema/macroRegistry.ts` (`INPUT_MACRO_TYPES`)
* `website/src/features/contentpage/macros/registry.tsx`

Example type addition:

```ts
export type InkTaskMacro = {
  type: "ink";
  instruction: Markdown;
  hint: Markdown;
  solution: Markdown;
  previewHeight: number;
  background: "plain" | "grid" | "dots";
  openLabel: string;
  engine: "excalidraw";
  maxSize: number;
};
```

---

### 5) Local persistence (WorksheetStorage)

**Constraint:** Local persistence must match the current task macro system.
**Invariant:** The stored value is a JSON string in `WorksheetStorage`.

#### 5.1 Answer schema

```ts
export type InkAnswerV1 = {
  version: 1;
  engine: "excalidraw";
  updatedAt: string;
  document: {
    elements: any[];
    appState: Record<string, any>;
    files: Record<string, any>;
  };
  thumbnail?: {
    mime: "image/webp" | "image/png";
    dataUrl: string;
    width: number;
    height: number;
  };
};

export type InkAnswer = InkAnswerV1;
```

#### 5.2 Storage wiring

Use the same storage primitives as other task macros (`WorksheetStorage` and `context.storageKey`).

```ts
const { value, setValue } = useTaskPersistence<InkAnswer>(
  context.storageKey ?? "",
  emptyInkAnswer,
  {
    serialize: (val) => JSON.stringify(val),
    deserialize: (raw, fallback) => {
      try {
        return JSON.parse(raw) as InkAnswer;
      } catch {
        return fallback;
      }
    }
  }
);
```

#### 5.3 Storage key

Add `ink` to `buildTaskKey` so it is persisted like other tasks:

```ts
case "ink":
  return `ink-${normalize(getMarkdown(task.instruction) ?? "") || index}`;
```

**Invariant:** State persistence is driven by `MacroStateProvider` context — macros use `useMacroValue()` which auto-syncs with the active adapter (e.g. `WorksheetStorage`).

---

### 6) UI components and responsibilities

* `InkTaskMacro` (inline preview + open button)
  * Renders instruction + preview box
  * Uses stored thumbnail if present
  * Opens full-screen editor

* `InkEditorModal` (full-screen)
  * Dynamically imports Excalidraw
  * Saves `InkAnswer` on change (debounced)
  * Generates a thumbnail on close

Inline preview must never import the engine.

---

### 7) Engine integration (Excalidraw)

**Constraint:** Client-only dynamic import.
**Invariant:** SSR never touches Excalidraw.

```ts
import dynamic from "next/dynamic";

export const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);
```

Thumbnail export is deterministic (fixed size, light mode).

---

### 8) Optional server persistence

If server sync is needed, mirror the existing task persistence pattern:

* Client saves locally first.
* Server uses a single upsert keyed by `(userId, worksheetId, taskKey)`.
* No partial merges in v1 (overwrite full document).

---

### 9) Migration + limits

**Limits**

* Max serialized document size: 2 MB
* Max thumbnail data URL size: 400 KB

**Migration**

```ts
export function migrateInkAnswer(input: any): InkAnswer | null {
  if (!input || typeof input !== "object") return null;
  if (input.version === 1) return input as InkAnswer;
  return null;
}
```

---

## Implementation checklist (updated)

### Phase 1 - Macro system

* [ ] Add `#ink` parser in `website/pipeline/pageParser/macros/tasks/ink.ts`.
* [ ] Register `ink` in `website/pipeline/pageParser/macros/macroRegistry.ts`.
* [ ] Add `InkTaskMacro` to `website/src/schema/macroTypes.ts`.
* [ ] Add `ink` to `INPUT_MACRO_TYPES` in `website/src/schema/macroRegistry.ts`.

### Phase 2 - Runtime renderer

* [ ] Add `InkTaskMacro` component in `website/src/features/contentpage/macros/input/InkTaskMacro.tsx`.
* [ ] Register the component in `website/src/features/contentpage/macros/registry.tsx`.
* [ ] Add `ink` to `buildTaskKey` in `website/src/features/contentpage/components/Group/TaskSetComponent.tsx`.

### Phase 3 - Local persistence

* [ ] Implement `InkAnswer` schema and serialization.
* [ ] Use `useTaskPersistence` or `WorksheetStorage` to save JSON per `storageKey`.
* [ ] Debounce autosave and flush on close.

### Phase 4 - Editor integration

* [ ] Add full-screen modal with safe-area padding and scroll lock.
* [ ] Add Excalidraw dynamic import and CSS.
* [ ] Generate thumbnails on close.

### Phase 5 - Hardening

* [ ] Enforce size limits with clear UI feedback.
* [ ] Handle invalid/migrated answers gracefully.
* [ ] Keep inline preview fast (thumbnail only).

### Phase 6 - Verification

* [ ] `#ink` renders in worksheets and is numberable like other tasks.
* [ ] Preview loads without Excalidraw bundles.
* [ ] Full-screen editor opens and saves locally.
* [ ] Refresh restores latest drawing from `WorksheetStorage`.
* [ ] Hints/solutions work as expected.
* [ ] Oversized documents do not crash the UI.

---

## Verification checklist

* [ ] `#ink` macro parses with required `#hint` and `#solution`.
* [ ] Task numbering behaves like other task macros.
* [ ] Local persistence uses `worksheet.storage.v1` and restores correctly.
* [ ] Inline preview never imports Excalidraw.
* [ ] Full-screen editor respects safe areas and locks background scroll.
* [ ] Thumbnail generation is deterministic and under size limits.
