// Spielstand im Browser (localStorage) mit Fehlerbehandlung.
// Es werden keine personenbezogenen Daten erhoben; alles bleibt auf dem Gerät.
const schluessel = (n) => `capitalism-chronicles-kapitel-${n}-v1`;
let SCHLUESSEL = schluessel(1);
let zusatz = () => ({});   // zusätzliche Felder des Kapitels

// Legt fest, welches Kapitel gespeichert wird. Muss vor dem ersten Laden aufgerufen werden.
export function setzeKapitel(n, felder = null) { SCHLUESSEL = schluessel(n); zusatz = felder || (() => ({})); }

// Liest den Stand eines anderen Kapitels, ohne ihn zu verändern (z. B. die Zeitkapsel aus Kapitel I).
export function leseStandVon(n) {
  try { const d = JSON.parse(window.localStorage.getItem(schluessel(n)) || 'null'); return d && d.v === 1 ? d : null; } catch (e) { return null; }
}
let ersatz = null; // falls localStorage gesperrt ist, hält der Stand nur bis zum Schließen der Seite

export function ladeStand() {
  try {
    const roh = window.localStorage.getItem(SCHLUESSEL);
    if (!roh) return ersatz;
    const d = JSON.parse(roh);
    if (!d || d.v !== 1) return null;
    return { ...neuerStand(), ...d };
  } catch (e) {
    return ersatz;
  }
}

export function speichereStand(stand) {
  ersatz = stand;
  try {
    window.localStorage.setItem(SCHLUESSEL, JSON.stringify(stand));
    return true;
  } catch (e) {
    return false;
  }
}

export function loescheStand() {
  ersatz = null;
  try { window.localStorage.removeItem(SCHLUESSEL); } catch (e) { /* nichts zu tun */ }
}

export function neuerStand() {
  return {
    v: 1,
    ort: { art: 'schiene', s: 0, bereich: null, x: 0, z: 0 },
    schritt: 0,          // Fortschritt in Station 2
    s1: 0, s3: 0, s4: 0, s5: 0,   // Fortschritt der übrigen Stationen
    zeitkapsel: null,    // Tipps zu Marx' Prognosen
    tagebuch: [],        // freigeschaltete Einträge
    belege: [],          // Inventar
    funde: [],           // gesicherte Funde (Stationsnummern)
    notizen: {},         // eigene Antworten der Spielenden
    gesehen: {},         // einmalige Hinweise und Szenen
    qualitaet: null,
    ...zusatz(),
  };
}
