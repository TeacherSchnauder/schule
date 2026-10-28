# Escape Game: Akte Weimar

Fach: GGK · Bildungsgang: Wirtschaftsgymnasium, J1 · BPE 2 Demokratie und
Diktatur in Deutschland und Europa (Teil-BPE 2.1–2.4) · Stand: 28.10.2026 ·
Spielversion 1.2

| Datei         | Inhalt                                                              |
|---------------|---------------------------------------------------------------------|
| `index.html`  | Lehrseite: Einordnung, Hinweise für die Lehrkraft, Vorschau des Spiels |
| `spiel.html`  | Escape Game als eigenständige Seite (für QR-Code und Classroom)      |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/ggk/geschichte/akte-weimar/spiel.html
```

Beamer-Ansicht für die Lehrkraft (Rahmengeschichte, Spielzeit, QR-Code, Musik):

```
https://teacherschnauder.github.io/schule/ggk/geschichte/akte-weimar/spiel.html#beamer
```

## Pflegehinweise

- Alle Texte stehen im Objekt `CONFIG` am Anfang des Skripts in `spiel.html`.
  Lösungen stehen dort nur als Prüfwert; wie man einen Prüfwert neu berechnet,
  steht im Lehrkraftmaterial.
- Lehrkraftmaterial, Lehrkraftcode und Prüfcodes werden nicht im Repository
  abgelegt, sondern lokal bzw. in Moodle.
- Die Musik wird im Browser erzeugt (Web Audio), es gibt keine Audiodateien.
- Die Seite lädt nichts von fremden Servern und speichert nur den Spielstand im
  Browser des Geräts (`localStorage`, Schlüssel `akteWeimar_v1`).

## Eintrag in `data/inhalte.js` (unter `themen`, nach „wahlprogramme-2025“; zusätzlich beim Bereich „ggk-geschichte“ status auf "aktiv" setzen)

```js
{
  id: "akte-weimar",
  name: "Escape Game: Akte Weimar",
  bereich: "ggk-geschichte",
  pfad: "ggk/geschichte/akte-weimar",
  status: "aktiv",
  kurz: "Was lernen wir für Bonn? Als Archivteam des Parlamentarischen Rates fünf Siegel öffnen – von der Weimarer Verfassung über die Zerstörung der Demokratie 1933 zu den Lehren des Grundgesetzes.",
  faecher: ["ggk"],
  material: ["Escape Game", "Beamer-Ansicht mit Musik", "Glossar"]
},
```
