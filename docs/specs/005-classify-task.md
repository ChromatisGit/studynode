# Spec 005 — `classify` task type

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Let authors write a categorization task where students sort shuffled items into named categories.
Behavior:
- `## classify: Title` heading starts the task.
- Categories declared with `[Category Name]` markers; items listed beneath each until the next marker.
- All items shuffled together and presented ungrouped to the student (category membership hidden).
- Student assigns each item to a category; feedback shown after an explicit "Prüfen" (check) action, not live.
- Items may contain inline math or images.
- Supports `### hint`, `### why`.
Out of scope:
- More than one correct category per item.
- Partial-credit scoring (per-item right/wrong is enough for v1).
Approach:
- New `pipeline/macros/classifyTask/types.ts`: `ClassifyTaskMacro { type: "classifyTask"; categories: string[]; items: { text: Markdown; categoryIndex: number }[]; hint?: Markdown; why?: Markdown }`.
- Parser: add `"classify"` case to `normalizeTaskToken()` → `{ kind: "classifyTask" }`; parse `[Category Name]` markers as category boundaries, shuffle items deterministically (reuse `deterministicShuffle`) at parse time or render time — decide during implementation.
- Website: new sorting UI (assign item → category, e.g. dropdown or drag target), explicit "Prüfen" button reveals correctness per item.
Open Qs:
- Shuffle at parse time (baked into content) vs. render time (per-student) — match existing MCQ convention once picked.
Done when:
- [ ] A `.md` file with `## classify:` and `[Category]` markers parses into a `classifyTask` macro.
- [ ] Website renders all items ungrouped and lets the student assign each to a category.
- [ ] "Prüfen" reveals per-item correctness, not live feedback.
- [ ] `bun run check` passes in both repos.
