# Markdown-Syntax und Strukturregeln

Dieses Dokument beschreibt die Syntax- und Strukturregeln für Arbeitsblätter im Learnspace-Format.
Die Struktur orientiert sich an den Datenmodellen:

- `CategorySchema`
- `TaskSchema`
- `TaskTypeSchema`

---

## Grundaufbau

Ein Arbeitsblatt besteht aus **Kategorien** mit jeweils mehreren **Aufgaben (Tasks)**.
Jede Aufgabe kann wiederum **eine oder mehrere Teilaufgaben (Subtasks)** enthalten.

```md
# @checkpoint        ← Kategorie
## @set              ← Aufgabe (Task)
### @mcq             ← Teilaufgabe (Subtask)
```

---

## Kategorie-Ebene

Jede Kategorie beginnt mit einer `#`-Überschrift und einem Decorator.

| Decorator | Bedeutung | Category-Wert |
|------------|------------|----------------|
| `# @checkpoint` | Verständnis- bzw. Selbsttest-Aufgaben | `"checkpoint"` |
| `# @challenge` | Anspruchsvollere Zusatzaufgaben | `"challenge"` |
| `# @core` | Grundaufgabe die alle Schüler während der Übungsphase erarbeiten sollen | `"core"` |
| `# @info` | Theoretischer Input, kein Category-Block | – |

**Alles unterhalb** einer Kategorie bis zur nächsten `# @...` gehört zu dieser Kategorie.

---

## Aufgaben-Ebene (`TaskSchema`)

Aufgaben beginnen mit `##`-Überschriften.

### Varianten

| Überschrift | Bedeutung |
|--------------|------------|
| `## @set` | Explizite Aufgabe mit mehreren Teilaufgaben (`###`) |
| `## @mcq`, `## @gap`, `## @text`, `## @math`, `## @code` | Aufgabe mit direktem Item (keine Unteraufteilung nötig) |

### Inhalte einer Aufgabe

- **Text** (alles zwischen `## ...` und der nächsten `###`, `##` oder `#`) → `TaskSchema.text`
- **Teilaufgaben** entstehen durch `### @...`-Decorators

> Wenn eine Aufgabe nur **eine** Teilaufgabe enthält (`subtask.length === 1`), wird sie visuell **nicht** als a), b), c) unterteilt.

---

## Teilaufgaben-Ebene (`TaskSchema.subtask[]`)

Jede Teilaufgabe beginnt mit `### @<typ>`.

| Decorator | Typfeld (`type`) | Beschreibung | Details |
|------------|------------------|---------------|----------|
| `@mcq` | `"mcq"` | Multiple-Choice-Frage | Checkbox-Syntax:<br>`- [x] richtige Antwort`<br>`- [ ] falsche Antwort` |
| `@mcq[single=true]` | `"mcq"` | Single-Choice-Frage | Nur eine Antwort korrekt |
| `@gap` | `"gap"` | Freie Lückentext-Eingabe | Lücken mit `__ {{Lücke}}` markieren |
| `@gap[mcq=true]` | `"gap_mcq"` | Lückentext mit Dropdown | `__ {{richtige|falsche|...}}` |
| `@text` | `"text"` | Freie Textaufgabe | Unterstützt `@hint`, `@solution`, `@explanation` |
| `@math` | `"math"` | Rechenfeld (kariert) | Unterstützt `@hint`, `@solution`, `@explanation` |
| `@code` | `"code"` | Programmieraufgabe | Unterstützt Codeblöcke `@hint`, `@solution`, `@explanation`, `@validation` |

---

## Inline-Decorator innerhalb von Items

Innerhalb einer Teilaufgabe können zusätzliche Marker vorkommen:

| Decorator | Gilt für | Feld | Bedeutung |
|------------|-----------|------|-----------|
| `@hint` | `@text`, `@math`, `@code` | `hint` | kurzer Hinweis oder Tipp |
| `@solution` | `@text`, `@math`, `@code` | `solution` | Musterlösung oder Beispielantwort |
| `@explanation` | `@text`, `@math`, `@code` | `explanation` | Erläuterung zur Lösung |
| `@validation` | nur `@code` | `validation` | Prüflogik (Codeblock) |

---

## 🧠 Beispiel: Checkpoint-Kategorie

```md
# @checkpoint

Ein Checkpoint überprüft direkt das Wissen aus dem Infotext

## @set

Zum Beispiel mit Multiple Choice Fragen:

### @mcq
Welche Antworten sind richtig?
- [x] ich
- [x] ich auch
- [ ] ich nicht

### @mcq
Müssen mehrere Antworten richtig sein?
- [x] Nein
- [ ] Doch
- [ ] Ohh!

## @mcq[single=true]
Eine Quizfrage
- [x] richtig
- [ ] falsch
- [ ] auch falsch
```

Ergebnis:

```ts
{
  category: "checkpoint",
  task: [
    {
      text: "Zum Beispiel mit Multiple Choice Fragen:",
      subtask: [
        { type: "mcq", question: "...", options: [...], correct: [...] },
        { type: "mcq", question: "...", options: [...], correct: [...] }
      ]
    },
    {
      text: "",
      subtask: [
        { type: "mcq", question: "Eine Quizfrage", options: [...], correct: [...], single: true }
      ]
    }
  ]
}
```

---

## Entscheidungs-Flow (Parsing-Logik)

1. `# @...` → neue Kategorie (`task`, `checkpoint`, `challenge`)
2. `## @set` → neue Aufgabe mit mehreren Teilaufgaben
3. `## @mcq/@gap/@text/...` → Aufgabe mit direkter Teilaufgabe
4. `### @mcq/@gap/...` → Teilaufgabe (Subtask) innerhalb der aktuellen Aufgabe
5. `@hint/@solution/@validation/...` → Zusatzinfos zum letzten Item
6. `__ {{...}}` → Lücken in Lückentexten
7. ```ts``` / ```python``` → Codeblöcke (Starter- oder Validation-Code)

---

## Beispiel: Challenge-Kategorie

```md
# @challenge

## @set

Eine `@challenge` enthält anspruchsvollere Aufgaben für schnelle Schüler

### @text
Eine offene Textaufgabe.

@hint
Gib einen hilfreichen Hinweis.

@solution
Eine beispielhafte Antwort.

### @math
Eine Matheaufgabe.

@hint
Rechne!

@solution
Ergebnis

### @code
Eine Codingaufgabe:

```ts
let counter: number
```

@hint
Welches Symbol setzt einen Wert?

@solution
```ts
let counter: number = 2;
```

@validation
```ts
counter === 2
```
```

Ergebnis:
```ts
{
  category: "challenge",
  task: [
    {
      text: "Eine `@challenge` enthält anspruchsvollere Aufgaben...",
      subtask: [
        { type: "text", hint: "...", solution: "..." },
        { type: "math", hint: "...", solution: "..." },
        { type: "code", starter_code: "let counter...", hint: "...", solution: "...", validation: "counter === 2" }
      ]
    }
  ]
}
```

---

## Kurzübersicht aller Decorators

| Stufe | Decorator | Bedeutung |
|-------|------------|------------|
| Kategorie | `# @checkpoint` / `# @challenge` / `# @core` | Start eines Aufgabenblocks |
| Aufgabe | `## @set` | Neue Aufgabe mit mehreren Teilaufgaben |
| Aufgabe | `## @mcq` / `## @gap` / `## @text` / `## @math` / `## @code` | Einzelaufgabe ohne Unterteilung |
| Teilaufgabe | `### @mcq` / `### @gap` / ... | Subtask innerhalb einer Aufgabe |
| Zusatz | `@hint`, `@solution`, `@explanation`, `@validation` | Zusatzinfos zu einer Teilaufgabe |
| Inline | `__ {{...}}` | Lückenmarkierung in Texten |
