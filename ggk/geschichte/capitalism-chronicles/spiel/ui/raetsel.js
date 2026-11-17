// Rätseloberflächen mit gestuften Hilfen:
// 1. fachlich begründete Rückmeldung auf die falsche Antwort, 2. kleiner Hinweis, 3. gezielte Hilfe,
// der vollständige Lösungsweg erst nach der richtigen Antwort.
import { el, esc } from './oberflaeche.js';

// Liest die Zahl aus einer Eingabe; Einheiten und Zusätze werden ignoriert
// („6 Schilling“, „3 Sh“, „100 %“, „100 Prozent“, „0,6“, „½“, „1/2“, „5 Std.“).
export function leseZahl(text) {
  // Tausenderpunkt und -leerzeichen („1.000“, „10 000“) entfernen, Dezimalkomma in Punkt wandeln
  const t = String(text).replace(/½/g, '0.5').replace(/\b([1-9]\d{0,2})((?:[. ]\d{3})+)(?!\d)/g, (m, a, b) => a + b.replace(/[. ]/g, '')).replace(/,/g, '.');
  const bruch = t.match(/(\d+)\s*\/\s*(\d+)/);
  if (bruch && Number(bruch[2]) !== 0) return Number(bruch[1]) / Number(bruch[2]);
  const m = t.match(/-?\d*\.?\d+/);
  return m ? Number(m[0]) : NaN;
}
export const zahlText = (x) => String(Math.round(x * 100) / 100).replace('.', ',');

// Hinweisknopf, der die Hilfen der Reihe nach aufdeckt.
function hilfeKnopf(hilfen, ziel) {
  let n = 0;
  const b = el('button', 'knopf still');
  const text = () => (b.textContent = n >= hilfen.length ? 'Alle Hinweise gezeigt' : `Hinweis (${n + 1} von ${hilfen.length})`);
  text();
  b.addEventListener('click', () => {
    if (n >= hilfen.length) return;
    ziel.append(el('div', 'rueck hilfe', esc(hilfen[n])));
    n++; text();
    if (n >= hilfen.length) b.disabled = true;
    ziel.lastChild.scrollIntoView({ block: 'nearest' });
  });
  return { knopf: b, zurueck: () => { n = 0; b.disabled = false; text(); ziel.innerHTML = ''; } };
}

// Eine oder mehrere Rechenfragen auf einem Blatt. Ergebnis: true (gelöst) oder false (abgebrochen).
export function rechenblatt(ui, { titel, angaben = [], fragen }) {
  return new Promise((fertig) => {
    const punkte = el('div', 'schritte', fragen.map(() => '<i></i>').join(''));
    const f = ui.fenster({ titel, kopf: fragen.length > 1 ? punkte : null, beiSchliessen: (w) => fertig(w === true) });
    const angabenEl = angaben.length ? el('ul', 'angaben', angaben.map((a) => `<li>${esc(a)}</li>`).join('')) : null;
    const frageEl = el('p', 'auftrag');
    const zeile = el('div', 'eingabe');
    const input = el('input'); input.type = 'text'; input.inputMode = 'decimal'; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Antwort');
    const einheit = el('span');
    const pruefen = el('button', 'knopf', 'Prüfen');
    zeile.append(input, einheit, pruefen);
    const rueck = el('div', 'rueck');
    const hilfenEl = el('div', 'hilfen');
    if (angabenEl) f.inhalt.append(angabenEl);
    f.inhalt.append(frageEl, zeile, rueck, hilfenEl);
    let h = hilfeKnopf([], hilfenEl);
    const links = el('div', 'links');
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    f.fuss.append(links, weiter);

    let i = 0, geloest = false;
    const zeige = () => {
      const fr = fragen[i];
      geloest = false;
      [...punkte.children].forEach((p, k) => { p.className = k < i ? 'fertig' : k === i ? 'jetzt' : ''; });
      frageEl.textContent = fr.frage;
      einheit.textContent = fr.einheit || '';
      input.value = ''; input.disabled = false; pruefen.disabled = false;
      rueck.className = 'rueck'; rueck.textContent = '';
      hilfenEl.innerHTML = '';
      links.innerHTML = '';
      h = hilfeKnopf(fr.hilfen || [], hilfenEl);
      links.append(h.knopf);
      weiter.hidden = true;
      if (!ui.touch) input.focus();
    };
    const pruefe = () => {
      if (geloest) return;
      const fr = fragen[i];
      const x = leseZahl(input.value);
      if (Number.isNaN(x)) { rueck.className = 'rueck falsch'; rueck.textContent = 'Tragt eine Zahl ein, zum Beispiel 4 oder 0,5.'; return; }
      if (Math.abs(x - fr.loesung) < 1e-6) {
        geloest = true;
        rueck.className = 'rueck richtig'; rueck.textContent = 'Richtig. ' + fr.weg;
        input.disabled = true; pruefen.disabled = true; h.knopf.hidden = true;
        hilfenEl.innerHTML = '';
        weiter.hidden = false; weiter.textContent = i < fragen.length - 1 ? 'Nächste Frage' : 'Weiter';
        if (!ui.touch) weiter.focus();
      } else {
        const schluessel = String(Math.round(x * 100) / 100);
        rueck.className = 'rueck falsch';
        rueck.textContent = (fr.fehler && fr.fehler[schluessel]) || fr.sonst || 'Das stimmt noch nicht.';
        input.select?.();
      }
    };
    pruefen.addEventListener('click', pruefe);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pruefe(); } });
    weiter.addEventListener('click', () => {
      if (i < fragen.length - 1) { i++; zeige(); } else f.schliessen(true);
    });
    zeige();
  });
}

// Karten per Antippen einem Feld zuordnen. Ergebnis: true oder false (abgebrochen).
export function zuordnung(ui, def) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', beiSchliessen: (w) => fertig(w === true) });
    f.inhalt.append(el('p', 'auftrag', esc(def.einleitung)));
    const raster = el('div', 'zuordnung');
    const linksSp = el('div', 'spalte'), rechtsSp = el('div', 'spalte');
    raster.append(linksSp, rechtsSp);
    const rueck = el('div', 'rueck');
    const hilfenEl = el('div', 'hilfen');
    f.inhalt.append(rueck, hilfenEl, raster);
    const h = hilfeKnopf(def.hilfen || [], hilfenEl);
    const links = el('div', 'links'); links.append(h.knopf);
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    f.fuss.append(links, weiter);
    weiter.addEventListener('click', () => f.schliessen(true));

    // feste, aber gemischte Reihenfolge der Karten
    const n = def.karten.length;
    const karten = n === 4 ? [def.karten[2], def.karten[0], def.karten[3], def.karten[1]]
      : def.karten.map((k, i) => [k, (i * 7 + 3) % n]).sort((a, c) => a[1] - c[1]).map((x) => x[0]);
    let wahl = null, offen = karten.length;
    const felder = {};
    const markiere = () => {
      [...linksSp.children].forEach((k) => k.classList.toggle('gewaehlt', k.dataset.id === wahl));
      Object.values(felder).forEach((fe) => fe.classList.toggle('bereit', !!wahl && !fe.dataset.voll));
    };
    for (const k of karten) {
      const b = el('button', 'karte', esc(k.text)); b.dataset.id = k.id;
      b.addEventListener('click', () => { wahl = wahl === k.id ? null : k.id; markiere(); });
      linksSp.append(b);
    }
    for (const fd of def.felder) {
      const b = el('button', 'feld', `<b>${esc(fd.titel)}</b><small>${esc(fd.text)}</small>`);
      felder[fd.id] = b;
      b.addEventListener('click', () => {
        if (!wahl || b.dataset.voll) return;
        const k = def.karten.find((x) => x.id === wahl);
        if ((k.ziele || [k.ziel]).includes(fd.id)) {
          if (!def.mehrfach) b.dataset.voll = '1';
          b.append(el('div', 'karte', esc(k.text)));
          linksSp.querySelector(`[data-id="${k.id}"]`).remove();
          rueck.className = 'rueck richtig'; rueck.textContent = k.passt || `${def.passt || 'Passt: '}${fd.titel}.`;
          wahl = null; offen--;
          if (offen === 0) {
            rueck.textContent = (k.passt ? k.passt + ' ' : '') + def.erfolg;
            h.knopf.hidden = true; hilfenEl.innerHTML = '';
            weiter.hidden = false;
          }
        } else {
          rueck.className = 'rueck falsch'; rueck.textContent = (k.falsch && k.falsch[fd.id]) || ('Das passt noch nicht. ' + k.hinweis);
        }
        markiere();
      });
      rechtsSp.append(b);
    }
  });
}

// Auswahlfrage mit begründeter Rückmeldung zu jeder Antwort. Ergebnis: true oder false (abgebrochen).
export function auswahl(ui, def) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, beiSchliessen: (w) => fertig(w === true) });
    f.inhalt.append(el('p', 'auftrag', esc(def.frage)));
    const liste = el('div', 'optionen');
    const rueck = el('div', 'rueck');
    const hilfenEl = el('div', 'hilfen');
    f.inhalt.append(liste, rueck, hilfenEl);
    const h = hilfeKnopf(def.hilfen || [], hilfenEl);
    const links = el('div', 'links'); links.append(h.knopf);
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    f.fuss.append(links, weiter);
    weiter.addEventListener('click', () => f.schliessen(true));
    let fertigGeloest = false;
    for (const o of def.optionen) {
      const b = el('button', 'option', esc(o.text));
      b.addEventListener('click', () => {
        if (fertigGeloest || b.classList.contains('falsch')) return;
        rueck.textContent = o.rueck;
        if (o.richtig) {
          fertigGeloest = true;
          b.classList.add('richtig'); rueck.className = 'rueck richtig';
          h.knopf.hidden = true; hilfenEl.innerHTML = '';
          weiter.hidden = false;
        } else { b.classList.add('falsch'); rueck.className = 'rueck falsch'; }
      });
      liste.append(b);
    }
  });
}

// Freie Notiz. Ergebnis: Text oder null (abgebrochen).
export function notiz(ui, def, vorgabe = '') {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, beiSchliessen: (w) => fertig(typeof w === 'string' ? w : null) });
    f.inhalt.append(el('p', 'auftrag', esc(def.frage)));
    const t = el('textarea'); t.value = vorgabe; t.maxLength = 900;
    const rueck = el('div', 'rueck');
    f.inhalt.append(t, el('p', 'klein', esc(def.hinweis)), rueck);
    const ok = el('button', 'knopf', 'Notiz sichern');
    f.fuss.append(ok);
    ok.addEventListener('click', () => {
      const text = t.value.trim();
      if (text.length < (def.min || 1)) { rueck.className = 'rueck falsch'; rueck.textContent = def.zuKurz || 'Schreibt mindestens einen Stichpunkt zu jeder der beiden Fragen.'; return; }
      f.schliessen(text);
    });
    if (!ui.touch) t.focus();
  });
}
