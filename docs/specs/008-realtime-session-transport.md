# Spec 008 — Realtime session transport

Status: agreed <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Replace the removed Ably layer with a native Cloudflare Durable Object + WebSocket, one DO per running session, so clients receive pushed state instead of polling on navigation. See [presenter-model.md](../design/presenter-model.md) → Decisions.
Behavior:
- Opening a session (spec 007) creates/wakes a DO keyed by `session_id`.
- Presenter, projector, and enrolled-student clients connect via a WebSocket upgrade, gated by existing auth guards + course-enrollment check.
- On connect, client receives an INIT snapshot of current session state.
- Subsequent state changes broadcast to every connected socket for that session.
- DO persists critical fields to the `sessions` row so a hibernation-wake can rehydrate.
- Closing a session notifies connected clients and tears down broadcasting.
- Dropped connection reconnects and re-fetches INIT — no full page reload required.
Out of scope:
- What state flows through it beyond `sessions.student_mode` (spec 007) — new state (frames, ink) lands with its own spec; proof of transport is broadcasting a `student_mode` change end-to-end.
- Removing `slide_state` / `quiz_sessions` tables or old Ably code paths (separate cleanup).
- Live-ink protocol/throttling (Milestone D).
Approach:
- New DO class (`workers/SessionCoordinator.ts`) using the WebSocket Hibernation API; export from `workers/app.ts`; add `[[durable_objects.bindings]]` + `[[migrations]]` to `wrangler.toml`.
- New upgrade route, e.g. `route("api/session/:sessionId/ws", ...)`.
- Replace the `useSlideStream`/`useQuizStream` stub bodies with real WebSocket client hooks, keeping `streamTypes.ts` event shapes where they still fit.
- DO is scoped per session, not per course — closing a session tears its DO down; matches spec 007's session-owns-Live-layer rule. `bun run cf:dev` (plain `wrangler dev` under the hood) simulates DOs locally once bindings are declared — no fallback needed.
Open Qs:
- none
Done when:
- [ ] Starting a session opens a DO; presenter, projector, and an enrolled student's client all connect and receive an INIT snapshot.
- [ ] A `student_mode` toggle from the presenter reaches the projector and student sockets with no page reload.
- [ ] Closing the session notifies connected clients.
- [ ] `bun run check` passes.

<!--
RULES (enforced, not optional):
- No paragraphs anywhere. One line per bullet.
- Whole spec fits one screen (~150 words). Longer = task too big, split it.
- Spec is source of truth. Code never diverges silently — amend the spec instead.
- "too long" from the user = cut to bullets, no discussion.
-->
