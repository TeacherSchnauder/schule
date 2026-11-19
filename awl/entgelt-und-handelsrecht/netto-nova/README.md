# Netto Nova: Gehaltsabrechnung, Sozialversicherung und HGB

Fach: AWL · Bildungsgang: Berufsschule, Verwaltungsfachangestellte ·
Inhalt: Sozialversicherung, Altersvorsorge, Gehaltsabrechnung mit
Beitragsbemessungsgrenzen, Kaufmann, Firma, Vollmachten, KG ·
3 Sektoren mit 35 Fragen, Endboss mit 7 Fragen · Stand: 18.11.2026

| Datei         | Inhalt                                                                  |
|---------------|-------------------------------------------------------------------------|
| `index.html`  | Lehrseite: Einordnung, Hinweise für die Lehrkraft, Vorschau des Spiels  |
| `spiel.html`  | Lernspiel als eigenständige Seite (für QR-Code und Classroom)           |

Adresse für die Klasse:

```
https://teacherschnauder.github.io/schule/awl/entgelt-und-handelsrecht/netto-nova/spiel.html
```

## Spielregeln (Konstanten in `spiel.html`)

- `BOSS_SHARE = 2/3`: Den Endboss erreicht, wer mindestens zwei Drittel der
  Sektorfragen richtig beantwortet hat (derzeit 24 von 35).
- `BOSS_HP = 5`: So viele richtige Antworten braucht es gegen den Endboss.
- `POWER_EVERY = 4`: Jede vierte richtige Antwort bringt Schild, Joker oder
  Zeitdehner.
- Zeit je Frage: höchstens Grundzeit des Sektors oder Lesezeit nach
  Wortzahl, je nachdem, was größer ist; im Ruhigen Modus 50 % mehr.

## Fragenformat

Die Fragen stehen in `spiel.html` in der Konstante `SAMPLE`. Das Format
erweitert das des Wissenslaufs:

```
= Zeile für das Datenblatt (Beitragssätze, Grenzen …)
# Sektor 1 · Name | 35          Sektor mit Grundzeit in Sekunden
# BOSS: Der Abzugs-Koloss | 120  Endboss (genau einer, am Ende)
@ Konzept | Lerncheckliste 4     Thema für den Lernkompass + Verweis
?2 Fragetext                     Ziffer = Anforderungsbereich (1, 2, 3)
+ richtige Antwort
- falsche Antwort ~ typische Verwechslung (für den Lernkompass)
! Erklärung
```

- Backticks (`` ` ``) und `${` dürfen nicht vorkommen.
- Jedes Konzept sollte mindestens zwei Fragen haben, sonst kann der
  Lernkompass nicht zwischen „sicher“ und „geraten“ unterscheiden.
- Gleiche Texte nach `~` werden als dieselbe Fehlvorstellung gezählt.
- Antworten bis etwa 34 Zeichen erscheinen als Tore, längere als Liste.

## Pflegehinweise

- **Werte jährlich prüfen:** Beitragssätze, Beitragsbemessungsgrenzen und
  Zusatzbeitrag stehen in den `=`-Zeilen und in mehreren Rechenaufgaben
  (Herr Kaya, Frau Dorn, Herr Vogt, Frau Lenz). Ändern sich die Werte, müssen
  Datenblatt, Aufgaben, Lösungen und Erklärungen gemeinsam angepasst werden.
- **Schülerversion ohne Editor:** Fragen ändert nur die Lehrkraft, indem sie
  `spiel.html` neu hochlädt. Die neue Fassung gilt sofort für alle.
- Die Seite lädt nichts von fremden Servern; Schriften sind Systemschriften,
  Grafik und Musik werden im Browser erzeugt (eigene Erstellung).
- Gespeichert wird nur im Browser des Geräts (`localStorage`), mit eigenen
  Schlüsseln für dieses Spiel:
  `nn_prog_v1_awl1` (Fortschritt nach jedem Sektor),
  `nn_log_v1_awl1` (letzter Lernkompass),
  `nn_best_v1_awl1` (Punkterekord, Siege),
  `nn_opt_v1_awl1` (Ruhiger Modus, Ton).
  Ein weiteres Set mit diesem Spiel braucht eigene Schlüssel
  (z. B. `_awl2`), sonst vermischen sich die Lernstände.
- Der Lernkompass-Export bittet den KI-Coach, Fragen einzeln im Chat zu
  stellen; das Ende-Bild verlinkt auf den Lerncoach AWL.

## Einträge in `data/inhalte.js`

Unter `bereiche`:

```js
{ id: "awl-entgelt-handelsrecht", fach: "awl", name: "Entgelt, soziale Sicherung und Handelsrecht",
  ordner: "awl/entgelt-und-handelsrecht", status: "aktiv",
  kurz: "Sozialversicherung und Altersvorsorge, Gehaltsabrechnung mit Beitragsbemessungsgrenzen, Kaufmann, Firma, Vollmachten und KG." },
```

Unter `themen`:

```js
{
  id: "netto-nova",
  name: "Netto Nova: Gehalt, Sozialversicherung, HGB",
  bereich: "awl-entgelt-handelsrecht",
  pfad: "awl/entgelt-und-handelsrecht/netto-nova",
  status: "aktiv",
  kurz: "…",
  faecher: ["awl", "pruefungsvorbereitung"],
  material: ["Weltraum-Lernspiel", "Endboss", "Lernkompass"]
},
```
