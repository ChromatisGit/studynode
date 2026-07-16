# Spec 004 — `match` task type

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Let authors write a matching task pairing items from a `left` list with a `right` list.
Behavior:
- `## match: Title` heading starts the task.
- Body has a `left:` list and a `right:` list (equal length).
- Correct pairing is defined by position — `left[i]` matches `right[i]` in source order.
- Right column is shuffled deterministically on display (same approach as MCQ option shuffling).
- List items may contain inline math or images, not just plain text.
- Supports `### hint`, `### why`.
Out of scope:
- Distractors (extra unmatched `right` items) — postponed idea, separate spec later.
- Drag-and-drop vs. tap-to-pair interaction choice (left to website implementation).
Approach:
- New `pipeline/macros/matchTask/types.ts`: `MatchTaskMacro { type: "matchTask"; left: Markdown[]; right: Markdown[]; hint?: Markdown; why?: Markdown }`. Right-column shuffle order is computed website-side per render (like MCQ), not baked into content.
- Parser: add `"match"` case to `normalizeTaskToken()` → `{ kind: "matchTask" }`; parse `left:` / `right:` sub-lists from the task body, error if lengths differ.
- Website: new pairing UI (tap left item, tap right item to connect), validated against index correspondence.
Open Qs:
- Exact markdown syntax for `left:`/`right:` lists (nested bullets vs. separate headings) — needs one worked example before implementing.
Done when:
- [ ] A `.md` file with `## match:` parses `left`/`right` into a `matchTask` macro.
- [ ] Parser errors on mismatched list lengths.
- [ ] Website renders shuffled right column and validates pairs by index.
- [ ] `bun run check` passes in both repos.
