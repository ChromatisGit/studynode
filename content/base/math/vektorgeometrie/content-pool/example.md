# Beispielsblatt

# @info

`@info` wird genutzt, um **theoretischen Input**, Erklärungen oder Beispiele zu geben.

**Beispiel:**
Ein Beispiel mit Code:

``` ts
const example: string = "hello World";
```

# @checkpoint

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

## @set

`@mcq[single=true]` bedeutet: *Immer nur eine Antwort ist korrekt.*

### @mcq[single=true]

Eine Quizfrage
- [x] richtig
- [ ] falsch
- [ ] auch falsch

### @mcq[single=true]

Zweite Quizfrage
- [x] richtig
- [ ] falsch
- [ ] ganz falsch

# @core

## @gap

Der `@gap`-Decorator erzeugt **Lückentexte**, bei denen Schüler Wörter einsetzen.

Ich kann eine __ {{Lücke}} platzieren. Hier ist eine Lücke mit mehreren richtigen __ {{Lösungen|Antworten}}!

Funktioniert auch in Code

``` ts
let counter: __ {{number}};

counter __ {{=}} 1;
```

## @gap[mcq=true]

Ich kann auch einen Lückentext mit Dropdown für die Antworten haben. Nur die erste __ {{Antwort|Frage|Bild}} ist richtig.

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

Setze `counter` auf 2.

``` ts
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
