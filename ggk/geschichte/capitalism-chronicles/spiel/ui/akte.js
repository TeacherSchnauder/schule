// Akte der Gruppe: sammelt Belege aus früheren Kapiteln (Spielstand oder eingefügter Notizentext),
// feste Beweisstücke und alles, was im laufenden Kapitel gesichert wird.
// Eintrag: { id, titel, text, kapitel (1, 2, 3), marke, quelle }
import { el, esc } from './oberflaeche.js';

const ROEM = { I: 1, II: 2, III: 3 };

// Liest einen kopierten Notizentext („Notizen kopieren“). Tolerant: Unbekanntes wird überlesen.
// Ergebnis: { kapitel, funde: [Text], tipps1, tipps2, entscheidungen: [Text], notizen: Text } oder null.
export function importiereText(text) {
  const t = String(text || '');
  const kopf = t.match(/CAPITALISM CHRONICLES\s*[–-]\s*Kapitel\s+(III|II|I)\b/i);
  if (!kopf) return null;
  const kapitel = ROEM[kopf[1].toUpperCase()];
  const zeilen = t.split(/\r?\n/).map((z) => z.trim());
  const abschnitt = (name) => {
    const i = zeilen.findIndex((z) => z.toUpperCase() === name);
    if (i < 0) return [];
    const aus = [];
    for (let k = i + 1; k < zeilen.length && zeilen[k] !== ''; k++) aus.push(zeilen[k]);
    return aus;
  };
  const funde = abschnitt('FUNDE').filter((z) => z.startsWith('- ') && !/noch keine/.test(z)).map((z) => z.slice(2));
  const tipp = (z) => { const m = [...String(z).matchAll(/p([123]):\s*(ja|teils|nein)/gi)]; return m.length === 3 ? Object.fromEntries(m.map((x) => ['p' + x[1], x[2].toLowerCase()])) : null; };
  let tipps1 = tipp(abschnitt('TIPPS 1845').join(' ')), tipps2 = tipp(abschnitt('TIPPS NEU').join(' '));
  if (!tipps1) {   // Kapitel I schreibt die Tipps als Sätze
    const m = [...t.matchAll(/Euer Tipp:\s*(Tritt teilweise ein|Tritt nicht ein|Tritt ein)/g)].map((x) => ({ 'Tritt ein': 'ja', 'Tritt teilweise ein': 'teils', 'Tritt nicht ein': 'nein' }[x[1]]));
    if (m.length >= 3) tipps1 = { p1: m[0], p2: m[1], p3: m[2] };
  }
  const entscheidungen = abschnitt('ENTSCHEIDUNGEN');
  return { kapitel, funde, tipps1, tipps2, entscheidungen, notizen: t.length > 4000 ? t.slice(0, 4000) + ' …' : t };
}

// Einträge aus einem Spielstand eines früheren Kapitels (leseStandVon) bilden.
export function ausStand(kapitel, stand, { fundNamen = {}, tippNamen = {}, prognosen = [] } = {}) {
  if (!stand) return [];
  const aus = [];
  for (const nr of stand.funde || []) if (fundNamen[nr]) aus.push({ id: `k${kapitel}_fund_${nr}`, titel: `Fund aus Kapitel ${'I'.repeat(kapitel)}: ${fundNamen[nr]}`, text: `Diesen Fund habt ihr in Kapitel ${'I'.repeat(kapitel)} gesichert.`, kapitel, marke: null, quelle: 'eigener Spielstand' });
  const tippText = (t) => prognosen.map((p) => `${p.titel} ${tippNamen[t[p.id]] || '–'}`).join(' · ');
  const t1 = kapitel === 1 ? stand.zeitkapsel : stand.tippsKapitel1;
  if (t1 && t1.p1) aus.push({ id: `k${kapitel}_tipps1`, titel: 'Eure Tipps von 1845', text: tippText(t1), kapitel, marke: null, quelle: 'eigener Spielstand', tipps: { p1: t1.p1, p2: t1.p2, p3: t1.p3 }, stufe: 1 });
  if (stand.tippsNeu) aus.push({ id: 'k2_tipps2', titel: 'Eure neuen Tipps nach Kapitel II', text: tippText(stand.tippsNeu), kapitel: 2, marke: null, quelle: 'eigener Spielstand', tipps: stand.tippsNeu, stufe: 2 });
  for (const [k, v] of Object.entries(stand.notizen || {})) if (v && typeof v === 'string' && !/^tipps|zeitkapsel$/.test(k)) aus.push({ id: `k${kapitel}_notiz_${k}`, titel: `Eure Notiz aus Kapitel ${'I'.repeat(kapitel)}`, text: v, kapitel, marke: null, quelle: 'eigene Notiz', notiz: k });
  return aus;
}

// Einträge aus einem eingefügten Text bilden.
export function ausText(imp, { tippNamen = {}, prognosen = [] } = {}) {
  if (!imp) return [];
  const k = imp.kapitel, aus = [];
  imp.funde.forEach((f, i) => aus.push({ id: `k${k}_fund_t${i}`, titel: `Fund aus Kapitel ${'I'.repeat(k)}`, text: f, kapitel: k, marke: null, quelle: 'eingefügte Notizen' }));
  const tippText = (t) => prognosen.map((p) => `${p.titel} ${tippNamen[t[p.id]] || '–'}`).join(' · ');
  if (imp.tipps1) aus.push({ id: `k${k}_tipps1`, titel: 'Eure Tipps von 1845', text: tippText(imp.tipps1), kapitel: k, marke: null, quelle: 'eingefügte Notizen', tipps: imp.tipps1, stufe: 1 });
  if (imp.tipps2) aus.push({ id: 'k2_tipps2', titel: 'Eure neuen Tipps nach Kapitel II', text: tippText(imp.tipps2), kapitel: 2, marke: null, quelle: 'eingefügte Notizen', tipps: imp.tipps2, stufe: 2 });
  if (imp.entscheidungen.length) aus.push({ id: 'k2_entscheidungen', titel: 'Eure Entscheidungen in den Simulationen', text: imp.entscheidungen.join(' · '), kapitel: 2, marke: null, quelle: 'eingefügte Notizen' });
  return aus;
}

// Fügt Einträge hinzu, ohne vorhandene zu verdoppeln. Gibt die Zahl der neuen Einträge zurück.
export function fuegeHinzu(akte, eintraege) {
  let n = 0;
  for (const e of eintraege) if (!akte.some((x) => x.id === e.id)) { akte.push(e); n++; }
  return n;
}

const listeHtml = (ui, akte) => {
  if (!akte.length) return '<div class="leer">Die Akte ist noch leer.</div>';
  return [1, 2, 3].map((k) => {
    const teil = akte.filter((e) => e.kapitel === k);
    return teil.length ? `<h3 class="zw">Kapitel ${'I'.repeat(k)}</h3>` + teil.map((e) => `<div class="beleg" data-id="${esc(e.id)}"><b>${esc(e.titel)} ${e.marke ? ui.markeHtml(e.marke) : ''}</b>${esc(e.text)}${e.quelle ? `<small class="quelle">Quelle: ${esc(e.quelle)}</small>` : ''}</div>`).join('') : '';
  }).join('');
};

// Zeigt die Akte. Mit zusatz (HTML-Element) erscheint unten ein weiterer Bereich, z. B. die Vorlesekarte.
export function zeigeAkte(ui, akte, { titel = 'Akte der Gruppe', fuss = [] } = {}) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel, klasse: 'breit', beiSchliessen: () => fertig() });
    f.inhalt.innerHTML = `<p class="klein">Alles in der Akte könnt ihr an der Werkbank als Beleg verwenden. ${akte.length} Einträge.</p>` + listeHtml(ui, akte);
    const links = el('div', 'links'); for (const b of fuss) links.append(b);
    const zu = el('button', 'knopf', 'Schließen'); zu.addEventListener('click', () => f.schliessen());
    f.fuss.append(links, zu);
  });
}

// Import beim Anlegen der Akte: zeigt, was auf dem Gerät gefunden wurde, und nimmt eingefügten Text an.
// gefunden: { 1: [Einträge], 2: [Einträge] } aus Spielständen · beiText(text) → Einträge oder null
export function importDialog(ui, { gefunden, beiText, texte }) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: texte.titel || 'Akte anlegen', klasse: 'breit', schliessbar: false, beiSchliessen: (w) => fertig(w) });
    const neu = [];
    const zeile = (k) => `Aus Kapitel ${'I'.repeat(k)}: ${gefunden[k].length ? `<b>${gefunden[k].length} Einträge gefunden</b>` : 'kein Spielstand auf diesem Gerät'}`;
    f.inhalt.innerHTML = `<p class="auftrag">${esc(texte.einleitung)}</p><div class="aktenfund"><div>${zeile(1)}</div><div>${zeile(2)}</div></div>`;
    for (const k of [1, 2]) neu.push(...gefunden[k]);
    const feld = el('textarea'); feld.placeholder = texte.einfuegen; feld.classList.add('einfuegen');
    const lesen = el('button', 'knopf still', 'Eingefügten Text lesen');
    const rueck = el('div', 'rueck');
    f.inhalt.append(el('p', 'klein', esc(texte.hinweis)), feld, lesen, rueck);
    lesen.addEventListener('click', () => {
      if (!feld.value.trim()) { rueck.className = 'rueck falsch'; rueck.textContent = texte.leer; return; }
      const e = beiText(feld.value);
      if (!e || !e.length) { rueck.className = 'rueck falsch'; rueck.textContent = texte.unlesbar; return; }
      const n = fuegeHinzu(neu, e);
      rueck.className = 'rueck richtig'; rueck.textContent = `${n} neue Einträge aus dem eingefügten Text übernommen.`;
      feld.value = '';
    });
    const ok = el('button', 'knopf', 'Akte anlegen');
    ok.addEventListener('click', () => f.schliessen(neu));
    f.fuss.append(ok);
  });
}
