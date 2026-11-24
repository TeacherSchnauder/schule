# Wissenslauf zur Klassenarbeit 2: Lager, Kosten, Märkte

Fach: VBL (Prüfungsvorbereitung) · Bildungsgang: Wirtschaftsgymnasium, Jahrgangsstufe 1 · Klassenarbeit 2 ·
Inhalt: Optimale Bestellmenge und Bestellverfahren (BPE 6.2), Lagersysteme und
Lagerkennzahlen (BPE 6.3), Kostenverläufe und Break-even (BPE 7.1),
Preiselastizität der Nachfrage (BPE 15.2), Angebot (BPE 15.3) ·
5 Levels und Endboss, 56 Fragen · Stand: 24.11.2026

| Datei         | Inhalt                                                               |
|---------------|----------------------------------------------------------------------|
| `index.html`  | Lehrseite: Einordnung, Hinweise für die Lehrkraft, Vorschau des Spiels |
| `spiel.html`  | Lernspiel als eigenständige Seite (für QR-Code und Classroom)        |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/pruefungsvorbereitung/vbl-j1/wissenslauf-klassenarbeit-2/spiel.html
```

## Pflegehinweise

- Die Fragen stehen in `spiel.html` in der Konstante `SAMPLE` im Editor-Format
  (`#` Level | Startzeit, `?` Frage, `+` richtig, `-` falsch, `!` Erklärung).
  Backticks (`` ` ``) und `${` dürfen in den Fragen nicht vorkommen.
- Neue Fragen erstellt der Claude-Skill „wissenslauf-quiz-autor“.
- Die Seite lädt nichts von fremden Servern; die Schriften sind eingebettet.
- **Schülerversion ohne Editor:** Das Spiel verwendet immer die Fragen aus
  `SAMPLE` (`let QTEXT = SAMPLE;`). Fragen ändert nur die Lehrkraft, indem sie
  `spiel.html` neu hochlädt.
- Gespeichert wird nur im Browser des Geräts (`localStorage`), mit eigenen
  Schlüsseln für dieses Set: `wl_best_v3_vbwl_j1` (Bestwerte) und
  `wl_log_v1_vbwl_j1` (Lernkompass); `wl_q_v3_vbwl_j1` ist für die Fragen
  reserviert, wird in der Schülerversion aber nicht gelesen.
- 20 Sterne = 1 Leben, höchstens 5 Leben.
- Nur Übungsfragen: Das Repository ist öffentlich.

## Einträge in `data/inhalte.js`

Unter `bereiche`: `pruefung-vbl-j1` (Fach `pruefungsvorbereitung`, Ordner
`pruefungsvorbereitung/vbl-j1`). Unter `themen`: `wissenslauf-vbl-j1-ka2`,
Fächer `pruefungsvorbereitung`, `bwl`, `vwl`.
