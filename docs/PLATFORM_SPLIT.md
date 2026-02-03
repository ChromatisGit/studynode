# Platform / Instance Split Plan

## Guiding Principles

1. **Configuration over code.** Instance customization happens through data files (`site.yml`), not by modifying platform source code. A teacher forks the instance repo, edits config, and never touches `website/`.

2. **The submodule boundary is the product boundary.** `website/` (the submodule) = the platform. Everything outside it (the parent repo) = the instance. This boundary already exists and gets reinforced.

3. **Sensible defaults inside the platform.** The platform boots with zero instance config using built-in defaults. `website/` works standalone for development.

4. **Pipeline as the bridge.** The existing pipeline reads `content/` from the parent directory. Extend this: the pipeline also reads `site.yml` from the parent and generates `.generated/config/site.json`. Same pattern as `courses.json`.

5. **No merge conflicts on update.** Instance-specific data never lives inside `website/`. Pulling a new platform version (`git submodule update`) produces zero conflicts.

6. **Big refactors are permitted when improving maintainability** 
   The software is still in alpha and not in use: Therefore no data migration is needed and big breaking changes are acceptable

---

## Goals

1. Define a `site.yml` config schema capturing all instance-specific settings
2. Make the homepage overridable: platform provides a basic default, instances can provide custom React components
3. Make CSS brand color configurable
4. Make metadata (title, description, lang) configurable
5. Handle opt-in features (principles, practise) through config toggles
6. Produce a clean template repo structure other teachers can fork
7. Preserve 100% backward compatibility during migration

---

## Details

### 1) Instance Repo Structure (after split)

```
my-learning-site/                 (what teachers fork)
+-- site.yml                      # NEW: all instance branding/config
+-- content/
|   +-- definitions.yml           # groups, subjects, variants
|   +-- base/                     # reusable topic content
|   +-- courses/                  # course configurations
|   +-- principles/               # optional (features.principles: true)
+-- site/                         # NEW: instance React components
|   +-- homepage/                 # required: every instance provides its homepage
|   |   +-- Homepage.tsx          # composes platform building blocks + custom sections
|   |   +-- Homepage.module.css   # (optional) custom homepage styles
|   |   +-- sections/             # (optional) custom sections (Hero, About, etc.)
+-- assets/                       # NEW: favicon, og-image
|   +-- favicon.svg
|   +-- og-image.png
+-- package.json                  # delegates to website/
+-- docker-compose.yml
+-- website/                      # platform (git submodule - DO NOT EDIT)
```

`site.yml` lives at the repo root, next to `content/`. It's about the site, not educational content.

`site/homepage/` contains the instance's homepage. Every instance must provide a `Homepage.tsx`. The template includes a minimal one (CourseSection + Footer). Components here can import from the platform's component library (`@components/*`, `@ui/*`, `@features/*`) since they compile within the website's Next.js build.

---

### 2) The Config Contract: `site.yml`

#### 2.1 Schema (validated with Zod in the pipeline)

New file: `website/pipeline/configParser/schema/siteConfig.ts`

```typescript
import { z } from "zod";

export const siteConfigSchema = z.object({
  site: z.object({
    name: z.string().min(1),
    tagline: z.string().optional(),
    lang: z.string().default("de"),
  }),

  meta: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
  }),

  theme: z.object({
    brandColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
    brandColorDark: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  }).optional(),

  owner: z.object({
    name: z.string().min(1),
    displayName: z.string().optional(),
    copyright: z.string().optional(),
  }),

  // Homepage layout is code-driven (each instance has Homepage.tsx).
  // This section only contains data used by platform building-block components.
  homepage: z.object({
    footer: z.object({
      description: z.string().optional(),   // used by template's simple footer
      tagline: z.string().optional(),        // bottom bar left
    }),
  }).optional(),

  features: z.object({
    principles: z.boolean().default(false),
    practise: z.boolean().default(false),
  }).default({}),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;
```

#### 2.2 Current instance's `site.yml` (studynode.net)

```yaml
lang: de

theme:
  brandColor: "#6b2fa0"
  brandColorDark: "#975be6"

features:
  principles: true
  practise: true
```

Note: contact info is handled directly in the instance's custom Footer content within `site/homepage/Homepage.tsx`, not through YAML config.

#### 2.3 Default config (for standalone platform development)

New file: `website/pipeline/configParser/defaults/defaultSiteConfig.ts`

When no `site.yml` exists in the parent directory, the pipeline uses sensible English defaults so the platform works out of the box.

---

### 3) Pipeline Changes

#### 3.1 Loading `site.yml`

Extend `loadConfigs.ts` (or add a separate `loadSiteConfig.ts`):

1. Look for `site.yml` in the parent directory (same level as `content/`). The existing `resolveContentPath()` in `io.ts` already resolves the parent. Add a helper `resolveSiteConfigPath()` that looks for `../site.yml` relative to the content root.
2. If found: parse YAML, validate with `siteConfigSchema`.
3. If not found: use `defaultSiteConfig`.
4. Write to `.generated/config/site.json`.

#### 3.2 Updated pipeline flow

```
main.ts:
  deleteGenerated()             # existing
  cleanImageOutput()            # existing
  loadSiteConfig()              # NEW - reads site.yml, writes site.json
  loadConfigs()                 # existing
  buildPagePaths()              # existing
  buildChapterContent()         # existing
  resolveCourses()              # existing
  writeJSONFile(courses)        # existing
  generateCourseSQLScript()     # existing
  generateBrandColors()         # NEW - writes brand-colors.css
  copyInstanceAssets()          # NEW - copies favicon/og-image
  ensureDevAdminUser()          # existing
```

#### 3.3 Brand color CSS generation

New step in pipeline. Reads `theme.brandColor`/`theme.brandColorDark` from site config. Generates `.generated/config/brand-colors.css` that overrides the `--sn-brand-*` CSS variables.

Color variants (soft-bg, soft-border, strong, selection, focus-ring) computed via HSL manipulation in the pipeline -- pure math, no runtime dependency.

#### 3.4 Asset copying

New step. If `assets/favicon.svg` exists in instance root, copy to `website/public/icon/`. Same for `og-image.png`.

---

### 4) Runtime: Site Provider

New file: `website/src/server/providers/siteProvider.ts`

```typescript
import "server-only";
import siteJson from "@generated/config/site.json";
import type { SiteConfig } from "@pipeline/configParser/schema/siteConfig";

const siteConfig = siteJson as SiteConfig;
export function getSiteConfig(): SiteConfig { return siteConfig; }
```

Same pattern as the existing `courseProvider.ts` which imports `@generated/config/courses.json`.

---

### 5) Homepage Architecture: Instance-Provided + Platform Building Blocks

Every instance provides its own `Homepage.tsx`. The platform provides reusable building-block components that instances compose. The template includes a minimal homepage to start from.

#### 5.1 How it works

1. **Every instance** has `site/homepage/Homepage.tsx`. This is required, not optional.
2. **Pipeline copies** `site/homepage/*` into `.generated/site/homepage/` during `bun generate`.
3. **The homepage route** imports from the generated location:
   ```typescript
   // src/app/(app)/page.tsx
   import { Homepage } from "@generated/site/Homepage";
   ```
4. The platform provides **building-block components** that Homepage.tsx imports.

#### 5.2 Platform building blocks (stay in website/)

| Component | What it provides |
|-----------|-----------------|
| `CourseSection` | Course listing grid grouped by access level. Accepts `courseGroups` + labels. |
| `Footer` | Footer shell: `<footer>` container + bottom bar (tagline/copyright). Content via `children`. |
| `HomeSection` | Shared section wrapper for consistent spacing/typography (already exists). |

The platform's component library (`@components/*`) is also available: `Button`, `Card`, `Grid`, `Container`, `SectionShell`, `IconBox`, etc.

#### 5.3 Instance-specific components (move to studynode-content)

These leave the platform and move to the instance's `site/homepage/`:

| Component | Reason |
|-----------|--------|
| `Hero` | Branding-specific hero with styled CTA buttons |
| `NodeNetwork` (Background) | Animated canvas -- decorative, unique to studynode.net |
| `About` + `aboutData` | Teacher-specific "about" section with goal cards |
| `Homepage.module.css` | Custom homepage layout styles |

#### 5.4 Footer: Shell + Custom Content

The Footer component provides the structural shell. The instance fills in the content:

```typescript
// Platform's Footer component
export function Footer({ tagline, copyright, children }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <Container size="wide" className={styles.footerInner}>
        {children}                           {/* Instance-provided content */}
        <div className={styles.footerBar}>
          {tagline && <span>{tagline}</span>}
          {copyright && <span>{copyright}</span>}
        </div>
      </Container>
    </footer>
  );
}
```

studynode.net's Homepage.tsx:
```tsx
<Footer tagline="Gebaut mit ... fuers Lernen" copyright={copyrightText}>
  <div className={styles.footerGrid}>
    <div>
      <h3>StudyNode</h3>
      <p>Eine digitale Lernplattform...</p>
    </div>
    <div>
      <h3>Kontakt</h3>
      <a href="mailto:...">christian.contactmail@gmail.com</a>
    </div>
  </div>
</Footer>
```

Template's Homepage.tsx:
```tsx
<Footer tagline={config.homepage.footer.tagline} copyright={config.owner.copyright}>
  <p>{config.homepage.footer.description}</p>
</Footer>
```

#### 5.5 Template's minimal Homepage.tsx

```typescript
// Template's site/homepage/Homepage.tsx
import { CourseSection } from "@features/homepage/sections/CourseSection/CourseSection";
import { Footer } from "@features/homepage/sections/Footer/Footer";
import type { HomepageProps } from "@features/homepage/types";

export function Homepage({ siteConfig, courseGroups, isAdmin }: HomepageProps) {
  const config = siteConfig;
  const year = new Date().getFullYear();
  const copyright = config.owner.copyright?.replace("{year}", String(year));

  return (
    <main>
      <CourseSection groups={courseGroups} isAdmin={isAdmin} />
      <Footer tagline={config.homepage?.footer?.tagline} copyright={copyright}>
        <p>{config.homepage?.footer?.description}</p>
      </Footer>
    </main>
  );
}
```

#### 5.6 What Homepage receives as props

The homepage route passes standard props via a `HomepageProps` type (defined in platform):
- `siteConfig` -- full site configuration from `site.yml`
- `courseGroups` -- courses grouped by access level
- `isAdmin` -- whether current user is admin
- `sidebarData` -- sidebar navigation data
- `logoutAction` -- server action for logout

---

### 6) Files to Modify in the Platform

#### 6.1 `src/app/layout.tsx`
- Read metadata from `getSiteConfig()` instead of hardcoded values
- Dynamic `lang` attribute from `config.site.lang`
- Dynamic storage prefix in theme init script

#### 6.2 `src/app/(app)/page.tsx`
- Import `Homepage` from `@generated/site/Homepage`
- Pass standard `HomepageProps` (siteConfig, courseGroups, isAdmin, etc.)

#### 6.3 `src/features/homepage/` -- simplify to platform building blocks
- `CourseSection.tsx` -- keep, accept label props (reads from platform's `.de.json`)
- `Footer.tsx` -- refactor to shell component with `children` prop for custom content
- NEW: `types.ts` -- `HomepageProps` type definition
- Remove from platform: `Hero.tsx`, `About.tsx`, `NodeNetwork/`, `aboutData.ts`, `homepage.de.json`, `Homepage.module.css`

#### 6.4 `src/ui/layout/Navbar/Navbar.tsx`
- Replace `LAYOUT_TEXT.navbar.brand` with a `siteName` prop threaded through Layout

#### 6.5 `src/ui/layout/Navbar/NavbarDesktopLinks.tsx`
- Add `enabledFeatures` prop. Only render principles/practise links when enabled AND `groupKey` exists.

#### 6.6 `src/ui/contexts/ThemeContext.tsx`
- Accept `storageKey` prop instead of hardcoded `"sn-theme"`

#### 6.7 `src/app/providers.tsx`
- Accept and pass `storageKey` to `ThemeProvider`

#### 6.8 `src/ui/styles/tokens/colors.css`
- Rename `--sn-purple-*` variables to `--sn-brand-*` (pure rename, same values)

#### 6.9 All CSS files referencing `--sn-purple-*`
- Find-and-replace to `--sn-brand-*`

#### 6.10 `src/ui/styles/globals.css`
- Import `.generated/config/brand-colors.css` after token imports

---

### 7) Files to Move / Delete

#### Move from platform to studynode-content instance (`site/homepage/`)

| File | New location |
|------|-------------|
| `src/features/homepage/sections/Hero/Hero.tsx` + CSS | `site/homepage/sections/Hero/` |
| `src/features/homepage/sections/Background/NodeNetwork.tsx` + CSS | `site/homepage/sections/Background/` |
| `src/features/homepage/sections/About/About.tsx` + CSS + `aboutData.ts` | `site/homepage/sections/About/` |
| `src/features/homepage/Homepage.module.css` | `site/homepage/Homepage.module.css` |

A new `site/homepage/Homepage.tsx` is created in the instance that imports these local sections + platform components (CourseSection, Footer).

#### Delete from platform (no longer needed)

| File | Reason |
|------|--------|
| `src/features/homepage/homepage.de.json` | Content lives in instance's custom homepage |
| `src/features/homepage/Homepage.tsx` (current) | Replaced by `HomeSection` utility only; page imports from instance |

---

### 8) Files That Stay Unchanged (generic platform)

- All of `src/features/contentpage/` (macro system, rendering engine)
- All of `src/features/coursepage/` (course page rendering)
- All of `src/features/admin/` (admin panel)
- All of `src/features/access/` (auth system)
- All of `src/server/` (actions, services, repos, db, providers)
- All of `src/ui/components/` (reusable component library)
- Platform i18n files: `layout.de.json` (except `brand` key), `access.de.json`, `admin.de.json`, `contentpage.de.json`, `coursepage.de.json`

---

### 9) Opt-In Features: Principles + Practise

Both are teacher-specific features the platform provides but instances opt into.

#### 9.1 Principles

- `site.yml`: `features.principles: true/false` (default `false`)
- Content source: `content/principles/*.typ` (already in instance repo)
- When `false`: navbar hides link, route returns 404
- When `true`: works as today

#### 9.2 Practise

- `site.yml`: `features.practise: true/false` (default `false`)
- Currently a stub (hardcoded tasks in `practiceProvider.ts`, not in navigation)
- When `false`: practice route returns 404, no links shown
- When `true`: practice route is accessible at `[group]/[course]/[topic]/practice`
- Note: practise is still under development. The feature toggle just controls whether it's exposed. Future work will add real content loading and navigation integration.

#### 9.3 How toggles are enforced

- **Navbar**: `NavbarDesktopLinks.tsx` receives `enabledFeatures: { principles: boolean, practise: boolean }` and conditionally renders links
- **Routes**: Page components check `getSiteConfig().features` and return `notFound()` when disabled
- **Sidebar**: Similar conditional rendering

---

### 10) What the i18n `.de.json` Strings Classify As

| File | Classification | Action |
|------|---------------|--------|
| `homepage.de.json` | Instance-specific | Delete; content lives in instance's custom Homepage.tsx |
| `layout.de.json` | Platform (except `brand`) | Keep; `brand` key read from config |
| `access.de.json` | Platform | Keep unchanged |
| `admin.de.json` | Platform | Keep unchanged |
| `contentpage.de.json` | Platform | Keep unchanged |
| `coursepage.de.json` | Platform | Keep unchanged |

The platform stays German-only for now. Future i18n would swap `.de.json` files based on `site.lang`.

Note: CourseSection's labels ("Oeffentliche Kurse", "Kurs oeffnen", etc.) stay in a platform `.de.json` file since they're generic UI strings.

---

### 11) Future Extension Points (not implemented now, but preserved)

- **Custom pages beyond homepage**: Extend the `site/` directory pattern to `site/pages/` for arbitrary custom routes
- **Custom macros**: Macro registry already extensible; `site/macros/` could add custom content macros
- **Full i18n**: Replace `.de.json` with `locale/{lang}/` structure
- **Custom CSS**: `assets/overrides.css` in instance, copied by pipeline
- **Homepage section registry**: Allow custom section components to be registered and composed via config

---

## Implementation Checklist

### Phase 0: CSS Variable Rename (no functional change)
- [ ] Rename `--sn-purple-*` to `--sn-brand-*` in `colors.css`
- [ ] Find-and-replace all `--sn-purple-*` references in all `.module.css` and `.css` files
- [ ] Verify: `bun build` succeeds, site looks identical

### Phase 1: Pipeline Reads Site Config
- [ ] Create `website/pipeline/configParser/schema/siteConfig.ts` (Zod schema with features.principles + features.practise)
- [ ] Create `website/pipeline/configParser/defaults/defaultSiteConfig.ts`
- [ ] Add `loadSiteConfig()` to pipeline (resolves `site.yml` from parent, validates, writes `.generated/config/site.json`)
- [ ] Update `website/pipeline/main.ts` to call `loadSiteConfig()` early
- [ ] Add `resolveSiteConfigPath()` helper to `website/pipeline/io.ts`
- [ ] Create `site.yml` in instance repo root with current studynode.net values
- [ ] Verify: `bun generate` produces `.generated/config/site.json`

### Phase 2: Site Provider + Metadata
- [ ] Create `website/src/server/providers/siteProvider.ts`
- [ ] Update `src/app/layout.tsx`: dynamic metadata, lang, storage prefix from config
- [ ] Update `ThemeContext.tsx`: accept `storageKey` prop
- [ ] Update `providers.tsx`: pass `storageKey` through
- [ ] Verify: metadata and theme storage key come from config

### Phase 3: Homepage -- Instance-Provided + Platform Building Blocks
- [ ] Add pipeline step: copy `site/homepage/` to `.generated/site/homepage/`
- [ ] Define `HomepageProps` type in platform (`src/features/homepage/types.ts`)
- [ ] Refactor `Footer.tsx` to shell component (container + bottom bar + `children`)
- [ ] Keep `CourseSection.tsx` as platform building block, accept props
- [ ] Update `src/app/(app)/page.tsx` to import from `@generated/site/Homepage` and pass `HomepageProps`
- [ ] Move studynode.net homepage to instance repo: `Hero`, `NodeNetwork`, `About`, `aboutData`, `Homepage.module.css` -> `site/homepage/`
- [ ] Create `site/homepage/Homepage.tsx` in studynode-content that composes moved sections + platform components
- [ ] Create minimal `site/homepage/Homepage.tsx` in template (CourseSection + Footer only)
- [ ] Delete from platform: `homepage.de.json`, `aboutData.ts`, `Hero/`, `About/`, `Background/`
- [ ] Verify: studynode.net renders its custom homepage with moved components
- [ ] Verify: custom homepage can import platform components (`@components/*`, `@features/*`)

### Phase 4: Navbar + Layout + Feature Toggles
- [ ] Thread `siteName` and `enabledFeatures` through Layout -> Navbar chain
- [ ] Update `Navbar.tsx`: use `siteName` prop for brand text
- [ ] Update `NavbarDesktopLinks.tsx`: conditional principles + practise links based on feature flags
- [ ] Update principles route: check `features.principles`, return `notFound()` when disabled
- [ ] Update practice route: check `features.practise`, return `notFound()` when disabled
- [ ] Verify: navbar shows correct brand, feature toggles control visibility

### Phase 5: Brand Color Generation
- [ ] Add HSL color manipulation utilities to pipeline
- [ ] Generate `.generated/config/brand-colors.css` from `theme.brandColor`
- [ ] Import generated CSS in `globals.css` (after token imports)
- [ ] Verify: changing `brandColor` in `site.yml` + `bun generate` changes brand color

### Phase 6: Asset Copying
- [ ] Pipeline step to copy `assets/favicon.svg` -> `public/icon/`
- [ ] Pipeline step to copy `assets/og-image.png` -> `public/`
- [ ] Create `assets/` directory in instance repo
- [ ] Verify: custom favicon appears

### Phase 7: Template + Documentation
- [ ] Create template repo structure with placeholder `site.yml`
- [ ] Include minimal `site/homepage/Homepage.tsx` (CourseSection + Footer)
- [ ] Example content in template (minimal course)
- [ ] README with fork-and-customize instructions
- [ ] Test: fresh clone -> `bun setup` -> `bun generate` -> `bun dev` works

### Verification
- [ ] studynode.net renders correctly with custom homepage from `site/homepage/` (Hero, NodeNetwork, About, CourseSection, Footer)
- [ ] Template repo produces a working site with minimal homepage (CourseSection + Footer)
- [ ] Custom homepage imports platform components (`@components/*`, `@features/*`) without issues
- [ ] Changing `site.yml` values and running `bun generate` updates metadata, brand, navbar
- [ ] Feature toggles (principles, practise) control route availability and navbar links
- [ ] Brand color changes propagate to all UI elements
- [ ] `bun build` succeeds for both studynode-content and template instances
