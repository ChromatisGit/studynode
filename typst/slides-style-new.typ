// slides-style-new.typ
// Didactic slide system for StudyNode PDF output.
// 9 slide types derived from teaching situations, not subject matter.
// Web pipeline and CSS translation follow in a later step.

// ─── Design System ────────────────────────────────────────────────────────────

#let colors = (
  page:    rgb(248, 247, 255),   // --sn-bg: lavender tint
  surface: rgb(255, 255, 255),   // white card
  text:    rgb(29,  24,  48),    // --sn-text
  muted:   rgb(112, 106, 138),   // subdued text
  border:  rgb(219, 214, 240),   // --sn-border
  purple:  rgb(124,  53, 184),   // --sn-purple-accent
  blue:    rgb(87,  132, 236),   // --sn-blue-accent
  orange:  rgb(235, 128,  35),   // --sn-orange-accent
  green:   rgb(46,  133,  85),   // --sn-green-accent
  teal:    rgb(50,  152, 154),   // --sn-teal-accent
)

#let tints = (
  purple: rgb(245, 235, 255),
  blue:   rgb(236, 242, 255),
  orange: rgb(255, 244, 230),
  green:  rgb(235, 248, 240),
  teal:   rgb(230, 248, 248),
  muted:  rgb(248, 247, 255),
)

#let radius  = 8pt
#let padding = (xs: 4pt, sm: 8pt, md: 14pt, lg: 20pt)
#let gap     = (xs: 6pt, sm: 10pt, md: 16pt, lg: 24pt, xl: 32pt)

#let font-body = ("DM Sans", "Segoe UI", "Inter")
#let font-mono = ("Cascadia Code", "Cascadia Mono", "Consolas")

// Save built-ins before shadowing
#let _std-image = image
#let _std-link  = link
#let _std-list  = list


// ─── Main Style ───────────────────────────────────────────────────────────────

#let slides-style(body) = {
  show: doc => {
    set page(
      width:  33.87cm,
      height: 19.05cm,   // 16:9
      margin: (x: 1.5cm, y: 1.0cm),
      fill: colors.page,
      background: {
        // subtle drop shadow
        place(center + horizon, dy: 3pt,
          block(
            width:  33.87cm - 0.8cm,
            height: 19.05cm - 0.6cm,
            fill:   rgb("#1d183012"),
            radius: 16pt,
          )
        )
        // white card
        place(center + horizon,
          block(
            width:  33.87cm - 0.8cm,
            height: 19.05cm - 0.6cm,
            fill:   white,
            radius: 16pt,
            stroke: 0.7pt + colors.border,
          )
        )
      },
    )
    set text(font: font-body, size: 13pt, fill: colors.text)
    set par(leading: 0.8em)
    doc
  }
  body
}


// ─── Presenter Notes — invisible in PDF ───────────────────────────────────────

#let pn(body) = []


// ─── Title Slide ──────────────────────────────────────────────────────────────

#let title(body) = {
  align(center + horizon, {
    text(size: 9pt, fill: colors.muted, weight: "medium")[Foliensatz zu]
    v(gap.sm)
    text(size: 26pt, weight: "bold", fill: colors.text, body)
    v(gap.md)
    line(length: 3cm, stroke: 2pt + colors.purple)
  })
  place(bottom + center,
    text(size: 7.5pt, fill: colors.muted)[
      Statischer PDF-Export — im Unterricht wurde eine interaktive Version auf studynode.de verwendet.
    ]
  )
  pagebreak(weak: false)
}


// ─── Internal Helpers ─────────────────────────────────────────────────────────

// Small colored pill label
#let _badge(label, color) = box(
  inset: (x: 5pt, y: 2pt),
  radius: 3pt,
  fill: color.transparentize(82%),
  text(size: 8pt, weight: "bold", fill: color, upper(label))
)

// Badge + title in one line, followed by a divider
#let _header(badge-label, badge-color, slide-title) = {
  grid(
    columns: (auto, 1fr),
    column-gutter: 7pt,
    align(center + horizon, _badge(badge-label, badge-color)),
    align(left + horizon,
      text(size: 15pt, weight: "bold", fill: colors.text, slide-title)
    ),
  )
  v(gap.xs)
  line(length: 100%, stroke: 0.5pt + colors.border)
  v(gap.md)
}

// Colored statement / question box
#let _focus-box(content, accent) = {
  block(
    width: 100%,
    radius: radius,
    fill: accent.transparentize(91%),
    stroke: (left: 3.5pt + accent, rest: 0.5pt + accent.transparentize(65%)),
    inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
    { set text(size: 14pt); content }
  )
  v(gap.md)
}

// Result / answer / conclusion box
#let _result-box(content, accent, label) = {
  block(
    width: 100%,
    radius: radius,
    fill: accent.transparentize(90%),
    stroke: (left: 3.5pt + accent, rest: 0.5pt + accent.transparentize(65%)),
    inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
    {
      text(size: 8pt, weight: "bold", fill: accent, upper(label))
      v(gap.xs)
      set text(size: 13pt)
      content
    }
  )
  v(gap.sm)
}

// Numbered list with colored circle badges
#let _steps-list(items, badge-color) = {
  for i in range(items.len()) {
    grid(
      columns: (24pt, 1fr),
      column-gutter: 10pt,
      align(top,
        block(
          width: 24pt, height: 24pt,
          fill: badge-color, radius: 12pt,
          align(center + horizon,
            text(size: 10pt, weight: "bold", fill: white, str(i + 1))
          )
        )
      ),
      pad(top: 3pt, items.at(i))
    )
    if i < items.len() - 1 { v(gap.md) }
  }
  v(gap.md)
}

// Layout helper: text-content and material side-by-side or stacked
#let _with-material(text-content, mat, layout) = {
  if mat == none {
    text-content
  } else if layout == "split" {
    grid(
      columns: (2fr, 1fr),
      column-gutter: gap.lg,
      text-content,
      mat,
    )
  } else {
    // stacked
    text-content
    mat
  }
}


// ─── Material Helpers ─────────────────────────────────────────────────────────

#let formula(expr: none) = {
  align(center,
    block(
      stroke: (top: 2pt + colors.purple, bottom: 2pt + colors.purple, rest: 0.5pt + colors.border),
      radius: radius,
      fill: tints.purple,
      inset: (x: padding.lg, y: padding.md),
      { set text(size: 15pt); expr }
    )
  )
  v(gap.md)
}

#let link(url: "", label: none) = {
  let display = if label != none { label } else { text(url) }
  block(
    width: 100%,
    inset: (x: padding.md, y: padding.sm),
    radius: radius,
    stroke: 0.8pt + colors.blue,
    fill: tints.blue,
    grid(
      columns: (auto, 1fr, auto),
      column-gutter: 6pt,
      align(center + horizon, text(size: 10pt, fill: colors.blue)[→]),
      align(left + horizon, text(size: 10pt, fill: colors.blue, weight: "semibold", display)),
      align(right + horizon, text(size: 7.5pt, fill: colors.muted)[(öffnet im Browser)]),
    )
  )
  v(gap.md)
}

#let image(file: "", label: none) = {
  block(
    width: 100%,
    height: 5cm,
    stroke: (paint: colors.border, dash: "dashed"),
    radius: radius,
    fill: tints.muted,
    align(center + horizon,
      text(size: 9pt, fill: colors.muted, style: "italic")[Bild: #file]
    )
  )
  if label != none {
    v(gap.xs)
    align(center, text(size: 9pt, fill: colors.muted, label))
  }
  v(gap.md)
}

#let list(body) = {
  set _std-list(marker: text(fill: colors.purple)[•])
  body
  v(gap.md)
}


// ─── 1. sectionSlide ──────────────────────────────────────────────────────────
// Full purple background — no white card. Purely orientational.

#let sectionSlide(title: [], subtitle: none, pn: none) = {
  pagebreak(weak: true)
  // Purple overlay covering the white card (card = page - 0.8cm each side)
  place(top + left, dx: -1.5cm, dy: -1.0cm,
    block(
      width:  33.87cm - 0.8cm,
      height: 19.05cm - 0.6cm,
      fill:   colors.purple,
      radius: 16pt,
    )
  )
  // Centered content — placed after the rect so it renders above it
  place(center + horizon,
    block(width: 26cm,
      align(center, {
        if subtitle != none {
          text(size: 11pt, weight: "medium", fill: white.transparentize(35%), subtitle)
          v(gap.sm)
        }
        text(size: 34pt, weight: "bold", fill: white, title)
        v(gap.md)
        line(length: 4cm, stroke: 1.5pt + white.transparentize(55%))
      })
    )
  )
  v(16.5cm) // page filler so next slide starts on a new page
}


// ─── 2. hookSlide ─────────────────────────────────────────────────────────────
// Opens a problem or guiding question. Creates curiosity.
// focus = Leitfrage (orange box). material below or split right.
// No result (spec).

#let hookSlide(
  title:    [],
  focus:    none,
  material: none,
  steps:    none,
  layout:   "stacked",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Einstieg", colors.orange, title)

  if layout == "split" and material != none {
    grid(
      columns: (2fr, 1fr),
      column-gutter: gap.lg,
      {
        if focus != none { _focus-box(focus, colors.orange) }
        if steps != none { _steps-list(steps, colors.orange) }
      },
      material,
    )
  } else {
    // stacked: focus → material → steps
    if focus    != none { _focus-box(focus, colors.orange) }
    if material != none { material }
    if steps    != none { _steps-list(steps, colors.orange) }
  }
}


// ─── 3. conceptSlide ──────────────────────────────────────────────────────────
// Introduces a concept, rule, or definition.
// focus = core statement (purple definition box). steps clarify it.
// No result (spec).

#let conceptSlide(
  title:    [],
  focus:    none,
  steps:    none,
  material: none,
  layout:   "stacked",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Konzept", colors.purple, title)

  // focus always full-width above content
  if focus != none { _focus-box(focus, colors.purple) }

  if layout == "split" and material != none {
    grid(
      columns: (2fr, 1fr),
      column-gutter: gap.lg,
      { if steps != none { _steps-list(steps, colors.purple) } },
      material,
    )
  } else {
    if material != none { material }
    if steps    != none { _steps-list(steps, colors.purple) }
  }
}


// ─── 4. compareSlide ──────────────────────────────────────────────────────────
// Contrasts two or more things.
// focus = comparison question (blue box). columns = side-by-side panels.
// result = synthesis conclusion (purple — Erkenntnis, not a solution).

#let compareSlide(
  title:   [],
  focus:   none,
  columns: (),
  result:  none,
  pn:      none,
) = {
  pagebreak(weak: true)
  _header("Vergleich", colors.blue, title)

  if focus != none { _focus-box(focus, colors.blue) }

  // Build column grid: header row + content row
  let count = columns.len()
  if count > 0 {
    let col-fractions = (1fr,) * count
    let header-cells = ()
    let content-cells = ()
    for col in columns {
      header-cells.push(
        block(
          width: 100%,
          stroke: (bottom: 1.5pt + colors.blue),
          inset: (bottom: 6pt, top: 0pt, x: 0pt),
          text(size: 11pt, weight: "bold", fill: colors.blue, col.title)
        )
      )
      content-cells.push(pad(top: 8pt, col.content))
    }
    grid(
      columns:        col-fractions,
      column-gutter:  gap.lg,
      row-gutter:     0pt,
      ..header-cells,
      ..content-cells,
    )
    v(gap.md)
  }

  if result != none { _result-box(result, colors.purple, "Fazit") }
}


// ─── 5. exampleSlide ──────────────────────────────────────────────────────────
// Shows a worked example, optionally with step-by-step derivation.
// No focus. result = final answer (green — Lösung).
// revealAll: no effect in PDF (all content always visible).

#let exampleSlide(
  title:     [],
  material:  none,
  steps:     none,
  result:    none,
  revealAll: false,
  layout:    "stacked",
  pn:        none,
) = {
  pagebreak(weak: true)
  _header("Beispiel", colors.muted, title)

  // stacked: material → steps → result
  if material != none { material }
  if steps    != none { _steps-list(steps, colors.muted) }
  if result   != none { _result-box(result, colors.green, "Lösung") }
}


// ─── 6. promptSlide ───────────────────────────────────────────────────────────
// Question for classroom dialogue.
// focus = question (blue box). result = answer (green — revealed on click in live).
// Default layout: split when material present, stacked otherwise.

#let promptSlide(
  title:    [],
  focus:    none,
  material: none,
  result:   none,
  layout:   auto,
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Frage", colors.blue, title)

  let eff-layout = if layout == auto {
    if material != none { "split" } else { "stacked" }
  } else { layout }

  if eff-layout == "split" and material != none {
    grid(
      columns: (2fr, 1fr),
      column-gutter: gap.lg,
      { if focus != none { _focus-box(focus, colors.blue) } },
      material,
    )
  } else {
    if focus    != none { _focus-box(focus, colors.blue) }
    if material != none { material }
  }

  if result != none { _result-box(result, colors.green, "Antwort") }
}


// ─── 7. taskSlide ─────────────────────────────────────────────────────────────
// Work assignment. focus dominates the slide visually.
// focus = instruction (large, teal fill, white text). No result (spec).

#let taskSlide(
  title:    [],
  focus:    none,
  material: none,
  layout:   "stacked",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Auftrag", colors.teal, title)

  if focus != none {
    block(
      width: 100%,
      radius: radius,
      fill: colors.teal,
      inset: (x: padding.lg, y: gap.xl),
      align(center,
        text(size: 21pt, weight: "bold", fill: white, focus)
      )
    )
    v(gap.md)
  }

  if material != none { material }
}


// ─── 8. recapSlide ────────────────────────────────────────────────────────────
// Secures key insights. steps = core points (green badges, extra spacing).
// No focus, no result (spec).

#let recapSlide(
  title: [],
  steps: (),
  pn:    none,
) = {
  pagebreak(weak: true)
  _header("Zusammenfassung", colors.green, title)

  for i in range(steps.len()) {
    grid(
      columns: (24pt, 1fr),
      column-gutter: 10pt,
      align(top,
        block(
          width: 24pt, height: 24pt,
          fill: colors.green, radius: 12pt,
          align(center + horizon,
            text(size: 10pt, weight: "bold", fill: white, str(i + 1))
          )
        )
      ),
      pad(top: 3pt, steps.at(i))
    )
    if i < steps.len() - 1 { v(gap.lg) }  // generous spacing for recap
  }
  v(gap.md)
}


// ─── 9. quizSlide ─────────────────────────────────────────────────────────────
// Interactive multiple-choice question (answered via devices in live class).
// In PDF: options listed vertically, correct answer marked green.

#let quizSlide(
  title:   [],
  focus:   none,
  options: (),
  correct: 1,
  pn:      none,
) = {
  pagebreak(weak: true)
  _header("Quiz", colors.orange, title)

  if focus != none { _focus-box(focus, colors.orange) }

  let letters = ("A", "B", "C", "D")
  for i in range(options.len()) {
    let is-correct   = (i + 1) == correct
    let item-fill    = if is-correct { tints.green  } else { white }
    let item-stroke  = if is-correct { colors.green } else { colors.border }
    let badge-fill   = if is-correct { colors.green } else { colors.orange }

    block(
      width: 100%,
      radius: radius,
      fill: item-fill,
      stroke: 0.6pt + item-stroke,
      inset: (x: padding.lg, y: padding.md),
      grid(
        columns: (26pt, 1fr),
        column-gutter: 10pt,
        align(center + horizon,
          block(
            width: 24pt, height: 24pt,
            radius: 12pt,
            fill: badge-fill,
            align(center + horizon,
              text(size: 10pt, weight: "bold", fill: white,
                letters.at(i, default: "?"))
            )
          )
        ),
        align(horizon, text(size: 13pt, options.at(i)))
      )
    )
    if i < options.len() - 1 { v(gap.xs) }
  }
  v(gap.md)
}
