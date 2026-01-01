# StudyNode routing and RouteContext

This README focuses on how `src/contexts/RouteContext.tsx` and everything under
`src/app` works in this project.

## RouteContext: `src/contexts/RouteContext.tsx`

Purpose: expose derived routing state and auth state to client components.
It is provided by `RouteProvider` (see `src/app/providers.tsx`) and accessed
through `useRouteContext`.

How it works:
- Reads the current path via `usePathname()`.
- Splits the path into segments and derives:
  - `routeParam1` and `routeParam2` (first two URL segments).
  - `topic`, `chapter`, `worksheet` (segments 3-5, unless reserved).
  - `groupId`, `courseId`, `subject` based on the first two segments.
  - flags like `isHome`, `isLibrary`, `isPrinciples`, `isGroupOverview`.
- Reads `isAuthenticated` from `MockAuthContext` to make auth state available
  alongside routing data.
- Uses a few reserved segments to avoid misinterpreting routes:
  - Reserved roots: `library`, `access`, `worksheet`.
  - Reserved course segments: `practice`.

Important fields:
- `pathname`: current path.
- `isAuthenticated`: from `MockAuthContext`.
- `groupId`: set to the first segment unless this is a library route.
- `courseId`: `${groupId}/${routeParam2}` when applicable.
- `topic`, `chapter`, `worksheet`: derived from segments 3-5.
- `isHome`: true for `/`.
- `isLibrary`: true for `/library`.
- `isPrinciples`: true for `/:group/principles`.
- `isGroupOverview`: true for `/:group` (non-reserved root).
- `depth`: number of path segments.
- `hasTopicContext`: true when `topic` is present.

Usage:
- Client components can call `useRouteContext()` for route data.
- The hook throws if used outside `RouteProvider`.

## App Router structure: `src/app`

Next.js App Router uses the file system to define routes. This project has:

### Root layout and providers
- `src/app/layout.tsx`
  - Global CSS import.
  - Metadata for the site.
  - Injects a small script to set `data-theme` early, before hydration.
  - Wraps everything in `Providers`.
- `src/app/providers.tsx`
  - Client component.
  - Wraps children in `ThemeProvider`, `MockAuthProvider`, `RouteProvider`.
  - Adds `sonner`'s `Toaster` with offsets aligned to the navbar.

### Route group `(app)`
`src/app/(app)` is a route group (the folder name is not part of the URL).
Everything here uses the shared app layout.

- `src/app/(app)/layout.tsx`
  - Wraps pages with `Layout` from `src/components/Layout`.
- `src/app/(app)/page.tsx`
  - Home page, composed from hero, course section, about, and footer sections.
- `src/app/(app)/library/page.tsx`
  - `/library` stub page. Uses `getLibraryStub()`.
- `src/app/(app)/library/[...segments]/page.tsx`
  - `/library/*` catch-all. Displays the sub-path and the stub message.
- `src/app/(app)/worksheet/page.tsx`
  - `/worksheet` sample worksheet page using `getSampleWorksheet()`.

### Dynamic group and course routes
These are nested under the route group and use dynamic segments.

- `src/app/(app)/[group]/page.tsx`
  - `/:group` group overview stub.
- `src/app/(app)/[group]/principles/page.tsx`
  - `/:group/principles` protected page.
  - Client component: checks `MockAuthContext` and redirects to `/` if not
    allowed.
- `src/app/(app)/[group]/[course]/page.tsx`
  - `/:group/:course` course page.
  - Fetches course data, overview, and roadmap.
  - Renders `CoursepagePage` with a `CoursepageModel`.
- `src/app/(app)/[group]/[course]/[topic]/page.tsx`
  - `/:group/:course/:topic` topic page.
  - Lists chapters and links to chapter routes.
- `src/app/(app)/[group]/[course]/[topic]/practice/page.tsx`
  - `/:group/:course/:topic/practice` practice tasks page.
- `src/app/(app)/[group]/[course]/[topic]/[chapter]/page.tsx`
  - `/:group/:course/:topic/:chapter` chapter page.
  - Lists worksheets with `WorksheetCards`.
- `src/app/(app)/[group]/[course]/[topic]/[chapter]/[worksheet]/page.tsx`
  - `/:group/:course/:topic/:chapter/:worksheet` worksheet page.

### Access route
- `src/app/access/page.tsx`
  - `/access` login/join flow with access code and PIN.
  - Uses `MockAuthContext`, course lookup, and toasts for feedback.
  - Redirects when the user already has access to the course.
- `src/app/access/AccessPage.module.css`
  - Styles for the access page.

## Route map summary

```
/                                   -> home
/access                              -> access/join page
/library                             -> library stub
/library/...                         -> library stub catch-all
/worksheet                           -> sample worksheet
/:group                              -> group overview stub
/:group/principles                   -> protected principles stub
/:group/:course                      -> course overview page
/:group/:course/:topic               -> topic page
/:group/:course/:topic/practice      -> practice page
/:group/:course/:topic/:chapter      -> chapter page
/:group/:course/:topic/:chapter/:worksheet -> worksheet page
```

## How RouteContext lines up with routes

- `RESERVED_ROOTS` keeps `/library`, `/access`, and `/worksheet` from being
  treated as `/:group`.
- `RESERVED_COURSE_SEGMENTS` (currently `practice`) prevents that segment from
  being treated as `topic`, `chapter`, or `worksheet`.
- `isPrinciples` flags `/:group/principles` so `courseId` is not derived there.

If you want to extend routing, update `src/app` for the new page and adjust
`RouteContext` if the path parsing rules need to change.
