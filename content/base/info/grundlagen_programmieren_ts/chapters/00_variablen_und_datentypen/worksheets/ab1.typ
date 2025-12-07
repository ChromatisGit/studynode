#import "worksheet-style.typ": *
#show: worksheetStyle

#title[Einstieg Variablen]

= Checkpoint

#group[
  Ergänze die Lücken.

  #gap(empty: true)[
    ```ts
    // Der folgende Code erstellt eine Begrüßung in der Schul-App

    {{let}} nachricht: {{string}};

    nachricht = "Willkommen in deiner Schul-App!";

    console.log({{nachricht}});
    ```
  ]
]

#group[
  Wähle den passenden Datentyp für die Schul-App:

  #mcq(single: true)[
    Die Variable `groesse` soll die Körpergröße eines Schülers speichern (ohne Einheit).
    - [x] number
    - [ ] string
    - [ ] boolean
  ]

  #mcq(single: true)[
    Die Variable `istErwachsen` soll speichern, ob ein Schüler volljährig ist.
    - [ ] number
    - [ ] string
    - [x] boolean
  ]

  #mcq(single: true)[
    Die Variable `wohnort` soll den Wohnort eines Schülers speichern.
    - [ ] number
    - [x] string
    - [ ] boolean
  ]
]

= Aufgaben

#codeTask[
  In der Schul-App soll ein Schülerprofil gespeichert werden.
  Lege eine Variable `name` für deinen Namen und `alter` für dein Alter an.
  Gib beide Variablen mit `console.log` in der Konsolenausgabe aus.

  #starter[
    ```ts
    // Profil-Daten für die Schul-App
    ```
  ]

  #hint[
    `name` ist Text (string), `alter` ist eine Zahl (number). Denke daran, zuerst zu deklarieren und dann einen Wert zuzuweisen.
  ]

  #solution[
    ```ts
    let name: string = "Dein Name";
    let alter: number = 17;

    console.log(name);
    console.log(alter);
    ```
  ]

  #validation[
    ```ts
    typeof(name) === "string"
      && typeof(alter) === "number"
      && name.length > 1
      && alter > 0
    ```
  ]
]
