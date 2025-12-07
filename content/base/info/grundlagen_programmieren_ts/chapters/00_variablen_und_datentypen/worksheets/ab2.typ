#import "worksheet-style.typ": *
#show: worksheetStyle

#title[Übungen Variablen]

= Aufgaben

#group[
  Beantworte, was der Code in der Schul-App macht (mehrere Antworten können richtig sein).

  #mcq[
    ```ts
      const wohnort: string = "Stuttgart";
    ```

    - [x] Deklariert die Variable `wohnort`
    - [x] Weist der Variable `wohnort` einen Wert zu
    - [ ] Gibt den Wert der Variable in der Konsolenausgabe aus
    - [ ] Der Code wirft einen Fehler
  ]

  #mcq[

    ```ts
    let adresse: string;
    ```

    - [x] Deklariert die Variable `adresse`
    - [ ] Weist der Variable `adresse` einen Wert zu
    - [ ] Gibt den Wert der Variable in der Konsolenausgabe aus
    - [ ] Der Code wirft einen Fehler
  ]

  #mcq[

    ```ts
    adresse = "Hauptstraße 17";
    console.log(adresse);
    ```

    - [ ] Deklariert die Variable `adresse`
    - [x] Legt den Wert der Variable `adresse` fest
    - [x] Gibt den Wert der Variable in der Konsolenausgabe aus
    - [ ] Der Code wirft einen Fehler
  ]

  #mcq[

    ```ts
    const hausnummer: number = "17a";
    ```

    - [ ] Deklariert die Variable `hausnummer`
    - [ ] Legt den Wert der Variable `hausnummer` fest
    - [ ] Gibt den Wert der Variable in der Konsolenausgabe aus
    - [x] Der Code wirft einen Fehler
  ]

  #mcq[

    ```ts
    let geburtsort: string;
    console.log(geburtsort);
    ```

    - [x] Deklariert die Variable `geburtsort`
    - [ ] Legt den Wert der Variable `geburtsort` fest
    - [ ] Gibt den Wert der Variable in der Konsolenausgabe aus
    - [ ] Der Code wirft einen Fehler
  ]
]

#group[
  In den untenstehenden Code für die Schul-App haben sich Fehler eingeschlichen.
  Korrigiere die Fehler!

  #codeTask[
    Die Schul-App soll speichern, ob das Schülerkonto aktiviert ist.


    #starter[
      ```ts
      istAktiv = true;
      console.log(istAktiv);
      ```
    ]

    #hint[
      Deklariere zuerst die Variable mit einem passenden Datentyp. Danach kannst du den Wert zuweisen.
    ]

    #solution[
      ```ts
      let istAktiv: boolean;
      istAktiv = true;
      console.log(istAktiv);
      ```
    ]

    #validation[
      ```ts
      typeof(istAktiv) === "boolean" && istAktiv === true
      ```
    ]


  ]

  #codeTask[
    In der Schul-App soll eine feste maximale Anzahl von Kursen gespeichert werden.
    `maxKurse` soll eine Konstante sein.


    #starter[
      ```ts
      const maxKurse: number;
      maxKurse = 15;
      console.log(maxKurse);
      ```
    ]

    #hint[
      Bei const musst du den Wert direkt bei der Deklaration festlegen.
    ]

    #solution[
      ```ts
      const maxKurse: number = 15;
      console.log(maxKurse);
      ```
    ]

    #validation[
      ```ts
      maxKurse === 15
      ```
    ]

  ]
]
