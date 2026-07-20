# Presenter Model (north-star)

Design source-of-truth for the StudyLuma Presenter redesign. The tiny specs under [`../specs/`](../specs/) implement slices of this; when code and this doc disagree, amend one of them — never diverge silently.

Status: draft <!-- draft → agreed -->

## Positioning

The Presenter sits **between PowerPoint and a whiteboard**, combining the strengths of both:

- PowerPoint gives **structure** — a prepared, ordered lesson.
- The whiteboard gives **openness** — live, dialogic development on a free surface.
- StudyLuma adds what neither has: **private teacher information**, **student interaction**, **session state**, and a link back into the **Lernpfad**.

> A structured teaching session where prepared content, live board-work, and short formative feedback connect without a media break.

The goal is *not* to be a nicer slide tool. A lesson is a **dialogic process**; the product must let the teacher leave the prepared path at any moment and still keep structure on hand.

## The core shift: two axes, not slide types

Today the runtime asks *"what type of slide is this?"* (`conceptSlide`, `quizSlide`, …) and bakes behavior into the type. That is too rigid for live teaching. We separate two **orthogonal** axes:

| Axis | Question | Values |
|------|----------|--------|
| **Content type** | What is prepared, pedagogically? | impulse · concept · example · task · comparison · summary · quiz |
| **Interaction mode** | How is it used live, right now? | present · annotate · co-develop · collect answers · practice · review · secure |

The same `example` can be *presented* as a finished worked solution, *co-developed* on a workspace, held back as a *private* Musterlösung, or handed out as a *task*. Behavior comes from the mode, not the content type.

A prepared lesson is an **ordered sequence of frames**. Each frame carries a content type, a default interaction mode, and an estimated duration — authored in the existing StudyLuma markdown.

## The four layers

Everything the runtime holds sorts into four layers with **different owners and lifetimes**:

| Layer | Owned by | Holds | Visible to |
|-------|----------|-------|-----------|
| **Prepared** | the chapter | tasks, texts, images, diagrams, quiz questions, hints, Musterlösungen, Sicherungen | public (when shown) |
| **Live** | a session (one class) | handwriting, markings, side-calculations, spontaneous solution paths, extra workspaces, annotations on student work | public (projector) |
| **Private teacher** | the teacher | presenter notes, Musterlösung, expected answers, common mistakes, next phase, timing, quiz answers before release | teacher tablet only |
| **Session** | a session | current frame, blackout, timer, active workspace, revealed hints, quiz status, extra surfaces, **student mode** | drives all three surfaces |

**The critical ownership rule:** prepared content belongs to the **chapter**; everything created during a lesson belongs to a **session** (a specific class). The current model has no concept of this separation — the same chapter must run for class 9a and 9b with independent Live layers, and a fresh session starts with an empty Live layer while the Prepared layer is untouched. This same ownership boundary is what scopes student devices (below): a session belongs to one course, so it only ever affects students in that course.

## Surfaces

The Session layer drives **three** surfaces, each seeing a different composition of the layers.

### Teacher screen (tablet) — two modes

The tablet switches between two states rather than showing one permanently-complex UI:

- **Control mode** — for impulse, navigation, quiz: current public view, presenter notes, next phase, private solution, navigation, timer, quiz results.
- **Write mode** — for co-development: public workspace maximized, minimal chrome, private solution quickly callable, pen tools, undo, new surface, navigation deliberately guarded against accidental taps.

A permanently dense presenter UI would get in the way while writing. The tablet concentrates on the current activity.

### Projector screen

Shows **only the public session state**: prepared content, public handwriting, released hints, quiz question or result, timer, blackout. No navigation, no private information.

### Student devices — session-scoped modes (core)

What a logged-in student sees is itself session state, not a separate app. The teacher's session projects a **mode** onto every enrolled student's device. This is a first-class part of the model.

| Student mode | Student sees | Set when |
|--------------|--------------|----------|
| **Normal** | free navigation — browse chapters, worksheets, revisit last lesson | no active session, or teacher explicitly **opens** |
| **Locked** | a hold screen ("look at the front, be part of the lesson") — StudyLuma is intentionally inert so it can't pull focus | teacher is presenting (present / annotate / co-develop / review / secure) |
| **Quiz** | current question + options; submit, then wait for the next question or the end | a Quick Check or quiz frame is running |
| **Task** | a single small task on their device (any existing task type, or the new free-response type) | a practice frame is running |

Mode largely **follows the active frame's interaction mode**, with an explicit teacher **lock ↔ open** override so the teacher can send students to a worksheet or last lesson's material mid-session. When a quiz or task ends, the device returns to whatever the session mode then is (usually Locked).

**Scoping rule (critical):** the projection reaches **only students enrolled in the session's course**. A 10th-grade student logging in to revisit old material during your 9th-grade lesson is in Normal mode, entirely unaffected. This falls straight out of Live = session = one course.

Future (separate feature): a personal doodle / notes surface during Locked mode, to sustain focus without unlocking navigation. Out of scope here.

## Quiz — two shapes, one engine

Formative checks are a **short response step inside the flow**, not a separate gamified event: no new link, no room to open, no leaderboard, no mode to explain, no switching back afterward. But the same engine serves two distinct uses — keep both:

- **Quick Check** — a single inline question mid-lesson. Teacher fires it, sees the distribution and common wrong answers, decides what becomes public, moves straight into discussion or the next frame.
- **Sicherung quiz** — a short multi-question set at the end of a lesson to consolidate. Same phases and aggregates, used as a closing consolidation rather than an interruption.

Reveals are fine **for hints, markings, and Sicherung** — not as a replacement for a dialogic solution.

## Student-work capture

In Task mode a student can surface their solution on the projector: either the student **offers** it (button → teacher **accepts**), or the teacher enters the student's **ID**. Applies to a single small task, not a full worksheet. In the model now; the presentation step is deferred past the MVP.

## What carries over vs. what's new

| Reused | Evolves | Genuinely new (biggest lift) |
|--------|---------|------------------------------|
| Quiz DB engine (phases, join/submit, live aggregates) → **Quick Check** + **Sicherung quiz** | typed-slides → **frames** (content type + mode + est. time) | **Realtime session transport**: native Cloudflare Durable Object + WebSocket, one DO per running session |
| | teacher/projector surfaces gain **control vs write mode** + **student device modes** | **Live Layer**: tablet handwriting → projector in real time, persisted per session |
| | | free-response task type; student-solution capture; spontaneous / compare workspaces |

**Correction (verified in code, not assumed):** there is currently **no realtime layer at all**. `useSlideStream`/`useQuizStream` are no-op stubs — a comment in each reads "Realtime removed. State is read from DB via loader on each navigation." The previous system used **Ably** (third-party pub/sub SaaS); it was fully stripped during the `feat: react router rewrite` commit and never replaced. The `AdminSnapshot`/`ClassroomCoordinatorDO` naming in `streamTypes.ts` is stale/aspirational, not real infra. Practical effect today: slide state, blackout, and quiz phase only update on client reload/navigation — nothing pushes. This is why realtime transport is now its own Milestone-A spec rather than an assumed dependency: Locked mode, live ink, and quiz phase transitions all require genuine push.

Also note: `QuizPresenterPanel` (the only UI that can start a quiz) is currently rendered nowhere — wiring the quiz into a frame host resolves that dead code too.

## MVP — thin vertical slice

Prove the novel "combined" magic end-to-end before breadth. Deliberately front-loads the Live Layer, because it is the heart of the value proposition and the thesis argument.

1. One frame **presented** (Prepared → Projector).
2. Teacher **control ↔ write** mode switch.
3. Basic **live pen → projector** in real time (pen + eraser + undo, persisted for the session).
4. **Private teacher panel** (Musterlösung + notes) on the tablet while writing publicly, quick show/hide.
5. Student **Locked** mode for enrolled students while presenting (course-scoped); teacher can **open** to Normal.

**Input target: a graphics tablet**, not a touchscreen. Indirect pointer input behaves like a mouse, so palm rejection, accidental-touch, and zoom-without-writing simply don't arise in v1. Touchscreen support — and its harder input handling — is a later phase.

## Spec sequence

Grouped into milestones; each spec is one small PR under [`../specs/`](../specs/).

| Milestone | Specs (approx.) |
|-----------|-----------------|
| **A — Foundation** | session data model (per-class; Prepared vs Live ownership) · **realtime session transport (Cloudflare DO + WebSocket, replaces the removed Ably layer)** · session → student projection (course-scoped student mode) · lesson = ordered frames + overview screen |
| **B — Two-surface runtime** | frame runtime (replaces slide renderer) · control-mode vs write-mode · private teacher panel · student **Locked** mode + teacher lock/open toggle |
| **C — Quiz** | inline de-gamified **Quick Check** · end-of-lesson **Sicherung quiz** (multi-question) · teacher controls what becomes public · student **Quiz** mode |
| **D — Live Layer** (graphics-tablet first) | public pen → projector realtime + per-session persistence · annotate-over-prepared · spontaneous / compare workspaces |
| **E — Task & close** | free-response task type + student **Task** mode · student-solution capture (offer/accept) · task timer + individually-released hints · Sicherung frame (capture from workspace) · session end / export |

## Decisions

**Live handwriting tech — own the stroke data, don't adopt a whiteboard SDK.** The centre of gravity is a serializable stroke model that rides the existing DO/WebSocket sync and per-session DB persistence — not a canvas app. Full SDKs (tldraw, Excalidraw) own their own document + sync/persistence and would fight the frame-runtime and four-layer model (tldraw also carries a watermark/commercial-license requirement — a poor fit for a public/nonprofit project). Stack:

- **Input:** Pointer Events API (native) — one path for graphics tablet now and Apple Pencil later (`pressure`, `tiltX/Y`, `pointerType`, `getCoalescedEvents()`). Palm rejection later = ignore `pointerType === 'touch'`.
- **Ink quality:** `perfect-freehand` (MIT, tiny) — pressure-sensitive stroke outline from a points array; we keep the point data.
- **Data model (ours):** stroke = `{ id, tool, color, points: [[x,y,pressure]…] }`; surface = ordered strokes. Undo/redo = operations on that list.
- **Rendering:** Canvas 2D (lowest latency for continuous ink).
- **Latency (Milestone-D detail):** teacher renders own ink optimistically; stream throttled point batches (+ periodic mid-stroke deltas, persist on stroke-end) to the DO → projector, which renders a beat behind. Do **not** round-trip every point.

Reconsider an SDK only if the scope grows to arbitrary object select/move/transform or true simultaneous multi-user editing — well past Milestone E. Arrows, highlighter, colours, and even stroke select/move fit the custom model.

## Open questions

- Free-response task type: naming + shape (working name `freeResponse`); how its solution renders on the projector.
- Workspace overlay vs. transition: keep the impulse pinned beside a free surface, or demote it to a small reference object. Likely per-frame configurable — settle when specced.
- Exact derivation of student mode from interaction mode + teacher override (the mapping table above is the starting point).
