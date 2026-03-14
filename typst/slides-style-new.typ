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

// Slide format: "16:9" (default, 33.87 × 19.05 cm) or "4:3" (25.4 × 19.05 cm)
#let slide-format = "4:3"

#let _page-w = if slide-format == "4:3" { 25.4cm  } else { 33.87cm }
#let _page-h = if slide-format == "4:3" { 19.05cm } else { 19.05cm }
#let _card-w = _page-w - 0.8cm
#let _card-h = _page-h - 0.6cm

// Minimum widths for cards and bullet point containers (in cm)
#let card-min-width   = 12cm  // focus-box and result-box
#let points-min-width = 9cm   // bullet point container

#let font-body = ("DM Sans", "Segoe UI", "Inter")
#let font-mono = ("Cascadia Code", "Cascadia Mono", "Consolas")

// Typography scale — all sizes proportional to font-size-base
#let font-size-base = 13pt
#let fs-tiny    = font-size-base * 0.577  // ≈  7.5pt — minor hint text
#let fs-badge   = font-size-base * 0.615  // ≈  8pt   — badge labels
#let fs-caption = font-size-base * 0.692  // ≈  9pt   — captions, image labels
#let fs-small   = font-size-base * 0.769  // ≈ 10pt   — link text, quiz elements
#let fs-sub     = font-size-base * 0.846  // ≈ 11pt   — section subtitle
#let fs-minor   = font-size-base * 0.923  // ≈ 12pt   — card body text
#let fs-body    = font-size-base          // = 13pt   — default body text
#let fs-focus   = font-size-base * 1.077  // ≈ 14pt   — focus box content
#let fs-heading = font-size-base * 1.154  // ≈ 15pt   — headers, card titles, formula
#let fs-task    = font-size-base * 1.615  // ≈ 21pt   — task slide focus
#let fs-title   = font-size-base * 2.0    // ≈ 26pt   — title slide
#let fs-section = font-size-base * 2.615  // ≈ 34pt   — section slide

// Save built-ins before shadowing
#let _std-image  = image
#let _std-link   = link
#let _std-list   = list
#let _std-layout = layout


// ─── Main Style ───────────────────────────────────────────────────────────────

#let slides-style(body) = {
  show: doc => {
    set page(
      width:  _page-w,
      height: _page-h,
      margin: (x: 1.5cm, y: 1.0cm),
      fill: colors.page,
      background: {
        // subtle drop shadow
        place(center + horizon, dy: 3pt,
          block(
            width:  _card-w,
            height: _card-h,
            fill:   rgb("#1d183012"),
            radius: 16pt,
          )
        )
        // white card
        place(center + horizon,
          block(
            width:  _card-w,
            height: _card-h,
            fill:   white,
            radius: 16pt,
            stroke: 0.7pt + colors.border,
          )
        )
      },
    )
    set text(font: font-body, size: font-size-base, fill: colors.text)
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
    text(size: fs-caption, fill: colors.muted, weight: "medium")[Foliensatz zu]
    v(gap.sm)
    text(size: fs-title, weight: "bold", fill: colors.text, body)
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
  text(size: fs-badge, weight: "bold", fill: color, upper(label))
)

// Badge + title in one line, followed by a divider
#let _header(badge-label, badge-color, slide-title) = {
  grid(
    columns: (auto, 1fr),
    column-gutter: 7pt,
    align(center + horizon, _badge(badge-label, badge-color)),
    align(left + horizon,
      text(size: fs-heading, weight: "bold", fill: colors.text, slide-title)
    ),
  )
  v(gap.xs)
  line(length: 100%, stroke: 0.5pt + colors.border)
  v(gap.md)
}

// Colored statement / question box
// Auto-width: grows to fit content, but never narrower than card-min-width-ratio of available width.
// Text inside is always left-aligned.
#let _focus-box(content, accent) = {
  layout(size => context {
    let min-w  = card-min-width
    let inner  = { set text(size: fs-focus); set align(left); content }
    let proto  = block(
      radius: radius,
      inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
      inner,
    )
    let w = calc.max(calc.min(measure(proto).width, size.width), min-w)
    block(
      width: w,
      radius: radius,
      fill: accent.transparentize(91%),
      stroke: (left: 3.5pt + accent, rest: 0.5pt + accent.transparentize(65%)),
      inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
      inner,
    )
  })
  v(gap.md)
}

// Result card — no label/title, content only. Text always left-aligned.
// centered: true → the box itself is centered on the slide (text stays left inside)
#let _result-box(content, accent, centered: false) = {
  layout(size => context {
    let min-w = card-min-width
    let inner = { set align(left); set text(size: fs-body); content }
    let proto = block(
      radius: radius,
      inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
      inner,
    )
    let w = calc.max(calc.min(measure(proto).width, size.width), min-w)
    let the-block = block(
      width: w,
      radius: radius,
      fill: accent.transparentize(90%),
      stroke: (left: 3.5pt + accent, rest: 0.5pt + accent.transparentize(65%)),
      inset: (left: padding.lg, right: padding.lg, top: padding.md, bottom: padding.md),
      inner,
    )
    if centered { align(center, the-block) } else { the-block }
  })
  v(gap.sm)
}

// Bullet point list with colored dot markers.
// Rendered inside an invisible container: auto-width, min points-min-width-ratio of available width.
// Text inside is always left-aligned.
#let _points-list(items, bullet-color, min-width: points-min-width, font-size: none) = {
  layout(size => context {
    let min-w = min-width
    let rows = {
      set align(left)
      if font-size != none { set text(size: font-size) }
      for i in range(items.len()) {
        grid(
          columns: (14pt, 1fr),
          column-gutter: 8pt,
          align(top, pad(top: 4pt,
            block(width: 7pt, height: 7pt, radius: 3.5pt, fill: bullet-color)
          )),
          pad(top: 1pt, items.at(i))
        )
        if i < items.len() - 1 { v(gap.sm) }
      }
    }
    let proto = block(rows)
    let w = calc.max(calc.min(measure(proto).width, size.width), min-w)
    block(width: w, rows)
  })
  v(gap.md)
}

// Layout helper: left text-content and right material according to layout
// "split" (default): 2-col grid when material present, single column otherwise
// "center": everything stacked and center-aligned
#let _with-material(text-content, mat, layout) = {
  if layout == "center" {
    align(center, {
      text-content
      if mat != none { mat }
    })
  } else {
    // split (default)
    if mat != none {
      grid(
        columns: (1fr, 1fr),
        column-gutter: gap.lg,
        text-content,
        mat,
      )
    } else {
      text-content
    }
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
      { set text(size: fs-heading); expr }
    )
  )
  v(gap.md)
}

#let link(url: "", label: none) = {
  let display = if label != none { label } else { text(url) }
  block(
    width: card-min-width,
    inset: (x: padding.md, y: padding.sm),
    radius: radius,
    stroke: 0.8pt + colors.blue,
    fill: tints.blue,
    grid(
      columns: (auto, 1fr, auto),
      column-gutter: 6pt,
      align(center + horizon, text(size: fs-small, fill: colors.blue)[→]),
      align(left + horizon, text(size: fs-small, fill: colors.blue, weight: "semibold", display)),
      align(right + horizon, text(size: fs-tiny, fill: colors.muted)[(öffnet im Browser)]),
    )
  )
  v(gap.md)
}

#let image(file: "", label: none, height: 1fr) = {
  // height: 1fr (default) fills remaining page height — correct for standalone page-flow use.
  // Pass height: auto when the image is inside a grid cell to prevent row expansion.
  align(center,
    _std-image(
      file,
      width:  100%,
      height: height,
      fit:    "contain",
    )
  )
  if label != none {
    align(center, text(size: fs-caption, fill: colors.muted, label))
  }
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
          text(size: fs-sub, weight: "medium", fill: white.transparentize(35%), subtitle)
          v(gap.sm)
        }
        text(size: fs-section, weight: "bold", fill: white, title)
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
  points:   none,
  layout:   "center",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Einstieg", colors.orange, title)

  _with-material(
    {
      if focus  != none { _focus-box(focus, colors.orange) }
      if points != none { _points-list(points, colors.orange) }
    },
    material,
    layout,
  )
}


// ─── 3. conceptSlide ──────────────────────────────────────────────────────────
// Introduces a concept, rule, or definition.
// focus = core statement (purple definition box). steps clarify it.
// No result (spec).

#let conceptSlide(
  title:    [],
  focus:    none,
  points:   none,
  material: none,
  layout:   "center",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Konzept", colors.purple, title)

  _with-material(
    {
      if focus  != none { _focus-box(focus, colors.purple) }
      if points != none { _points-list(points, colors.purple) }
    },
    material,
    layout,
  )
}


// ─── 4. compareSlide ──────────────────────────────────────────────────────────
// Contrasts two or more things.
// focus = comparison question (blue box). columns = side-by-side cards.
// result = synthesis conclusion (purple — Erkenntnis, not a solution).
// layout kept for API compatibility; alignment is determined by card count.
// reveal: "all" | "rowWise" | "colWise" — ignored in PDF (all content always visible).
// columns items: (title: [], content: ([], [], ...))

#let compareSlide(
  title:   [],
  focus:   none,
  columns: (),
  result:  none,
  reveal:  "rowWise",
  layout:  "center",
  pn:      none,
) = {
  pagebreak(weak: true)
  _header("Vergleich", colors.blue, title)

  if focus != none { align(center, _focus-box(focus, colors.blue)) }

  let count = columns.len()
  if count > 0 {
    _std-layout(size => context {
      let min-card-w = 0.30 * _page-w   // 30 % of page width ≈ 10.2 cm
      let gutter     = gap.lg
      let use-fixed  = count <= 2

      // Actual outer card width (needed for accurate height measurement)
      let card-w = if use-fixed {
        min-card-w
      } else {
        (size.width - (count - 1) * gutter) / count
      }

      // Shared card inner content builder — content is an array of bullet items
      let card-inner(col) = {
        align(center, text(size: fs-heading, weight: "bold", fill: colors.text, col.title))
        line(length: 100%, stroke: 0.6pt + colors.blue.transparentize(60%))
        v(6pt)
        {
          set align(left)
          set text(size: fs-minor)
          let items = col.content
          for i in range(items.len()) {
            grid(
              columns: (12pt, 1fr),
              column-gutter: 6pt,
              align(top, pad(top: 3pt,
                block(width: 6pt, height: 6pt, radius: 3pt, fill: colors.blue)
              )),
              pad(top: 1pt, items.at(i)),
            )
            if i < items.len() - 1 { v(gap.xs) }
          }
        }
      }

      // Measure each card at its real width to find the tallest
      let max-h = columns.fold(0pt, (acc, col) => calc.max(acc,
        measure(block(
          width: card-w,
          inset: (x: padding.lg, y: padding.md),
          card-inner(col),
        )).height
      ))

      let col-widths = if use-fixed { (min-card-w,) * count } else { (1fr,) * count }

      let cards = columns.map(col =>
        block(
          width:  100%,
          height: max-h,
          radius: radius,
          fill:   colors.blue.transparentize(91%),
          stroke: 0.6pt + colors.border,
          inset:  (x: padding.lg, y: padding.md),
          card-inner(col),
        )
      )

      let g = grid(
        columns:       col-widths,
        column-gutter: gutter,
        ..cards,
      )

      if use-fixed { align(center, g) } else { g }
    })
    v(gap.md)
  }

  if result != none {
    _result-box(result, colors.purple, centered: true)
  }
}


// ─── 5. exampleSlide ──────────────────────────────────────────────────────────
// Shows a worked example, optionally with step-by-step derivation.
// No focus. result = final answer (green — Lösung).
// revealAll: no effect in PDF (all content always visible).

#let exampleSlide(
  title:     [],
  material:  none,
  points:    none,
  result:    none,
  revealAll: false,
  layout:    "center",
  pn:        none,
) = {
  pagebreak(weak: true)
  _header("Beispiel", colors.muted, title)

  _with-material(
    { if points != none { _points-list(points, colors.muted) } },
    material,
    layout,
  )
  if result != none {
    _result-box(result, colors.green,
      centered: layout == "center" or material != none)
  }
}


// ─── 6. promptSlide ───────────────────────────────────────────────────────────
// Question for classroom dialogue.
// focus = question (blue box). result = answer (green — revealed on click in live).
// focus + material follow layout. result always centered.

#let promptSlide(
  title:    [],
  focus:    none,
  material: none,
  points:   none,
  result:   none,
  layout:   "center",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Frage", colors.blue, title)

  _with-material(
    {
      if focus  != none { _focus-box(focus, colors.blue) }
      if points != none { _points-list(points, colors.blue) }
    },
    material,
    layout,
  )
  if result != none {
    _result-box(result, colors.green, centered: true)
  }
}


// ─── 7. taskSlide ─────────────────────────────────────────────────────────────
// Work assignment. focus dominates the slide visually.
// focus = instruction (large, teal fill, white text). No result (spec).

#let taskSlide(
  title:    [],
  focus:    none,
  points:   none,
  result:   none,
  material: none,
  layout:   "center",
  pn:       none,
) = {
  pagebreak(weak: true)
  _header("Auftrag", colors.teal, title)

  // Big teal focus block — always full-width, layout-independent
  if focus != none {
    block(
      width: 100%,
      radius: radius,
      fill: colors.teal,
      inset: (x: padding.lg, y: gap.xl),
      align(center,
        text(size: fs-task, weight: "bold", fill: white, focus)
      )
    )
    v(gap.md)
  }

  _with-material(
    { if points != none { _points-list(points, colors.teal) } },
    material,
    layout,
  )
  if result != none {
    _result-box(result, colors.teal, centered: true)
  }
}


// ─── 8. recapSlide ────────────────────────────────────────────────────────────
// Secures key insights. steps = core points (green badges, extra spacing).
// No focus, no result (spec).

#let recapSlide(
  title:  [],
  points: (),
  layout: "center",
  pn:     none,
) = {
  pagebreak(weak: true)
  _header("Zusammenfassung", colors.green, title)

  if layout == "center" {
    align(center, _points-list(points, colors.green, min-width: card-min-width, font-size: fs-heading))
  } else {
    _points-list(points, colors.green, min-width: card-min-width, font-size: fs-heading)
  }
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
              text(size: fs-small, weight: "bold", fill: white,
                letters.at(i, default: "?"))
            )
          )
        ),
        align(horizon, text(size: fs-body, options.at(i)))
      )
    )
    if i < options.len() - 1 { v(gap.xs) }
  }
  v(gap.md)
}
