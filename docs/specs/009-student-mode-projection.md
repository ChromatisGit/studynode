# Spec 009 — Session → student mode projection

Status: agreed <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Push the session's student mode to every enrolled student's device live, scoped strictly to the session's course. See [presenter-model.md](../design/presenter-model.md) → Student devices.
Behavior:
- MVP scope: `normal` ↔ `locked` only — `quiz`/`task` modes land with their own milestones.
- A session opens in `normal` (spec 007) — the teacher explicitly locks from the control screen when ready to present.
- `locked` renders a full-screen hold view ("look at the front"); no other page is reachable.
- Teacher toggles back to `open` at any time (e.g. to send students to a worksheet); students regain normal navigation immediately.
- A student not enrolled in the session's course is unaffected, regardless of what session is running elsewhere or what mode it's in.
- Closing the session returns all its students to `normal`.
- Mode changes take effect via spec 008's transport — no reload required.
Out of scope:
- `quiz` mode, `task` mode (their own milestone specs).
- Per-student overrides (one student individually unlocked).
- The future doodle/notes surface during `locked` mode.
- A student enrolled in 2+ courses with simultaneous open sessions — undefined for now, known gap, revisit if it actually occurs.
Approach:
- Add a `lock`/`open` toggle action on the control screen, updating `sessions.student_mode` (spec 007).
- App-shell-level subscription (mounted once in the root layout, not per-route — the only way to guarantee no route can bypass it; successor to today's `QuizStartBanner`, generalized + course-scoped) renders the `locked` overlay when applicable.
- Reuse spec 008's broadcast: mode changes push only to sockets whose enrollment matches the session's course.
Open Qs:
- none
Done when:
- [ ] A student enrolled in the session's course sees the locked screen within ~1s of the teacher toggling lock, no reload.
- [ ] A student in a different course, browsing normally, is unaffected regardless of session or mode.
- [ ] Teacher toggling "Open" returns their students to normal navigation live.
- [ ] Closing the session returns all its students to `normal`.
- [ ] `bun run check` passes.

<!--
RULES (enforced, not optional):
- No paragraphs anywhere. One line per bullet.
- Whole spec fits one screen (~150 words). Longer = task too big, split it.
- Spec is source of truth. Code never diverges silently — amend the spec instead.
- "too long" from the user = cut to bullets, no discussion.
-->
