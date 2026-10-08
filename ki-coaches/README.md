# KI-Coaches

Fach mit eigenen Inhaltsseiten (`rolle: "fach"` in `data/inhalte.js`).
Ein KI-Coach ist ein Prompt, den Schülerinnen und Schüler in ein KI-Programm
ihrer Wahl kopieren. Auf der Lernplattform selbst läuft keine KI.

| Ordner         | Themenbereich | Inhalt                                             |
|----------------|---------------|----------------------------------------------------|
| `rechtslehre/` | Rechtslehre   | Lerncoach Rechtslehre (Verwaltungsfachangestellte) |
| `awl/`         | AWL           | Lerncoach Allgemeine Wirtschaftslehre (Verwaltungsfachangestellte) |

Pfadschema: `ki-coaches/<fach>/<coach>/` – Fach → Themenbereich → Thema wie bei
`wirtschaft/` und `ggk/`. Die Themenbereiche sind nach Unterrichtsfach benannt.
Die Seiten im Thema melden sich mit `tiefe: 3` an.

Jeder Coach erscheint zusätzlich auf der Seite seines Unterrichtsfachs
(Feld `faecher` des Themeneintrags), z. B. der Lerncoach unter Rechtslehre.

## Gemeinsame Hinweise

Die Hinweise zur Nutzung (freie Werkzeugwahl, Altersgrenzen, keine
personenbezogenen Daten, Alternative ohne KI) stehen einmal auf
`ki-coaches/index.html#nutzung`. Jeder Coach verweist dorthin, statt sie zu
wiederholen.

## Neuen Coach anlegen

1. Ordner `ki-coaches/<fach>/<coach>/` mit `index.html` (Themenseite),
   `coach.html` (Prompt-Seite) und `README.md` – Vorlage ist
   `rechtslehre/lerncoach/`.
2. Gibt es den Themenbereich für das Fach noch nicht: `ki-coaches/<fach>/index.html`
   als Kopie von `rechtslehre/index.html` anlegen und in `data/inhalte.js` unter
   `bereiche` eintragen (id mit Präfix `ki-`, z. B. `ki-vbwl`).
3. Themeneintrag in `data/inhalte.js` ergänzen, mit `faecher: ["ki-coaches", "<fach>"]`.
