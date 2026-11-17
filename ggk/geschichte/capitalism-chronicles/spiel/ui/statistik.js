// Statistik-Bausteine: Gini-Rechnung, Lorenz-Regler, Zeitreihen-Diagramm, Statistikwand mit Aufgaben,
// Mehrfachwahl „Was zeigt das nicht?“ und ein Regler für Vermögen aus Unternehmensanteilen.
// Alle Texte und Werte kommen aus Daten; null-Werte erscheinen als „Werte folgen“.
import { el, esc } from './oberflaeche.js';
import { rechenblatt, auswahl } from './raetsel.js';

const de = (x, n = 2) => x.toFixed(n).replace('.', ',');

// Gini-Koeffizient einer Liste nichtnegativer Werte (0 = gleich; bei n Werten höchstens (n−1)/n).
export function gini(werte) {
  const x = [...werte].map((v) => Math.max(0, +v || 0)).sort((a, b) => a - b), n = x.length, s = x.reduce((a, b) => a + b, 0);
  if (!n || s === 0) return 0;
  let z = 0; x.forEach((v, i) => { z += (i + 1) * v; });
  return (2 * z) / (n * s) - (n + 1) / n;
}
// Punkte der Lorenzkurve: [[0,0], …, [1,1]]
export function lorenzPunkte(werte) {
  const x = [...werte].map((v) => Math.max(0, +v || 0)).sort((a, b) => a - b), s = x.reduce((a, b) => a + b, 0) || 1;
  let k = 0; return [[0, 0], ...x.map((v, i) => { k += v; return [(i + 1) / x.length, k / s]; })];
}

// Mehrfachwahl: Alle richtigen Antworten finden; falsche Antworten (Fallen) erklären sich. Ergebnis: true | false.
export function mehrfachwahl(ui, def) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, beiSchliessen: (w) => fertig(w === true) });
    f.inhalt.append(el('p', 'auftrag', esc(def.frage)));
    const liste = el('div', 'optionen mehrfach'), rueck = el('div', 'rueck');
    f.inhalt.append(liste, rueck);
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    weiter.addEventListener('click', () => f.schliessen(true));
    f.fuss.append(weiter);
    let offen = def.optionen.filter((o) => o.richtig).length;
    for (const o of def.optionen) {
      const b = el('button', 'option', esc(o.text));
      b.addEventListener('click', () => {
        if (b.classList.contains('richtig') || b.classList.contains('falsch')) return;
        b.classList.add(o.richtig ? 'richtig' : 'falsch');
        rueck.className = 'rueck ' + (o.richtig ? 'richtig' : 'falsch'); rueck.textContent = o.rueck;
        if (o.richtig && --offen === 0) { rueck.textContent = o.rueck + ' ' + (def.erfolg || ''); weiter.hidden = false; }
      });
      liste.append(b);
    }
  });
}

// ---------------------------------------------------------------- Lorenz-Regler
function lorenzSvg(werte, merk = null) {
  const B = 260, R = 30, p = (pt) => `${R + pt[0] * B},${R + B - pt[1] * B}`;
  const kurve = lorenzPunkte(werte), alt = merk ? lorenzPunkte(merk) : null;
  return `<svg viewBox="0 0 ${B + 2 * R} ${B + 2 * R + 14}" class="lorenz" role="img" aria-label="Lorenzkurve">
    <rect x="${R}" y="${R}" width="${B}" height="${B}" class="rahmen"/>
    <polygon points="${p([0, 0])} ${kurve.map(p).join(' ')}" class="flaeche"/>
    <line x1="${R}" y1="${R + B}" x2="${R + B}" y2="${R}" class="gleich"/>
    ${alt ? `<polyline points="${alt.map(p).join(' ')}" class="merk"/>` : ''}
    <polyline points="${kurve.map(p).join(' ')}" class="kurve"/>
    ${kurve.map((k) => `<circle cx="${R + k[0] * B}" cy="${R + B - k[1] * B}" r="3.5" class="punkt"/>`).join('')}
    <text x="${R + B / 2}" y="${R + B + 26}" text-anchor="middle">Haushalte, von arm nach reich</text>
    <text x="12" y="${R + B / 2}" text-anchor="middle" transform="rotate(-90 12 ${R + B / 2})">Anteil am Einkommen</text></svg>`;
}

// def: { titel, text, aufgabe, erkenntnis, vorgaben: [{ name, werte | null }], marke }
// Ergebnis: { geloest: bool, gini } oder null (abgebrochen)
export function lorenzRegler(ui, def, { pflicht = false } = {}) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: def.marke ? el('div', '', ui.markeHtml(def.marke)) : null, beiSchliessen: (w) => fertig(w || null) });
    let werte = [8, 14, 18, 24, 36], merk = null, geloest = false;
    f.inhalt.append(el('p', 'auftrag', esc(def.text)));
    const raster = el('div', 'lorenzraster'), bild = el('div'), rechts = el('div');
    raster.append(bild, rechts);
    const regler = el('div', 'haushalte');
    const eingaben = werte.map((v, i) => {
      const z = el('label', '', `<span>Haushalt ${i + 1}</span>`); const r = el('input'); r.type = 'range'; r.min = 0; r.max = 100; r.step = 1; r.value = v; const a = el('b');
      r.addEventListener('input', () => { werte[i] = +r.value; male(); });
      z.append(r, a); regler.append(z); return { r, a };
    });
    const wert = el('div', 'giniwert'), vorgaben = el('div', 'wahl'), rueck = el('div', 'rueck');
    for (const v of def.vorgaben) {
      const b = el('button', '', esc(v.name)); b.disabled = !v.werte; if (!v.werte) b.title = 'Werte folgen';
      b.addEventListener('click', () => { werte = [...v.werte]; eingaben.forEach((e, i) => { e.r.value = werte[i]; }); male(); });
      vorgaben.append(b);
    }
    const merken = el('button', 'knopf still', 'Diese Verteilung merken');
    merken.addEventListener('click', () => { merk = [...werte]; geloest = false; rueck.className = 'rueck hilfe'; rueck.textContent = `Gemerkt: Gini ${de(gini(merk))}. Stellt jetzt eine deutlich andere Verteilung mit fast demselben Gini ein.`; male(); });
    rechts.append(regler, wert, vorgaben, el('p', 'klein', esc(def.aufgabe)), merken, rueck);
    f.inhalt.append(raster);
    const weiter = el('button', 'knopf', pflicht ? 'Weiter' : 'Weiter');
    weiter.addEventListener('click', () => {
      if (pflicht && !geloest) { rueck.className = 'rueck falsch'; rueck.textContent = 'Löst zuerst die Aufgabe: eine Verteilung merken, dann eine deutlich andere mit fast demselben Gini einstellen.'; return; }
      f.schliessen({ geloest, gini: gini(werte) });
    });
    f.fuss.append(weiter);
    function male() {
      const s = werte.reduce((a, b) => a + b, 0) || 1, g = gini(werte);
      eingaben.forEach((e, i) => { e.a.textContent = `${Math.round((werte[i] / s) * 100)} %`; });
      bild.innerHTML = lorenzSvg(werte, merk);
      wert.innerHTML = `Gini-Koeffizient: <b>${de(g)}</b>`;
      if (merk && !geloest) {
        const a = [...merk].sort((x, y) => x - y), b = [...werte].sort((x, y) => x - y), sa = a.reduce((x, y) => x + y, 0) || 1;
        const abstand = a.reduce((d, v, i) => d + Math.abs(v / sa - b[i] / s), 0);   // Unterschied der Anteile
        if (abstand > 0.16 && Math.abs(g - gini(merk)) < 0.012) { geloest = true; rueck.className = 'rueck richtig'; rueck.textContent = def.erkenntnis; }
      }
    }
    male();
  });
}

// ---------------------------------------------------------------- Zeitreihen
const STRICH = { voll: '', gestrichelt: '7 5', gepunktet: '2 5' };
export const hatWerte = (st) => st.reihen.some((r) => r.punkte.some((p) => p[1] !== null));

export function zeitreiheSvg(st) {
  const alle = st.reihen.flatMap((r) => r.punkte), mit = alle.filter((p) => p[1] !== null);
  const B = 560, H = 280, L = 56, R = 16, O = 16, U = 34;
  const jahre = alle.map((p) => p[0]), x0 = Math.min(...jahre), x1 = Math.max(...jahre);
  if (!mit.length) return `<svg viewBox="0 0 ${B} ${H}" class="zeitreihe leer"><rect x="${L}" y="${O}" width="${B - L - R}" height="${H - O - U}" class="rahmen"/><text x="${B / 2}" y="${H / 2}" text-anchor="middle" class="folgt">Werte folgen</text>${[x0, x1].map((j) => `<text x="${j === x0 ? L : B - R}" y="${H - 10}" text-anchor="${j === x0 ? 'start' : 'end'}">${j}</text>`).join('')}</svg>`;
  let y0 = Math.min(...mit.map((p) => p[1])), y1 = Math.max(...mit.map((p) => p[1]));
  // Feste Achse (z. B. 0 bis 1 beim Gini) verhindert, dass kleine Änderungen durch eine abgeschnittene Achse dramatisch wirken.
  if (st.achse) { [y0, y1] = st.achse; } else { const sp = (y1 - y0) || Math.abs(y1) * 0.1 || 1; y0 -= sp * 0.25; y1 += sp * 0.25; if (y0 < 0 && Math.min(...mit.map((p) => p[1])) >= 0) y0 = 0; }
  const X = (j) => L + ((j - x0) / ((x1 - x0) || 1)) * (B - L - R), Y = (v) => O + (1 - (v - y0) / (y1 - y0)) * (H - O - U);
  const stellen = y1 - y0 < 0.2 ? 3 : y1 - y0 < 2 ? 2 : y1 - y0 < 20 ? 1 : 0;
  const gitter = [0, 1, 2, 3, 4].map((i) => { const v = y0 + ((y1 - y0) * i) / 4; return `<line x1="${L}" x2="${B - R}" y1="${Y(v)}" y2="${Y(v)}" class="gitter"/><text x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">${de(v, stellen)}</text>`; }).join('');
  const jahreU = [...new Set(jahre)].sort((a, b) => a - b);
  const achse = jahreU.map((j) => `<text x="${X(j)}" y="${H - 10}" text-anchor="middle">${j}</text>`).join('');
  const brueche = (st.brueche || []).map((b) => `<line x1="${X(b.jahr)}" x2="${X(b.jahr)}" y1="${O}" y2="${H - U}" class="bruch"><title>${esc(b.text)}</title></line>`).join('');
  const linien = st.reihen.map((r, i) => {
    const pt = r.punkte.filter((p) => p[1] !== null);
    if (!pt.length) return '';
    return `<polyline points="${pt.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')}" class="reihe r${i}" stroke-dasharray="${STRICH[r.strich] || ''}"/>` + pt.map((p) => `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5" class="punkt r${i}" tabindex="0"><title>${p[0]}: ${de(p[1], Math.max(stellen, 2))}</title></circle>`).join('');
  }).join('');
  return `<svg viewBox="0 0 ${B} ${H}" class="zeitreihe" role="img" aria-label="${esc(st.titel)}"><rect x="${L}" y="${O}" width="${B - L - R}" height="${H - O - U}" class="rahmen"/>${gitter}${achse}${brueche}${linien}</svg>`;
}

function statistikHtml(ui, st) {
  const legende = st.reihen.map((r, i) => `<span class="r${i}"><svg viewBox="0 0 34 8"><line x1="0" x2="34" y1="4" y2="4" stroke-dasharray="${STRICH[r.strich] || ''}"/></svg>${esc(r.name)}${r.punkte.every((p) => p[1] === null) ? ' (Werte folgen)' : ''}</span>`).join('');
  return `<h3 class="zw">${esc(st.titel)} ${ui.markeHtml(st.marke)}</h3><p class="klein">${esc(st.einheit)}</p>${zeitreiheSvg(st)}<div class="zrlegende">${legende}</div>
    ${(st.brueche || []).map((b) => `<p class="klein">Gestrichelte Linie ${b.jahr}: ${esc(b.text)}</p>`).join('')}
    <p>${esc(st.lesehilfe)}</p>${st.quelle ? `<p class="quelle">Quelle: ${esc(st.quelle)}${st.stand ? ' · Stand: ' + esc(st.stand) : ''}</p>` : '<p class="quelle">Quelle und Werte folgen in der Inhaltsrunde. Es werden keine Zahlen erfunden.</p>'}`;
}

// Statistikwand: Reiter je Statistik, Aufgaben, „In die Akte“.
// Ergebnis: { gesehen: [ids], akte: [Einträge], aufgaben: [ids] }
export function statistikwand(ui, statistiken, { titel = 'Statistikwand', min = 2, pflicht = [], alle = false, gesehen: vorher = [], kapitel = 3 } = {}) {
  return new Promise((fertig) => {
    const gesehen = new Set(vorher), akte = [], aufgaben = new Set();
    const brauchbar = statistiken.filter(hatWerte).map((s) => s.id);
    const noetig = () => { const ziel = alle ? brauchbar : [...new Set([...pflicht.filter((p) => brauchbar.includes(p))])]; return ziel.every((id) => gesehen.has(id)) && gesehen.size >= Math.min(min, statistiken.length); };
    const f = ui.fenster({ titel, klasse: 'voll', beiSchliessen: (w) => fertig(w === true ? { gesehen: [...gesehen], akte, aufgaben: [...aufgaben], fertig: true } : { gesehen: [...gesehen], akte, aufgaben: [...aufgaben], fertig: false }) });
    const leiste = el('div', 'reiter'), feld = el('div', 'statistik'), rueck = el('div', 'rueck');
    f.inhalt.append(leiste, feld, rueck);
    const weiter = el('button', 'knopf', 'Weiter');
    weiter.addEventListener('click', () => { if (!noetig()) { rueck.className = 'rueck falsch'; rueck.textContent = alle ? 'Seht euch alle Statistiken mit Werten an.' : `Seht euch mindestens ${min} Statistiken an${pflicht.length ? ', darunter die markierte' : ''}.`; return; } f.schliessen(true); });
    f.fuss.append(weiter);
    const zeige = (st) => {
      gesehen.add(st.id); rueck.textContent = ''; rueck.className = 'rueck';
      [...leiste.children].forEach((b) => { b.classList.toggle('an', b.dataset.id === st.id); if (gesehen.has(b.dataset.id)) b.classList.add('gesehen'); });
      feld.innerHTML = statistikHtml(ui, st);
      const knoepfe = el('div', 'wahl');
      const mit = hatWerte(st), a = st.aufgaben || {};
      const knopf = (name, tu, id) => { const b = el('button', aufgaben.has(id) ? 'an' : '', esc(name)); b.dataset.aufgabe = id; b.addEventListener('click', async () => { if (await tu()) { aufgaben.add(id); b.classList.add('an'); } }); knoepfe.append(b); };
      if (mit && a.ablesen) knopf('Aufgabe: ablesen', () => rechenblatt(ui, { titel: st.titel, fragen: [{ frage: a.ablesen.frage, einheit: '', loesung: a.ablesen.loesung, weg: a.ablesen.weg, sonst: a.ablesen.sonst }] }), st.id + '_ablesen');
      if (mit && a.entwicklung) knopf('Aufgabe: Entwicklung', () => auswahl(ui, { titel: st.titel, frage: a.entwicklung.frage, optionen: a.entwicklung.optionen }), st.id + '_entwicklung');
      if ((st.zeigtNicht || []).length) knopf('Was zeigt sie nicht?', () => mehrfachwahl(ui, { titel: st.titel, frage: 'Was zeigt diese Statistik NICHT? Findet alle richtigen Antworten. Vorsicht: Eine Antwort ist eine Falle.', optionen: st.zeigtNicht, erfolg: 'Alle gefunden.' }), st.id + '_nicht');
      if (mit) {
        const id = 'statistik_' + st.id, b = el('button', '', akte.some((x) => x.id === id) ? 'In der Akte' : 'In die Akte'); b.dataset.akte = '1';
        b.addEventListener('click', () => { if (!akte.some((x) => x.id === id)) akte.push({ id, titel: 'Statistik: ' + st.titel, text: st.lesehilfe, kapitel, marke: st.marke, quelle: st.quelle }); b.textContent = 'In der Akte'; b.classList.add('an'); });
        knoepfe.append(b);
      }
      feld.append(knoepfe);
      f.inhalt.scrollTop = 0;
    };
    for (const st of statistiken) {
      const b = el('button', '', esc(st.titel) + (pflicht.includes(st.id) ? ' ★' : '') + (hatWerte(st) ? '' : ' ·')); b.dataset.id = st.id;
      b.addEventListener('click', () => zeige(st)); leiste.append(b);
    }
    zeige(statistiken.find((s) => pflicht.includes(s.id) && hatWerte(s)) || statistiken.find(hatWerte) || statistiken[0]);
  });
}

// ---------------------------------------------------------------- Vermögen aus Unternehmensanteilen (Modell)
// def: { titel, text, anteil (Prozent), fazit } · boersenwert in Mrd. € oder null (dann Darstellung als Index 100)
export function vermoegensregler(ui, def, { boersenwert = null, beiKurs = null } = {}) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, kopf: el('div', '', ui.markeHtml('modell')), beiSchliessen: (w) => { beiKurs?.(null); fertig(w === true); } });
    f.inhalt.append(el('p', 'auftrag', esc(def.text)));
    const r = el('input'); r.type = 'range'; r.min = -30; r.max = 30; r.step = 1; r.value = 0; r.classList.add('kursregler');
    const aus = el('div', 'vermoegen'), fazit = el('p', 'rueck');
    f.inhalt.append(el('label', 'kurs', '<span>Aktienkurs</span>'), r, aus, fazit);
    let bewegt = false;
    const male = () => {
      const d = +r.value, wert = (boersenwert ?? 100) * (1 + d / 100), teil = (wert * def.anteil) / 100, ein = boersenwert === null ? ' Punkte' : ' Mrd. €';
      aus.innerHTML = `<div><small>Kursänderung</small><b>${d > 0 ? '+' : d < 0 ? '−' : ''}${Math.abs(d)} %</b></div>
        <div><small>${boersenwert === null ? 'Wert des Unternehmens (vorher 100)' : 'Börsenwert des Unternehmens'}</small><b>${de(wert, 1)}${ein}</b></div>
        <div><small>Anteil des Gründers: ${def.anteil} %</small><b>${de(teil, 1)}${ein}</b><i>Vermögen auf dem Papier</i></div>
        <div><small>Geld auf dem Konto des Gründers</small><b>unverändert</b></div>`;
      beiKurs?.(d);
      if (bewegt) { fazit.className = 'rueck hilfe'; fazit.textContent = def.fazit; weiter.hidden = false; }
    };
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    weiter.addEventListener('click', () => f.schliessen(true));
    f.fuss.append(weiter);
    r.addEventListener('input', () => { bewegt = true; male(); });
    male();
  });
}
