# Lernplattform `schule` – Struktur und Arbeitsweise

Referenzdokument für die Arbeit an der Lernplattform. Wer ein neues Thema
anlegt, findet hier alles Nötige, ohne den Code zu lesen.

**Stand:** 08.10.2026 – abgeglichen mit dem Repository auf GitHub
(Commit „GGK: Fach mit Politik und Geschichte angelegt“, 07.10.2026)
plus Fach KI-Coaches mit Lerncoach Rechtslehre.

---

## Eckdaten

| | |
|---|---|
| Repository | `TeacherSchnauder/schule`, öffentlich |
| Adresse | https://teacherschnauder.github.io/schule/ |
| Veröffentlichung | GitHub Pages, Branch `main`, Ordner `/ (root)` |
| Technik | HTML5, CSS3, Vanilla JavaScript |
| Abhängigkeiten | keine – keine Bibliotheken, keine externen Schriften, kein Build-System |
| Gestaltung | Blau / Weiß / Dunkelgrau, Kacheln, responsiv, Druckstil vorhanden |

Alle internen Verweise sind relativ. Die Seiten funktionieren deshalb auch beim
lokalen Öffnen und überstehen ein Umbenennen des Repositorys. Einzige Ausnahme:
`404.html` verwendet absolute Pfade mit `/schule/`.

---

## Verzeichnisbaum

```
schule/
├── index.html                  Startseite: Kacheln aller Fächer + „Zuletzt veröffentlicht“
├── 404.html                    Fehlerseite (absolute Pfade!)
├── README.md
├── Struktur.md                 dieses Dokument
│
├── assets/
│   ├── css/site.css            gemeinsames Stylesheet
│   └── js/site.js              Navigation, Breadcrumbs, Kachelübersichten
│
├── data/
│   └── inhalte.js              ⚑ zentrale Inhaltsübersicht – einzige Pflegestelle
│
├── wirtschaft/                 Fach mit eigenem Inhalt
│   ├── index.html
│   └── beschaffung/
│       ├── index.html
│       └── cross-docking/
│           ├── index.html      Lehrseite
│           ├── rechner.html    interaktiver Rechner, eigene Adresse für QR-Code
│           └── README.md
│
├── ggk/                        Fach mit eigenem Inhalt (Geschichte mit Gemeinschaftskunde)
│   ├── index.html
│   ├── README.md
│   ├── politik/
│   │   ├── index.html
│   │   └── wahlprogramme-2025/
│   │       ├── index.html      Lehrseite
│   │       ├── zuordnung.html  Zuordnungsspiel, eigene Adresse für QR-Code
│   │       └── README.md
│   └── geschichte/
│       └── index.html          Themenbereich angelegt, noch „geplant“
│
├── ki-coaches/                 Fach mit eigenem Inhalt (KI-Prompts, fachübergreifend)
│   ├── index.html              Übersicht + gemeinsame „Hinweise zur Nutzung“ (#nutzung)
│   ├── README.md
│   └── rechtslehre/
│       ├── index.html
│       └── lerncoach/
│           ├── index.html      Themenseite
│           ├── coach.html      Prompt mit Kopier-Schaltfläche, eigene Adresse für QR-Code
│           └── README.md
│
├── awl/  bwl/  vwl/  rechtslehre/        Fachseiten, die verlinken
└── lernfelder/  pruefungsvorbereitung/  methodenkoffer/
```

---

## Zwei Arten von Fächern

**Fächer mit eigenem Inhalt** (`rolle: "fach"`) tragen die Inhaltsseiten im
eigenen Ordnerbaum: `wirtschaft/`, `ggk/`, `ki-coaches/`. Ihre Fachseite zeigt
die Themenbereiche als Kacheln.

**Fächer als Verweis** (`rolle: "sammlung"`) haben keine eigenen Inhaltsseiten.
Sie zeigen Themen aus anderen Fachbäumen, damit ein Thema nur einmal existiert
und trotzdem unter mehreren Fächern auftaucht: `awl/`, `bwl/`, `vwl/`,
`rechtslehre/`, `lernfelder/`, `pruefungsvorbereitung/`, `methodenkoffer/`.

Cross-Docking liegt also physisch unter `wirtschaft/beschaffung/`, erscheint
aber auch auf den Seiten von BWL und AWL – gesteuert über das Feld `faecher`
des Themeneintrags. Ebenso liegt der Lerncoach unter `ki-coaches/` und
erscheint auch unter Rechtslehre und Prüfungsvorbereitung.

---

## Pfadschema

Es gibt genau eine Form:

```
Fach → Themenbereich → Thema
wirtschaft/beschaffung/cross-docking/
ggk/politik/wahlprogramme-2025/
ki-coaches/rechtslehre/lerncoach/
```

Bei GGK sind **Politik** und **Geschichte** die Themenbereiche, bei den
KI-Coaches die **Unterrichtsfächer**. Eine Trennung nach Bildungsgang
(Berufsschule / Wirtschaftsgymnasium) gibt es im Pfad nicht; der Bildungsgang
steht auf der jeweiligen Themenseite (Augenbraue, Hinweise).

---

## `data/inhalte.js` – die einzige Pflegestelle

Aus dieser Datei werden Navigation, Startseitenkacheln, Fachübersichten und
Breadcrumbs erzeugt. Drei Listen:

### `faecher`

```js
{ id: "ggk",
  name: "GGK",                  // erscheint in der Kopfnavigation – kurz halten
  ordner: "ggk",
  icon: "globus",
  kurz: "Einzeiler für die Kachel.",
  status: "aktiv",
  rolle: "fach" }               // "fach" = eigener Inhalt, "sammlung" = Verweis
```

Verfügbare Icons (in `site.js`): `fabrik`, `buch`, `diagramm`, `globus`,
`waage`, `raster`, `haken`, `werkzeug`, `ordner`, `seite`, `lkw`.
Ein unbekannter Name wird als `seite` dargestellt.

### `bereiche` – Themenbereiche

```js
{ id: "ggk-politik",            // muss über ALLE Fächer eindeutig sein → Fachkürzel voranstellen
  fach: "ggk",
  name: "Politik",
  ordner: "ggk/politik",
  status: "aktiv",
  kurz: "Einzeiler für die Kachel." }
```

### `themen` – die eigentlichen Inhaltsseiten

```js
{ id: "wahlprogramme-2025",
  name: "Wahlprogramme 2025 zuordnen",
  bereich: "ggk-politik",
  pfad: "ggk/politik/wahlprogramme-2025",
  status: "aktiv",
  kurz: "Einzeiler für die Kachel.",
  faecher: ["ggk"],                        // auf welchen Fachseiten das Thema erscheint
  material: ["Zuordnungsspiel"] }          // kleine Etiketten auf der Kachel
```

### `status`

| Wert | Wirkung |
|---|---|
| `"aktiv"` | Kachel ist verlinkt |
| `"geplant"` | Kachel erscheint grau und ohne Link – kein toter Verweis |

Geplante Themen und Bereiche dürfen eingetragen werden, bevor es sie gibt.

### Kachelflächen auf den Seiten

Eine Seite bestimmt mit `<ul data-kacheln="…" data-id="…">`, was angezeigt wird:

| `data-kacheln` | zeigt | verwendet in |
|---|---|---|
| `faecher` | alle Fächer | Startseite |
| `veroeffentlicht` | alle aktiven Themen | Startseite |
| `bereiche` | Themenbereiche eines Fachs | Fachseite mit eigenem Inhalt |
| `themen` | Themen eines Bereichs | Bereichsseite |
| `themen-fach` | Themen mit diesem Fach in `faecher` | Sammlungsseiten (AWL, BWL …) |

---

## Ein neues Thema anlegen

1. **Ordner anlegen**, zum Beispiel `wirtschaft/beschaffung/abc-analyse/`.
   In der GitHub-Weboberfläche: **Add file → Create new file** und als Namen
   `wirtschaft/beschaffung/abc-analyse/index.html` eintippen – jeder
   Schrägstrich legt einen Ordner an.
2. **`index.html`** aus einem bestehenden Thema kopieren und anpassen. Am Ende
   der Datei steht die Anmeldung – `tiefe` ist die Zahl der Ordnerebenen unter
   der Wurzel, und genauso viele `../` stehen vor den Verweisen auf `assets/`
   und `data/`:
   ```html
   <script>Schule.seite({ tiefe: 3, typ: "thema", id: "abc-analyse" });</script>
   ```
3. **`data/inhalte.js`** ergänzen: den Themeneintrag hinzufügen oder von
   `status: "geplant"` auf `"aktiv"` setzen und `pfad` eintragen.

Danach erscheint das Thema automatisch in Navigation, Fachübersichten und
Breadcrumbs. Weitere Dateien sind nicht zu ändern.

`typ` ist `"start"`, `"fach"`, `"bereich"` oder `"thema"`.

Ein neuer **Themenbereich** braucht einen Eintrag unter `bereiche` und eine
`index.html` mit `typ: "bereich"` und `tiefe: 2`. Ein neues **Fach** braucht
einen Eintrag unter `faecher` und eine `index.html` mit `typ: "fach"` und
`tiefe: 1`.

---

## Aufbau einer Themenseite

Vorlage ist `wirtschaft/beschaffung/cross-docking/index.html`:

1. Titelblock mit Augenbraue, Überschrift, Vorspann, Schaltflächen
2. Einführung – Fachtext in `<div class="schmal">`
3. Ablaufgrafik – Inline-SVG in `<div class="ablauf">`
4. Vorteile und Nachteile – `<ul class="karten">` mit Icon-Karten
5. Interaktives Werkzeug – eigene Datei, eingebettet in `<div class="rahmen">`
6. Praxisbeispiele – `<table class="daten">`
7. Zusammenfassung – `<div class="merkkasten">`

Nicht jede Seite braucht alle Abschnitte; `ggk/politik/wahlprogramme-2025/`
und `ki-coaches/rechtslehre/lerncoach/` bestehen nur aus Titelblock,
Einordnung und eingebettetem Werkzeug.

Interaktive Werkzeuge liegen immer als **eigene Datei** neben der Themenseite
und werden dort per `<iframe>` eingebunden. So gibt es eine kurze Adresse für
QR-Code und Google Classroom, bei der die Schüler nur das Werkzeug sehen und
nicht die Lösungstexte der Lehrseite.

### Artefakte aus Claude übernehmen

Ein in Claude erstelltes Artefakt wird vor dem Hochladen angepasst:

- Externe Schriften entfernen (z. B. Google Fonts) – sie übertragen bei jedem
  Aufruf Daten an fremde Server.
- `<title>` in den `<head>`, `lang="de"` und `charset="utf-8"` setzen.
- Claude-spezifische Laufzeitzeilen (`window.claude…`) durch einen normalen
  Start ersetzen.
- Hinweise und Lösungen für die Lehrkraft aus dem Werkzeug herausnehmen.

### Hinweise für die Lehrkraft

Ausführliche Lehrkraft-Hinweise mit Lösungswegen oder Lösungslinks werden
**nicht** im Repository abgelegt, sondern lokal bzw. in Moodle
(Beispiel: `lehrkraft-hinweise.md` zu Wahlprogramme 2025). Auf der Lehrseite
stehen nur Einordnung und Einsatzhinweise ohne Lösungen.

---

## KI-Coaches

Ein KI-Coach ist ein Prompt, den Schülerinnen und Schüler in ein KI-Programm
ihrer Wahl kopieren. Auf der Plattform läuft keine KI, es wird nichts
übertragen. Die Coaches liegen gesammelt unter `ki-coaches/`, gegliedert nach
Unterrichtsfach, und erscheinen über `faecher` zusätzlich auf der Seite ihres
Fachs.

| Bereich | id | Status |
|---|---|---|
| `ki-coaches/rechtslehre/` | `ki-rechtslehre` | aktiv – Lerncoach Rechtslehre |
| `ki-coaches/vbwl/` | `ki-vbwl` | geplant – Glossar-Coach für sprachsensiblen Unterricht |

**Grundsätze**

- Anbieterneutral: kein bestimmtes KI-Programm vorschreiben.
- Freiwillig: Wer keine KI nutzen möchte oder keinen Zugang hat, wendet sich an
  die Lehrkraft; die Arbeit muss auch ohne KI möglich sein.
- Gemeinsame Hinweise (Altersgrenzen, keine personenbezogenen Daten, keine
  echten Vorgänge aus dem Ausbildungsbetrieb, KI kann irren, eigene Leistung)
  stehen nur einmal auf `ki-coaches/index.html#nutzung`. Jeder Coach verweist
  dorthin.
- Der Prompt steht in `coach.html` zweimal: lesbar (`#rendered`) und als
  Kopiertext (`<textarea id="raw">`). Änderungen immer an beiden Stellen.

**Neuen Coach anlegen:** Ordner `ki-coaches/<fach>/<coach>/` als Kopie von
`ki-coaches/rechtslehre/lerncoach/`. Fehlt der Bereich, zusätzlich
`ki-coaches/<fach>/index.html` (Kopie von `ki-coaches/rechtslehre/index.html`)
und Eintrag unter `bereiche` mit id `ki-<fach>`. Themeneintrag mit
`faecher: ["ki-coaches", "<fach>"]`.

---

## Fachliche Konventionen für Inhalte

- Zwischen gesicherten Fakten, didaktischer Vereinfachung, wissenschaftlicher
  Kontroverse und politischer Bewertung wird unterschieden. Vereinfachungen
  werden gekennzeichnet, wo sie zu Missverständnissen führen könnten.
- Modelle werden als Modelle ausgewiesen. Interaktive Rechner tragen einen
  sichtbaren Hinweis auf ihre Annahmen und Grenzen.
- Bei kontroversen Fragen stehen die wichtigsten Positionen nebeneinander,
  gewichtet nach ihrer empirischen Grundlage.
- Politische Materialien folgen dem Beutelsbacher Konsens: Aussagen von
  Parteien sind Analysematerial, keine Empfehlung.
- Beispiele nennen keine konkreten Unternehmen mit Behauptungen, die sich nicht
  belegen lassen; typische Branchenmuster werden als solche bezeichnet.

---

## Beim Hinzufügen beachten

- **Das Repository ist öffentlich.** Vor dem Einstellen fremder Materialien
  (Schulbuchauszüge, Grafiken, Fotos) die Rechtslage prüfen. Lösungen zu
  Klassenarbeiten gehören nicht hierher.
- **Datenschutz**: Die Seiten laden nichts von fremden Servern, setzen keine
  Cookies und erheben keine Nutzungsdaten. Das sollte so bleiben – keine
  eingebetteten Videos von Drittanbietern ohne Prüfung, keine Analysedienste.
  Links auf fremde Seiten sind unproblematisch, weil sie erst beim Anklicken
  aufgerufen werden.
- **Hochladen** über **Add file → Upload files** im Browser. Ganze Ordner
  lassen sich per Drag-and-drop hochladen; die Unterordner bleiben erhalten.
  Eine hochgeladene Datei mit gleichem Pfad ersetzt die vorhandene.
  Dateien mit führendem Punkt wie `.nojekyll` werden dabei je nach System
  übersprungen und müssen über **Create new file** angelegt werden.

---

## Offene Punkte

- **`.nojekyll` fehlt** im Repository. Die Seite funktioniert trotzdem, solange
  kein Ordnername mit `_` beginnt. Anlegen über **Create new file**, Name
  `.nojekyll`, Inhalt leer.
- **Adresse in READMEs:** In `README.md` ist `teacherschnauder.github.io` seit
  08.10.2026 korrigiert. Der Rechner-Link in
  `wirtschaft/beschaffung/cross-docking/README.md` nennt noch
  `matthiasschnauder.github.io`.
- **Kopfnavigation zweizeilig:** Mit zehn Fächern bricht die Navigation auch
  auf großen Bildschirmen in eine zweite Zeile um (bei 1024 px Breite schon mit
  neun). Funktional unkritisch. Abhilfe bei Bedarf: Sammlungsfächer in der
  Navigation zusammenfassen – das erfordert eine Änderung an `site.js`.
- **Bildungsgang-Trennung** (Fach → Bildungsgang → Themenbereich → Thema) war
  für GGK angedacht, ist aber nicht umgesetzt; `site.js` unterstützt sie nicht.
  Eine spätere Einführung ändert die Adressen bestehender GGK-Themen und damit
  ausgegebene QR-Codes.
