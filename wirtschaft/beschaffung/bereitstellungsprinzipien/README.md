# Bereitstellungsprinzipien

Inhaltsseite im Themenbereich Beschaffung
(Bildungsplan Wirtschaftsgymnasium VBWL, J1, BPE 6: Bereitstellungsprinzipien
Just-in-time / Just-in-sequence, externes Kanban, Delivery on demand,
Vorratsbeschaffung; Anschluss an die ABC/XYZ-Analyse).

| Datei        | Inhalt |
|--------------|--------|
| `index.html` | Lehrseite: Zielkonflikt, Materialfluss-Grafik der vier Prinzipien, Überblickstabelle (Auslöser, Voraussetzungen), Begriffsebenen, eingebetteter Lernpfad, Einsatzhinweise, Merkkasten. Keine Lösungen der Fallaufgaben. |
| `spiel.html` | Lernpfad in vier Stufen am Fall BüroMax GmbH, eigenständige Seite ohne Abhängigkeiten |

## Adresse (für QR-Code und Google Classroom)

```
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/bereitstellungsprinzipien/spiel.html
```

`spiel.html` wird in `index.html` per `<iframe>` eingebettet und meldet seine Höhe
per `postMessage` (`typ: "rechner-hoehe"`), wie bei den Lagerkennzahlen.

## Der Lernpfad

Grundlage ist das Arbeitsblatt „5. Bereitstellungsprinzipien“ (BPE 6, Kap. A):
Ausgangssituation, Anlage 1 (fünf Gütergruppen), Anlage 2 (Voraussetzungen),
Anlage 3 (Vor- und Nachteile), Anlage 4 (Links), Zusatzaufgabe und Abschlussfrage.

| Stufe | Inhalt | frei ab |
|-------|--------|---------|
| 1 Entscheiden | Gut in die ABC/XYZ-Matrix einordnen, Prinzip wählen, begründen; Auswertung mit Voraussetzungs-Check für alle vier Prinzipien, Musterbegründung zum Abhaken, Ergebnisübersicht zum Kopieren | sofort |
| 2 Labor | Wertanteil, Verbrauch, Lieferant, Lieferzeit, Bestellanbindung einstellen; vier Kipp-Aufträge | 3 geprüfte Fälle |
| 3 Vor- und Nachteile | eigene Sammlung, dann Musterlösung aufdecken und abhaken; Links aus Anlage 4 | 2 bearbeitete Kipp-Aufträge |
| 4 Abschluss | Zusatzaufgabe Vorratsplanung, Abschlussfrage, Learningsnack | 2 aufgedeckte Prinzipien |

**Tipps:** An jeder Schreibstelle bis zu drei gestufte Tipps. Nach zwei Tipps
lässt sich auch ohne eigenen Text prüfen bzw. aufdecken. Ein Fall zählt als
geprüft, auch wenn die Wahl nicht passte.

**Lehrkraft-Zugang:** unten im Lernpfad; gleiches Kennwort wie im Lernpfad
Lagerkennzahlen (gespeichert ist nur der SHA-256-Hash, Schlüssel
`bereitstellungsprinzipien-lehrkraft`). Öffnet alle Stufen.

**Speicher:** `localStorage`, Schlüssel `bp6-bereitstellung-v1`, nur auf dem
jeweiligen Gerät. Es werden keine Daten übertragen.

## Entscheidungsmodell (Funktion `bewerte` im ersten Skriptblock)

Jedes Prinzip hat Muss-Kriterien (verletzt → „nicht geeignet“) und Hinweise
(verletzt → „eingeschränkt“). Empfohlen wird ein geeignetes vor einem
eingeschränkten Prinzip, danach entscheidet eine interne Punktzahl. Liegen die
beiden besten Prinzipien höchstens 1 Punkt auseinander: „Grenzfall“. Sind alle
nicht geeignet: Zielkonflikt.

| Prinzip | Muss-Kriterien |
|---------|----------------|
| JIT / JIS | Bedarf X oder Y; Lieferant sichert Qualität und Pünktlichkeit zu |
| Kanban | Lieferant sichert zu; Lieferzeit kurz; Bestellanbindung digital (nur „möglich“ = eingeschränkt) |
| Delivery on demand | Lieferant sichert zu; Lieferzeit kurz |
| Vorrat | Wertanteil nicht A |

Geprüft: Alle fünf Gütergruppen ergeben die Musterlösung des Arbeitsblatts
(Mahagoni JIT, Teak JIT, Hirschleder DoD, Büffelleder Kanban als Grenzfall zu DoD,
Drehstuhlrollen Vorrat).

Annahmen zu Anlage 1: Lieferzeit bei Mahagoni und Teak als „kurz“ gewertet
(Schwankungen „mit geringem zeitlichem Vorlauf“ ausgleichbar); bei den
Drehstuhlrollen keine Zusage zu Qualität und Pünktlichkeit („nicht zugesichert“).
Die Seite zeigt diese Annahmen in der Auswertung an.

## Hinweise

- Musterlösungen und Tipps stehen im Quelltext und sind öffentlich – nur
  Übungsmaterial.
- Lehrerfassung mit Erwartungshorizont liegt nicht im Repository (lokal).
- Inhalte der Gütergruppen, Tipps und Musterlösungen stehen in den Konstanten
  `GUETER`, `VN`, `KIPP`, `ASPEKTE` und `TIPP_…` im ersten Skriptblock.
