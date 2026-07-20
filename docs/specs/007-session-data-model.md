# Spec 007 — Session data model

Status: agreed <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Introduce a `sessions` table modeling one running lesson per course, separating chapter-owned Prepared content from session-owned Live/runtime state. See [presenter-model.md](../design/presenter-model.md).
Behavior:
- A session belongs to exactly one course and exactly one content item (`content_key`), opened by an admin; lifecycle `open` → `closed`.
- Switching to different content mid-lesson means closing this session and opening a new one — no mid-session retargeting.
- Starting a session for a course auto-closes any other open session for that course.
- A session references the content it presents but never mutates the Prepared layer.
- Session row carries `student_mode`, defaulting to `normal` on open — opening a session does not lock students; the teacher locks explicitly (spec 009).
- "Active session for course" lookup returns at most one open session, or null.
- Closing a session ends its runtime state; Prepared content is untouched.
Out of scope:
- The frame content model, current-frame tracking, timer, blackout — added by the specs that actually need them (Milestone B), not speculated here.
- Live ink/handwriting storage (Milestone D).
- Migrating or removing `slide_state` / `quiz_sessions` — additive only, not wired into any UI yet.
Approach:
- Migration: `sessions` table (`session_id`, `course_id` FK, `content_key`, `status`, `student_mode`, `created_at`, `closed_at`), partial unique index on `course_id WHERE status = 'open'` (mirrors `quiz_sessions`'s existing pattern).
- New `sessionService.ts`: `startSession`, `closeSession`, `getActiveSessionForCourse`, `updateSessionState` — `updateSessionState` only accepts `student_mode`, never `content_key`, so retargeting is impossible through the service layer.
Open Qs:
- none
Done when:
- [ ] Migration creates `sessions` with the partial-unique-open-per-course constraint.
- [ ] `startSession(courseId, ...)` closes any prior open session for that course first.
- [ ] New session's `student_mode` is `normal`.
- [ ] `getActiveSessionForCourse(courseId)` returns the open session or null.
- [ ] `updateSessionState` has no code path that can change `content_key` after creation.
- [ ] `bun run check` passes.
