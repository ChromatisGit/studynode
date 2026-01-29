# .typ File Format & Macro Syntax

The `.typ` format is a custom markup language used for educational content pages.
It is processed by the pipeline to produce JSON that the web app renders.

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
   - Strings: `"quoted"` or `'quoted'`
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
- **Parameters**: `source: "path/to/image.png"` (required)
```typ
#image(source: "diagram.png")
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
Fill-in-the-blank exercise. Gaps are marked with `{{ answer | alternative }}`.
- **Parameters**: `empty: boolean` (default: `true`)
  - `true`: Text input mode (user types answer)
  - `false`: MCQ mode (user selects from shuffled options)

```typ
#gap[
  The capital of France is {{ Paris }}.
  Water boils at {{ 100 | one hundred }} degrees Celsius.
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

```typ
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
    Return `n * 2`.
  ]

  #validation[
    ```ts
    assert(double(5) === 10);
    ```
  ]
]
```

## Content Directory Structure

Content is organized as:

```
content/
  base/
    <subjectId>/
      <topicId>/
        chapters.typ          # Topic title page
        <chapterFolder>/
          overview.typ        # Chapter overview
          worksheets/
            worksheet1.typ
            worksheet2.typ
```

Chapter folders can be prefixed with numbers for ordering (e.g., `01-intro`, `02-basics`).
The chapter ID is extracted by removing the numeric prefix.

## Markdown Support

Within content blocks, standard Markdown is supported:
- **Bold**: `**text**`
- **Italic**: `*text*`
- **Code**: `` `inline` `` or fenced blocks
- **Links**: `[text](url)`
- **Lists**: `-` or `1.`

The parser converts Markdown content to the `Markdown` type for rendering.
