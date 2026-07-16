# Spec 003 — `spot-error` task type

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Let authors write an error-identification task where the student picks the wrong step out of a sequence.
Behavior:
- `## spot-error: Title` heading starts the task, same as other task types.
- Body is a list of steps using `( )` / `(x)` syntax, identical to `single-choice`.
- Exactly one step marked `(x)` — the erroneous one; parser errors if zero or more than one.
- Steps render as an ordered sequence; student selects the one they believe is wrong.
- Supports `### hint`, `### why` subsections like other closed-answer types.
- Valid inside `@checkpoint` (digitally validatable).
Out of scope:
- Partial credit for near-miss selections.
- Multi-error variants (deferred, not requested).
Approach:
- New `pipeline/macros/spotError/types.ts`: `SpotErrorMacro { type: "spotError"; steps: Markdown[]; errorIndex: number; hint?: Markdown; why?: Markdown }`.
- Parser: add `"spot-error"` case to `normalizeTaskToken()` → `{ kind: "spotError" }`; reuse the existing `(x)`/`( )` line-scan from `parseMcqTask` but require exactly one match.
- Website: new task renderer + interaction component mirroring `single-choice`'s UI, feedback shown immediately on selection.
Open Qs:
- none
Done when:
- [ ] A `.md` file with a `## spot-error:` task parses without error and produces a `spotError` macro.
- [ ] Parser throws a clear error when 0 or 2+ steps are marked `(x)`.
- [ ] Website renders the steps and gives correct/incorrect feedback on selection.
- [ ] `bun run check` passes in both repos.
