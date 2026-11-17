// Kapitel II – Zeitkapsel: Codewort, Tipps aus Kapitel I holen (Spielstand, eingefügter Text oder neue Wahl), neue Tipps im Epilog.
import { el, esc } from '../../../ui/oberflaeche.js';

const GUELTIG = ['ja', 'teils', 'nein'];
const gueltig = (t) => t && ['p1', 'p2', 'p3'].every((p) => GUELTIG.includes(t[p]));
// Sucht im kopierten Notizentext aus Kapitel I nach „Euer Tipp: Tritt …“
export function leseTippsAusText(text) {
  const m = [...String(text).matchAll(/Euer Tipp:\s*(Tritt teilweise ein|Tritt nicht ein|Tritt ein)/g)].map((x) => ({ 'Tritt ein': 'ja', 'Tritt teilweise ein': 'teils', 'Tritt nicht ein': 'nein' }[x[1]]));
  return m.length >= 3 ? { p1: m[0], p2: m[1], p3: m[2] } : null;
}

// Wahl der drei Tipps. alt: frühere Tipps zum Vergleich (oder null). Ergebnis: { p1, p2, p3 } oder null.
function tippFelder(k, ziel, tipps, alt, beiAenderung) {
  const K = k.daten.kapsel;
  const box = el('div', 'kapsel3');
  for (const p of K.prognosen) {
    const d = el('div', 'prognose', `<b>${esc(p.titel)}</b><small>${esc(p.text)}</small>${alt ? `<span class="tipp-alt">1845: ${esc(k.tippText(alt[p.id]))}</span>` : ''}`);
    const r = el('div', 'tipps');
    for (const [wert, name] of K.tipps) {
      const b = el('button', tipps[p.id] === wert ? 'an' : '', esc(name));
      b.addEventListener('click', () => { tipps[p.id] = wert; [...r.children].forEach((x) => x.classList.toggle('an', x === b)); beiAenderung(); });
      r.append(b);
    }
    d.append(r); box.append(d);
  }
  ziel.append(box);
}

export function oeffneKapsel(k) {
  const { ui, daten, st } = k, K = daten.kapsel;
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Die Zeitkapsel von 1845', beiSchliessen: (w) => fertig(w || null) });
    const code = () => {
      f.inhalt.innerHTML = `<p class="auftrag">${esc(K.codeFrage)}</p>`;
      const zeile = el('div', 'eingabe'); const input = el('input'); input.type = 'text'; input.autocomplete = 'off'; input.setAttribute('aria-label', 'Codewort');
      const ok = el('button', 'knopf', 'Öffnen'); const rueck = el('div', 'rueck');
      zeile.append(input, ok); f.inhalt.append(zeile, rueck);
      const pruefe = () => { if (input.value.trim().toLowerCase() === String(daten.kapitel.codewort).toLowerCase()) inhalt(); else { rueck.className = 'rueck falsch'; rueck.textContent = K.codeFalsch; } };
      ok.addEventListener('click', pruefe);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pruefe(); } });
      if (!ui.touch) input.focus();
    };
    const zeigeTipps = (tipps, text) => {
      f.inhalt.innerHTML = `<p class="auftrag">${esc(text)}</p>` + K.prognosen.map((p) => `<div class="prognose"><b>${esc(p.titel)}</b><small>${esc(p.text)}</small><span class="tipp-alt">Euer Tipp von 1845: ${esc(k.tippText(tipps[p.id]))}</span></div>`).join('');
      f.fuss.innerHTML = '';
      const b = el('button', 'knopf', 'Tipps mitnehmen'); b.addEventListener('click', () => f.schliessen(tipps)); f.fuss.append(b);
    };
    const inhalt = () => {
      k.szenen.hoersaal.oeffneKapsel(true);
      const alt = k.leseStandVon(1)?.zeitkapsel;
      if (gueltig(alt)) return zeigeTipps({ p1: alt.p1, p2: alt.p2, p3: alt.p3 }, K.gefunden);
      // kein Spielstand auf diesem Gerät: Text einfügen oder neu wählen
      const tipps = {};
      f.inhalt.innerHTML = `<p class="auftrag">${esc(K.fehlt)}</p>`;
      const t = el('textarea'); t.placeholder = K.einfuegen; t.style.minHeight = '5em';
      const lesen = el('button', 'knopf still', 'Text auswerten'); const rueck = el('div', 'rueck');
      f.inhalt.append(t, lesen, rueck);
      lesen.addEventListener('click', () => { const g = leseTippsAusText(t.value); if (g) zeigeTipps(g, K.gefunden); else { rueck.className = 'rueck falsch'; rueck.textContent = K.unlesbar; } });
      f.fuss.innerHTML = '';
      const b = el('button', 'knopf', 'Tipps mitnehmen'); b.disabled = true;
      tippFelder(k, f.inhalt, tipps, null, () => { b.disabled = !gueltig(tipps); });
      b.addEventListener('click', () => f.schliessen(tipps)); f.fuss.append(b);
    };
    code();
  });
}

export function neueTipps(k) {
  const { ui, daten, st } = k;
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Neue Tipps für die Zeitkapsel', klasse: 'breit', beiSchliessen: (w) => fertig(w || null) });
    f.inhalt.innerHTML = `<p class="auftrag">${esc(daten.kapsel.neuFrage)}</p>`;
    const tipps = { ...(st().tippsNeu || {}) };
    const b = el('button', 'knopf', 'In die Kassette legen'); b.disabled = !gueltig(tipps);
    tippFelder(k, f.inhalt, tipps, st().tippsKapitel1, () => { b.disabled = !gueltig(tipps); });
    b.addEventListener('click', () => f.schliessen(tipps)); f.fuss.append(b);
  });
}
