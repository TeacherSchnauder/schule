# schule – Lernplattform

Unterrichtsmaterial für Wirtschaft und Recht, veröffentlicht über GitHub Pages.

**Adresse:** https://matthiasschnauder.github.io/schule/

Statische Website ohne Build-System: HTML5, CSS3, Vanilla JavaScript. Keine
externen Abhängigkeiten, keine Schriften oder Skripte von fremden Servern. Die
Seiten funktionieren deshalb auch, wenn man die Dateien lokal im Browser öffnet.

---

## Aufbau

```
schule/
├── index.html                  Startseite mit allen Fächern
├── 404.html                    Fehlerseite
├── .nojekyll                   schaltet die Jekyll-Verarbeitung ab
├── README.md
│
├── assets/
│   ├── css/site.css            gemeinsames Stylesheet
│   └── js/site.js              Navigation, Breadcrumbs, Kacheln
│
├── data/
│   └── inhalte.js              ⚑ zentrale Inhaltsübersicht
│
├── wirtschaft/                 Fach mit eigenen Inhaltsseiten
│   ├── index.html
│   └── beschaffung/
│       ├── index.html
│       └── cross-docking/
│           ├── index.html      Lehrseite
│           ├── rechner.html    interaktiver Rechner (eigene Adresse)
│           ├── assets/         Bilder und Downloads zu diesem Thema
│           └── README.md
│
├── awl/  bwl/  vwl/  rechtslehre/
├── lernfelder/  pruefungsvorbereitung/  methodenkoffer/
```

### Fächer mit Inhalt und Fächer als Verweis

Inhaltsseiten liegen **genau einmal** im fachsystematischen Baum, derzeit unter
`wirtschaft/`. Die übrigen Fachordner (`awl/`, `bwl/`, `vwl/`, …) enthalten
keine Kopien, sondern Übersichtsseiten, die auf dieselben Themen verweisen.

Cross-Docking wird dadurch unter Wirtschaft, BWL und AWL angezeigt, existiert
aber nur an einer Stelle und muss nur einmal gepflegt werden. Welche Fächer ein
Thema anzeigen, steht im Feld `faecher` des Themeneintrags.

---

## Ein neues Thema anlegen

1. **Ordner anlegen**, zum Beispiel `wirtschaft/beschaffung/abc-analyse/`.
2. **`index.html`** aus `wirtschaft/beschaffung/cross-docking/` kopieren und
   inhaltlich anpassen. Am Ende der Datei die Anmeldung korrigieren:
   ```html
   <script>Schule.seite({ tiefe: 3, typ: "thema", id: "abc-analyse" });</script>
   ```
   `tiefe` ist die Anzahl der Ordnerebenen unter der Wurzel. Alle Verweise auf
   `assets/` und `data/` werden mit genauso vielen `../` davor geschrieben.
3. **`data/inhalte.js`** öffnen und den Eintrag unter `themen` ergänzen
   beziehungsweise von `status: "geplant"` auf `status: "aktiv"` setzen:
   ```js
   { id: "abc-analyse", name: "ABC-Analyse", bereich: "beschaffung",
     pfad: "wirtschaft/beschaffung/abc-analyse", status: "aktiv",
     kurz: "Einteilung der Güter nach ihrem Wertanteil am Gesamtverbrauch.",
     faecher: ["wirtschaft", "bwl", "awl"],
     material: ["Arbeitsblatt"] }
   ```

Danach erscheint das Thema automatisch in der Navigation, in der Übersicht des
Themenbereichs, auf den zugeordneten Fachseiten und erhält Breadcrumbs. Es sind
keine weiteren Dateien zu ändern.

Ein neuer **Themenbereich** wird genauso unter `bereiche` eingetragen, ein neues
**Fach** unter `faecher`.

### status

| Wert        | Wirkung                                                      |
|-------------|--------------------------------------------------------------|
| `"aktiv"`   | Kachel ist verlinkt                                           |
| `"geplant"` | Kachel erscheint grau und ohne Link – kein toter Verweis      |

---

## Veröffentlichen

GitHub Pages wird unter *Settings → Pages* aktiviert:
Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)**.

Nach ein bis zwei Minuten ist die Seite unter der oben genannten Adresse
erreichbar. Jeder weitere Commit auf `main` wird automatisch veröffentlicht.

`.nojekyll` verhindert, dass GitHub die Dateien durch Jekyll verarbeitet; das
beschleunigt die Veröffentlichung und schützt Ordner, deren Name mit einem
Unterstrich beginnt.

---

## Hinweise zur Pflege

- **Relative Pfade**: Alle internen Verweise sind relativ. Wird das Repository
  umbenannt oder auf eine eigene Domain umgezogen, funktionieren die Seiten
  ohne Änderung weiter. Einzige Ausnahme ist `404.html`, die absolute Pfade mit
  `/schule/` verwendet – bei einer Umbenennung ist dort anzupassen.
- **Datenschutz**: Die Seiten laden nichts von fremden Servern nach und setzen
  keine Cookies. Es werden keine Nutzungsdaten erhoben.
- **Urheberrecht**: Vor dem Einstellen fremder Materialien (Schulbuchauszüge,
  Grafiken, Fotos) die Rechtslage prüfen. Das Repository ist öffentlich.
