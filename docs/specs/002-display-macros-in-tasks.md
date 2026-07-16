# Spec 002 — Display macros inside task bodies

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Let display macros (table, image, formula, graph, …) appear inside a task's instruction, not only at section level.

Behavior:
- Task instruction parsed as a node list (markdown segments + display macros), not one flat markdown string.
- Recognized inside a task body: all `DISPLAY_MACRO_TYPES` (image, table, formula, callout, card, codeRunner, graph).
- Rendered interleaved in author order, above the task's input/answer UI.
- Applies to freeform-instruction tasks: textTask, codeTask, inputTask, handwrittenTask.
- Enables `$$graph` (spec 001) inside a task — the composition case deferred there.

Out of scope:
- mcq / gap bodies (structured inline parsing — options, `((…))` — left as-is).
- Task-as-input / auto-checking changes.

Approach:
- Schema: task `instruction: Markdown` → `instruction: Node[]` (markdown + display macros); shared across task types.
- studyluma-content: parse task main body with existing display-node logic (reuse `convertDisplayNode`) instead of flattening to markdown.
- studyluma-website: task renderers render the node list (reuse the section content renderer); two repos → two PRs.

Open Qs:
- Include hint / answer / why subsections too, or instruction only for v1?
- Backward-compat: auto-migrate existing tasks (string → single markdown node)?

Done when:
- [ ] A textTask with an embedded `table` renders the table inside the task.
- [ ] A `$$graph` inside a textTask renders the graph (composition with spec 001).
- [ ] Existing string-instruction tasks render unchanged.
- [ ] `bun run check` passes in both repos.
