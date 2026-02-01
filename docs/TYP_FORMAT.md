# .typ File Format & Macro Syntax

The `.typ` format is a custom markup language used for educational content pages.
It is processed by the pipeline to produce JSON that the web app renders.
The same files are also used to generate PDFs via Typst (`website/typst/worksheet-style.typ`).

This document describes:
- The `.typ` syntax (for the parser).
- The worksheet rendering model (web vs PDF).
- The visual spec for the PDF output.
- Macro-by-macro behavior and implementation notes.

## File Structure

Every `.typ` file must start with a title declaration, followed by optional sections:

```typ
#title[Page Title]

= Section Heading

Content goes here...

= Another Section

More content...
```

- **Title**: Required. Declared with `#title[...]`
- **Sections**: Declared with `= Section Heading` (single `=` at line start)
- **Content**: Markdown text and/or macros within each section

## Macros

Macros follow the pattern:

```
#macroName(param: value, param2: "string")[
  content
]
```

### Syntax Rules

1. **Name**: `#` followed by identifier (e.g., `#note`, `#mcq`)
2. **Parameters**: Optional, in parentheses with `key: value` pairs separated by commas
   - Strings: `"quoted"`
   - Booleans: `true` or `false`
   - Numbers: unquoted numeric literals
3. **Content**: Optional, in square brackets `[...]`
   - Brackets must be balanced
   - Content is trimmed and can span multiple lines

### Code Blocks

Fenced code blocks (triple backticks) inside macro content are protected during parsing:

````typ
#codeRunner[
  ```ts
  console.log("Hello");
  ```
]
````

## Available Macros

### Display Components

#### `#note`
Displays a note/info box.
```typ
#note[
  This is important information.
]
```

#### `#highlight`
Highlighted content with an icon.
- **Parameters**: `icon: "info" | "warning"` (default: `"info"`)
```typ
#highlight(icon: "warning")[
  Be careful with this!
]
```

#### `#image`
Displays an image.
- **Parameters**: `source: "path/to/image.png"` (required, source must be omitted)
```typ
#image("diagram.png")
```

#### `#table`
Renders a table. Rows are newline-separated, cells are comma-separated.
Use `\,` to escape commas within cells.
```typ
#table[
  Header 1, Header 2, Header 3
  Cell A, Cell B, Cell C
  Cell D, Cell E, Cell F
]
```

#### `#codeRunner`
Interactive code editor that can execute code.
Content must be a fenced code block with language specified.
- Supported languages: `ts`, `python`
````typ
#codeRunner[
  ```ts
  const x = 5;
  console.log(x * 2);
  ```
]
````

### Task Macros

Task macros are interactive exercises. They can be grouped with `#group`.

#### `#group`
Groups multiple task macros together, optionally with an intro.
```typ
#group[
  Optional intro text before the tasks.

  #mcq[
    First question?
    - [x] Correct
    - [ ] Wrong
  ]

  #mcq[
    Second question?
    - [ ] Wrong
    - [x] Correct
  ]
]
```

#### `#mcq`
Multiple choice question.
- **Parameters**:
  - `single: boolean` (default: `false`) - Single selection mode
  - `wideLayout: boolean` (default: `false`) - Wide layout for options
  - `shuffleOptions: boolean` (default: `true`) - Shuffle option order

Content includes the question text followed by a checklist:
- `- [x]` marks correct answer(s)
- `- [ ]` marks incorrect options

```typ
#mcq(single: true)[
  What is 2 + 2?

  - [ ] 3
  - [x] 4
  - [ ] 5
]
```

#### `#gap`
Fill-in-the-blank exercise. Gaps are marked with `(( answer | alternative ))`.
- **Parameters**: `mode: "text" | "mcq"` (default: `"text"`)
  - `text`: Text input mode (user types answer)
  - `mcq`: MCQ mode (user selects from shuffled options)

```typ
#gap[
  The capital of France is (( Paris )).
  Water boils at (( 100 | one hundred )) degrees Celsius.
]
```

#### `#textTask`
Free-form text task with hint and solution.
- **Inline macros** (required): `#hint[...]`, `#solution[...]`

```typ
#textTask[
  Explain the concept of recursion.

  #hint[
    Think about a function calling itself.
  ]

  #solution[
    Recursion is when a function calls itself...
  ]
]
```

#### `#mathTask`
Math problem with hint and solution.
- **Inline macros** (required): `#hint[...]`, `#solution[...]`

```typ
#mathTask[
  Calculate the derivative of f(x) = x^2.

  #hint[
    Use the power rule.
  ]

  #solution[
    f'(x) = 2x
  ]
]
```

#### `#codeTask`
Coding exercise with starter code, hint, solution, and optional validation.
- **Inline macros**:
  - `#starter[...]` (required) - Initial code template (fenced code block)
  - `#hint[...]` (required) - Hint text
  - `#solution[...]` (required) - Solution text
  - `#validation[...]` (optional) - Validation code (fenced code block)
- Supported languages: `ts`, `python`

````typ
#codeTask[
  Write a function that doubles a number.

  #starter[
    ```ts
    function double(n: number): number {
      // Your code here
    }
    ```
  ]

  #hint[
    Multiply the input by 2.
  ]

  #solution[
    ```ts
    function double(n: number): number {
      return 2*n
    }
    ```
  ]

  #validation[
    ```ts
    double(5) === 10;
    ```
  ]
]
````

## Markdown Support

Within content blocks, standard Markdown is supported:
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Code**: `` `inline` `` or fenced blocks
- **Links**: `[text](url)`
- **Lists**: `-` or `1.`

The parser converts Markdown content to the `Markdown` type for rendering.

---

## Worksheet Rendering Model (Web vs PDF)

The same `.typ` content is rendered in two places:
- Web: parsed to JSON and rendered by `WorksheetRenderer`.
- PDF: compiled by Typst using `worksheet-style.typ`.

### Section -> Category Mapping (Web)

Section headers are matched case-insensitively. The matching logic is in
`website/src/features/contentpage/config/categoryConfig.ts`.

- `Checkpoint` => checkpoint category
- `Aufgaben` or `Tasks` => core category
- `Challenges` or `Challenge` => challenge category
- Anything else => info category

### Category Layout (Web)

`WorksheetRenderer` converts sections into category blocks and items
(`website/src/features/contentpage/renderers/WorksheetRenderer.tsx`).

- Markdown paragraphs become info items.
- `#group[...]` becomes a task set with intro + tasks.
- Task macros (`#textTask`, `#mathTask`, `#codeTask`, `#mcq`, `#gap`) become task sets.
- Display macros (`#note`, `#highlight`, `#codeRunner`, `#table`, `#image`) are rendered inline.
- `== Subheader` becomes a subheader item.

### Task Numbering (Web)

Task numbering is handled by `TaskSetComponent`.

- `checkpoint` category has no numbering.
- `core` and `challenge` categories are numbered 1..N.
- A task set with multiple tasks shows a) b) c) labels.
- A single task shows a numbered badge.

---

## Macro Specifications (Web vs PDF)

Each macro below lists syntax, parameters, and how it is implemented in
the web renderer and in Typst.

### `#note`

- Syntax:
  ```typ
  #note[ ... ]
  ```
- Web: `NoteMacro` (`website/src/features/contentpage/macros/display/NoteMacro.tsx`)
  - Card with info icon, label, and text.
- PDF: Not implemented in `worksheet-style.typ` yet. (TODO)

### `#highlight`

- Syntax:
  ```typ
  #highlight(icon: "info" | "warning")[ ... ]
  ```
- Web: `HighlightMacro` (`website/src/features/contentpage/macros/display/HighlightMacro.tsx`)
  - Yellow (hint) or orange (warning) soft background.
- PDF: Not implemented in `worksheet-style.typ` yet. (TODO)

### `#image`

- Syntax:
  ```typ
  #image("path/to/image.png")
  ```
- Web: `ImageMacro` (`website/src/features/contentpage/macros/display/ImageMacro.tsx`)
- PDF: Uses Typst `#image` directly (built-in).

### `#table`

- Syntax:
  ```typ
  #table[
    Header 1, Header 2
    Row 1 Col 1, Row 1 Col 2
  ]
  ```
- Web: `TableMacro` (`website/src/features/contentpage/macros/display/TableMacro.tsx`)
  - Standard grid table with header styling.
- PDF: Uses Typst table function `worksheet-style.typ` yet. (TODO)

### `#codeRunner`

- Syntax:
  ````typ
  #codeRunner[
    ```ts
    console.log("Hello");
    ```
  ]
  ````
- Web: `CodeRunnerMacro` (`website/src/features/contentpage/macros/display/CodeRunnerMacro.tsx`)
  - Read-only code editor with run output.
- PDF: Not implemented in `worksheet-style.typ` yet. (TODO)
  - Code blocks should be styled by the raw block style.

### `#group`

- Syntax:
  ```typ
  #group[
    Intro text...
    #textTask[...]
    #mcq[...]
  ]
  ```
- Web: Becomes a `taskSet` with intro + tasks.
- PDF: Becomes a boxed card with similar styling.

### `#textTask`

- Syntax:
  ```typ
  #textTask[
    Instruction text...
    #hint[ ... ]
    #solution[ ... ]
  ]
  ```
- Web: `TextTaskMacro` (`website/src/features/contentpage/macros/input/TextTaskMacro.tsx`)
  - Free-text area + collapsible hint/solution.
- PDF: Should render the instruction text and print empty lines that takes as much space as the solution (a bit bigger so that students can write more) TODO.

### `#mathTask`

- Syntax:
  ```typ
  #mathTask[
    Instruction text...
    #hint[ ... ]
    #solution[ ... ]
  ]
  ```
- Web: `MathTaskMacro` (`website/src/features/contentpage/macros/input/MathTaskMacro.tsx`)
- PDF: Not part of this release.

### `#codeTask`

- Syntax:
  ```typ
  #codeTask[
    Instruction text...
    #starter[ ... ]
    #hint[ ... ]
    #solution[ ... ]
    #validation[ ... ]
  ]
  ```
- Web: `CodeTaskMacro` (`website/src/features/contentpage/macros/input/CodeTaskMacro.tsx`)
  - Code editor + run/check UI, hint/solution.
- PDF: Should render the instruction text and print empty lines that takes as much space as the solution (a bit bigger so that students can write more) TODO.


### `#mcq`

- Syntax:
  ```typ
  #mcq(single: true, wideLayout: false, shuffleOptions: true)[
    Question
    - [x] Correct
    - [ ] Wrong
  ]
  ```
- Web: `McqMacro` (`website/src/features/contentpage/macros/input/McqMacro.tsx`)
  - Options grid, checkbox/radio indicators, validation states.
- PDF: Currently rendered as a generic task block via `#task`

### `#gap`

- Syntax:
  ```typ
  #gap(mode: "text")[
    The capital is {{ Paris }}.
  ]
  ```
- Web: `GapMacro` (`website/src/features/contentpage/macros/input/GapMacro.tsx`)
  - Inline inputs or dropdowns with validation states.
- PDF: Implemented in `worksheet-style.typ`.
  - `mode: "text"` renders underscores as placeholders.
  - `mode: "mcq"` renders a list of possible answers.

### Inline macros

#### `#hint`
- Web: Part of an colapseable section
- PDF: Not rendered at all until a good solution is found

#### `#solution`
- Web: Part of an colapseable section
- PDF: Will be rendered in a separate "solution" pdf version. Not part of this release

#### `#starter`

- Web:
- PDF:

#### `#validation`

- Web: Used to validate solution of `#codeTask`
- PDF: Not required at all, should therefore be hidden
