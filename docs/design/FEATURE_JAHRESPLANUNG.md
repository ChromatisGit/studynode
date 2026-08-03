# Feature: Jahresplanung (Stoffverteilungsplan)

## Ziel

Lehrkräfte können einen interaktiven Jahresplan für einen Kurs erstellen. Der Plan verteilt die Topics aus `course.yml` auf Kalenderwochen und berücksichtigt Ferien, Feiertage, Klausuren und optionale Themen.

## Kernkonzepte

### Wochenkapazität

Jede Woche hat eine verfügbare Stundenzahl. Die Standardkapazität wird einmalig pro Plan festgelegt (z.B. 4 Std/Woche). Sie kann pro Woche überschrieben werden:

- Feiertag fällt auf Unterrichtstag → Kapazität reduzieren (z.B. 2 Std statt 4)
- Ferienwochen → Kapazität 0

### Topics

Topics kommen direkt aus der bestehenden Kursstruktur (bereits in der DB nach Pipeline-Lauf). Jedes Topic bekommt eine geschätzte Stundenzahl (`estimated_hours`), entweder in `course.yml` hinterlegt oder im Plan manuell gesetzt.

Das System verteilt Topics automatisch auf Wochen basierend auf Kapazität und geschätzter Dauer. Beim Anlegen des Plans wählt die Lehrkraft Schuljahr, Kurs und Wochenstundenzahl.

### Optionale Themen

`course.yml` hat zwei unabhängige Listen:

```yaml
topics:           # Pflicht, feste Reihenfolge
optional-topics:  # Pool, frei an beliebiger Stelle einplanbar
```

Optionale Themen können im Plan an jeder Stelle eingefügt werden. Sie verbrauchen Wochenkapazität wie normale Topics, verschieben aber den Pflichtablauf nach hinten. Sie können auch wieder entfernt werden — der Pflichtablauf rückt dann vor.

### Events

Innerhalb einer Woche können Events eingetragen werden. Sie reduzieren die verfügbare Kapazität dieser Woche:

| Kind | Beispiel | Dauer |
|------|----------|-------|
| `exam` | GK Klausur 1 | 45 min |
| `exercise` | Wiederholung Terme | frei |
| `marker` | Zwischenstand besprechen | — |

Marker haben keine Dauer und beeinflussen die Kapazität nicht — sie dienen nur als Notiz.

### Bump Forward

Wenn eine Woche ausfällt oder die Kapazität nachträglich reduziert wird, verschiebt das System alle folgenden Topics automatisch nach vorne ("Bump Forward"). Die Lehrkraft markiert die Woche als Ausfall — der Rest passt sich an.

## Datenmodell (Entwurf)

```
school_year_plans
  id, course_id, group_key, label, school_year
  default_hours_per_week

plan_weeks
  id, plan_id, week_number, date_from
  available_hours  -- überschreibt default_hours_per_week

plan_week_topics
  week_id, topic_id, is_optional
  -- Topics werden automatisch verteilt, können manuell verschoben werden

plan_week_events
  id, week_id, kind ('exam' | 'exercise' | 'marker')
  label, duration_minutes (nullable bei marker)
```

## Erweiterungen in course.yml

```yaml
topics:
  terme-gleichungen:
    estimated_hours: 8
    chapters:
      - terme-umformen
      - ...

optional-topics:
  kostenprojekt:
    estimated_hours: 4
    chapters:
      - einführung
```

## Abgrenzung

- **Kein schulweiter Stundenplan** — nur individuelle Unterrichtsplanung pro Lehrkraft und Kurs
- **Keine Schüler-Ansicht** — rein lehrerseitig
- **Keine Kollaborationsfunktion** in der ersten Version
