# Spec 010 — Lesson = ordered frames + overview screen

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Author a lesson as an ordered sequence of frames (content type + interaction mode + estimated time), replacing the rigid typed-slide-deck format for new content. See [presenter-model.md](../design/presenter-model.md) → The core shift.
Behavior:
- A lesson's markdown declares an ordered list of frames.
- Each frame has a content type (impulse/concept/example/task/comparison/summary/quiz) and a default interaction mode (present/annotate/co-develop/collect-answers/practice/review/secure).
- Frames carry an optional estimated duration in minutes.
- Before starting a session, the teacher sees an overview: frame title, type, estimated time, running total.
- Teacher can start a session at any frame, not only the first.
Out of scope:
- Rendering/running a frame live (Milestone B — frame runtime).
- Migrating existing typed-slide decks to the frame format — additive, not a replacement yet.
- Runtime interaction-mode switching (control/write-mode spec).
Approach:
- New schema type `Frame` (`contentType`, `mode`, `title`, `estimatedMinutes`, `body`) and `Lesson = Frame[]` in `schema/`.
- Parser: new frame-boundary markdown convention, following the existing `## <type>:`-heading pattern used by task macros.
- New overview route/component rendering the frame table + a "start here" action per frame.
Open Qs:
- Exact markdown syntax for a frame boundary + its metadata — needs a concrete proposal before implementation.
- New `content_pages.page_kind` value `lesson`, or reuse existing `slides` kind?
Done when:
- [ ] A `.md` file with N frames (type + mode + optional time each) parses into an ordered `Lesson`.
- [ ] Overview screen lists all frames with type, estimated time, and running total.
- [ ] Teacher can pick any frame as the session's starting point.
- [ ] `bun run check` passes.
