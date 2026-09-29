# Cross-Docking

Inhaltsseite zum Thema Cross-Docking im Themenbereich Beschaffung.

| Datei          | Inhalt                                                          |
|----------------|-----------------------------------------------------------------|
| `index.html`   | Lehrseite: Einführung, Ablaufgrafik, Vorteile, Nachteile, eingebetteter Rechner, Praxisbeispiele, Merkkasten |
| `rechner.html` | Interaktiver Cross-Docking-Rechner als eigenständige Seite       |
| `assets/`      | Bilder und Downloads zu diesem Thema                             |

## Der Rechner

`rechner.html` ist eine vollständige, eigenständige Seite ohne Abhängigkeiten.
Sie wird in `index.html` über ein `<iframe>` eingebettet und lässt sich
gleichzeitig direkt aufrufen:

```
https://matthiasschnauder.github.io/schule/wirtschaft/beschaffung/cross-docking/rechner.html
```

Diese Adresse eignet sich für den QR-Code auf dem Arbeitsblatt und für die
Verlinkung in Google Classroom: Die Schülerinnen und Schüler sehen dann nur den
Rechner, nicht die Lehrtexte mit den Ergebnissen.

### Modell

Drei Lieferanten, drei Filialen, ein Umschlagpunkt. Verglichen werden:

| Verfahren            | Streckenführung                              | Kommissionierung |
|----------------------|----------------------------------------------|------------------|
| Ohne Cross-Docking   | jeder Lieferant fährt jede Filiale an         | –                |
| Einstufig            | Lieferanten → Umschlagpunkt → Sammeltour      | beim Lieferanten |
| Mehrstufig           | wie einstufig                                 | am Umschlagpunkt |

Einstufiges und mehrstufiges Verfahren unterscheiden sich im Modell **nicht** in
der Strecke, sondern im Ort der Kommissionierung. Sichtbar wird das über den
Regler „Geänderte Bestellpositionen": Beim einstufigen Verfahren erzwingt jede
Änderung eine Nachlieferfahrt, beim mehrstufigen nicht.

### Referenzwerte

Bei unveränderter Grundeinstellung und unverschobenen Standorten:

| | ohne CD | einstufig | mehrstufig |
|---|---:|---:|---:|
| Kilometer | 1.280 | 803 | 803 |
| Anlieferungen | 9 | 3 | 3 |
| Kosten je Tag | 1.760,55 € | 1.449,72 € | 1.458,12 € |
| Kilometer nach Änderung (3 Positionen) | 2.269 | 1.792 | 803 |

### Modellgrenzen

Der Rechner arbeitet mit Luftlinien und einer festen Tourenreihenfolge ohne
Routenoptimierung. Er zeigt die Richtung der Effekte zuverlässig, nicht deren
exakten Betrag. Reale Tourenplanung berücksichtigt Straßenkilometer,
Zeitfenster und Lenkzeiten. Dieser Unterschied steht als Hinweis auf der Seite
und sollte im Unterricht einmal ausdrücklich benannt werden.
