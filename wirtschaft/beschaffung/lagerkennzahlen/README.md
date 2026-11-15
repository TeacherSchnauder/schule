# Lagerkennzahlen

Inhaltsseite zum Thema Lagerkennzahlen im Themenbereich Beschaffung
(Bildungsplan Wirtschaftsgymnasium VBWL, J1, BPE 6.3: durchschnittlicher Lagerbestand,
durchschnittliche Lagerdauer, Umschlagshäufigkeit, Lagerzinsen und Lagerzinssatz).

| Datei          | Inhalt |
|----------------|--------|
| `index.html`   | Lehrseite: Kennzahlen mit Formeln, Rechenbeispiel, Inventurarten, Deutung der Zahlen, Branchenvergleich, Optimierungsmöglichkeiten, eingebetteter Lernpfad, Merkkasten |
| `rechner.html` | Lernpfad in sechs Stufen mit freiem Rechner, eigenständige Seite ohne Abhängigkeiten |

## Der Lernpfad

`rechner.html` wird in `index.html` per `<iframe>` eingebettet und meldet seine Höhe
per `postMessage`. Direkt aufrufbare Adresse (für QR-Code und Google Classroom):

```
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/lagerkennzahlen/rechner.html
```

Jede Stufe wird erst nach Bestehen der vorherigen frei. Der Fortschritt wird nur im
Browser des jeweiligen Geräts gespeichert (`localStorage`, Schlüssel
`lagerkennzahlen-lernpfad-v1`); es werden keine Daten übertragen.

| Stufe | Inhalt |
|-------|--------|
| 1 Formeln sicher | Lernkarten, Formel-Baukasten (7 Formeln), Begriffsquiz mit 12 Fragen |
| 2 Rechnen | Zufallsaufgaben: Jahres-, Quartals- und Monatsinventur (Lagerkarte); Hinweise zu typischen Fehlern, Folgefehler werden erkannt |
| 3 Interpretieren | Zahlen in Worte fassen, zehn „Was passiert, wenn …?“-Szenarien mit Wirkungsketten, Regler-Labor |
| 4 Branchenvergleich | vier Fallkarten: rechnen, beurteilen, Ursachen erkennen, Empfehlung schreiben und mit dem Erwartungshorizont abgleichen |
| 5 Lager optimieren | Planspiel über vier Quartale mit Maßnahmen und Zufallsereignissen; Szenario-Nummer, damit die Klasse dasselbe Jahr spielen kann |
| 6 Abi-Aufgabe | Aufgabe mit 24 BE, Rechenteile automatisch bewertet, Vertiefung zur Lagerzinsformel |

Nach Stufe 2 wird der freie Rechner freigeschaltet.

**Lehrkraft-Zugang:** Auf der Startseite des Lernpfads schaltet ein Kennwort alle Stufen frei.
Im Quelltext steht nur der SHA-256-Wert. Das ist kein Schutz gegen gezieltes Ausprobieren,
sondern verhindert nur, dass die Stufen versehentlich übersprungen werden.

## Hinweise zu den Inhalten

- Die Lagerzinsen werden nach der im Unterricht eingeführten Formel
  (Ø Lagerbestand · Lagerzinssatz ÷ 100) berechnet. In Stufe 6 gibt es dazu eine
  freiwillige Vertiefung (Jahresbetrachtung).
- Die Branchenwerte der Fallkarten 2 bis 4 und alle Werte des Planspiels sind fiktiv und im
  Werkzeug entsprechend gekennzeichnet.
- Die Erwartungshorizonte der Freitext-Teile sind Selbstkontrolle (Häkchen setzen), keine
  automatische Bewertung.
