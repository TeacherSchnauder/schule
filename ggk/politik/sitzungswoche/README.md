# Escape Game: Die Sitzungswoche

Fach: GGK · Bildungsgang: Wirtschaftsgymnasium, J1 · BPE 2 Demokratie und
Diktatur in Deutschland und Europa (Teil-BPE 2.1 und 2.2) · Stand: 08.11.2026 ·
Spielversion 1.3

| Datei         | Inhalt                                                              |
|---------------|---------------------------------------------------------------------|
| `index.html`  | Lehrseite: Einordnung, Hinweise für die Lehrkraft, Vorschau des Spiels |
| `spiel.html`  | Escape Game als eigenständige Seite (für QR-Code und Classroom)      |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/ggk/politik/sitzungswoche/spiel.html
```

Beamer-Ansicht für die Lehrkraft (Ablauf, Rollen, Spielzeit, QR-Code, Musik):

```
https://teacherschnauder.github.io/schule/ggk/politik/sitzungswoche/spiel.html#beamer
```

## Pflegehinweise

- Alle Texte stehen im Objekt `CONFIG` am Anfang des Skripts in `spiel.html`.
  Lösungen stehen dort nur als Prüfwert. Texte dürfen geändert werden;
  Reihenfolge und Inhalt der Antwortmöglichkeiten nicht, sonst stimmen die
  Prüfwerte nicht mehr.
- Die Fakten-Infokästen geben einen Stand wieder (`CONFIG.meta.stand`, derzeit
  Ende Oktober 2026) – vor dem Einsatz prüfen, besonders den Kasten zur Debatte
  um ein AfD-Verbot (Station 2) und die Handyregeln in Baden-Württemberg (Station 6).
- Lehrkraftmaterial, Lehrkraftcode, Prüfcodes, Dossier und Sicherungsblatt
  werden nicht im Repository abgelegt, sondern lokal bzw. in Moodle.
- Musik wird im Browser erzeugt (Web Audio), es gibt keine Audiodateien:
  „Die Gedanken sind frei“ (Volkslied um 1800) und die Nationalhymne (Melodie
  Joseph Haydn, 1797) – beide gemeinfrei.
- Die Seite lädt nichts von fremden Servern und speichert nur den Spielstand im
  Browser des Geräts (`localStorage`, Schlüssel `sitzungswoche_j1_v1`).

## Eintrag in `data/inhalte.js` (unter `themen`, nach „wahlprogramme-2025“)

```js
{
  id: "sitzungswoche",
  name: "Escape Game: Die Sitzungswoche",
  bereich: "ggk-politik",
  pfad: "ggk/politik/sitzungswoche",
  status: "aktiv",
  kurz: "Wer macht hier eigentlich die Gesetze? Als Praktikumsteam ein fiktives Handyverbot durchs Regierungsviertel begleiten – von Demokratieprinzipien und Parteiverbot über Fraktion, Plebiszite und Lobbyismus bis zu Bundesrat und Föderalismus.",
  faecher: ["ggk"],
  material: ["Escape Game", "Begehbare Spielwelt", "Beamer-Ansicht mit Musik"]
},
```
