# To-Do-Liste für Meilenstein 2 (Next.js Rewrite)

## Phase 0 – Vorbereitung (blockierend)

### Repo-Split

* Neues Repo „studynode-web“ erstellen
* Neues Repo „studynode-content“ erstellen
* Content per Submodule oder Pull-Step einbinden
* Lokale Entwicklung mit beiden Repos sicherstellen
* CI-Build sicherstellen

### Pipeline

* Pipeline zieht Content-Repo
* Builder ausführen
* Next.js Build erfolgreich
* Deployment auf Vercel lauffähig

---

## Phase 1 – Release-Blocker

### UI / Funktionalität

* zwei Code Task in einer Task Validierung selber Output

### Navigation / Orientierung

* Course Page:

  * Aktuelles Kapitel anzeigen
  * Aktuelle Arbeitsblätter anzeigen
* Homepage:

  * Kurse in drei Bereiche aufteilen

    * Öffentliche Kurse
    * Freigeschaltete Kurse
    * Beitretbare Kurse

---

## Phase 2 – Testbarkeit

### Test-Worksheet anlegen

* Alle MCQ-Varianten (2–6 Optionen, lange Texte)
* Free Response kurz/lang
* Free-Response Preview testen
* Notes/Hinweise testen (wenn vorhanden)
* Bilder testen (wenn Komponente vorhanden)
* Edge-Cases (lange Wörter)

### Nach dem Test

* MCQ Gap prüfen und beheben
* Scrollverhalten testen
* Mobile Verhalten testen
* Hover-Zustände testen
