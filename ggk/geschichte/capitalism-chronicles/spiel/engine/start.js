// Einstieg: lädt Schriften und Daten, baut Kapitel I und zeigt den Titelbildschirm.
import { Spiel } from './spiel.js';
import { loescheStand, neuerStand, setzeKapitel } from './speicher.js';
import { Oberflaeche, warte } from '../ui/oberflaeche.js';
import { musik } from './musik.js';

// Welches Kapitel? Das bestimmt allein die Seite (index.html, kapitel-2.html, kapitel-3.html).
// So öffnet jeder Link verlässlich das Kapitel, auf das er zeigt.
const KAPITEL = [1, 2, 3].includes(Number(document.body.dataset.kapitel)) ? Number(document.body.dataset.kapitel) : 1;
try { window.sessionStorage.removeItem('cc-kapitel'); } catch (e) { /* Rest einer älteren Version entfernen */ }

const canvas = document.getElementById('buehne');
const ui = new Oberflaeche(document.getElementById('ui'), canvas);

function fehler(e) {
  console.error(e);
  const l = document.querySelector('#titel .lade');
  if (l) {
    l.hidden = false;
    l.textContent = 'Das Spiel konnte nicht gestartet werden: ' + (e && e.message ? e.message : e) +
      ' – Bitte die Seite über einen Webserver (z. B. GitHub Pages) öffnen, nicht als lokale Datei.';
  }
}

async function los() {
  // Kapitel III: Die Beamer-Ansicht für das Plenum läuft ohne 3D-Welt.
  if (KAPITEL === 3 && new URLSearchParams(window.location.search).has('beamer')) {
    const { starteBeamer } = await import('../chapters/kapitel-3/beamer.js');
    canvas.remove(); document.getElementById('ui').remove();
    await starteBeamer(document.body);
    return;
  }
  // Schriften zuerst, weil Schilder in der Welt mit ihnen gezeichnet werden
  try {
    await Promise.race([
      Promise.all([document.fonts.load('20px "Abril Fatface"'), document.fonts.load('20px "Source Serif 4"')]),
      warte(2500),
    ]);
  } catch (e) { /* Ersatzschrift genügt */ }

  const modul = await import(`../chapters/kapitel-${KAPITEL}/kapitel.js`);
  const { ladeDaten, baueKapitel } = modul;
  setzeKapitel(KAPITEL, modul.standZusatz || null);
  const daten = await ladeDaten();
  musik.konfiguriere(daten.musik);
  musik.imTitel = true;
  const spiel = new Spiel(canvas, ui);
  ui.verbinde(spiel, daten);
  await warte(30);   // einen Moment für die Anzeige des Ladehinweises
  const kapitel = baueKapitel(spiel, ui, daten);
  spiel.setzeWelt(kapitel.welt);
  kapitel.bereite();
  spiel.zustand = 'titel';
  spiel.setzeTitelKamera();
  canvas.classList.add('sepia');
  spiel.start();
  window.__spiel = spiel;        // für Tests und Fehlersuche
  window.__kapitel = kapitel;
  await warte(200);

  const wahl = await ui.zeigeTitel(spiel.hatStand, KAPITEL);
  musik.imTitel = false;
  if (wahl === 'neu' && spiel.hatStand) {
    loescheStand();
    const q = spiel.stand.qualitaet;
    spiel.stand = neuerStand();
    spiel.stand.qualitaet = q;
    ui.setzeSiegel();
  }
  await kapitel.beginne(wahl);
}

los().catch(fehler);
