// Werkbank: baut das Ergebnis einer Rollengruppe. Drei Modi: plaedoyer, gutachten, kriterien.
// Geprüft wird nur die Vollständigkeit, nie die Richtung der Argumente.
import { el, esc } from './oberflaeche.js';

const MIN = 15;
const feld = (name, hilfe, wert = '', zeilen = 2) => { const w = el('label', 'wfeld', `<span>${esc(name)}</span><small>${esc(hilfe)}</small>`); const t = el('textarea'); t.rows = zeilen; t.value = wert; t.maxLength = 600; w.append(t); return { el: w, t }; };

// Belegauswahl aus der Akte (Mehrfachwahl)
function belegwahl(akte, gewaehlt) {
  const box = el('div', 'belegwahl');
  for (const e of akte) {
    const b = el('button', gewaehlt.includes(e.id) ? 'an' : '', `<i>${'I'.repeat(e.kapitel)}</i> ${esc(e.titel)}`); b.dataset.id = e.id; b.title = e.text;
    b.addEventListener('click', () => { const i = gewaehlt.indexOf(e.id); if (i >= 0) gewaehlt.splice(i, 1); else gewaehlt.push(e.id); b.classList.toggle('an', i < 0); });
    box.append(b);
  }
  return box;
}

// Prüft den Inhalt. Ergebnis: Liste der Mängel (leer = vollständig).
export function pruefeWerkbank(modus, w, akte, kapitel = [1, 2, 3]) {
  const m = [], lang = (t) => (t || '').trim().length >= MIN;
  if (modus === 'plaedoyer') {
    if (!lang(w.massstab)) m.push('Der Maßstab fehlt oder ist zu kurz.');
    (w.karten || []).forEach((k, i) => {
      for (const [f, n] of [['behauptung', 'die Behauptung'], ['einwand', 'der stärkste Einwand'], ['erwiderung', 'die Erwiderung']]) if (!lang(k[f])) m.push(`Karte ${i + 1}: Es fehlt ${n}.`);
      if (!(k.belege || []).length) m.push(`Karte ${i + 1}: Es fehlt ein Beleg.`);
    });
    const benutzt = new Set((w.karten || []).flatMap((k) => k.belege || []).map((id) => akte.find((e) => e.id === id)?.kapitel));
    for (const k of kapitel) if (!benutzt.has(k)) m.push(`Es fehlt ein Beleg aus Kapitel ${'I'.repeat(k)}.`);
  } else if (modus === 'gutachten') {
    (w.befunde || []).forEach((k, i) => {
      if (!(k.belege || []).length) m.push(`Befund ${i + 1}: Es fehlt ein Beleg oder eine Zahl.`);
      if (!lang(k.aussage)) m.push(`Befund ${i + 1}: Es fehlt die Aussage.`);
      if (!lang(k.grenze)) m.push(`Befund ${i + 1}: Es fehlt die Grenze der Daten.`);
      if (!k.fuer) m.push(`Befund ${i + 1}: Wählt, wofür der Befund eher spricht.`);
    });
    if (!lang(w.kapsel)) m.push('Die Auswertung der Zeitkapsel fehlt.');
  } else {
    const krit = (w.kriterien || []).filter((x) => (x || '').trim().length >= 5);
    if (krit.length < 3) m.push(`Es fehlen Kriterien: ${krit.length} von 3.`);
    (w.fragen || []).forEach((q, i) => { if (!lang(q.text)) m.push(`Frage ${i + 1} fehlt oder ist zu kurz.`); });
  }
  return m;
}

// Seiten der Vorlesekarte aus dem Inhalt bilden
export function vorleseSeiten(modus, w, akte, extra = null) {
  const beleg = (ids) => (ids || []).map((id) => akte.find((e) => e.id === id)).filter(Boolean).map((e) => e.titel).join(' · ');
  const s = [];
  if (modus === 'plaedoyer') {
    s.push({ kopf: 'Unser Maßstab', text: w.massstab });
    w.karten.forEach((k, i) => s.push({ kopf: `Argument ${i + 1}`, text: k.behauptung, zeilen: [['Beleg', beleg(k.belege)], ['Stärkster Einwand', k.einwand], ['Unsere Antwort', k.erwiderung]] }));
  } else if (modus === 'gutachten') {
    w.befunde.forEach((k, i) => s.push({ kopf: `Befund ${i + 1}`, text: k.aussage, zeilen: [['Grundlage', beleg(k.belege)], ['Grenze der Daten', k.grenze], ['Spricht eher für', k.fuer]] }));
    s.push({ kopf: 'Die Zeitkapsel', text: w.kapsel });
  } else {
    s.push({ kopf: 'Unsere Kriterien', text: '', zeilen: w.kriterien.filter(Boolean).map((k, i) => [`${i + 1}`, k]) });
    s.push({ kopf: 'Unsere Fragen', text: '', zeilen: w.fragen.map((q) => [`An: ${q.an}`, q.text]) });
  }
  if (extra) s.push(extra);
  return s;
}

export function alsText(titel, seiten) {
  return [titel.toUpperCase(), ...seiten.flatMap((s) => ['', s.kopf + (s.text ? ': ' + s.text : ''), ...(s.zeilen || []).map(([a, b]) => `  ${a}: ${b}`)])].join('\n');
}

// Vollbild zum Vorlesen im Plenum: eine Seite je Argument, große Schrift.
export function vorlesekarte(ui, { rolle, farbe, seiten }) {
  return new Promise((fertig) => {
    ui.spiel.sperre();
    const v = el('div', ''); v.id = 'vorlesen'; v.style.setProperty('--rf', farbe);
    let i = 0;
    const zeige = () => {
      const s = seiten[i];
      v.innerHTML = `<header><b>${esc(rolle)}</b><span>${i + 1} / ${seiten.length}</span></header>
        <main><h2>${esc(s.kopf)}</h2>${s.text ? `<p class="gross">${esc(s.text)}</p>` : ''}${(s.zeilen || []).map(([a, b]) => `<p><small>${esc(a)}</small>${esc(b)}</p>`).join('')}</main>
        <footer><button class="knopf hell" data-a="z" ${i === 0 ? 'disabled' : ''}>← Zurück</button><button class="knopf hell" data-a="x">Schließen</button><button class="knopf" data-a="w" ${i === seiten.length - 1 ? 'disabled' : ''}>Weiter →</button></footer>`;
    };
    v.addEventListener('click', (e) => {
      const a = e.target.closest('button')?.dataset.a; if (!a) return;
      if (a === 'x') { v.remove(); ui.spiel.entsperre(); fertig(); return; }
      i += a === 'w' ? 1 : -1; zeige();
    });
    ui.wurzel.append(v); zeige();
  });
}

// Öffnet die Werkbank. def: { modus, titel, akte, wert (früherer Inhalt), kriterien, urteilsformen, bausteine, adressaten, fuerWahl, kapselText }
// Ergebnis: Inhalt (vollständig) oder null (abgebrochen; Zwischenstand über beiAenderung).
export function werkbank(ui, def) {
  const { modus, akte } = def;
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'voll werkbank', beiSchliessen: (w) => { def.beiAenderung?.(lese()); fertig(w || null); } });
    const w = def.wert ? JSON.parse(JSON.stringify(def.wert)) : {};
    const lesen = [];
    const rueck = el('div', 'rueck');
    if (modus === 'plaedoyer') {
      w.karten = w.karten || [0, 1, 2].map(() => ({ behauptung: '', belege: [], einwand: '', erwiderung: '' }));
      f.inhalt.append(el('p', 'auftrag', 'Baut euer Plädoyer: ein Maßstab und drei Argumentkarten. Jede Karte braucht eine Behauptung, mindestens einen Beleg aus der Akte, den stärksten Einwand und eure Erwiderung. Über alle Karten braucht ihr einen Beleg aus jedem Kapitel.'));
      const ms = feld('Unser Maßstab', 'Woran messt ihr, ob der Kapitalismus Wohlstandsmotor oder Problem ist? Ein Satz.', w.massstab || '');
      f.inhalt.append(ms.el); lesen.push(() => { w.massstab = ms.t.value.trim(); });
      w.karten.forEach((k, i) => {
        const box = el('div', 'wkarte', `<h3>Argumentkarte ${i + 1}</h3>`);
        const a = feld('Behauptung', 'Was wollt ihr zeigen?', k.behauptung), c = feld('Stärkster Einwand der Gegenseite', 'Fair formuliert.', k.einwand), d = feld('Erwiderung', 'Widerlegen, einschränken oder einräumen.', k.erwiderung);
        box.append(a.el, el('p', 'klein', 'Belege aus der Akte (antippen):'), belegwahl(akte, k.belege), c.el, d.el);
        lesen.push(() => { k.behauptung = a.t.value.trim(); k.einwand = c.t.value.trim(); k.erwiderung = d.t.value.trim(); });
        f.inhalt.append(box);
      });
    } else if (modus === 'gutachten') {
      w.befunde = w.befunde || [0, 1, 2].map(() => ({ belege: [], aussage: '', grenze: '', fuer: '' }));
      f.inhalt.append(el('p', 'auftrag', 'Baut euer Gutachten: drei Befunde. Jeder Befund braucht eine Grundlage aus der Akte, eine Aussage, eine Grenze der Daten und eine Einschätzung, wofür er eher spricht. Dazu wertet ihr die Zeitkapsel aus.'));
      w.befunde.forEach((k, i) => {
        const box = el('div', 'wkarte', `<h3>Befund ${i + 1}</h3>`);
        const a = feld('Aussage', 'Was zeigen die Daten?', k.aussage), g = feld('Grenze der Daten', 'Was zeigen sie nicht?', k.grenze);
        const wahl = el('div', 'wahl');
        for (const o of def.fuerWahl) { const b = el('button', k.fuer === o ? 'an' : '', esc(o)); b.addEventListener('click', () => { k.fuer = o; [...wahl.children].forEach((x) => x.classList.toggle('an', x === b)); }); wahl.append(b); }
        box.append(el('p', 'klein', 'Grundlage aus der Akte (antippen):'), belegwahl(akte, k.belege), a.el, g.el, el('p', 'klein', 'Spricht eher für:'), wahl);
        lesen.push(() => { k.aussage = a.t.value.trim(); k.grenze = g.t.value.trim(); });
        f.inhalt.append(box);
      });
      const kp = feld('Auswertung der Zeitkapsel', def.kapselText || 'Was ist aus den drei Prognosen geworden? Was zeigt der Vergleich eurer Tipps?', w.kapsel || '', 3);
      f.inhalt.append(kp.el); lesen.push(() => { w.kapsel = kp.t.value.trim(); });
    } else {
      w.kriterien = w.kriterien || []; w.fragen = w.fragen || def.adressaten.map((an) => ({ an, text: '' }));
      f.inhalt.append(el('p', 'auftrag', 'Legt drei Kriterien fest, nach denen ihr urteilt, und bereitet drei Fragen vor. Ihr könnt Vorschläge antippen oder eigene Kriterien schreiben.'));
      const box = el('div', 'wkarte', '<h3>Kriterien (genau drei)</h3>');
      const wahl = el('div', 'belegwahl');
      const eigene = [0, 1, 2].map((i) => { const t = el('input'); t.type = 'text'; t.placeholder = `Eigenes Kriterium ${i + 1} (optional)`; t.maxLength = 120; const v = (w.kriterien || []).filter((x) => !def.kriterien.includes(x))[i]; if (v) t.value = v; return t; });
      const gew = new Set((w.kriterien || []).filter((x) => def.kriterien.includes(x)));
      for (const kr of def.kriterien) { const b = el('button', gew.has(kr) ? 'an' : '', esc(kr)); b.addEventListener('click', () => { if (gew.has(kr)) gew.delete(kr); else gew.add(kr); b.classList.toggle('an', gew.has(kr)); }); wahl.append(b); }
      const ee = el('div', 'eigene'); eigene.forEach((t) => ee.append(t));
      box.append(wahl, ee); f.inhalt.append(box);
      const fb = el('div', 'wkarte', '<h3>Fragen für die Kreuzbefragung</h3>');
      const ff = w.fragen.map((q) => { const x = feld(`Frage an: ${q.an}`, 'Eine Frage, deren Antwort euer Urteil beeinflussen könnte.', q.text); fb.append(x.el); return x; });
      f.inhalt.append(fb);
      lesen.push(() => { w.kriterien = [...gew, ...eigene.map((t) => t.value.trim()).filter(Boolean)].slice(0, 3); w.fragen.forEach((q, i) => { q.text = ff[i].t.value.trim(); }); });
      const u = el('details', 'urteile', `<summary>Die fünf Urteilsformen und was jede begründen muss</summary><p class="klein">Jedes Urteil braucht vier Bausteine: ${def.bausteine.map(esc).join(' · ')}</p>` + def.urteilsformen.map((x) => `<div class="uform"><b>${esc(x.name)}:</b> ${esc(x.satz)}<small>Muss begründen: ${esc(x.mussBegruenden)}</small><small>Muss den Einwand beantworten: ${esc(x.einwand)}</small><small>Typische Schwäche: ${esc(x.schwaeche)}</small></div>`).join(''));
      f.inhalt.append(u);
    }
    const lese = () => { lesen.forEach((fn) => fn()); return w; };
    f.inhalt.append(rueck);
    const ok = el('button', 'knopf', 'Abschließen');
    ok.addEventListener('click', () => {
      const m = pruefeWerkbank(modus, lese(), akte, def.kapitel);
      if (m.length) { rueck.className = 'rueck falsch'; rueck.innerHTML = 'Noch nicht vollständig:<br>' + m.slice(0, 6).map(esc).join('<br>'); rueck.scrollIntoView({ block: 'nearest' }); return; }
      f.schliessen(w);
    });
    const aktenknopf = el('button', 'knopf still', 'Akte ansehen'); aktenknopf.addEventListener('click', () => def.zeigeAkte?.());
    const links = el('div', 'links'); links.append(aktenknopf);
    f.fuss.append(links, ok);
  });
}
