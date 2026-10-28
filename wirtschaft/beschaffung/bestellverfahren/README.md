# Bestellpunkt- und Bestellrhythmusverfahren

Inhaltsseite im Themenbereich Beschaffung
(Bildungsplan Wirtschaftsgymnasium VBWL, J1, BPE 6.2: Bestellpunktverfahren
einschließlich Veränderung des Servicegrads, Bestellrhythmusverfahren).

| Datei            | Inhalt |
|------------------|--------|
| `index.html`     | Lehrseite: Begriffe mit Formeln, Bestellpunktverfahren mit Rechenbeispiel und Lagerverlauf, Bestellrhythmusverfahren (feste Liefermenge / Auffüllen), Vergleich bei steigendem Verbrauch, Vergleichstabelle, Sicherheitsbestand und Servicegrad, eingebetteter Simulator, Merkkasten |
| `simulator.html` | Lagerbestandssimulator mit Prüfmodus und Modus „Erkunden“, eigenständige Seite ohne Abhängigkeiten |

Die Rechenbeispiele der Lehrseite (150 Stück/Tag, 5 Tage Lieferzeit, 4 Sicherheitstage,
2.400 Stück Bestellmenge) weichen bewusst von der Abitur-Übungsaufgabe ab.

## Adressen

```
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/bestellverfahren/simulator.html?modus=pruefen
https://teacherschnauder.github.io/schule/wirtschaft/beschaffung/bestellverfahren/simulator.html?modus=erkunden
```

Mit `&aufgabe=1001` (1000–9999) öffnet der Prüfmodus eine bestimmte Aufgabe.

## Prüfmodus

1. Bestellpunktverfahren berechnen: Sicherheits-, Melde-, Höchstbestand, Bestellintervall,
   Zeit von der Lieferung bis zum Meldebestand (Formeln wie im Erwartungshorizont der Abituraufgabe).
2. Verbrauch steigt dauerhaft: Werte neu berechnen (Sicherheitsbestand in Tagen → steigt mit),
   Zeitabstand zwischen zwei Bestellungen.
3. Lagerverlauf deuten: Sicherheits-, Melde-, Höchstbestand als Linien einzeichnen und
   Bestellzeitpunkte markieren (Hinweis, wenn der Liefertag statt des Bestelltags markiert wird).
4. Lagerverlauf ablesen (wie Arbeitsauftrag 3 des Arbeitsblatts): neun Größen aus einer Grafik.
5. Bestellrhythmusverfahren berechnen und mit dem Bestellpunktverfahren vergleichen:
   Liefermenge, Höchstbestand, Bestelltag, Bestand vor der Lieferung bei unerwartetem Mehrverbrauch.
6. Verfahren unterscheiden: vier simulierte Verläufe zuordnen (einer bei konstantem Verbrauch
   → nicht unterscheidbar), sechs Aussagen zuordnen, eine Frage zu Sicherheitsbestand und Servicegrad.

Rückmeldung je Feld: richtig, Folgefehler, falsch, mit gezielten Hinweisen zu typischen Fehlern.
Die Lösungen werden im Browser berechnet; der Prüfmodus ist eine Übungshilfe, kein Prüfungswerkzeug.

## Modus „Erkunden“

Beide Verfahren laufen mit demselben tatsächlichen Verbrauch nebeneinander. Fünf Szenarien
mit Beobachtungsaufträgen (konstant, dauerhafte Steigerung, Nachfragespitze, starke
Schwankung, verspätete Lieferung), Abspielen Tag für Tag, Kennzahlen (Ø Bestand,
Fehlmenge, Servicegrad mengen- und tagesbezogen), Protokoll der Bestellungen.

Modell: kontinuierliche Zeit innerhalb eines Tages; das Bestellpunktverfahren bestellt genau
beim Erreichen des Meldebestands (Prüfung auf Lagerbestand + offene Bestellungen), das
Bestellrhythmusverfahren zu Tagesbeginn an festen Tagen; Fehlmengen werden nicht nachgeliefert.
