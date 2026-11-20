// Baustein D: Zwei Zeitungen, ein Ereignis.
// Vier Schritte in einem Fenster: Zuordnen, Faktenkern, Haltung begründen, eigene Notiz.
// Rückmeldung mit Text und Symbol, Hinweise erst nach dem ersten Prüfen, Lösung nach dem vierten Fehlversuch.
import { el, esc } from './oberflaeche.js';
import { mische, hinweisStufen, meldung } from './raetsel.js';

const MAX = 4;

// ablage: stand.zeitungen; dort steht danach je id { schritt, zuordnung, kern, merkmale, notiz, nichtSelbst: [] }.
// Ergebnis: true (fertig) oder false (abgebrochen; der erreichte Schritt bleibt gespeichert).
export function zeitungen(ui, def, ablage, sichere = () => {}) {
  const e = (ablage[def.id] ||= { schritt: 0, nichtSelbst: [] });
  return new Promise((fertig) => {
    const kopf = el('div', '', ui.markeHtml(def.marke));
    const f = ui.fenster({ titel: def.titel, klasse: 'voll zeitungen', kopf, beiSchliessen: (w) => fertig(w === true) });
    const punkte = el('div', 'schritte', '<i></i><i></i><i></i><i></i>');
    f.header.append(punkte);
    const links = el('div', 'links');
    const pruefen = el('button', 'knopf', 'Prüfen');
    const weiter = el('button', 'knopf', 'Weiter');
    f.fuss.append(links, pruefen, weiter);
    const blattName = (b) => def.blaetter[b].name;
    const stueck = (id) => def.stuecke.find((s) => s.id === id);
    let aktion = null;
    pruefen.addEventListener('click', () => aktion?.());

    const rahmen = (art, text) => {
      f.inhalt.innerHTML = ''; links.innerHTML = '';
      [...punkte.children].forEach((p, k) => { p.className = k < e.schritt ? 'fertig' : k === e.schritt ? 'jetzt' : ''; });
      f.inhalt.append(el('p', 'klein vorspann', esc(def.schritte[art])));
      if (text) f.inhalt.append(el('p', 'auftrag', esc(text)));
      const rueck = el('div', 'rueck'); rueck.setAttribute('aria-live', 'polite');
      const hilfenEl = el('div', 'hilfen');
      const h = hinweisStufen(def.hilfen[art] || [], hilfenEl);
      links.append(h.knopf);
      pruefen.hidden = false; pruefen.disabled = false; weiter.hidden = true;
      return { rueck, hilfenEl, h };
    };
    const geschafft = (r, text) => {
      meldung(r.rueck, 'richtig', 'Richtig.', text);
      r.h.aus(); pruefen.hidden = true; weiter.hidden = false; aktion = null;
      e.schritt++; sichere();
      if (!ui.touch) weiter.focus();
    };
    const loesungZeigen = (r, art, text) => {
      r.rueck.append(el('p', 'loesung', `<b>Lösung (nicht selbst gelöst):</b> ${esc(text)}`));
      if (!e.nichtSelbst.includes(art)) e.nichtSelbst.push(art);
    };
    weiter.addEventListener('click', () => zeige());

    // --- Schritt 1: Zuordnen ---
    const zuordnen = () => {
      const r = rahmen('zuordnen');
      const liste = el('div', 'stuecke');
      const wahl = {}; const fest = {}; let fehl = 0;
      for (const s of mische(def.stuecke)) {
        const box = el('div', 'stueck');
        box.append(el('p', 'zeitungstext', esc(s.text)));
        const reihe = el('div', 'wahl');
        for (const b of ['A', 'B']) {
          const k = el('button', '', esc(blattName(b))); k.dataset.b = b; k.setAttribute('aria-pressed', 'false');
          k.addEventListener('click', () => {
            if (fest[s.id]) return;
            wahl[s.id] = b;
            for (const x of reihe.children) { const an = x === k; x.classList.toggle('an', an); x.setAttribute('aria-pressed', String(an)); }
          });
          reihe.append(k);
        }
        const notiz = el('p', 'klein stueckrueck');
        box.append(reihe, notiz); box.dataset.id = s.id;
        liste.append(box);
      }
      f.inhalt.append(el('div', 'koepfe', ['A', 'B'].map((b) => `<div class="blattkopf"><b>${esc(blattName(b))}</b><small>${esc(def.blaetter[b].unter)}</small></div>`).join('')), liste, r.rueck, r.hilfenEl);
      aktion = () => {
        if (def.stuecke.some((s) => !wahl[s.id])) { meldung(r.rueck, 'hinweis', 'Ordnet erst alle sechs Stücke zu.', ''); return; }
        let alle = true;
        for (const box of liste.children) {
          const s = stueck(box.dataset.id), n = box.querySelector('.stueckrueck');
          if (fest[s.id]) continue;
          if (wahl[s.id] === s.blatt) { fest[s.id] = true; box.classList.add('fest'); n.textContent = '✓ passt'; for (const b of box.querySelectorAll('button')) b.disabled = true; }
          else { alle = false; n.textContent = '✗ ' + s.falsch; }
        }
        if (alle) { e.zuordnung = { ...wahl }; geschafft(r, def.rueck.zuordnenFertig); return; }
        fehl++;
        meldung(r.rueck, 'falsch', def.rueck.zuordnenFehler, '');
        if (fehl >= MAX) {
          for (const box of liste.children) { const s = stueck(box.dataset.id); fest[s.id] = true; wahl[s.id] = s.blatt; for (const b of box.querySelectorAll('button')) { b.disabled = true; b.classList.toggle('an', b.dataset.b === s.blatt); } }
          loesungZeigen(r, 'zuordnen', def.loesung.zuordnen);
          e.zuordnung = { ...wahl }; e.schritt++; sichere();
          r.h.aus(); pruefen.hidden = true; weiter.hidden = false; aktion = null;
          return;
        }
        r.h.freigeben();
      };
    };

    const bericht = (b) => {
      const sp = el('article', 'bericht');
      sp.append(el('header', 'blattkopf', `<b>${esc(blattName(b))}</b><small>${esc(def.blaetter[b].unter)}</small>`));
      for (const teil of def.berichte[b]) {
        const s = stueck(teil);
        sp.append(s ? el(s.art === 'Überschrift' ? 'h4' : 'p', s.art === 'Überschrift' ? '' : 'zeitungstext', esc(s.text)) : el('p', 'zeitungstext', esc(teil)));
      }
      return sp;
    };

    // --- Schritt 2: Faktenkern ---
    const kern = () => {
      const r = rahmen('kern');
      const paar = el('div', 'berichte'); paar.append(bericht('A'), bericht('B'));
      const liste = el('div', 'optionen aussagen');
      const wahl = new Set(); let fehl = 0;
      for (const a of mische(def.aussagen)) {
        const b = el('button', 'option', esc(a.text)); b.dataset.id = a.id; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          if (wahl.has(a.id)) wahl.delete(a.id); else wahl.add(a.id);
          b.classList.toggle('gewaehlt', wahl.has(a.id)); b.setAttribute('aria-pressed', String(wahl.has(a.id)));
        });
        liste.append(b);
      }
      f.inhalt.append(paar, liste, r.rueck, r.hilfenEl);
      aktion = () => {
        if (wahl.size !== 3) { meldung(r.rueck, 'hinweis', def.rueck.kernDrei, ''); return; }
        const falsch = def.aussagen.filter((a) => wahl.has(a.id) && !a.beide);
        if (!falsch.length) {
          e.kern = [...wahl];
          for (const b of liste.children) { b.disabled = true; if (wahl.has(b.dataset.id)) b.classList.add('richtig'); }
          geschafft(r, def.rueck.kernFertig); return;
        }
        fehl++;
        meldung(r.rueck, 'falsch', 'Noch nicht.', falsch.map((a) => a.nur).join(' '));
        if (fehl >= MAX) {
          for (const b of liste.children) { b.disabled = true; const a = def.aussagen.find((x) => x.id === b.dataset.id); b.classList.toggle('gewaehlt', false); if (a.beide) b.classList.add('richtig'); }
          loesungZeigen(r, 'kern', def.loesung.kern);
          e.kern = def.aussagen.filter((a) => a.beide).map((a) => a.id); e.schritt++; sichere();
          r.h.aus(); pruefen.hidden = true; weiter.hidden = false; aktion = null;
          return;
        }
        r.h.freigeben();
      };
    };

    // --- Schritt 3: Haltung begründen ---
    const merkmale = () => {
      const r = rahmen('merkmale');
      const liste = el('div', 'stuecke');
      const wahl = {}; const fest = {}; let fehl = 0;
      const auswahl = def.merkmalStuecke ? def.merkmalStuecke.map(stueck) : def.stuecke;
      for (const s of auswahl) {
        wahl[s.id] = new Set();
        const box = el('div', 'stueck'); box.dataset.id = s.id;
        box.append(el('p', 'zeitungstext', `<small>${esc(blattName(s.blatt))}</small> ${esc(s.text)}`));
        const reihe = el('div', 'wahl chips');
        for (const m of def.merkmale) {
          const k = el('button', '', esc(m.text)); k.dataset.m = m.id; k.setAttribute('aria-pressed', 'false');
          k.addEventListener('click', () => {
            if (fest[s.id]) return;
            const w = wahl[s.id]; if (w.has(m.id)) w.delete(m.id); else w.add(m.id);
            k.classList.toggle('an', w.has(m.id)); k.setAttribute('aria-pressed', String(w.has(m.id)));
          });
          reihe.append(k);
        }
        box.append(reihe, el('p', 'klein stueckrueck'));
        liste.append(box);
      }
      f.inhalt.append(liste, r.rueck, r.hilfenEl);
      aktion = () => {
        let alle = true;
        for (const box of liste.children) {
          const s = stueck(box.dataset.id), n = box.querySelector('.stueckrueck'), w = wahl[s.id];
          if (fest[s.id]) continue;
          const abwegig = [...w].filter((m) => s.merkmale.abwegig[m]);
          const treffer = [...w].filter((m) => s.merkmale.richtig.includes(m));
          if (!w.size) { alle = false; n.textContent = '• ' + def.rueck.merkmaleLeer; }
          else if (abwegig.length) { alle = false; n.textContent = '✗ ' + abwegig.map((m) => s.merkmale.abwegig[m]).join(' '); }
          else if (!treffer.length) { alle = false; n.textContent = '✗ ' + def.rueck.merkmaleFehlt + ' ' + s.hinweis; }
          else { fest[s.id] = true; box.classList.add('fest'); n.textContent = '✓ passt'; for (const b of box.querySelectorAll('button')) b.disabled = true; }
        }
        if (alle) { e.merkmale = Object.fromEntries(Object.entries(wahl).map(([k, v]) => [k, [...v]])); geschafft(r, def.rueck.merkmaleFertig); return; }
        fehl++;
        meldung(r.rueck, 'falsch', 'Noch nicht bei allen Stücken.', '');
        if (fehl >= MAX) {
          for (const box of liste.children) {
            const s = stueck(box.dataset.id);
            if (!fest[s.id]) { wahl[s.id] = new Set(s.merkmale.richtig); box.querySelector('.stueckrueck').textContent = 'Lösung: ' + s.merkmale.richtig.map((m) => def.merkmale.find((x) => x.id === m).text).join(', '); }
            for (const b of box.querySelectorAll('button')) { b.disabled = true; b.classList.toggle('an', wahl[s.id].has(b.dataset.m)); }
          }
          loesungZeigen(r, 'merkmale', 'Die passenden Merkmale stehen jetzt unter jedem Stück.');
          e.merkmale = Object.fromEntries(Object.entries(wahl).map(([k, v]) => [k, [...v]])); e.schritt++; sichere();
          r.h.aus(); pruefen.hidden = true; weiter.hidden = false; aktion = null;
          return;
        }
        r.h.freigeben();
      };
    };

    // --- Schritt 4: Notiz ---
    const notiz = () => {
      const r = rahmen('notiz', def.notiz.frage);
      const t = el('textarea'); t.value = e.notiz || ''; t.maxLength = 600; t.setAttribute('aria-label', def.notiz.frage);
      f.inhalt.append(t, el('p', 'klein', esc(def.notiz.hinweis)), r.rueck);
      pruefen.textContent = 'Notiz sichern';
      aktion = () => {
        const text = t.value.trim();
        if (text.length < def.notiz.min) { meldung(r.rueck, 'hinweis', def.notiz.zuKurz, ''); return; }
        e.notiz = text; e.schritt = 4; e.fertig = true; sichere();
        f.schliessen(true);
      };
      if (!ui.touch) t.focus();
    };

    const zeige = () => {
      pruefen.textContent = 'Prüfen';
      [zuordnen, kern, merkmale, notiz][Math.min(e.schritt, 3)]();
      f.inhalt.scrollTop = 0;
    };
    zeige();
  });
}

// Zeilen für „Notizen kopieren“
export function zeitungenText(def, e) {
  if (!e || !e.notiz) return [];
  const ns = (e.nichtSelbst || []).length ? ` (Lösung gezeigt bei: ${e.nichtSelbst.join(', ')})` : '';
  return ['', `ZWEI ZEITUNGEN: ${def.blaetter.A.name} und ${def.blaetter.B.name}${ns}`, def.notiz.frage, e.notiz];
}
