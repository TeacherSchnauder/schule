# Wissenslauf: Kaufvertragsstörungen

Fach: Rechtslehre · Bildungsgang: Berufsschule, Verwaltungsfachangestellte ·
Inhalt: Lieferverzug, Zahlungsverzug mit Verzugszinsen, Annahmeverzug ·
5 Levels, 48 Fragen · Stand: 12.11.2026

| Datei         | Inhalt                                                               |
|---------------|----------------------------------------------------------------------|
| `index.html`  | Lehrseite: Einordnung, Hinweise für die Lehrkraft, Vorschau des Spiels |
| `spiel.html`  | Lernspiel als eigenständige Seite (für QR-Code und Classroom)        |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/rechtslehre/vertragsrecht/kaufvertragsstoerungen/spiel.html
```

## Pflegehinweise

- Die Fragen stehen in `spiel.html` in der Konstante `SAMPLE` im Editor-Format
  (`#` Level | Startzeit, `?` Frage, `+` richtig, `-` falsch, `!` Erklärung).
  Backticks (`` ` ``) und `${` dürfen in den Fragen nicht vorkommen.
- Neue Fragen erstellt der Claude-Skill „wissenslauf-quiz-autor“. Für ein
  anderes Thema `spiel.html` kopieren, `SAMPLE` ersetzen und die drei
  Speicherschlüssel umbenennen (siehe unten).
- Die Seite lädt nichts von fremden Servern; die Schriften Baloo 2 und Nunito
  (SIL Open Font License 1.1) sind eingebettet.
- Gespeichert wird nur im Browser des Geräts (`localStorage`), mit eigenen
  Schlüsseln für dieses Set: `wl_q_v3_rl_kv` (Fragen aus dem Editor),
  `wl_best_v3_rl_kv` (Bestwerte), `wl_log_v1_rl_kv` (Lernkompass). Alle Seiten
  unter `teacherschnauder.github.io` teilen sich den Browserspeicher; ohne
  eigene Schlüssel würden sich Sets gegenseitig überschreiben.
- Wer im Editor eigene Fragen gespeichert hat, sieht diese statt neuer
  Fassungen von `SAMPLE`. Zurück: „Fragen bearbeiten“ → „Beispielfragen“ → „Speichern“.

## Einträge in `data/inhalte.js`

Unter `bereiche`:

```js
{ id: "recht-vertragsrecht", fach: "rechtslehre", name: "Vertragsrecht",
  ordner: "rechtslehre/vertragsrecht", status: "aktiv",
  kurz: "Zustandekommen von Verträgen, Pflichten aus dem Kaufvertrag und Störungen bei der Erfüllung." },
```

Unter `themen`:

```js
{
  id: "wissenslauf-kaufvertragsstoerungen",
  name: "Wissenslauf: Kaufvertragsstörungen",
  bereich: "recht-vertragsrecht",
  pfad: "rechtslehre/vertragsrecht/kaufvertragsstoerungen",
  status: "aktiv",
  kurz: "…",
  faecher: ["rechtslehre", "pruefungsvorbereitung"],
  material: ["Jump-and-run-Lernspiel", "5 Levels", "Lernkompass"]
},
```
