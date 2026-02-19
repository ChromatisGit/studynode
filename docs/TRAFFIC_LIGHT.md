# Checkpoint Traffic Light System — Design Plan

## Context

StudyNode worksheets need a **formative real-time feedback system** for in-class use.
Teachers need to see whether the class can continue; learners need to reflect on difficulties.
Currently, worksheets are rendered as a single scrollable page with no navigation between sections.
This plan introduces section-by-section page navigation, task-completion gating on regular pages,
and a traffic-light self-assessment widget on checkpoint sections. Server persistence and teacher
monitoring are designed here but deferred to the DATABASE_UPDATE phase.

---

## Guiding Principles

1. **Section = navigable page** — each heading-delimited section is one navigable screen (prev/next).
2. **Two modes, same navigator** — active chapters enforce gating; completed chapters allow free nav.
3. **Check + content = completed** — a task set is done when the user clicked "Check Solution" **and** all input macros had content at that moment (regular pages only).
4. **Traffic light always interactive** — the traffic light is always clickable on active checkpoint sections, independent of task completion. A student who couldn't do any task should still be able to submit feedback.
5. **Checkpoint gates next** — submitting the traffic light unlocks Next on checkpoint sections (not task completion).
6. **German UI via language file** — all user-facing strings go through a language file (`.de.json`), never hardcoded.
7. **localStorage first, DB later** — checkpoint responses stored locally for now; DB storage + teacher monitoring implemented during DATABASE_UPDATE.
8. **No regressions** — existing WorksheetRenderer behavior (display macros, task numbering, storage) is preserved.

---

## Goals

1. Render worksheets one section at a time with Prev / Next navigation
2. Lock forward navigation on regular sections until all task sets are completed
3. Display an always-interactive traffic-light self-assessment on active checkpoint sections
4. Lock forward navigation on checkpoint sections until the traffic light is submitted
5. Persist checkpoint responses (understanding level + difficulty cause) in localStorage
6. Define the DB schema for checkpoint responses (implementation deferred)
7. Design the teacher monitoring view on the admin course page (implementation deferred)

---

## Details

### 1) Resolved Design Questions

| Question | Decision |
|---|---|
| Task completion trigger | Check Solution clicked **+** all input macros have content |
| Traffic light gate | Always interactive; submission (not task completion) unlocks Next |
| One checkpoint per worksheet | Convention only — not enforced |
| DB persistence timing | Deferred to DATABASE_UPDATE |
| Teacher monitoring location | `/admin/[courseId]` course detail page (deferred) |
| UI language | German — strings in `.de.json` language file |

---

### 2) German UI Copy

All user-facing strings are in `src/features/contentpage/contentpage.de.json`.

#### Traffic light self-assessment

```json
{
  "trafficLight": {
    "question": "Wie gut kamst du mit den Aufgaben zurecht?",
    "levels": {
      "green":  "Ich konnte alles alleine lösen.",
      "yellow": "Einiges ging, aber nicht alles sicher.",
      "red":    "Ich wusste oft nicht, wie ich weitermachen soll."
    },
    "causeQuestion": "Woran hats gelegen?",
    "causes": {
      "topic":     "Ich verstehe das Thema noch nicht so richtig.",
      "task":      "Ich verstehe eine oder mehrere Aufgaben nicht.",
      "approach":  "Ich weiß nicht, wie ich anfangen oder vorgehen soll.",
      "execution": "Ich kann es noch nicht richtig umsetzen.",
      "mistake":   "Ich verstehe nicht, was ich falsch gemacht habe.",
      "other":     "Anderes"
    },
    "submitButton": "Abschicken"
  }
}
```

#### Admin monitoring (for the deferred DB phase)

```json
{
  "checkpointMonitor": {
    "sectionTitle":   "Checkpoint-Ergebnisse",
    "distribution":   "Ampelverteilung",
    "causes":         "Ursachenverteilung",
    "participation":  "Teilnahmeübersicht",
    "submitted":      "Abgegeben",
    "open":           "Offen"
  }
}
```

---

### 3) Data Types

**File:** `src/schema/checkpointTypes.ts`

```ts
export type UnderstandingLevel = 'green' | 'yellow' | 'red';

export type DifficultyCause =
  | 'topic'
  | 'task'
  | 'approach'
  | 'execution'
  | 'mistake'
  | 'other';

export type CheckpointResponse = {
  understanding: UnderstandingLevel;
  causes?: DifficultyCause[];    // one or more causes when understanding !== 'green'
  submittedAt: number;           // unix timestamp ms
};
```

---

### 4) Chapter Status Prop Flow

The worksheet route currently does not fetch ProgressDTO.

**File to modify:** `src/app/(app)/[group]/[course]/[topic]/[chapter]/[worksheet]/page.tsx`

```ts
const progressDTO = await getProgressDTO(courseId);
const topic = progressDTO.topics.find(t => t.topicId === topicId);
const chapter = topic?.chapters.find(c => c.chapterId === chapterId);
const chapterStatus = chapter?.status ?? 'finished';

return <WorksheetRenderer page={page} worksheetSlug={...} chapterStatus={chapterStatus} />;
```

**`WorksheetRenderer` prop addition** (`src/features/contentpage/renderers/WorksheetRenderer.tsx`):

```ts
interface WorksheetRendererProps {
  page: Page;
  className?: string;
  worksheetSlug?: string;
  chapterStatus?: ProgressStatus;  // NEW — defaults to 'finished' (free nav, no regression)
}
```

`ProgressStatus` source: `src/schema/progressDTO.ts`

---

### 5) Page Navigation Architecture

**New component:** `src/features/contentpage/components/WorksheetNavigator/WorksheetNavigator.tsx`

```
WorksheetRenderer
└── WorksheetNavigator
    ├── PageNavBar (Prev / Next) — top
    ├── CurrentSectionView
    │   ├── CategorySection (existing, unchanged)
    │   └── CheckpointOverlay (shown when kind==='checkpoint' && status==='current')
    └── PageNavBar — bottom
```

**State:**
- `currentIndex: number`
- `completedSections: Set<number>` — sections where navigation condition is met

**Navigation rules:**

```
canGoBack  → currentIndex > 0                               (always)

canGoNext  →
  chapterStatus !== 'current'                               (free nav for finished)
  OR completedSections.has(currentIndex)                    (active: section done)
```

**Section auto-completion:**
- Kind `'info'`: immediately completed (no user action needed)
- Kind `'core'` / `'challenge'`: completed when all task sets report done
- Kind `'checkpoint'`: completed when `CheckpointOverlay` reports submission

**Single-section worksheets:** no nav bar rendered.

---

### 6) Task Completion Detection (Regular Sections Only)

#### 6.1 MacroRenderContext extension

**File to modify:** `src/macros/shared/componentTypes.ts`

```ts
type MacroRenderContext = {
  storageKey?: string;
  taskNumber?: string | number;
  checkTrigger?: number;
  readOnly?: boolean;
  onAttemptedChange?: (taskKey: string, attempted: boolean) => void;  // NEW
};
```

#### 6.2 Input macro changes

Each input macro (`gap`, `mcq`, `codeTask`, `textTask`, `mathTask`) already computes `isAttempted`.
Add a `useEffect` that calls `context.onAttemptedChange?.(storageKey, isAttempted)` whenever
`isAttempted` changes.

**Files to modify:**
- `src/macros/gap/Renderer.tsx`
- `src/macros/mcq/Renderer.tsx`
- `src/macros/codeTask/Renderer.tsx`
- `src/macros/textTask/Renderer.tsx`
- `src/macros/mathTask/Renderer.tsx`

#### 6.3 TaskSetComponent

**File to modify:** `src/features/contentpage/components/Group/TaskSetComponent.tsx`

```ts
interface TaskSetComponentProps {
  taskSet: TaskSet;
  categoryType: 'checkpoint' | 'core' | 'challenge';
  taskNumber?: number;
  onTaskSetCompleted?: () => void;  // NEW
}
```

Logic:
- Tracks `attemptedKeys: Set<string>` (keys reported as having content)
- `inputTaskCount` = `taskSet.tasks.filter(t => !DISPLAY_MACRO_TYPES.has(t.type)).length`
- On Check Solution click: if `attemptedKeys.size >= inputTaskCount` → `onTaskSetCompleted?.()`

#### 6.4 WorksheetNavigator aggregation

Navigator counts expected task sets per section, receives completion callbacks, marks section done when all task sets report.

Note: checkpoint sections use the `CheckpointOverlay` submission signal instead of task set completion to gate navigation.

---

### 7) Traffic Light Widget

#### 7.1 States

| State | Condition | Behaviour |
|---|---|---|
| Active | chapter is `'current'`, not yet submitted | user can select level + cause, submit |
| Submitted | already submitted | widget hidden |
| Hidden | chapter is not `'current'` | not rendered at all |

The traffic light is always interactive on active checkpoint sections — no "disabled" state.

#### 7.2 Component: `TrafficLight`

**File:** `src/features/contentpage/components/TrafficLight/TrafficLight.tsx`

```ts
interface TrafficLightProps {
  onSubmit: (response: CheckpointResponse) => void;
}
```

Render flow:
1. "Wie gut kamst du mit den Aufgaben zurecht?" (from language file)
2. Three buttons: 🟢 🟡 🔴 with German labels
3. If yellow or red selected: checkbox list of 6 cause options (multiple selection allowed)
4. "Abschicken" button: enabled when level selected and (green OR at least one cause selected)

#### 7.3 Component: `CheckpointOverlay`

**File:** `src/features/contentpage/components/CheckpointOverlay/CheckpointOverlay.tsx`

```ts
interface CheckpointOverlayProps {
  sectionIndex: number;
  onSubmitted: () => void;       // notifies WorksheetNavigator
}
```

- Reads `WorksheetStorageContext` to check if already submitted
- If submitted: renders nothing
- If not submitted: renders `<TrafficLight onSubmit={...} />`
- On submit: saves `CheckpointResponse` to storage, calls `onSubmitted()`

---

### 8) Checkpoint Storage (localStorage)

**File to modify:** `src/features/contentpage/storage/WorksheetStorage.ts`

Extend `WorksheetRecord`:

```ts
type WorksheetRecord = {
  worksheetId: string;
  signature: string;
  createdAt: number;
  lastAccessed: number;
  responses: Record<string, TaskResponseEntry>;
  checkpoints: Record<number, CheckpointResponse>;  // NEW
};
```

New methods on `WorksheetStorage`:
- `readCheckpoint(sectionIndex: number): CheckpointResponse | null`
- `saveCheckpoint(sectionIndex: number, response: CheckpointResponse): void`

---

### 9) DB Schema for Checkpoint Responses (Deferred — DATABASE_UPDATE)

```sql
CREATE TABLE checkpoint_responses (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  topic_id TEXT NOT NULL,
  chapter_id TEXT NOT NULL,
  worksheet_id TEXT NOT NULL,
  section_index INTEGER NOT NULL,
  understanding_level TEXT NOT NULL
    CHECK (understanding_level IN ('green','yellow','red')),
  difficulty_causes TEXT[]
    CHECK (difficulty_causes <@ ARRAY['topic','task','approach','execution','mistake','other']),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, worksheet_id, section_index)
);

CREATE INDEX idx_checkpoint_responses_course
  ON checkpoint_responses(course_id, worksheet_id);
```

RLS: users insert/read their own rows; admins read all.

Server action (deferred): `submitCheckpointAction(worksheetId, sectionIndex, response)`.
On first load after rollout: sync from localStorage → DB if DB record missing.

---

### 10) Teacher Monitoring View (Deferred — DATABASE_UPDATE)

**Location:** New section on the existing `/admin/[courseId]` page.

**Display structure per checkpoint (by chapter → worksheet):**

#### A. Ampelverteilung
Count and % for 🟢 🟡 🔴

#### B. Ursachenverteilung
Frequency of each selected cause (only among yellow + red responses).

#### C. Teilnahmeübersicht
- **Abgegeben:** `SELECT COUNT(*) FROM checkpoint_responses WHERE ...`
- **Offen:** enrolled users in course − submitted count

**Server query:** `getCheckpointStats(tx, courseId): Promise<CheckpointStats[]>` in
`src/server/queries/checkpoints.ts` (new file, deferred).

---

## Implementation Checklist

### Phase 1 — Types and language

- [x] Create `src/schema/checkpointTypes.ts`
- [x] Add traffic light strings to `src/features/contentpage/contentpage.de.json`

### Phase 2 — Chapter status prop flow

- [x] Update worksheet route to fetch `getProgressDTO` and extract `chapterStatus`
- [x] Add `chapterStatus` prop to `WorksheetRenderer` (default: `'finished'`)

### Phase 3 — Page navigation

- [x] Create `WorksheetNavigator` component with section index and completion state
- [x] Create `PageNavBar` component (Prev / Next buttons with lock state)
- [x] Render one section at a time; info sections auto-complete
- [x] Enforce `canGoNext` logic (free for finished, gated for current)
- [x] Integrate into `WorksheetRenderer` (replace direct categories map)
- [x] Hide nav bar for single-section worksheets

### Phase 4 — Task completion detection

- [x] Add `onAttemptedChange` to `MacroRenderContext` type
- [x] Update all 5 input macros to report `onAttemptedChange` on `isAttempted` changes
- [x] Add `onTaskSetCompleted` prop to `TaskSetComponent`
- [x] `TaskSetComponent` calls `onTaskSetCompleted` when Check clicked + all inputs attempted
- [x] `CategorySection` (or `WorksheetNavigator`) aggregates task set completions per section
- [x] Non-checkpoint section completion → `completedSections.add(index)`

### Phase 5 — Traffic light widget

- [x] Extend `WorksheetRecord` with `checkpoints` field and add storage methods
- [x] Create `TrafficLight` component (German labels from language file, 3 levels + 6 causes)
- [x] Create `CheckpointOverlay` component (reads storage, renders TrafficLight, notifies navigator)
- [x] Integrate `CheckpointOverlay` into `WorksheetNavigator` current section view
- [x] Checkpoint section completion = overlay reports submission

### Phase 6 — DB schema (DATABASE_UPDATE)

- [ ] Add `checkpoint_responses` table + RLS policies
- [ ] Create `submitCheckpointAction` server action
- [ ] Sync localStorage → DB on first post-rollout load

### Phase 7 — Admin monitoring view (DATABASE_UPDATE)

- [ ] Create `getCheckpointStats` query in `src/server/queries/checkpoints.ts`
- [ ] Create admin checkpoint stats component (Ampelverteilung, Ursachenverteilung, Teilnahme)
- [ ] Integrate into admin course detail page

### Phase 8 — Verification

- [ ] Active chapter — info section: next always allowed
- [ ] Active chapter — core/challenge section: next locked until all task sets checked + filled
- [ ] Active chapter — checkpoint section: traffic light always interactive; next locked until submitted
- [ ] Completed chapter: all sections — free nav, no restrictions
- [ ] Traffic light: cause selector appears for yellow/red only
- [ ] Traffic light: submitted state permanent (persisted in localStorage across page reloads)
- [ ] Revisiting a submitted checkpoint: widget hidden, treated as complete
- [ ] `chapterStatus` not passed: defaults to free navigation (no regression)
- [ ] Single-section worksheets: no nav bar rendered
- [ ] German strings: all copy sourced from language file, no hardcoded text
