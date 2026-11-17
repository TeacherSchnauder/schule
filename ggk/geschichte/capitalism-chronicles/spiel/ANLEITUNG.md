# The Capitalism Chronicles – Kapitel I, II und III

## Starten

Das Spiel läuft nur über einen Webserver (z. B. GitHub Pages), nicht per Doppelklick auf `index.html`.
Zum lokalen Testen genügt im Projektordner: `python3 -m http.server` und dann `http://localhost:8000` im Browser.

## Adresse auf der Lernplattform
Das Spiel liegt im Repository `TeacherSchnauder/schule` unter `ggk/geschichte/capitalism-chronicles/spiel/`:
- Kapitel I: https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/
- Kapitel II: https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-2.html
- Kapitel III: https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-3.html
- Beamer-Ansicht Tribunal: https://teacherschnauder.github.io/schule/ggk/geschichte/capitalism-chronicles/spiel/kapitel-3.html?beamer

## Aufbau

- `engine/` – Spielkern (Straße, Figuren, Kamera, Steuerung, Speicherung)
- `ui/` – Oberfläche (Titel, Dialog, Rätsel, Tagebuch, Stadtplan) und Gestaltung
- `chapters/kapitel-1/` – Welt (Außenwelt, Spinnsaal, Kontor, Keller, Feld), Stationen I bis V und alle Texte
  - `inhalte.json` – Tagebuch, Belege, Aufgaben, Rückmeldungen, Hinweise
  - `dialoge.json` – alle Gespräche
- `lib/three/` – three.js r170 (fest versioniert)
- `assets/` – Schriften, Titelbilder und Musik (`assets/musik/`)
- `engine/musik.js` – Musiksteuerung (Einstieg, Raummusik mit Wechsel und Pausen, An/Aus, Lautstärke)

Texte lassen sich in den beiden JSON-Dateien ändern, ohne den Programmcode anzufassen.
Achtung: JSON ist streng – ein fehlendes Komma oder Anführungszeichen verhindert den Start.

## Für die Lehrkraft

- Einstellungen (Zahnrad) → „Station I“ bis „Station V“ springt direkt zu einer Station. Funde und Belege der Stationen davor werden dabei freigeschaltet.
- Einstellungen → „Spielstand zurücksetzen“ löscht den Stand auf diesem Gerät.
- Tagebuch → „Notizen kopieren“ gibt Funde, Belege, Begriffe, die eigenen Notizen und die Tipps der Zeitkapsel als Text aus.
- Die Lösungen stehen im separaten Lehrerheft. Es gehört nicht in das öffentliche Repository.
- Der Spielstand liegt nur im Browser des Geräts (localStorage). Im privaten Modus oder nach dem Löschen der Browserdaten ist er weg.
- **Musik:** beim ersten Start **aus**. Einschalten über „Musik aus/an“ unter den Knöpfen des Titelbildschirms, über das Notensymbol oben rechts im Spiel oder in den Einstellungen (dort auch die Lautstärke). Die Wahl gilt auf dem Gerät für alle Kapitel. Jedes Kapitel hat eine Einstiegsmusik; danach wechselt die Musik je Raum (zwei Stücke je Raum, dazwischen 20–40 Sekunden Stille) und wird leiser, solange ein Dialog oder Fenster offen ist. Welche Stücke in welchem Raum laufen, steht in `inhalte.json` unter `musik`.
- **Beamer-Ansicht (Kapitel III):** kurzer Gong beim Wechsel zur nächsten Phase und am Ende der Redezeit; abschaltbar über den Knopf „Gong“ oben rechts.

## Stand

Enthalten: Titelbildschirm und alle fünf Stationen mit Streitgespräch und Zeitkapsel.
Seit 17.11.2026 mit Musik (abschaltbar, zu Beginn aus). Das Öffnen der Zeitkapsel folgt in Kapitel II.

---

# Kapitel II – Die Verteidigung: Gewachsen oder gebaut? (Grundspiel)

## Starten
- `kapitel-2.html` öffnen oder auf dem Titelbildschirm von Kapitel I unten „Zu Kapitel II“ wählen. Die Wahl gilt für den Browser-Tab.
- Beide Kapitel nutzen dieselbe Engine (`engine/`, `ui/`). Die Spielstände sind getrennt; Kapitel II liest aus dem Stand von Kapitel I nur die Zeitkapsel.

## Aufbau
- `chapters/kapitel-2/kapitel.js`: Orte, Ablauf, Lehrkraft-Funktionen.
- `hoersaal.js`, `welt-a.js` (Lancashire 1863, um 1910, um 1930), `wohnung.js`, `welt-b.js` (Frankfurt März, Juni, November 1948), `buero.js`, `figuren.js`, `umgebung.js`: Szenen und Figuren.
- `stationen/teil-a.js` (A0–A3, Zwischenhalt), `teil-b.js` (B1–B5), `epilog.js`, `kapsel.js`.
- Bausteine in `ui/`: `simulation.js`, `zeitreise.js`, `haushaltsbuch.js`, `zitatplatz.js`.

## Inhalte ändern, ohne zu programmieren
| Datei | Inhalt |
| --- | --- |
| `inhalte.json` | Kapiteltitel, Codewort (`kapitel.codewort`), B5 an/aus (`kapitel.b5Aktiv`), Personen und Namen, Ziele, Tagebuch, Belege, Denkpausen, Bilanz, Haushaltsbuch |
| `dialoge.json` | alle Gespräche |
| `simulationen.json` | alle Modelle mit ihren Modellzahlen und den Karten „Was historisch geschah“ |
| `zitate-plumpe.json` | Zitatplätze P1–P8: `status` ist `paraphrase`, `zitat` (dann `zitat` und `seite` füllen, höchstens zwei Sätze) oder `fehlt` |

Haushaltsbuch: Solange bei einer Seite `"werte": null` steht, zeigt das Spiel „Werte folgen“. Mit `"werte": { "lohn": …, "stunden": …, "miete": …, "korb": … }` erscheinen die Zahlen, das Diagramm und für 1910 die Rechenaufgabe.

## Für die Lehrkraft
- Codewort für die Zeitkapsel: `KALTESHERZ` (Groß- und Kleinschreibung egal).
- Einstellungen → „Für die Lehrkraft“: Sprung zu jeder Station; Schalter „Station B5 (Kartellfall) spielen“.
- Fehlt auf einem Gerät der Spielstand von Kapitel I, fügen die Schüler ihren kopierten Notizentext ein oder geben ihre Tipps neu ein.
- Am Ende: „Notizen kopieren“ für das Tribunal (Kapitel III).

## Stand des Grundspiels
- Alle Stationen sind spielbar. Alle Zahlen der Simulationen sind vorläufige Modellzahlen und im Spiel gekennzeichnet.
- Plumpe erscheint nur als gekennzeichnete Paraphrase. Das Haushaltsbuch hat noch keine Zahlen.
- Angaben mit dem Hinweis „Sekundärquelle“ werden in der Inhaltsrunde geprüft.
- Abweichungen von der Bauvorlage: Die Whitlows stehen am Fabriktor (kein eigener Kontor-Raum). Die Stationen liegen in drei Dateien statt in zehn. Die Abstimmung im Wirtschaftsrat erscheint als Karte.

# Kapitel III – Das Tribunal (Grundspiel)

## Starten
- `kapitel-3.html` öffnen oder auf dem Titelbildschirm eines anderen Kapitels „Zu Kapitel III“ wählen.
- Beamer-Ansicht für die Lehrkraft: `kapitel-3.html?beamer` (auch über den Titelknopf „Beamer-Ansicht (Lehrkraft)“ oder das Zahnrad im Spiel). Sie läuft ohne 3D und braucht keine Verbindung zu den Schülergeräten.

## Ablauf (66 Minuten, Kurzfassung 45)
1. Einstieg (5 Min.): Meinungslinie im Raum; im Spiel T0: Rolle wählen, Akte anlegen.
2. Vorbereitung im Spiel (28 Min.): T1 Asservatenkammer (4) · T2 Die Kette mit Zentrale und Statistikwand (13) · T3 Zeugenzimmer (5) · T4 Werkbank (4) · T5 Gegenseite (2).
3. Tribunal (25 Min.) und Urteil (8 Min.) mit der Beamer-Ansicht. Die Gruppen lesen von ihrer „Karte zum Vorlesen“ (Akte oben rechts).
- Kurzfassung: Schalter im Zahnrad. T1 und T3 entfallen; Beweisstücke und je zwei Zeugenaussagen liegen dann automatisch in der Akte.

## Rollen
Anklage, Verteidigung, Sachverständige, Jury. Alle Geräte einer Gruppe wählen dieselbe Rolle. Die Rolle eines Geräts ändert die Lehrkraft im Zahnrad.

## Akte und Import
- Auf demselben Gerät liest Kapitel III die Spielstände von Kapitel I und II automatisch (nur lesend).
- Auf einem anderen Gerät: In Kapitel I oder II „Notizen kopieren“, in Kapitel III beim Anlegen der Akte einfügen. Beide Texte nacheinander gehen.
- Ohne beides ist das Kapitel vollständig spielbar (feste Beweisstücke).

## Inhalte ändern, ohne zu programmieren
- `chapters/kapitel-3/gegenwart.json`: alle Gegenwartszahlen mit Quelle und Stand. `"wert": null` erscheint als „Werte folgen“.
- `chapters/kapitel-3/statistiken.json`: Statistikwand. Neue Statistik = neuer Eintrag; Werte als `[Jahr, Wert]`; `achse` legt die senkrechte Achse fest.
- `chapters/kapitel-3/dialoge.json`: Zeugen mit Fragen und Antworten (je Zeuge genau eine `"unbequem": true`).
- `chapters/kapitel-3/inhalte.json`: Rollen, Beweisstücke, Kette, Vermögensfrage, Kriterien, Urteilsformen.
- `chapters/kapitel-3/zitate.json`: Gegenstimmen der Gegenwart (nur Paraphrase mit Quelle).

## Für die Lehrkraft
- Zahnrad: Sprünge zu T0–T5, „Rolle dieses Geräts ändern“, „Beamer-Ansicht öffnen“, Kurzfassung, Spielstand zurücksetzen.
- Beamer-Ansicht: „Ergebnis kopieren“ sichert Meinungslinie, Zeitkapsel-Tipps, Urteil und Tafelbild als Text; „Neue Klasse“ leert alle Eingaben.
- Lösungen und Erwartungshorizonte stehen im Lehrerheft (nicht in diesem Ordner).

## Stand des Grundspiels
Alle Stationen, Rollen, die Kurzfassung und die Beamer-Ansicht sind gebaut und automatisch getestet. Offen für die Inhaltsrunde: Preisanteile entlang der Kette, Gini-Zeitreihen (Einkommen, Bangladesch, Welt), Wechselkurs und Börsenwert, Prüfung der Paraphrasen am Original, Stand der Lieferkettengesetze.
