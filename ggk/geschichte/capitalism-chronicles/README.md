# The Capitalism Chronicles

Fach: GGK (Geschichte: Industrielle Revolution) und FWS · Bildungsgang: Wirtschaftsgymnasium ·
Begehbares 3D-Lernspiel in drei Kapiteln · Stand: 16.11.2026 (Grundspiel aller Kapitel)

| Datei / Ordner      | Inhalt                                                                 |
|---------------------|------------------------------------------------------------------------|
| `index.html`        | Lehrseite: Einordnung, drei Kapitel, Hinweise für die Lehrkraft        |
| `spiel/`            | das Spiel (Three.js lokal, ohne Build); eigene Anleitung in `spiel/ANLEITUNG.md` |
| `spiel/LIZENZEN.md` | Quellen und Lizenzen aller Bestandteile                                |

Adressen für die Klasse:

```
https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/
https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-2.html
https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-3.html
```

Beamer-Ansicht für das Tribunal (Lehrkraft):

```
https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-3.html?beamer
```

## Pflegehinweise

- Alle Texte und Zahlen stehen in JSON-Dateien unter `spiel/chapters/kapitel-N/`;
  Änderungen dort brauchen keine Programmierung (siehe `spiel/ANLEITUNG.md`).
- Anders als die übrigen Seiten der Plattform läuft das Spiel nur über einen
  Webserver (GitHub Pages), nicht beim Öffnen der Datei per Doppelklick.
- Lehrerheft, Lösungen und Codewort werden nicht im Repository abgelegt.
- Das Spiel lädt nichts von fremden Servern und speichert nur den Spielstand im
  Browser (`localStorage`, Schlüssel `capitalism-chronicles-kapitel-1-v1` bis
  `-kapitel-3-v1` und `capitalism-chronicles-kapitel-3-beamer-v1`).

## Eintrag in `data/inhalte.js`

```js
{
  id: "capitalism-chronicles",
  name: "The Capitalism Chronicles",
  bereich: "ggk-geschichte",
  pfad: "ggk/geschichte/capitalism-chronicles",
  status: "aktiv",
  kurz: "…",
  faecher: ["ggk", "fws", "vwl"],
  material: ["3D-Lernspiel in drei Kapiteln", "Tribunal mit Beamer-Ansicht", "Lehrkraft-Bereich"]
}
```
