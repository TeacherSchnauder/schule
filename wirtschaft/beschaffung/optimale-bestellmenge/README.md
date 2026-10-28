# Optimale Bestellmenge

Inhaltsseite zum Thema optimale Bestellmenge im Themenbereich Beschaffung
(Bildungsplan Wirtschaftsgymnasium VBWL, J1, BPE 6.2).

| Datei          | Inhalt                                                          |
|----------------|-----------------------------------------------------------------|
| `index.html`   | Lehrseite: Zielkonflikt, Kostenarten, tabellarisches und grafisches Verfahren mit Beispiel, Formel nach Andler, Mindestbestand, eingebetteter Rechner, Modellgrenzen, Merkkasten |
| `rechner.html` | Rechner mit zwei Modi als eigenständige Seite ohne Abhängigkeiten |

## Der Rechner

`rechner.html` wird in `index.html` über ein `<iframe>` im Modus „Erkunden“
eingebettet. Die eingebettete Seite meldet ihre Höhe per `postMessage`; die
Lehrseite passt den Rahmen daran an. Direkt aufrufbare Adressen (z. B. für
QR-Codes und Google Classroom):

```
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/optimale-bestellmenge/rechner.html?modus=pruefen
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/optimale-bestellmenge/rechner.html?modus=erkunden
```

Mit `&aufgabe=1001` (Grundaufgabe) bzw. `&aufgabe=M1001` (mit Mindestbestand)
öffnet der Prüfmodus eine bestimmte Aufgabe – so bearbeitet die ganze Klasse
dieselben Zahlen. Ohne diesen Zusatz erhält jede Person eine zufällige Aufgabe.

### Prüfmodus

- Aufgabengenerator mit reproduzierbarer Aufgabennummer (1000–9999, Präfix `M`
  für die Variante mit Mindestbestand). Alle Werte sind centgenau, das Minimum der
  Tabelle ist eindeutig und liegt nie in der ersten oder letzten Zeile.
- Schritt 1: Tabelle mit sechs Bestellhäufigkeiten. Rückmeldung je Feld:
  richtig, Folgefehler (mit eigenem falschen Wert der Zeile richtig weitergerechnet), falsch.
- Schritt 2: Optimum aus der Tabelle wählen.
- Schritt 3: grafisches Verfahren. Punkte der drei Kostenarten per Antippen in ein
  Koordinatensystem setzen; Prüfung mit Toleranz (2,5 % der Mengenachse, 3 % der
  Kostenachse) und Folgefehler-Erkennung gegenüber der eigenen Tabelle; Lösungskurven
  einblendbar; Minimum und Schnittpunkt ablesen (±10 %); zwei Fragen zu den Kurven.
- Schritt 4: Formel nach Andler und Bestellhäufigkeit.
- Schritt 5: vier Verständnisfragen aus einem Pool von zehn, mit Begründung.
- Ergebnisübersicht zur Selbstkontrolle. Es wird nichts gespeichert oder übermittelt.

Hinweis: Die Lösungen werden im Browser berechnet. Wer den Quelltext liest,
kann sie ermitteln. Der Prüfmodus ist eine Übungshilfe, kein Prüfungswerkzeug.

### Modus Erkunden

Regler und Zahlenfelder für Jahresbedarf, bestellfixe Kosten, Einstandspreis,
Lagerhaltungskostensatz und Mindestbestand; Kostendiagramm mit Optimum,
„Bestellmenge ausprobieren“, Vergleich mit gemerkter Ausgangslage
(ceteris-paribus-Hinweis bei mehreren Änderungen), Tabellenverfahren und Rechenweg.
