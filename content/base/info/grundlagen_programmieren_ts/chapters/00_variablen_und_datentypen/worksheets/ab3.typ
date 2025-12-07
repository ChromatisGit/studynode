#import "worksheet-style.typ": *
#show: worksheetStyle

#title[Challenges Variablen]

= Challenge

#textTask[
  In der Schul-App für Schüler sind einige Variablen mit unpassenden Datentypen deklariert.
  Erkläre für jeder Zeile kurz, welcher besser geeignet wäre oder warum der Datentyp korrekt ist.

    ```ts
    let unterrichtsstundenHeute: string = 6;
    let hatParkplatzGebucht: string = "true";
    let appFarbe: number = "Blau";
    const appVersion: number = 1.0;
    ```

  #hint[
    Achte darauf, ob der Datentyp zum Wert passt. Werte in Anführungszeichen sind immer Text (string).
  ]

  #solution[
    ```ts
    let unterrichtsstundenHeute: string = 6;
    ```
    Falsch: Stundenanzahl ist eine Zahl -> besser: number


    ```ts
    let hatParkplatzGebucht: string = "true";
    ```
    Falsch: Wahr/Falsch-Angabe -> boolean

    ```ts
    let appFarbe: number = "Blau";
    ```
    Falsch: Farbe ist Text -> string

    ```ts
    const appVersion: number = 1.0;
    ```
    Richtig: Versionsnummer als Zahl, const sinnvoll da fest
  ]

]

#codeTask[
  Überlege bei den folgenden Variablen, ob sie besser mit `const` oder mit `let` deklariert werden sollten.
  Füge jeweils einen Kommentar hinzu, der deine Entscheidung begründet.

  #starter[
    ```ts
    schulName: string = "Willhelm-Maybach-Schule";

    aktuelleWoche: number = 48;

    istPause: boolean = false;

    maxFehltage: number = 20;
    ```
  ]

  #hint[
    Werte, die sich im Programmverlauf nie ändern sollen -> const
    Werte, die sich ändern können -> let
  ]

  #solution[
    ```ts
    const schulName: string = "Willhelm-Maybach-Schule";
    // Schulname bleibt immer gleich -> const

    let aktuelleWoche: number = 48;
    // Ändert sich jede Woche -> let besser

    let istPause: boolean = false;
    // Ändert sich mehrmals pro Tag -> let

    const maxFehltage: number = 20;
    // Fixer Wert, bleibt gleich -> const
    ```
  ]
]

#codeTask[
  Die Schul-App soll Informationen über eine Klasse speichern. Lege sinnvolle Variablen mit passenden Datentypen an.

  Verwende dabei mindestens:
  - eine Text-Variable (string)
  - eine Zahlen-Variable (number)
  - eine Wahr/Falsch-Variable (boolean)

  Gib anschließend alle Werte in der Konsole aus.

  #starter[
    ```ts
    // Ergänze sinnvolle Profil-Informationen
    ```
  ]

  #hint[
    Überlege, welche Daten in einer echten Schul-App vorkommen könnten. Wähle zu jedem Wert den passenden Datentyp.
  ]

  #solution[
    ```ts
    // Name des Klassenlehrers
    let lehrkraft: string = "Herr Holst";

    // Anzahl der Schüler in der Klasse
    let anzahlSchueler: number = 20;

    // Ob die Klasse ihre Tablets erhalten hat
    let hatTablet: boolean = true;

    console.log(lehrkraft);
    console.log(anzahlSchueler);
    console.log(hatTablet);
    ```
  ]
]