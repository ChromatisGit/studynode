# Spec 001 — Funktionsgraph macro (`$$graph`)

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        A `$$graph … $$` macro rendering interactive function plots (functions, points, sliders, view) in worksheets.

Behavior:
- Pipeline catches `$$graph … $$`, parses it to a typed `graph` macro; remark-math never sees it; website renders the pre-parsed object.
- Body = one record per line (`- ` bullet optional); each record `type(key=value; key=value)`; `;`-separated; terms in `$…$`.
- `fn(term=$a*x^2+5$; name=f; color=blue)` → plots a curve; `name`/`color` optional (auto-assigned).
- `point(1; 2; name=P)` → marker at (x, y); `name` optional; coords positional `(1; 2)` or named `(x=1; y=2)`.
- `view(xMin=-5; xMax=5; yMin=-3; yMax=3)` → visible window; auto-fit if omitted.
- `slider(parameter=a; value=1; min=-3; max=3; step=1)` → slider below graph, bound to `a` in terms.
- Dragging a slider re-evaluates terms and redraws curves live.
- Terms evaluated by a small custom parser (no dep): `+ - * / ^`, unary `-`, `sin cos tan exp ln log sqrt abs`, `pi e`, params.
- Display-only: not an input, not auto-checked; students answer via existing task macros.

Out of scope:
- Nesting a graph inside a task's instruction body (v1 = section-level display macro).
- Zoom/pan, graph-as-input, auto-detected roots/intersections/extrema.

Approach:
- studyluma-content: parse `$$graph` in pipeline → `GraphMacro` typed JSON (new macro).
- studyluma-website: `graph` display macro — SVG plotter + custom evaluator + slider state.
- Two independent repos → two coordinated PRs (parser, renderer); can't be one PR.

Open Qs:
- Color palette + auto-assign order — confirm named set.
- Sampling resolution + pole handling (e.g. `tan`, `1/x`) — clamp/skip discontinuities.
- Undefined free variable in a term (no slider, no const) — build error?

Done when:
- [ ] `$$graph$$` with one `fn` renders a curve in a worksheet.
- [ ] Multiple `fn`, `point`, and a `view` render correctly.
- [ ] A `slider` renders; dragging updates the curve live.
- [ ] Invalid record/term → clear pipeline build error.
- [ ] `bun run check` passes in both repos.
