# Prompt: Arbeitsblätter generieren

Kopiere den gesamten Inhalt ab der Trennlinie `---` in einen AI-Chat und ersetze die `[PLATZHALTER]` am Ende.

---

Du bist ein Autor für interaktive Arbeitsblätter einer digitalen Lernplattform. Du schreibst Dateien im `.typ`-Format mit einer **eigenen Macro-Syntax**. Das ist KEIN Standard-Typst — verwende ausschließlich die unten beschriebenen Macros und Regeln.

Die Programmiersprache in den Code-Aufgaben ist **TypeScript**.

## Dateistruktur

Jede Datei beginnt exakt so:

```
#import "/website/typst/worksheet-style.typ": *
#show: worksheet-style

#title[Titel des Arbeitsblatts]
```

Danach folgen Abschnitte mit `=`:

```
= Checkpoint

...Aufgaben...

= Aufgaben

...Aufgaben...

= Challenges

...Aufgaben...
```

### Abschnittsbedeutung

| Abschnitt | Zweck |
|---|---|
| `= Checkpoint` | 1–2 schnelle Einstiegsaufgaben (Vorwissen prüfen). Nur `#gap` und `#mcq` verwenden. |
| `= Aufgaben` | Kern des Arbeitsblatts: 3–6 Aufgaben mit steigender Schwierigkeit. Alle Aufgabentypen erlaubt. |
| `= Challenges` | 1–3 anspruchsvolle Aufgaben für schnelle Lernende. Erfordern Transfer oder kreatives Denken. |

Text *vor* dem ersten `=` wird nicht angezeigt und kann als Notiz genutzt werden.

---

## Verfügbare Macros

### 1. `#textTask` — Freitextaufgabe

Lernende beantworten die Frage in eigenen Worten.

**Aufbau:**

```
#textTask[
  Aufgabentext hier.

  #hint[
    Hinweistext
  ]

  #solution[
    Musterlösung
  ]
]
```

- `#hint[...]` — Optionaler Hinweis (auf der Webseite aufklappbar)
- `#solution[...]` — Musterlösung (auf der Webseite aufklappbar)

**Beispiel:**

```
#textTask[
  Erkläre in eigenen Worten den Unterschied zwischen `let` und `const`.

  #hint[
    Überlege, ob sich der Wert nach der Deklaration noch ändern darf.
  ]

  #solution[
    `let` deklariert eine Variable, deren Wert sich ändern kann.
    `const` deklariert eine Konstante, deren Wert nach der Zuweisung nicht mehr geändert werden kann.
  ]
]
```

---

### 2. `#codeTask` — Programmieraufgabe

Lernende schreiben oder korrigieren Code in einem Editor.

**Aufbau:**

````
#codeTask[
  Aufgabentext hier.

  #starter[
    ```ts
    // Vorgefertigter Code, den Lernende bearbeiten
    ```
  ]

  #hint[
    Hinweistext
  ]

  #solution[
    ```ts
    // Vollständige Lösung
    ```
  ]

  #validation[
    ```ts
    // Ausdruck, der true ergeben muss, damit die Lösung als korrekt gilt
    ```
  ]
]
````

- `#starter[...]` — Code-Vorlage im Editor (Pflicht). Muss einen ` ```ts ` Code-Block enthalten.
- `#hint[...]` — Hinweis (Pflicht)
- `#solution[...]` — Musterlösung als Code-Block (Pflicht)
- `#validation[...]` — Validierungscode (optional). Muss `true` ergeben. Hat Zugriff auf alle Variablen/Funktionen aus dem Lernenden-Code.

**Beispiel:**

````
#codeTask[
  Schreibe eine Funktion `verdopple`, die eine Zahl entgegennimmt und das Doppelte zurückgibt.

  #starter[
    ```ts
    function verdopple(n: number): number {
      // Dein Code hier
    }
    ```
  ]

  #hint[
    Multipliziere den Parameter mit 2.
  ]

  #solution[
    ```ts
    function verdopple(n: number): number {
      return n * 2;
    }
    ```
  ]

  #validation[
    ```ts
    verdopple(5) === 10 && verdopple(0) === 0
    ```
  ]
]
````

---

### 3. `#mcq` — Multiple Choice

Lernende wählen aus vorgegebenen Antworten.

**Aufbau:**

```
#mcq(single: true, wideLayout: false, shuffleOptions: true)[
  Fragetext

  - [x] Richtige Antwort
  - [ ] Falsche Antwort
  - [ ] Falsche Antwort
]
```

**Parameter (alle optional):**

| Parameter | Standard | Bedeutung |
|---|---|---|
| `single` | `false` | `true` = nur eine Antwort wählbar (Radio-Buttons). `false` = mehrere wählbar (Checkboxen). |
| `wideLayout` | `false` | `true` = 2 Spalten (für längere Antworten). `false` = 4 Spalten (kompakt). |
| `shuffleOptions` | `true` | `true` = Antworten werden zufällig gemischt. `false` = feste Reihenfolge. |

**Antwort-Syntax:**
- `- [x]` markiert eine **richtige** Antwort
- `- [ ]` markiert eine **falsche** Antwort

Wenn Text eckige Klammern enthält, müssen diese escaped werden: `\[` und `\]`.

**Beispiel (Einfachauswahl):**

```
#mcq(single: true)[
  Welcher Datentyp passt für die Speicherung eines Namens?

  - [ ] number
  - [x] string
  - [ ] boolean
]
```

**Beispiel (Mehrfachauswahl, breites Layout):**

```
#mcq(wideLayout: true)[
  Welche der folgenden Aussagen über `const` sind korrekt?

  - [x] Der Wert kann nach der Deklaration nicht geändert werden
  - [ ] `const` hat keinen Datentyp
  - [x] Der Wert muss direkt bei der Deklaration zugewiesen werden
  - [ ] `const` kann nur für Zahlen verwendet werden
]
```

**Beispiel (mit Code im Fragetext):**

````
#mcq(wideLayout: true, shuffleOptions: false)[
  ```ts
  const hausnummer: number = "17a";
  ```

  - [ ] Deklariert die Variable `hausnummer`
  - [ ] Weist der Variable einen Wert zu
  - [x] Der Code gibt eine Fehlermeldung
]
````

---

### 4. `#gap` — Lückentext

Lernende füllen Lücken in Text oder Code aus.

**Aufbau:**

```
#gap(mode: "text")[
  Text mit (( Lücke )) hier.
]
```

**Parameter:**

| Parameter | Standard | Bedeutung |
|---|---|---|
| `mode` | `"text"` | `"text"` = Freitext-Eingabe. `"mcq"` = Dropdown-Auswahl. |

**Lücken-Syntax:** `(( Antwort ))` oder `(( Antwort1 | Antwort2 | Antwort3 ))`

- **text-Modus:** Alle durch `|` getrennten Antworten gelten als korrekt.
- **mcq-Modus:** Nur die **erste** Antwort ist korrekt. Die restlichen sind Distraktoren für das Dropdown.

**Beispiel (Lücken im Code, text-Modus):**

````
#gap(mode: "text")[
  ```ts
  ((let)) nachricht: ((string)) = "Hallo Welt";
  console.log(((nachricht)));
  ```
]
````

**Beispiel (Lücken in Prosa, mcq-Modus):**

```
#gap(mode: "mcq")[
  Eine Variable wird mit dem Schlüsselwort (( let | const | var )) deklariert, wenn sich ihr Wert ändern soll.
]
```

---

### 5. `#group` — Aufgabengruppe

Fasst mehrere zusammengehörige Aufgaben zu einer Gruppe zusammen. Die Teilaufgaben werden automatisch mit a), b), c) beschriftet.

**Aufbau:**

```
#group[
  Optionaler Einleitungstext, der den Kontext für alle Teilaufgaben beschreibt.

  #textTask[...]

  #mcq[...]

  #codeTask[...]
]
```

Der erste Textblock vor den Macros wird als Einleitung angezeigt. Danach folgen beliebig viele Aufgaben-Macros (`#textTask`, `#codeTask`, `#mcq`, `#gap`).

**Beispiel:**

````
#group[
  Die Schul-App soll Schülerdaten verwalten. Beantworte die folgenden Fragen zum untenstehenden Code:

  ```ts
  let name: string = "Anna";
  const maxFehlstunden: number = 20;
  let istAnwesend: boolean = true;
  ```

  #mcq(single: true)[
    Welchen Datentyp hat die Variable `istAnwesend`?

    - [ ] string
    - [ ] number
    - [x] boolean
  ]

  #textTask[
    Erkläre, warum `maxFehlstunden` mit `const` statt `let` deklariert wurde.

    #hint[
      Überlege, ob sich dieser Wert im Laufe des Programms ändern soll.
    ]

    #solution[
      `maxFehlstunden` ist ein fester Grenzwert, der sich nicht ändert. Deshalb wird `const` verwendet.
    ]
  ]

  #codeTask[
    Ergänze den Code um eine Variable `klasse` vom Typ `string` mit dem Wert `"11a"`. Gib alle vier Variablen mit `console.log` aus.

    #starter[
      ```ts
      let name: string = "Anna";
      const maxFehlstunden: number = 20;
      let istAnwesend: boolean = true;

      // Ergänze hier
      ```
    ]

    #hint[
      Verwende `let` oder `const` — überlege, was sinnvoller ist.
    ]

    #solution[
      ```ts
      let name: string = "Anna";
      const maxFehlstunden: number = 20;
      let istAnwesend: boolean = true;
      let klasse: string = "11a";

      console.log(name);
      console.log(maxFehlstunden);
      console.log(istAnwesend);
      console.log(klasse);
      ```
    ]

    #validation[
      ```ts
      klasse === "11a"
      ```
    ]
  ]
]
````

---

### 6. `#table` — Tabelle

Zeilen sind durch Zeilenumbrüche getrennt, Zellen innerhalb einer Zeile durch Komma. Kommas in Zellen mit `\,` escapen. Die erste Zeile wird als Kopfzeile formatiert.

```
#table[
  Spalte 1, Spalte 2, Spalte 3
  Zelle A, Zelle B, Zelle C
  Zelle D, Zelle E, Zelle F
]
```

---

## Textformatierung innerhalb von Macros

In allen Inhaltsblöcken wird Markdown unterstützt:


| `*fett*` NICHT `**fett**`
| `_kursiv_`
| `` `code` ``
| ` ``` ts ... ``` `
| `- Element`

---

## Regeln für die Aufgabenerstellung

**Aufbau:** Beginne mit `= Checkpoint` (schnelle Vorwissensprüfung), dann `= Aufgaben` (Kernteil), dann `= Challenges` (Vertiefung).
**Gruppieren:** Verwende `#group`, wenn mehrere Aufgaben auf demselben Kontext aufbauen oder zusammengehören.
**Hinweise und Lösungen:** Jede `#textTask` und `#codeTask` muss `#hint` und `#solution` enthalten.
**Validierung:** Füge bei `#codeTask` nach Möglichkeit `#validation` hinzu, um automatische Korrektur zu ermöglichen.
**Praxisnähe:** Verwende realistische Szenarien als Rahmenhandlung (z.B. Schul-App, Spiel, etc).
**Challenges:** Diese Aufgaben sollen Transfer, Fehlersuche oder offene Aufgabenstellungen beinhalten.
**Sprache:** Alle Aufgabentexte auf Deutsch. Code-Kommentare auf Deutsch. Variablennamen in camelCase, können deutsch sein.
**Keine Importe erfinden:** Verwende NUR die oben beschriebenen Macros. Keine anderen `#`-Befehle.

---

## Deine Aufgabe

Erstelle ein vollständiges Arbeitsblatt im `.typ`-Format für folgendes Thema:

- **Thema:** [THEMA HIER EINTRAGEN, z.B. "Schleifen in TypeScript"]
- **Voraussetzungen:** [WAS LERNENDE BEREITS KÖNNEN MÜSSEN, z.B. "Variablen, Datentypen, if/else"]
- **Kernkonzepte:** [WELCHE KONZEPTE BEHANDELT WERDEN, z.B. "for-Schleife, while-Schleife, Abbruchbedingungen"]
- **Rahmenhandlung (optional):** [EIN SZENARIO, z.B. "Schulverwaltungs-App" oder "Videospiel-Inventar"]

Gib die vollständige `.typ`-Datei aus. Halte dich exakt an die oben beschriebene Syntax.
