# Spec 006 — Stable `/w/:contentKey` worksheet links

Status: draft <!-- draft → agreed → implemented → verified -->
PR: <!-- link once it exists -->

Goal:        Give generated worksheet PDFs a permanent, course-independent URL that survives course restructuring.
Behavior:
- `GET /w/:contentKey` — not logged in → redirect to login with a return URL back to itself.
- Logged in → look up the student's enrolled courses containing this content key (RLS-enforced).
- Exactly one match → redirect to that course's worksheet URL (`/:group/:course/:topic/:chapter/:worksheet`).
- Multiple matches (e.g. teacher enrolled in 2+ courses sharing the worksheet) → show a course picker.
- No match → 404.
Out of scope:
- The PDF footer link's domain — currently hardcoded (and wrong) in `studyluma-content`, made configurable per instance in `studyluma-content/docs/specs/001-configurable-site-url.md`. This spec only builds the `/w/:contentKey` route itself, whatever domain it's reached through.
- Anonymous/public access to worksheets via this route (same gating as normal worksheet routes).
Approach:
- New route `route("w/:contentKey", ...)` in `app/routes.ts`, outside the `:group/:course` nesting (course-independent by design).
- Resolve `contentKey` → candidate courses via existing `platform/content.server.ts` + enrollment/RLS query, reusing course-resolution logic already used elsewhere (e.g. worksheet loader).
- Picker UI only needed for the multi-match edge case — simple list of course names linking to their worksheet URL.
Open Qs:
- none
Done when:
- [ ] Visiting `/w/<validKey>` while logged out redirects to login, then back to `/w/<validKey>` after auth.
- [ ] Logged-in student with exactly one matching enrollment lands on the correct worksheet page.
- [ ] Logged-in user with 2+ matching enrollments sees a course picker.
- [ ] Unknown `contentKey` returns 404.
- [ ] `bun run check` passes.
