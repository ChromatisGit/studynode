# StudyNode

Digitale Unterrichtsplattform für Mathematik und Informatik auf Basis von **Docusaurus**.

---

## Ordnerstruktur



### Content

```

content/
├─ groupsAndSubjects.yml             # Definiert die Fächer und Kursarten
│
├─ base/                             # Allgemeine Unterrichtsinhalte (kursunabhängig)
│  ├─ <subject>/                     # math, info ...
│  │  └─ <topic>/                    # z. B. vektorgeometrie, trigonometrie
│  │     ├─ chapters/
│  │     │  └─ <chapter>/            # z. B. 00_geraden, 01_geraden_lagebeziehung
│  │     │     ├─ slides/            # Foliensätze
│  │     │     ├─ worksheets/        # Arbeitsbögen
│  │     │     ├─ preview.md         # Website vor/während Bearbeitung
│  │     │     └─ overview.md        # Website nach Abschluss des Kapitels
│  │     │
│  │     ├─ images/                  # Abbildungen für Webseite und Arbeitsbögen
│  │     ├─ notes.md                 # Interne Notizen
│  │     ├─ preview.md               # Website vor/während Bearbeitung
│  │     ├─ overview.md              # Website nach Vollendung des Themenblocks
│  │     └─ topicPlan.yml            # Stoffverteilungsplan eines Themenblocks (Lernziele + Kapitel)
│  │
│  └─ slides/                        # Überfachliche Foliensätze
│
├─ courses/                          # Konkrete Kurse (sichtbar für Schüler)
│  └─ <group>/                       # z. B. tg2, bk1
│     ├─ principles.md               # Leitsätze & Informationen für gesamte Gruppe
│     │
│     └─ <subject_variant>/          # z. B. math-lk, info-tm
│        ├─ coursePlan.yml          # Themenliste + aktueller Fortschritt
│        │
│        └─ <topic>/                 # Kurs-spezifische Themen (Alles optional)
│           └─ chapters/
│              └─ <chapter>/         # z.B. 10_geraden, 11_geraden_lagebeziehung
│                 ├─ preview.md      # (optional) überschreibt base/preview.md
│                 └─ overview.md     # (optional) überschreibt base/summary.md
│
└─ templates/                        # Vorlagen zum Kopieren
   ├─ baseTopic/                    # Topic + Chapter Skelett
   └─ coursePlans/                  # coursePlan.yml Vorlagen für Kursvarianten

```

### Source (Quellcode)
```
src/
│
├─ builder/                          # Node-Buildtools
│  └─ main.ts                        # erzeugt .generated/*
│
├─ dev/                              # Development Tools
│  └─ export-schema.ts               # Erzeugt Schema für YAML Validierung in VSCode
│
├─ schema/                           # Zod-Schemas (Quellcode)
│
└─ marp-styling/                     # CSS/Themes für Marp Foliensätze
```

### Weitere

```
website/                             # Docusaurus-Website
│
├─ src/                              # Darstellung & Interaktion mit der Webseite
├─ static/                           # Vom Builder abgelegte PDFs/Bilder
└─ .generated/                       # Vom Builder generiertes Layout

```

.vscode/
│
├─ settings.json                     # YAML Schema-Zuweisungen
│
└─ .schemas/                         # Generierte JSON-Schemas (für IntelliSense)
   └─ course-plan.schema.json
---

## Begriffe

| Begriff | Bedeutung |
|----------|------------|
| **Stunde** | Kleinste Unterrichtseinheit (Einzel- oder Doppelstunde). Eine Stunde behandelt einen klar abgegrenzten Teilaspekt des aktuellen Kapitels. |
| **Kapitel (chapter)** | Didaktisch abgeschlossene Einheit mit 1–6 Stunden. |
| **Themenblock (topic)** | Eigenständige thematische Einheit meist in Anlehnung einer Bil­dungs­plan­ein­hei­t. Kann mehrere Kapitel zusammenfassen (z. B. *Vektorgeometrie*) oder als einzelnes Thema ohne Unterkapitel stehen. |
| **Roadmap** | Fortschrittsübersicht über alle Themenblöcke und Kapitel eines Kurses. Zeigt aktuelle, abgeschlossene und kommende Themen. Wird über die Datei `course-plan.yaml` pro Kurs gesteuert. |
| **Arbeitsblatt (worksheet)** | Besteht aus mehreren Lernelementen (z. B. Basisaufgaben, Checkpoints, Challenges, Infotexten) und kann als PDF oder interaktive Web-Seite vorliegen. |
| **Lernelement** | Kleinste Einheit innerhalb eines Arbeitsblatts. Lernelemente werden im Content-Pool gepflegt und zu Arbeitsblättern zusammengesetzt. |
| **Grundaufgabe (core)** | Aufgabe, die alle Schüler während der Stunde bearbeiten. Sie bildet das erwartete Mindestlernziel ab. |
| **Checkpoint** | Verständnisfrage mit sofortiger Rückmeldung (Check for Understanding). Dient der Selbstkontrolle und Lernstandserhebung. |
| **Challenge** | Vertiefungs- oder Transferaufgabe für schnelle oder besonders leistungsstarke Schüler. Fördert Anwendung und Transfer. |

---

## Ablauf einer Stunde

1. Vorbereitung
2. Einstiegsphase (Marp-Folien)
3. Erarbeitungsphase
4. Ergebnissicherung
5. Nachbereitung

---


## Arbeitsblatttypen

| Typ | Format |
|------|---------|
| PDF-AB | `.pdf` |
| Web-AB | `.mdx` |

---


## ToDo Liste

- Warnung wenn Lernelemente die bereits veröffentlicht sind bearbeitet werden (Willst du das nicht lieber in einem neuen Branch machen?)

© 2025 Christian Holst
