## Practice Nodes — Content-Konzept & Autorenrichtlinien

### Guiding principles

1. **Auto-validierbar**
   Practice Nodes verwenden ausschließlich Aufgabentypen, die maschinell überprüfbar sind. `#textTask` ist nicht erlaubt.

2. **Kurz und fokussiert**
   Jede Aufgabe testet 1–2 Konzepte und ist in max. 90 Sekunden lösbar. Längere Aufgaben gehören ins Worksheet.

3. **Fachunabhängig**
   Alle Makros und Patterns funktionieren für Informatik, Mathematik und andere Fächer. Keine Makros, die nur für ein Fach nutzbar sind.

4. **Pool-basiert, nicht linear**
   Aufgaben sind eigenständige Pool-Elemente (kein Bezug aufeinander). Der Parser extrahiert sie einzeln, nicht als lineares Worksheet.

5. **Spaced Repetition**
   Sessions mischen Aufgaben kapitelübergreifend. Falsch beantwortete Aufgaben tauchen bevorzugt wieder auf.

6. **Bestehende Makros wiederverwenden**
   `#mcq`, `#gap` und `#codeTask` funktionieren unverändert. Neue Makros ergänzen den Pool, ersetzen nichts.

7. **Abgrenzung zu Worksheets**
   Worksheets sind lineare, einmalige Übungsblätter im Unterricht. Practice Nodes sind wiederholbare, kurze, automatisch validierbare Häppchen für eigenständiges Üben.

---

## Goals

1. Aufgaben-Pool pro Kapitel in `practice/pool.typ` Dateien definieren
2. Bestehende Makros (`#mcq`, `#gap`, `#codeTask`) für Practice wiederverwenden
3. Neue Makros für interaktive Aufgabentypen definieren (`#sortTask`, `#inputTask`, `#spotError`, `#matchTask`, `#classifyTask`)
4. Schwierigkeitsgrade über Section-Header (`= Leicht`, `= Mittel`, `= Schwer`) steuern
5. Optionale Konzept-Tags pro Aufgabe für feinere Filterung
6. Session-Algorithmus mit Kapitel-Mix und Schwierigkeits-Progression
7. Gamification: Session-Ergebnis, Fortschritts-Tracking, optional Streak/XP
8. Bestehende Validation-Engine (Web Worker für TS) wiederverwenden
9. Bestehende Route `/[group]/[course]/[topic]/practice` (Stub) nutzen

---

## Details

### 1) Bestehende Makros

Bereits implementierte Makros, die in Practice Nodes unverändert nutzbar sind.

| Makro | Beschreibung | Geschätzte Dauer | Einsatz |
|-------|-------------|-----------------|---------|
| `#mcq` | Multiple Choice (single/multi) | 10–20s | Konzeptverständnis, Code-Ausgabe vorhersagen |
| `#gap` | Lückentext (text/mcq-Modus) | 10–30s | Syntax vervollständigen, Begriffe zuordnen |
| `#codeTask` | Code schreiben mit Validation | 30–90s | Micro-Coding, Bug-Fixing, Code vervollständigen |

---

### 2) Neue Makros

Alle neuen Makros sind fachunabhängig und müssen vom Developer implementiert werden.

| Makro | Beschreibung | Geschätzte Dauer | Fächer |
|-------|-------------|-----------------|--------|
| `#sortTask` | Elemente in richtige Reihenfolge bringen (Drag & Drop) | 15–40s | Info: Code-Zeilen sortieren. Mathe: Rechenschritte ordnen |
| `#inputTask` | Exakte Antwort eingeben (Zahl, Wort, kurzer Ausdruck) | 10–30s | Info: Konsolenausgabe vorhersagen. Mathe: Ergebnis berechnen |
| `#spotError` | Fehlerhafte Zeile/Schritt identifizieren (Klick) | 15–30s | Info: Bug finden. Mathe: Rechenfehler finden |
| `#matchTask` | Paare zuordnen (Drag & Drop / Verbindungslinien) | 15–30s | Alle Fächer: Begriffe <-> Definitionen, Formeln <-> Namen |
| `#classifyTask` | Elemente in Kategorien einordnen | 15–30s | Info: Datentypen zuordnen. Mathe: Zahlenmengen sortieren |

#### 2.1 `#sortTask` — Elemente in Reihenfolge bringen

Der Schueler bekommt durcheinandergewuerfelte Elemente und muss sie in die richtige Reihenfolge bringen (Drag & Drop).

*Informatik-Beispiel:*
```typ
#sortTask[
  Bringe die Zeilen in die richtige Reihenfolge, um die Zahlen 1-3 auszugeben.

  - `for (let i = 1; i <= 3; i++) {`
  - `  console.log(i);`
  - `}`
]
```

*Mathe-Beispiel:*
```typ
#sortTask[
  Bringe die Rechenschritte in die richtige Reihenfolge, um $2x + 5 = 13$ nach $x$ aufzuloesen.

  - $2x + 5 = 13$
  - $2x = 13 - 5$
  - $2x = 8$
  - $x = 8 / 2$
  - $x = 4$
]
```

Die Reihenfolge im Quelltext ist die *korrekte* Reihenfolge. Der Renderer shuffled automatisch.

> **Hinweis fuer Developer**: Jeder Listeneintrag ist ein Element. Die Reihenfolge in der `.typ`-Datei ist die Loesung. Der Renderer zeigt sie in zufaelliger Reihenfolge. Validierung: gewaehlte Reihenfolge === Original-Reihenfolge. Listeneintraege koennen Backtick-Code, $LaTeX$ oder Plain-Text enthalten.

**Autorenhinweise:**
- 3–6 Elemente (mehr wird auf Mobilgeraeten schwierig)
- Jedes Element muss als eigenstaendige Einheit erkennbar sein
- Info: Code-Zeilen, Algorithmus-Schritte
- Mathe: Umformungsschritte, Beweisschritte, Konstruktionsschritte

#### 2.2 `#inputTask` — Exakte Antwort eingeben

Der Schueler sieht eine Aufgabe und tippt die Antwort als Text ein. Validiert wird per String-Vergleich (trimmed, optional case-insensitive). Mehrere korrekte Antworten moeglich.

*Informatik-Beispiel:*
```typ
#inputTask[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 3;
  x *= 2;
  console.log(x);
  ```

  #answer[`6`]
]
```

*Mathe-Beispiel:*
```typ
#inputTask[
  Berechne: $\sqrt{144}$

  #answer[`12`]
]
```

*Mathe mit mehreren korrekten Antworten:*
```typ
#inputTask[
  Loese die Gleichung $x^2 = 9$. Gib *eine* Loesung an.

  #answer[`3` | `-3`]
]
```

> **Hinweis fuer Developer**: `#answer` enthaelt die erwartete(n) Antwort(en), getrennt durch `|`. Vergleich: trimmed, bei Zahlen numerisch (z.B. `3.0` === `3`). Optional: Toleranz-Parameter fuer Rundung (`#answer(tolerance: 0.01)[...]`).

**Autorenhinweise:**
- Nur fuer kurze, eindeutige Antworten (eine Zahl, ein Wort, ein kurzer Ausdruck)
- Nicht fuer lange Texte oder komplexe Ausdruecke
- Bei Mathe: Toleranz beachten (z.B. $\pi \approx 3.14$)
- Alternative Schreibweisen als `|`-getrennte Optionen angeben

#### 2.3 `#spotError` — Fehler finden

Der Schueler sieht Code oder eine Berechnung mit einem Fehler und muss die fehlerhafte Zeile/Schritt anklicken.

*Informatik-Beispiel:*
```typ
#spotError[
  Dieser Code soll pruefen, ob `alter` mindestens 18 ist. Klicke auf die fehlerhafte Zeile.

  ```ts
  let alter: number = 20;
  if (alter = 18) {
    console.log("Volljaehrig");
  }
  ```

  #errorLine[2]

  #solution[Zeile 2: `=` ist eine Zuweisung, `===` waere der Vergleich.]
]
```

*Mathe-Beispiel:*
```typ
#spotError[
  In welchem Schritt ist der Rechenfehler?

  + $3(x + 2) = 15$
  + $3x + 5 = 15$
  + $3x = 10$
  + $x = 10/3$

  #errorLine[2]

  #solution[Schritt 2: $3 \cdot 2 = 6$, nicht $5$. Richtig: $3x + 6 = 15$.]
]
```

> **Hinweis fuer Developer**: `#errorLine` enthaelt die Nummer (1-basiert) der fehlerhaften Zeile/des fehlerhaften Schritts. Fuer Code: Zeilen im Code-Block. Fuer Mathe: nummerierte Listenschritte (`+` statt `-`). Der Renderer macht alle Zeilen/Schritte klickbar.

**Autorenhinweise:**
- Genau *ein* Fehler pro Aufgabe (eindeutig)
- Der Fehler muss in genau einer Zeile/Schritt lokalisierbar sein
- Info: `=` statt `===`, falscher Operator, falscher Index, fehlende Klammern
- Mathe: Vorzeichenfehler, falsche Umformung, Ausmultiplikationsfehler
- `#solution` erklaert, was falsch ist und wie es richtig waere

#### 2.4 `#matchTask` — Paare zuordnen

Der Schueler verbindet Elemente aus zwei Spalten miteinander.

*Informatik-Beispiel:*
```typ
#matchTask[
  Ordne jedem Ausdruck das Ergebnis zu.

  - `10 % 3` => `1`
  - `10 / 2` => `5`
  - `10 * 2` => `20`
  - `10 - 7` => `3`
]
```

*Mathe-Beispiel:*
```typ
#matchTask[
  Ordne jede Funktion ihrem Funktionstyp zu.

  - $f(x) = 2x + 3$ => Linear
  - $f(x) = x^2$ => Quadratisch
  - $f(x) = 2^x$ => Exponentiell
  - $f(x) = \sin(x)$ => Trigonometrisch
]
```

> **Hinweis fuer Developer**: Jeder Listeneintrag hat die Form `links => rechts`. Der Renderer zeigt zwei Spalten, die rechte wird geshuffelt. Beide Seiten koennen Code (Backticks), $LaTeX$ oder Plain-Text enthalten.

**Autorenhinweise:**
- 3–5 Paare (nicht zu viele)
- Linke und rechte Seite muessen *eindeutig* zuordenbar sein (keine Mehrdeutigkeiten)
- Info: Operator <-> Ergebnis, Datentyp <-> Wert, Code <-> Konsolenausgabe
- Mathe: Formel <-> Name, Funktion <-> Graph-Typ, Term <-> Vereinfachung

#### 2.5 `#classifyTask` — In Kategorien einordnen

Der Schueler sortiert Elemente in vordefinierte Kategorien (Drag & Drop in Boxen).

*Informatik-Beispiel:*
```typ
#classifyTask[
  Ordne die Werte dem richtigen Datentyp zu.

  == string
  - `"Hallo"`
  - `"42"`
  - `"true"`

  == number
  - `3.14`
  - `0`
  - `100`

  == boolean
  - `true`
  - `false`
]
```

*Mathe-Beispiel:*
```typ
#classifyTask[
  Ordne die Zahlen der richtigen Zahlenmenge zu.

  == Natuerliche Zahlen
  - $1$
  - $42$
  - $0$

  == Ganze Zahlen (aber nicht natuerlich)
  - $-3$
  - $-100$

  == Rationale Zahlen (aber nicht ganzzahlig)
  - $\frac{1}{3}$
  - $0.5$
]
```

> **Hinweis fuer Developer**: Kategorien werden mit `==` definiert (Sub-Heading-Level). Elemente unter jeder Kategorie gehoeren dorthin. Der Renderer zeigt alle Elemente gemischt und die Kategorie-Boxen als Ziele. Validation: Jedes Element muss in der richtigen Kategorie landen. Mindestens 2 Kategorien, max. 4.

**Autorenhinweise:**
- 2–4 Kategorien, 2–4 Elemente pro Kategorie
- Elemente muessen *eindeutig* einer Kategorie zuordenbar sein
- Info: Wert- vs. Referenzdatentypen, Schleifen-Typen, Operator-Kategorien
- Mathe: Zahlenmengen, Funktionstypen, geometrische Formen

---

### 3) Entwurfsmuster fuer Aufgaben

#### Pattern 1: Code-Vorhersage (MCQ)

Gegeben ist ein Code-Snippet. "Was wird ausgegeben?" / "Welchen Wert hat `x`?"

Ideal fuer: Ablaufverstaendnis, Operator-Reihenfolge, Schleifen-Tracing, Referenz-Verhalten.

```typ
#mcq(single: true, wideLayout: true, shuffleOptions: false)[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 5;
  x += 3;
  console.log(x);
  ```

  - [ ] `5`
  - [x] `8`
  - [ ] `53`
  - [ ] `3`
]
```

**Autorenhinweise:**
- `shuffleOptions: false` wenn die Reihenfolge der Optionen didaktisch wichtig ist
- `wideLayout: true` wenn Code-Bloecke in der Frage stehen
- Falsche Antworten sollen *typische Denkfehler* abbilden (z.B. `"53"` fuer String-Verkettung statt Addition)
- 3–4 Optionen, nicht mehr

#### Pattern 2: Syntax-Luecke (Gap)

Code mit Luecken. Schueler fuellt Schluesselwoerter/Syntax ein.

Ideal fuer: Keywords (`function`, `return`, `if`, `else`, `for`, `of`), Operatoren, Datentypen.

```typ
#gap(mode: "text")[
  ```ts
  ((function)) addiere(a: number, b: number): ((number)) {
    ((return)) a + b;
  }
  ```
]
```

**Autorenhinweise:**
- `mode: "text"` fuer freie Eingabe (exakte Antwort noetig)
- `mode: "mcq"` fuer Dropdown-Auswahl: `(( richtig | falsch1 | falsch2 ))`
- Maximal 3–4 Luecken pro Aufgabe
- Luecken sollen das Kernkonzept testen, nicht Triviales (keine Variablennamen als Luecke)

#### Pattern 3: Begriffszuordnung (Gap MCQ)

Konzeptuelle Luecke mit Auswahl — testet Verstaendnis statt Auswendiglernen.

```typ
#gap(mode: "mcq")[
  Bei Referenzdatentypen speichert die Variable eine
  (( Referenz | Kopie | Zahl )) auf den Speicherort.
]
```

#### Pattern 4: Micro-Coding (codeTask)

Kleine, fokussierte Programmieraufgabe — max. 3–5 Zeilen Code schreiben.

```typ
#codeTask[
  Berechne den Rest von `17 / 5` und speichere ihn in einer Variable `rest`.

  #starter[
    ```ts
    // Berechne den Rest
    ```
  ]

  #solution[
    ```ts
    let rest: number = 17 % 5;
    ```
  ]

  #validation[
    ```ts
    rest === 2
    ```
  ]
]
```

**Autorenhinweise:**
- Kurzer `#starter` — wenig bis kein Vorlagencode, da Practice schnell gehen soll
- `#hint` ist optional bei Practice (Schueler sollen erstmal selbst denken)
- `#validation` muss den *gesamten* erwarteten Zustand pruefen
- **Kein `console.log` in der Validation** — nur Ausdruecke die `true`/`false` ergeben
- Aufgabe soll in 30–90 Sekunden loesbar sein

#### Pattern 5: Bug-Fix (codeTask)

Fehlerhafter Code — Schueler findet und behebt den Fehler.

```typ
#codeTask[
  Der folgende Code soll pruefen, ob eine Zahl gerade ist. Er hat einen Fehler. Finde und behebe ihn.

  #starter[
    ```ts
    let zahl: number = 8;
    let istGerade: boolean = zahl % 2 === 1; // Fehler!
    ```
  ]

  #solution[
    ```ts
    let zahl: number = 8;
    let istGerade: boolean = zahl % 2 === 0;
    ```
  ]

  #validation[
    ```ts
    istGerade === true
    ```
  ]
]
```

#### Pattern 6: Code vervollstaendigen (codeTask)

Teilweise geschriebener Code — eine Zeile oder Ausdruck fehlt.

```typ
#codeTask[
  Vervollstaendige die Funktion, sodass sie die Summe von `a` und `b` zurueckgibt.

  #starter[
    ```ts
    function addiere(a: number, b: number): number {
      // Dein Code hier
    }
    ```
  ]

  #validation[
    ```ts
    addiere(3, 5) === 8 && addiere(0, 0) === 0
    ```
  ]
]
```

---

### 4) Dateistruktur & Format

#### 4.1 Verzeichnisstruktur

```
content/base/{subject}/{topic}/
  {chapter}/
    overview.typ          # Lehrinhalt (bestehend)
    worksheets/           # Arbeitsblaetter (bestehend)
    practice/
      pool.typ            # Aufgaben-Pool fuer Practice Nodes
```

Jedes Kapitel bekommt genau eine `pool.typ` Datei. Aufgaben innerhalb der Datei werden ueber Sections (`=`) nach Schwierigkeitsgrad gruppiert.

#### 4.2 Datei-Header

```typ
#import "/website/typst/worksheet-style.typ": *
#show: practice-style
```

> **Hinweis fuer Developer**: `practice-style` muss als neuer Style definiert werden. Er nutzt dieselben Makros wie `worksheet-style`, aber der Parser erkennt am Style-Typ, dass es sich um Practice-Aufgaben handelt und extrahiert einzelne Aufgaben als Pool-Elemente statt als lineares Worksheet.

#### 4.3 Section-Struktur nach Schwierigkeit

```typ
= Leicht
// Aufgaben die ein einzelnes Konzept isoliert testen
// Loesbar in 10–30 Sekunden

= Mittel
// Aufgaben die 2 Konzepte kombinieren oder Transfer erfordern
// Loesbar in 20–60 Sekunden

= Schwer
// Aufgaben die 3+ Konzepte kombinieren, Code-Tracing, Bug-Fixing
// Loesbar in 30–90 Sekunden
```

Die Section-Header (`= Leicht`, `= Mittel`, `= Schwer`) dienen dem Parser als Difficulty-Marker. **Keine anderen Section-Header verwenden.**

---

### 5) Metadaten-System

#### 5.1 Kapitel-Tags (automatisch)

Jede Aufgabe erbt automatisch den Kapitel-Tag aus dem Dateipfad:
- `00-variablen-und-datentypen/practice/pool.typ` -> Tag: `variablen-und-datentypen`

#### 5.2 Konzept-Tags (manuell, pro Aufgabe)

Autoren koennen optionale Konzept-Tags vergeben, um feinere Filterung zu ermoeglichen:

```typ
#mcq(single: true, tags: ("modulo", "operatoren"))[
  Was ergibt `10 % 3`?
  ...
]
```

> **Hinweis fuer Developer**: Der `tags`-Parameter muss als neues optionales Attribut fuer alle Practice-Makros implementiert werden. Tags sind Strings und werden vom Parser extrahiert und im generierten JSON gespeichert. Tags sind optional — fehlen sie, wird nur der Kapitel-Tag aus dem Dateipfad verwendet.

#### 5.3 Tag-Konventionen fuer TypeScript-Grundlagen

| Kapitel | Moegliche Tags |
|---------|--------------|
| 00 | `let-const`, `datentypen`, `console-log`, `kommentare` |
| 01 | `arithmetik`, `modulo`, `string-verkettung`, `kurzschreibweise`, `vergleichsoperatoren` |
| 02 | `if-else`, `else-if`, `logische-operatoren`, `und-oder`, `nicht`, `block-scope` |
| 03 | `for-schleife`, `while-schleife`, `inkrement`, `endlosschleife`, `akkumulator` |
| 04 | `funktion-definieren`, `parameter`, `return`, `scope`, `verschachtelung` |
| 05 | `array-erstellen`, `index`, `length`, `push`, `for-of` |
| 06 | `objekt-erstellen`, `punkt-notation`, `klammer-notation`, `eigenschaft-aendern` |
| 07 | `referenz-vs-wert`, `const-referenz`, `spread-operator`, `flache-kopie` |

Tags muessen nicht jede Aufgabe haben. Empfehlung: Tags setzen, wenn die Aufgabe ein spezifisches Unter-Konzept testet.

---

### 6) Session-Generierung

#### 6.1 Session-Aufbau

Eine Practice-Session besteht aus **8–12 Aufgaben** und dauert ca. **5–10 Minuten**.

**Zusammensetzung:**
- **50% aktuelles Kapitel** — Fokus auf das, was der Schueler gerade lernt
- **30% vorherige Kapitel** — Spaced Repetition fuer aeltere Konzepte
- **20% gemischt** — Zufaellig aus dem gesamten freigeschalteten Pool

#### 6.2 Schwierigkeits-Progression innerhalb einer Session

1. Start: 2–3 leichte Aufgaben (Aufwaermen, Erfolgserlebnis)
2. Mitte: 4–5 mittlere Aufgaben (Kerntraining)
3. Ende: 2–3 schwere Aufgaben (Herausforderung)

#### 6.3 Aufgabentyp-Mix

- Max. 3 gleiche Aufgabentypen hintereinander (Abwechslung)
- Mindestens 1 `#codeTask` pro Session
- Mindestens 2 `#mcq` pro Session

> **Hinweis fuer Developer**: Der Algorithmus sollte eine Aufgabe nicht wiederholen, die der Schueler in den letzten 3 Sessions korrekt geloest hat. Falsch beantwortete Aufgaben sollen bevorzugt wieder auftauchen.

---

### 7) Gamification-Konzept

#### 7.1 Session-Ergebnis

Nach jeder Session sieht der Schueler:
- **Richtig / Gesamt** (z.B. "9 von 12 richtig")
- **Balkenanzeige** pro Kapitel: Wie gut beherrscht der Schueler dieses Thema?

#### 7.2 Fortschritts-Tracking

Pro Schueler und pro Konzept-Tag wird gespeichert:
- Anzahl korrekt / total
- Letzter Uebungszeitpunkt
- Confidence-Score (gewichteter Durchschnitt der letzten N Versuche)

#### 7.3 Optional: Streak & XP

- **Streak**: Tage in Folge, an denen mindestens 1 Session absolviert wurde
- **XP**: Punkte pro richtig geloester Aufgabe (Leicht: 5, Mittel: 10, Schwer: 20)
- **Meilensteine**: "100 Aufgaben geloest", "Alle Kapitel geuebt", etc.

> **Hinweis fuer Developer**: Gamification-Features sind nice-to-have und koennen iterativ ergaenzt werden. MVP braucht nur Session-Ergebnis + Richtig/Falsch-Tracking.

---

### 8) Fachuebergreifende Erweiterbarkeit

Das System ist fachunabhaengig designt. Die Aufgabentypen funktionieren fuer:

| Fach | MCQ | Gap | codeTask | Neue Makros |
|------|-----|-----|----------|-------------|
| Info (TypeScript) | Code-Vorhersage, Konzeptfragen | Syntax-Luecken | Micro-Coding | Alle |
| Info (Datenbanken) | SQL-Ergebnis vorhersagen | SQL-Syntax-Luecken | SQL-Queries | Alle ausser `#spotError` (Code) |
| Mathe | Rechenaufgaben, Formel-Zuordnung | Formeln vervollstaendigen | - (kein Code) | `#sortTask`, `#inputTask`, `#spotError`, `#matchTask`, `#classifyTask` |

> **Hinweis fuer Developer**: Die Validation-Engine muss pro Fach konfigurierbar sein. TypeScript-Validation laeuft im Web Worker (existiert bereits). SQL-Validation koennte gegen eine Sandbox-DB laufen. Mathe-Validation prueft numerische Gleichheit.

---

### 9) Autorenrichtlinien

#### 9.1 Allgemeine Regeln

1. **Nur auto-validierbare Aufgabentypen** — Kein `#textTask`
2. **Kurz und fokussiert** — Jede Aufgabe testet 1–2 Konzepte, nicht mehr
3. **Keine Aufgabe ueber 90 Sekunden** — Wenn laenger, gehoert sie ins Worksheet
4. **Sprache**: Deutsch, Variablennamen in camelCase (deutsch oder englisch)
5. **Eckige Klammern escapen**: `\[` und `\]` in allen Makros
6. **Keine `#hint` in Practice** — Practice testet, ob Schueler es *koennen*. Hints gehoeren in Worksheets.
7. **`#solution` ist Pflicht** — Wird nach falschem Versuch oder nach Ablauf angezeigt

#### 9.2 Pool-Groesse pro Kapitel

**Minimum: 20 Aufgaben pro Kapitel** (damit Sessions sich nicht schnell wiederholen)
- Mindestens 6 leichte
- Mindestens 8 mittlere
- Mindestens 6 schwere

**Empfehlung: 30–40 Aufgaben** fuer optimale Abwechslung.

#### 9.3 Qualitaetskriterien

**Gute Aufgabe:**
- Testet ein klar identifizierbares Konzept
- Hat genau eine korrekte Antwort (bei MCQ) oder ein validiertes Ergebnis (bei Code)
- Falsche MCQ-Optionen spiegeln typische Denkfehler wider
- Ist ohne Kontext der Vorlesung verstaendlich
- Ist in sich geschlossen (kein Bezug auf andere Aufgaben)

**Schlechte Aufgabe:**
- "Erklaere in eigenen Worten..." (nicht validierbar)
- Zu viel Code schreiben (>5 Zeilen) -> gehoert ins Worksheet
- Triviale Fragen ohne Nachdenken ("Was ist 1+1?")
- Mehrdeutige Antworten ("Was *koennte* hier passieren?")

#### 9.4 Voraussetzungskette beachten

Aufgaben in `pool.typ` duerfen **nur Konzepte** aus dem eigenen Kapitel und allen vorherigen verwenden:

- Kap 00: Variablen, Datentypen, console.log
- Kap 01: + Operatoren, Vergleiche
- Kap 02: + if/else, logische Operatoren
- Kap 03: + for, while
- Kap 04: + Funktionen, return
- Kap 05: + Arrays
- Kap 06: + Objekte
- Kap 07: + Referenz vs. Wert, Spread

Eine Aufgabe in `03-schleifen/practice/pool.typ` darf also Schleifen + Bedingungen + Operatoren + Variablen verwenden, aber **keine Funktionen oder Arrays**.

---

### 10) Beispiel: Komplette pool.typ fuer Kapitel 01

```typ
#import "/website/typst/worksheet-style.typ": *
#show: practice-style

#title[Operatoren]

= Leicht

#mcq(single: true, tags: ("arithmetik"))[
  Was ergibt `10 + 5`?

  - [ ] `105`
  - [x] `15`
  - [ ] `10`
  - [ ] `5`
]

#mcq(single: true, tags: ("modulo"))[
  Was ergibt `7 % 2`?

  - [x] `1`
  - [ ] `3`
  - [ ] `3.5`
  - [ ] `0`
]

#gap(mode: "text", tags: ("kurzschreibweise"))[
  ```ts
  let punkte: number = 10;
  punkte ((+=)) 5;
  // punkte ist jetzt 15
  ```
]

#gap(mode: "mcq", tags: ("vergleichsoperatoren"))[
  Der Ausdruck `5 (( === | == | = )) 5` ergibt `true` und vergleicht Wert *und* Datentyp.
]

#mcq(single: true, tags: ("string-verkettung"))[
  Was ergibt `"Hallo " + "Welt"`?

  - [x] `"Hallo Welt"`
  - [ ] `"HalloWelt"`
  - [ ] Eine Fehlermeldung
  - [ ] `undefined`
]

#mcq(single: true, tags: ("vergleichsoperatoren"))[
  Was ergibt `10 > 10`?

  - [ ] `true`
  - [x] `false`
]

#matchTask(tags: ("arithmetik"))[
  Ordne jedem Ausdruck das Ergebnis zu.

  - `10 % 3` => `1`
  - `10 / 2` => `5`
  - `10 * 2` => `20`
  - `10 - 7` => `3`
]

#inputTask(tags: ("arithmetik"))[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 3 + 4;
  console.log(x);
  ```

  #answer[`7`]
]

= Mittel

#mcq(single: true, wideLayout: true, shuffleOptions: false, tags: ("arithmetik"))[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 2 + 3 * 4;
  console.log(x);
  ```

  - [ ] `20`
  - [x] `14`
  - [ ] `24`
  - [ ] `12`
]

#codeTask(tags: ("arithmetik", "modulo"))[
  Berechne den Rest von `17 / 5` und speichere ihn in `rest`.

  #starter[
    ```ts
    // Berechne den Rest
    ```
  ]

  #solution[
    ```ts
    let rest: number = 17 % 5;
    ```
  ]

  #validation[
    ```ts
    rest === 2
    ```
  ]
]

#gap(mode: "text", tags: ("kurzschreibweise"))[
  ```ts
  let leben: number = 100;
  leben ((-=)) 25;
  leben ((*=)) 2;
  // leben ist jetzt 150
  ```
]

#mcq(single: true, wideLayout: true, shuffleOptions: false, tags: ("string-verkettung"))[
  Was ergibt `5 + 3 + " Euro"`?

  - [x] `"8 Euro"`
  - [ ] `"53 Euro"`
  - [ ] `"8Euro"`
  - [ ] Eine Fehlermeldung
]

#codeTask(tags: ("arithmetik"))[
  Berechne den Durchschnitt der Zahlen 4, 8 und 12. Speichere das Ergebnis in `durchschnitt`.

  #starter[
    ```ts
    let a: number = 4;
    let b: number = 8;
    let c: number = 12;

    // Berechne den Durchschnitt
    ```
  ]

  #solution[
    ```ts
    let a: number = 4;
    let b: number = 8;
    let c: number = 12;

    let durchschnitt: number = (a + b + c) / 3;
    ```
  ]

  #validation[
    ```ts
    durchschnitt === 8
    ```
  ]
]

= Schwer

#inputTask(tags: ("kurzschreibweise"))[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 10;
  x *= 3;
  x -= 5;
  console.log(x);
  ```

  #answer[`25`]
]

#spotError(tags: ("vergleichsoperatoren"))[
  Dieser Code soll pruefen, ob `a` und `b` gleich sind. Finde den Fehler.

  ```ts
  let a: number = 5;
  let b: number = 5;
  let sindGleich: boolean = a = b;
  console.log(sindGleich);
  ```

  #errorLine[3]

  #solution[Zeile 3: `=` ist eine Zuweisung, `===` waere der Vergleich.]
]

#sortTask(tags: ("arithmetik", "kurzschreibweise"))[
  Bringe die Zeilen in die richtige Reihenfolge, um den Rabattpreis zu berechnen.

  - `let preis: number = 100;`
  - `let rabatt: number = preis * 0.1;`
  - `let endpreis: number = preis - rabatt;`
  - `console.log(endpreis);`
]

#mcq(single: true, wideLayout: true, shuffleOptions: false, tags: ("arithmetik", "kurzschreibweise"))[
  Was gibt der folgende Code aus?

  ```ts
  let x: number = 10;
  x *= 3;
  x -= 5;
  x %= 7;
  console.log(x);
  ```

  - [ ] `10`
  - [x] `4`
  - [ ] `25`
  - [ ] `1`
]

#codeTask(tags: ("vergleichsoperatoren", "modulo"))[
  Pruefe, ob die Zahl `zahl` gerade ist. Speichere das Ergebnis als `boolean` in `istGerade`.

  #starter[
    ```ts
    let zahl: number = 42;

    // Pruefe ob gerade
    ```
  ]

  #solution[
    ```ts
    let zahl: number = 42;
    let istGerade: boolean = zahl % 2 === 0;
    ```
  ]

  #validation[
    ```ts
    istGerade === true
    ```
  ]
]

#codeTask(tags: ("arithmetik", "string-verkettung"))[
  Berechne den Gesamtpreis fuer 3 Pizzen a 8.50 und 2 Getraenke a 2.50.
  Gib das Ergebnis als Text aus: `"Gesamt: X Euro"`.

  #starter[
    ```ts
    const pizzaPreis: number = 8.50;
    const getraenkPreis: number = 2.50;

    // Berechne und gib aus
    ```
  ]

  #solution[
    ```ts
    const pizzaPreis: number = 8.50;
    const getraenkPreis: number = 2.50;

    let gesamt: number = 3 * pizzaPreis + 2 * getraenkPreis;
    console.log("Gesamt: " + gesamt + " Euro");
    ```
  ]

  #validation[
    ```ts
    gesamt === 30.5
    ```
  ]
]
```

---

## Checkliste fuer Autoren

Vor dem Einreichen einer `pool.typ` Datei:

- [ ] Mindestens 20 Aufgaben (6+ leicht, 8+ mittel, 6+ schwer)
- [ ] Kein `#textTask` verwendet
- [ ] Alle `#codeTask` haben `#starter`, `#solution`, `#validation`
- [ ] Alle `#mcq` haben genau eine korrekte Antwort (bei `single: true`)
- [ ] Keine Konzepte aus spaeteren Kapiteln verwendet
- [ ] Eckige Klammern escaped (`\[`, `\]`)
- [ ] Aufgaben sind in sich geschlossen (kein Bezug aufeinander)
- [ ] Jede Aufgabe ist in max. 90 Sekunden loesbar
- [ ] Falsche MCQ-Optionen bilden typische Denkfehler ab
- [ ] `#validation`-Bloecke ergeben `true`/`false` (kein `console.log`)
- [ ] Sections sind genau `= Leicht`, `= Mittel`, `= Schwer`

---

## Zusammenfassung fuer Developer

**Neuer Content-Typ**: `practice` neben `worksheets` und `slides`

**Neuer Style**: `practice-style` (basiert auf `worksheet-style`, gleiche Makros)

**Neuer Parameter**: `tags` (optionales String-Array) fuer alle Makros

**Neue Makros**: `#sortTask`, `#inputTask`, `#spotError`, `#matchTask`, `#classifyTask`

**Parser-Aufgabe**: Jede Aufgabe als eigenstaendiges Pool-Element extrahieren (nicht linear wie Worksheet)

**Difficulty aus Sections**: `= Leicht` -> 1, `= Mittel` -> 2, `= Schwer` -> 3

**Session-API**: Gibt N Aufgaben aus Pool zurueck (Algorithmus s. Abschnitt 6)

**Validation**: Bestehende Client-Side-Validation wiederverwenden (Web Worker fuer TS)

**Bestehende Route**: `/[group]/[course]/[topic]/practice` existiert bereits als Stub

---

## Implementation checklist

### Phase 1 — Content-Infrastruktur

* [ ] `practice-style` in `website/typst/worksheet-style.typ` definieren
* [ ] Parser fuer `practice/pool.typ` Dateien erweitern (Pool-Modus statt linear)
* [ ] `tags`-Parameter als optionales Attribut fuer alle Makros implementieren
* [ ] Difficulty-Extraktion aus Section-Headern (`= Leicht` / `= Mittel` / `= Schwer`)

### Phase 2 — Neue Makros

* [ ] `#sortTask` Parser + Renderer (Drag & Drop Reihenfolge)
* [ ] `#inputTask` Parser + Renderer (Texteingabe mit `#answer` Validation)
* [ ] `#spotError` Parser + Renderer (klickbare Zeilen mit `#errorLine`)
* [ ] `#matchTask` Parser + Renderer (Paare zuordnen mit `=>` Syntax)
* [ ] `#classifyTask` Parser + Renderer (Kategorien mit `==` Sub-Headings)

### Phase 3 — Session-Engine

* [ ] Session-Algorithmus: Kapitel-Mix (50/30/20), Schwierigkeits-Progression
* [ ] Aufgaben-Deduplizierung (nicht in letzten 3 Sessions korrekt geloest)
* [ ] Aufgabentyp-Mix-Constraints (max. 3 gleiche hintereinander)
* [ ] Route `/[group]/[course]/[topic]/practice` implementieren (Stub existiert)

### Phase 4 — Gamification (MVP)

* [ ] Session-Ergebnis anzeigen (Richtig / Gesamt)
* [ ] Fortschritts-Tracking pro Kapitel (korrekt/total, letzter Zeitpunkt)
* [ ] Balkenanzeige pro Kapitel

### Phase 5 — Gamification (Optional)

* [ ] Streak-Tracking (Tage in Folge)
* [ ] XP-System (Leicht: 5, Mittel: 10, Schwer: 20)
* [ ] Meilensteine

### Phase 6 — Verification

* [ ] Practice-Aufgaben werden korrekt aus `pool.typ` extrahiert
* [ ] Alle Makros rendern korrekt (bestehende + neue)
* [ ] Session-Algorithmus liefert gut gemischte Aufgaben
* [ ] Validation funktioniert fuer alle Aufgabentypen
* [ ] Tags werden korrekt extrahiert und gespeichert
* [ ] Difficulty-Level werden korrekt aus Sections abgeleitet
* [ ] Voraussetzungskette wird eingehalten (keine Konzepte aus spaeteren Kapiteln)
