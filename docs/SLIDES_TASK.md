# Presentation Slides Feature Plan

## Guiding Principles

1. **Follow existing patterns**
   Slides integrate with the same pipeline, macro registry, and renderer as worksheets. The `#pn` macro follows the component macro pattern.

2. **Presenter is source of truth**
   The presenter window controls all state. Projector windows are read-only mirrors that receive updates via BroadcastChannel.

3. **Admin-only by design**
   Slides routes use `isAdmin()` check at the route level - no new authorization layer needed.

4. **Reuse content parsing**
   Existing `parseContent()` already splits by `=` headers into sections. Slides reuse this, with `#pn` macros extracted separately.

5. **No persistent state**
   Slide interactions are ephemeral (not saved to WorksheetStorage). This keeps presentations clean for each class session.

6. **URL-driven navigation**
   Slide position stored in `?s=...` query param for reload support and shareable links.

---

## Goals

1. Add `slides/` folder processing in the pipeline (parallel to `worksheets/`).
2. Create `#pn` presenter notes macro - visible only in presenter view.
3. Build two-window architecture with BroadcastChannel sync.
4. Implement keyboard navigation with input-focus awareness.
5. Support existing macros (#codeRunner, #mcq, etc.) in slides with live interaction sync.
6. Restrict access to admin users only.

---

## Details

### 1) Content Structure

```
content/base/{subject}/{topic}/{chapter}/
├── overview.typ
├── worksheets/
│   └── *.typ
└── slides/           ← NEW
    └── my-presentation.typ
```

Slide files use `=` as page separators (same as section headers in worksheets):

```typ
#title[Presenter Slides Test]

= Erste Slide
#image("/assets/example_image.png")
#pn[Notes only visible to teachers]

= Zweite Slide
#codeRunner[```ts
console.log("hello")
```]
```

---

### 2) Pipeline Changes

#### 2.1 Presenter Notes Macro

**File:** `pipeline/pageParser/macros/components/presenterNote.ts`

```ts
export type PresenterNoteMacro = {
  type: "pn";
  content: Markdown;
};

export const presenterNoteMacro = defineMacro({
  type: "pn",
  parser: (node: RawMacro) => ({
    type: "pn",
    content: parseRawText(node.content!, node.protectedBlocks),
  }),
});
```

Register in `macroRegistry.ts`:
```ts
import { presenterNoteMacro } from "./components/presenterNote";
// ...
pn: presenterNoteMacro,
```

#### 2.2 Slide Processing

Add to `buildChapterContent.ts` after `processWorksheets()`:

```ts
const slidesResult = await processSlides({
  subjectId, topicId, chapterId,
  slidesDir: `${chapterBase}/slides`,
}, collector, ctx);
```

`processSlides()` function:
- Lists `.typ` files in slides folder (optional - no error if missing)
- For each file: parse with `parsePage()`, extract `#pn` macros into separate array
- Write JSON to `.generated/{subject}/{topic}/{chapter}/slides/{slideId}.json`

#### 2.3 Output Schema

```ts
type Slide = {
  header: string;           // From = heading
  content: Node[];          // Regular content (excluding #pn)
  presenterNotes: Markdown[]; // Extracted #pn content
};

type SlideDeck = {
  title: string;
  slides: Slide[];
};
```

---

### 3) Routes

| Route | Purpose |
|-------|---------|
| `/[group]/[course]/[topic]/[chapter]/slides` | Slide selection view |
| `/[group]/[course]/[topic]/[chapter]/slides/[slideId]` | Presenter view |
| `/[group]/[course]/[topic]/[chapter]/slides/[slideId]/projector` | Projector view |

**Slide selection flow:**
1. Admin navigates to `/slides` → sees list of available slide decks for this chapter
2. Clicks "Start Presentation" on a deck → opens presenter view
3. Presenter view automatically opens projector window via `window.open()`
4. If projector window is blocked (popup blocker), show prominent "Open Projector" button

**Platform:** Desktop browsers only (Chrome/Edge). No touch/tablet optimization needed.

**Implementation:**
- `/slides/page.tsx` - Lists all slide decks from `.generated/{...}/slides/*.json`
- Each deck shows title and "Start" button
- "Start" navigates to `/slides/[slideId]` and triggers `window.open()` for projector

All routes:
- Call `assertAdminAccess()` (new helper using `isAdmin()`)
- Load `SlideDeck` from `.generated/` JSON
- Pass `channelName` for BroadcastChannel (based on route path + slideId)

---

### 4) State Synchronization

**BroadcastChannel** with localStorage fallback:

```ts
type SlideState = {
  slideIndex: number;
  blackout: boolean;
  interactiveState: Record<string, unknown>; // Per-macro state
};

type SlideMessage =
  | { type: "SLIDE_CHANGE"; slideIndex: number }
  | { type: "STATE_UPDATE"; state: SlideState }
  | { type: "BLACKOUT"; blackout: boolean }
  | { type: "SYNC_REQUEST" }
  | { type: "SYNC_RESPONSE"; state: SlideState };
```

**Flow:**
1. Projector opens → sends `SYNC_REQUEST`
2. Presenter responds with `SYNC_RESPONSE`
3. Presenter broadcasts state changes → Projector mirrors

**Security considerations:**
- **BroadcastChannel is same-origin**: Only tabs from `studynode.example.com` can communicate - no cross-origin access possible (browser enforced)
- **Channel name isolation**: Channel name includes full route path, so different chapters/slides use different channels
- **Admin-only routes**: Routes are protected by `isAdmin()` check - unauthorized users can't even load the pages
- **No sensitive data**: Synced state only contains slide index, blackout toggle, code edits, and pointer position
- **Worst case**: If another same-origin tab somehow knew the channel name, they could only change slide position - no data exfiltration risk

---

### 5) Keyboard Controls (Presenter Only)

| Key | Action |
|-----|--------|
| `→`, `Space`, `PageDown` | Next slide |
| `←`, `PageUp` | Previous slide |
| `Home` | First slide |
| `End` | Last slide |
| `B` | Toggle blackout |
| `F` | Fullscreen projector window |
| `G` | Toggle slide overview grid |
| `L` | Toggle laser pointer |

**Constraint:** Ignore key events when `target` is `INPUT`, `TEXTAREA`, `contentEditable`, or inside `[data-code-editor]`.

---

### 6) Component Architecture

```
features/slides/
├── SlidePresenter.tsx       # Main presenter view
├── SlideProjector.tsx       # Fullscreen projector view
├── components/
│   ├── SlideRenderer.tsx    # Renders single slide content
│   ├── SlideControls.tsx    # Navigation buttons
│   └── PresenterNotes.tsx   # Notes panel
└── hooks/
    ├── useSlideBroadcast.ts # BroadcastChannel communication
    ├── useSlideState.ts     # State + URL sync
    └── useSlideKeyboard.ts  # Keyboard handler
```

**SlidePresenter layout:**
- Header: title + controls
- Main: current slide preview
- Sidebar: presenter notes + slide thumbnails

**SlideProjector:**
- Fullscreen slide content
- Blackout overlay when active
- No controls visible

---

### 7) Additional Presenter Features

#### Timer/Clock
- Show elapsed presentation time in presenter view header
- Start automatically when presentation opens
- Optional: pause/reset controls

#### Slide Overview Grid
- Keyboard shortcut `G` opens grid view of all slides
- Click any thumbnail to jump to that slide
- Shows current slide highlighted

#### Pointer/Laser Tool
- Keyboard shortcut `L` toggles laser pointer mode
- Presenter mouse position broadcasts to projector
- Projector shows red dot cursor at synced position
- Auto-hides when pointer inactive for 2s

Add to `SlideState`:
```ts
type SlideState = {
  slideIndex: number;
  blackout: boolean;
  interactiveState: Record<string, unknown>;
  pointer?: { x: number; y: number; visible: boolean }; // NEW
};
```

---

### 8) Interactive Macros in Slides

Macros like `#codeRunner` and `#mcq` work in slides:
- Presenter can interact (edit code, select answers)
- State changes broadcast to projector
- Projector shows results but is non-interactive
- **Solution reveal syncs**: When presenter clicks "Show Solution", projector shows solution too

**Implementation:** Use `MacroRenderContext` with custom `onChange` handler that broadcasts state. Add `solutionVisible` to `interactiveState` for tasks with solutions.

---

## Critical Files to Modify

| File | Change |
|------|--------|
|  | Register `pn` macro |
| `pipeline/dataTransformer/buildChapterContent.ts` | Add `processSlides()` |
| `src/schema/macroTypes.ts` | Add `PresenterNoteMacro` type |
| `src/schema/slideTypes.ts` | New file: `Slide`, `SlideDeck`, `SlideState`, `SlideMessage` |
| `src/server/services/slideService.ts` | New: admin auth + data fetching |
| `src/app/(app)/[group]/[course]/[topic]/[chapter]/slides/page.tsx` | Slide selection page |
| `src/app/(app)/[group]/[course]/[topic]/[chapter]/slides/[slideId]/page.tsx` | Presenter route |
| `src/app/(app)/[group]/[course]/[topic]/[chapter]/slides/[slideId]/projector/page.tsx` | Projector route |

---

## Implementation Checklist

### Phase 1 - Pipeline
- [ ] Create `presenterNote.ts` macro definition
- [ ] Register `pn` in `macroRegistry.ts`
- [ ] Add `PresenterNoteMacro` to `macroTypes.ts`
- [ ] Create `slideTypes.ts` schema
- [ ] Add `processSlides()` to `buildChapterContent.ts`
- [ ] Test pipeline with example slide file

### Phase 2 - Server Layer
- [ ] Create `slideProvider.ts` (read from .generated)
- [ ] Create `slideService.ts` (admin authorization)

### Phase 3 - Routes
- [ ] Create slide selection route `/slides/page.tsx`
- [ ] Create presenter route `/slides/[slideId]/page.tsx`
- [ ] Create projector route `/slides/[slideId]/projector/page.tsx`
- [ ] Implement auto-open projector window on presentation start

### Phase 4 - Core Hooks
- [ ] `useSlideBroadcast.ts` - BroadcastChannel + localStorage fallback
- [ ] `useSlideState.ts` - State management + URL sync
- [ ] `useSlideKeyboard.ts` - Keyboard navigation

### Phase 5 - Components
- [ ] `SlideSelection.tsx` - List available slide decks with "Start" buttons
- [ ] `SlideRenderer.tsx` - Render slide content
- [ ] `SlideControls.tsx` - Navigation UI
- [ ] `PresenterNotes.tsx` - Notes panel
- [ ] `SlidePresenter.tsx` - Full presenter view (auto-opens projector)
- [ ] `SlideProjector.tsx` - Fullscreen projector
- [ ] `PresentationTimer.tsx` - Elapsed time display
- [ ] `SlideOverviewGrid.tsx` - Grid view for quick navigation
- [ ] `LaserPointer.tsx` - Synced pointer overlay

### Phase 6 - Styling
- [ ] CSS modules for all components
- [ ] Responsive presenter layout
- [ ] Fullscreen projector styling
- [ ] Blackout overlay

### Phase 7 - Integration
- [ ] Connect macro rendering with broadcast state
- [ ] Test #codeRunner editing in slides
- [ ] Test #mcq interaction sync

---

## Verification Checklist

- [ ] `#pn` macro parses correctly, content extracted separately
- [ ] Slides JSON generated in `.generated/` folder
- [ ] Multiple slide decks per chapter supported (each .typ file = one deck)
- [ ] Slide selection page lists all available decks
- [ ] "Start" button opens presenter and auto-opens projector window
- [ ] "Open Projector" button shown if popup blocker prevents auto-open
- [ ] Non-admin users get 404 on slides routes
- [ ] Presenter view shows slides + notes + controls
- [ ] Projector view opens in new window, fullscreen capable
- [ ] Slide navigation syncs between windows
- [ ] Blackout (B key) shows black on projector
- [ ] Keyboard controls disabled when editing code
- [ ] URL `?s=N` updates on navigation, survives reload
- [ ] #codeRunner edits visible on projector in real-time
- [ ] #mcq selections sync to projector
- [ ] "Show Solution" syncs to projector
- [ ] Timer shows elapsed time, resets on page reload
- [ ] `G` key opens slide overview grid, click jumps to slide
- [ ] `L` key enables laser pointer, position syncs to projector
