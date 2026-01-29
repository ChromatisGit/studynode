# StudyNode Styling Guidelines

## 1. Design Tokens - Always Use CSS Variables

**Never use hardcoded colors, spacing, or sizes. Always use design tokens.**

### Colors (`--sn-*`)

```css
/* Neutrals */
--sn-bg                    /* Page background */
--sn-surface               /* Card/panel background */
--sn-surface-raised        /* Elevated surface (hover states, inputs) */
--sn-surface-deep          /* Deeper surfaces */
--sn-text                  /* Primary text */
--sn-text-muted            /* Secondary/muted text */
--sn-border                /* Standard borders */

/* Accent Colors (each has: accent, accent-strong, accent-soft-bg, accent-soft-border) */
--sn-purple-accent*        /* Primary/brand color */
--sn-green-accent*         /* Success states */
--sn-red-accent*           /* Error/danger states */
--sn-orange-accent*        /* Warning states */
--sn-blue-accent*          /* Info states */
--sn-teal-accent*          /* Secondary accent */
--sn-yellow-accent*        /* Hints */
--sn-gray*                 /* Neutral actions */

/* Special */
--sn-text-on-accent        /* Text on colored backgrounds (#ffffff) */
--sn-code-bg               /* Code block background (dark) */
--sn-code-text             /* Code block text */
--sn-code-bg-border        /* Code block border */
```

### Spacing (`--sn-space-*`)

```css
--sn-space-xs: 0.5rem;     /* 8px - tight spacing */
--sn-space-sm: 0.75rem;    /* 12px - small gaps */
--sn-space-md: 1rem;       /* 16px - standard */
--sn-space-lg: 1.5rem;     /* 24px - section gaps */
--sn-space-xl: 2rem;       /* 32px - large sections */
--sn-space-2xl: 3rem;      /* 48px - page sections */
```

### Border Radius (`--sn-radius-*`)

```css
--sn-radius-xxs: 6px;
--sn-radius-xs: 8px;
--sn-radius-sm: 10px;
--sn-radius-md: 12px;
--sn-radius-lg: 14px;
--sn-radius-xl: 18px;
```

### Typography

```css
--sn-font-body             /* Body text font stack */
--sn-font-mono             /* Monospace/code font */
--sn-font-normal: 400;
--sn-font-medium: 500;
--sn-font-semibold: 600;
--sn-font-bold: 700;
```

### Layout

```css
--sn-page-padding: 1.5rem;
--sn-navbar-height: 60px;
--sn-content-width-narrow: 960px;
--sn-content-width-wide: 1120px;
```

### Shadows

```css
--sn-shadow-lw             /* Light shadow (cards) */
--sn-shadow-md             /* Medium shadow (modals) */
```

---

## 2. CSS Module Conventions

- Use **CSS Modules** (`.module.css`) for component styles
- Use **camelCase** for class names: `.taskBadge`, `.optionButton`
- Target global classes inside modules with `:global()`:

```css
.myComponent :global(.sn-markdown) {
  /* styles */
}
```

---

## 3. Common Patterns

### Buttons/Interactive Elements

```css
.button {
  background: var(--sn-surface-raised);
  border: 1px solid var(--sn-border);
  border-radius: var(--sn-radius-sm);
  padding: var(--sn-space-xs) var(--sn-space-sm);
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.button:hover {
  background: var(--sn-surface-deep);
  border-color: var(--sn-purple-accent);
}
```

### Accent State Variants

```css
/* Success/Correct */
.button--correct {
  background: var(--sn-green-accent);
  border-color: var(--sn-green-accent);
  color: var(--sn-text-on-accent);
}

/* Error/Wrong */
.button--wrong {
  background: var(--sn-red-accent);
  border-color: var(--sn-red-accent);
  color: var(--sn-text-on-accent);
}

/* Soft variants (for backgrounds) */
.highlight--info {
  background: var(--sn-blue-accent-soft-bg);
  border-left: 3px solid var(--sn-blue-accent);
}
```

### Cards/Panels

```css
.card {
  background: var(--sn-surface);
  border: 1px solid var(--sn-border);
  border-radius: var(--sn-radius-md);
  padding: var(--sn-space-md);
}
```

### Preventing Element Squishing

```css
.badge {
  width: 2rem;
  height: 2rem;
  min-width: 2rem;      /* Prevent shrinking */
  flex-shrink: 0;       /* Don't shrink in flex */
}
```

---

## 4. Code Blocks

All code blocks use dark theme regardless of app theme:

```css
.codeBlock {
  background: var(--sn-code-bg);
  border: 1px solid var(--sn-code-bg-border);
  color: var(--sn-code-text);
  font-family: var(--sn-font-mono);
  border-radius: var(--sn-radius-xs);
  padding: var(--sn-space-xs);
}
```

---

## 5. Margin/Padding Rules

- **Vertical margins**: `margin: VAR 0;` (top/bottom first)
- **Horizontal padding**: `padding: 0 VAR;`
- Use spacing tokens, not raw values
- Reset margins inside components:

```css
.component :global(.sn-markdown) {
  margin: 0;
}
```

---

## 6. Dark Mode Support

All colors automatically adapt via `[data-theme='dark']` selectors in tokens. **Never hardcode colors** - always use tokens so dark mode works automatically.

---

## 7. Anti-Patterns to Avoid

| Don't | Do |
|-------|-----|
| `color: #1d1f27;` | `color: var(--sn-text);` |
| `padding: 8px;` | `padding: var(--sn-space-xs);` |
| `border-radius: 12px;` | `border-radius: var(--sn-radius-md);` |
| Inline styles | CSS Modules |
