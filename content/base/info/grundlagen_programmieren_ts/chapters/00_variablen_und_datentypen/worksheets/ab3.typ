#import "worksheet-style.typ": *
#show: worksheetStyle

#title[Challenges Variablen]

= Challenge



#textTask[
  In der Schul-App sind einige Datentypen unlogisch gewählt.
  Erkläre, warum der Datentyp richtig gewählt oder warum ein anderer Datentyp geeigneter wäre.
ToDo
    ```ts
    let schulfarbe: number = "Blau";
    let maxTeilnehmer: string = 30;
    let hatMensaAbo: string = "true";
    const appVersion: number = 1.0;
    ```

  #hint[
    Achte darauf, ob der Datentyp zum Wert passt. Werte in Anführungszeichen sind immer Text (string).
  ]

  #solution[
    ```ts
    let schulfarbe: number = "Blau"; 
    // ❌ Falsch: Farbe ist Text, kein number

    let maxTeilnehmer: string = 30;
    // ❌ Falsch: Anzahl ist Zahl, kein string

    let hatMensaAbo: string = "true";
    // ❌ Falsch: Wahr/Falsch-Angabe → boolean

    const appVersion: number = 1.0;
    // ✅ In Ordnung, Versionsnummer als Zahl
    ```
  ]

]

#codeTask[
  Überlege bei den folgenden Variablen, ob sie besser mit **const** oder mit **let** deklariert werden sollten.
  Füge jeweils einen Kommentar hinzu, der deine Entscheidung begründet.

  #starter[
    ```ts

    schulName: string = "Willhelm-Maybach-Schule";

    aktuelleWoche: number = 48;

    hatHausaufgabeAbgegeben: boolean = false;

    maxFehltage: number = 20;
    ```
  ]

  #hint[
    Werte, die sich im Programmverlauf nie ändern sollen → const
    Werte, die sich ändern können → let
  ]

  #solution[
    ```ts
    const schulName: string = "Berufliches Gymnasium Süd";
    // Schulname bleibt immer gleich -> const ist richtig

    let aktuelleWoche: number = 48;
    // ✅ Ändert sich jede Woche -> let besser

    let hatHausaufgabeAbgegeben: boolean = false;
    // ✅ Kann sich ändern -> let

    const maxFehltage: number = 20;
    // ✅ Fixer Wert, bleibt gleich -> const passt
    ```
  ]

  #validation[
  ]
]

#codeTask[
  Die Schul-App soll Informationen über eine Klasse speichern.
  Lege sinnvolle Variablen mit passenden Datentypen an. 
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
    let anzahlSchueler: number = ;

    // Ob die Klasse ihre Tablets erhalten hat
    let hatTablet: boolean = true;

    console.log(lehrkraft);
    console.log(anzahlSchueler);
    console.log(hatTablet);
    ```
  ]

  #validation[
    ```ts
   //ToDo
    ```
  ]
]