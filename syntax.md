# Arbeitsblätter erstellen

Mit StudyNode und Typst kannst du Arbeitsblätter erstellen, die automatisch eine interaktiven Web-Version oder ein PDF-Version zum Ausdrucken generieren.

Wenn du das **Typst-Plugin** in VS Code installierst, siehst du direkt eine PDF-Vorschau. Sie unterscheidet sich optisch leicht von der Webversion.

---

## Grundaufbau

### Titel

Der Titel des Arbeitsblatts wird wie folgt festgelegt.

```typst
#title[Mein Arbeitsblatt]
```

### Kategorien

Ein Arbeitsblatt besteht aus mehreren Kategorien. Eine Kategorie beginnt mit `=` und einem Titel.
Alles bis zur nächsten `=`-Zeile gehört zu dieser Kategorie.

#### Info-Kategorien

- Können **beliebig benannt** werden, z. B. `= Grundlagen Variablen` oder `= Wiederholung`.
- Dienen zur Erklärung oder Theorie.
- Enthalten normalen Text.

#### Aufgaben-Kategorien

- Haben den Titel `= Checkpoint`, `= Aufgaben` oder `= Challenges`.
- Können **Aufgaben-Macros** enthalten.

---

## Aufgaben-Macros

Macros starten immer mit `#name[...]`.
Sie erzeugen interaktive oder druckbare Aufgaben.

| Macro            | Bedeutung                          | Beispiel                          |
| ---------------- | ---------------------------------- | --------------------------------- |
| `#mcq[...]`      | Multiple Choice                    | `#mcq[Frage - [x] Ja - [ ] Nein]` |
| `#gap[...]`      | Lückentext                         | `#gap[Setze den {{}}]`            |
| `#textTask[...]` | Freie Textaufgabe                  | `#textTask[Erkläre das Konzept.]` |
| `#mathTask[...]` | Rechenaufgabe                      | `#mathTask[5 + 3 = ]`             |
| `#codeTask[...]` | Programmieraufgabe                 | siehe unten                       |
| `#info[...]`     | Info-Box innerhalb einer Kategorie | `#info("Hinweis")[Text]`          |

---

## Details zu den Aufgabentypen

### Multiple Choice `#mcq[...]`

* Antworten werden als Liste geschrieben:

  ```markdown
  - [x] Richtig
  - [ ] Falsch
  ```
* Es können beliebig viele Antworten richtig sein.
  Mindestens eine Antwort muss richtig sein.
* Mit `#mcq(single: true)` kann festgelegt werden, dass nur eine Antwort ausgewählt werden kann.
* Beim Generieren wird die Reihenfolge der Antworten zufällig vertauscht.

### Lückentext `#gap[...]`

* Schreibe `{{richtige}}` für eine Lücke mit einer richtigen Antwort.
* Schreibe `{{eins|zwei}}` für mehrere akzeptierte Antworten.
* Mit `#gap(mcq: true)` werden die Einträge als Dropdown angezeigt (die erste Angabe ist die korrekte).

### Mathe-, Coding- und Textaufgaben `#mathTask[...]`, `#codeTask[...]`, `#textTask[...]`

Innerhalb dieser Aufgaben können zusätzliche Macros verwendet werden:

| Macro              | Funktion                     | Beispiel                           |
| ------------------ | ---------------------------- | ---------------------------------- |
| `#hint[...]`       | Tipp                         | `#hint[Überlege, was passiert.]`   |
| `#solution[...]`   | Lösung                       | `#solution[Ergebnis: 8]`           |
| `#starter[...]`    | Startcode (nur Code-Aufgabe) | `#starter[```ts\nlet x;\n```]`     |
| `#validation[...]` | Prüfung (nur Code-Aufgabe)   | `#validation[```ts\nx === 2\n```]` |

---

## Aufgaben gruppieren mit `#group[...]`

Nutze `#group[...]`, um mehrere Aufgaben zu Unteraufgaben zusammenzufassen.
Text vor der ersten Aufgabe gilt als Einleitung oder Aufgabenstellung, auf die sich alle Unteraufgaben beziehen.

```typst
#group[
  Das ist die Einleitung.
  #mcq[Frage 1 - [x] Ja - [ ] Nein]
  #gap[Setze das Wort ein: {{Antwort}}]
]
```

---

## Format-Regeln

* Code wird mit **drei Backticks** ` ` ``` umschlossen:

  ````typst
  ```ts
  console.log("Hallo")
  ```
  ````
* Macros beginnen mit `#` und enden mit `[ ... ]`.
* Keine anderen Typst-Funktionen oder Formatierungen verwenden.
  (Das kann das Arbeitsblatt unbrauchbar machen.)

---

## Kurzes Beispiel

````typst
#title[Beispiel-Arbeitsblatt]

= Grundlagen Variablen

Eine Variable speichert einen Wert, z. B. eine Zahl oder einen Text.

= Checkpoint

#group[
  #mcq[Was passiert?
  ```ts
  console.log("Test")
  ```
  - [x] Es wird "Test" ausgegeben
  - [ ] Es wird ein Test ausgeführt
  - [ ] Nichts passiert
  ]

  #gap[Setze das Wort ein: Ich kann eine {{Lücke}} platzieren. Hier ist eine Lücke mit mehreren richtigen {{Lösungen|Antworten}}!]

  #textTask[
    Mit welchem Aufgabentyp kann ich freie Antworten zulassen?
    #hint[Ließ nochmal Aufgaben-Macros.]
    #solution[Mit dem Macro `#textTask[]`.]
  ]
]

= Aufgaben
#mathTask[
  Rechne: 4 × 2 = ?
  #solution[8]
]

= Challenge
#mathTask[
  Rechne: 4 × 2 = ?
  #solution[8]
]

#info("Code Aufgaben")[
  Hier ist ein kurzer Infotext, der für die folgende Aufgabe relevant sein könnte.
]

#codeTask[
  Setze `counter` auf 2.
  #starter[
    ```ts
    let counter;
    ```]
  #solution[
    ```ts
    let counter = 2;
    ```]
  #validation[
    ```ts
    counter === 2
    ```]
]

````

