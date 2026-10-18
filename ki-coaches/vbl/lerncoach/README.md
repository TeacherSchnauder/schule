# Lerncoach VBL

Fach: Volks- und Betriebswirtschaftslehre (Profilfach) · Bildungsgang: Wirtschaftsgymnasium BW,
Jahrgangsstufen 1 und 2 · Bildungsplan 2021 (BPE 6–23) · Stand Prompt: 18.10.2026

| Datei        | Inhalt                                                                         |
|--------------|--------------------------------------------------------------------------------|
| `index.html` | Themenseite: Einordnung, Hinweise für die Lehrkraft, eingebetteter Coach       |
| `coach.html` | Schülerseite: Lernpass einfügen, Prompt kopieren/als Textdatei, Lesefassung    |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/ki-coaches/vbl/lerncoach/coach.html
```

## Pflegehinweise

- Der Prompt steht in `coach.html` **nur einmal**: im `<textarea id="raw">` (Markdown,
  HTML-maskiert: `&amp;`, `&lt;`, `&gt;`). Lesefassung, Inhaltsverzeichnis, Kopie und
  Textdatei werden daraus beim Öffnen der Seite erzeugt. Änderungen also nur dort.
- Der Lernpass aus dem Eingabefeld wird beim Kopieren mit einer Trennlinie ans Ende des
  Prompts gehängt. Er wird nicht gespeichert (kein localStorage, keine Übertragung).
- Zeitabhängig und regelmäßig zu prüfen:
  - Abschnitt 15.3 (Abitur): Bearbeitungszeit, Auswahlmodus, BE, Hilfsmittel und
    Paragraphenregel stammen vom Deckblatt der Hauptprüfung 2026.
  - Anhang 1: Wahl-BPE 13/14 und 22/23 – Hinweis anpassen, sobald feststeht, welche
    abiturrelevant sind.
  - Anhang 2: EZB-Strategie (Überprüfungen 2021 und 2025), Bezeichnungen von Sozialleistungen.
- Der Prompt enthält keine echten Abituraufgaben oder Erwartungshorizonte.
- Die Seite lädt nichts von fremden Servern. Ohne JavaScript erscheint der Prompt als
  einfaches Textfeld; die Seite bleibt nutzbar.
