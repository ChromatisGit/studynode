# @checkpoint

## @set

Zum Beispiel mit Multiple Choice Fragen:

### @mcq

Macht dieser Code etwas?

```ts
console.log("test")
```

- [x] Ja
- [x] Definitiv
- [ ] Nein

### @mcq

Müssen mehrere Antworten richtig sein?
- [x] Nein
- [ ] Doch
- [ ] Ohh!

## @set

`@mcq[single]` bedeutet: *Immer nur eine Antwort ist korrekt.*

### @mcq[single]

Eine Quizfrage
- [x] richtig
- [ ] falsch
- [ ] auch falsch

### @mcq[single]

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

## @gap[mcq]

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

@starter
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

## @text

Eine weitere Textaufgabe, die nicht mit den anderen Aufgaben zu tun hat und deshalb level 2 statt in dem set ist

@hint
Ein Hinweis

@solution
Eine beispielhafte Antwort.