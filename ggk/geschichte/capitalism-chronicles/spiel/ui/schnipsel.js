// Der zerrissene Brief: Lücken mit Fachbegriffen füllen, Schnipsel nach der Argumentationslogik ordnen,
// einen fremden Schnipsel aussortieren. Geprüft wird nicht eine feste Reihenfolge, sondern Regeln
// (A steht vorn, C vor R …). Jede Reihenfolge, die alle Regeln erfüllt, ist richtig.
import { el, esc } from './oberflaeche.js';

// ---------------------------------------------------------------- Wörter prüfen
const norm = (s) => String(s).toLowerCase().trim()
  .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
  .replace(/[^a-z]/g, '');

function abstand(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

// Ergebnis: { ok: true, genau: bool } oder { ok: false, text }
export function pruefeWort(eingabe, l) {
  const e = norm(eingabe);
  if (!e) return { ok: false, leer: true };
  const ziele = l.akzeptiert.map(norm);
  if (ziele.includes(e)) return { ok: true, genau: true };
  if (l.fast && l.fast[e]) return { ok: false, text: l.fast[e] };
  // kleine Tippfehler gelten: ein Fehler bei kurzen, zwei bei langen Wörtern
  if (ziele.some((z) => abstand(e, z) <= (z.length >= 8 ? 2 : 1))) return { ok: true, genau: false };
  return { ok: false, text: l.sonst };
}

// ---------------------------------------------------------------- Reihenfolge prüfen
// brief: Liste der Schnipsel-IDs in den Plätzen (null = leer); ablage: ID oder null.
// Ergebnis: { ok: true } oder { ok: false, text }
export function pruefeBrief(def, brief, ablage) {
  const o = def.ordnen;
  if (brief.includes(def.fremd)) return { ok: false, text: o.fremdImBrief, fremd: true };
  if (brief.some((x) => !x) || ablage !== def.fremd) return { ok: false, text: o.unvollstaendig };
  const pos = (id) => brief.indexOf(id);
  for (const r of def.regeln) {
    let ok = true;
    if (r.art === 'erst') ok = pos(r.id) === 0;
    else if (r.art === 'letzt') ok = pos(r.id) === brief.length - 1;
    else if (r.art === 'vor') ok = pos(r.a) < pos(r.b);
    else if (r.art === 'nachbar') ok = pos(r.id) === pos(r.a) + 1 || pos(r.id) === pos(r.b) - 1;
    if (!ok) return { ok: false, text: r.text, regel: r };
  }
  return { ok: true };
}

// Schnipseltext als HTML: Lücken als Linie oder mit dem gefundenen Wort.
export function schnipselHtml(def, id, woerter = {}) {
  return esc(def.schnipsel[id]).replace(/\{(\d)\}/g, (m, n) => (woerter[n] ? `<b class="wort">${esc(woerter[n])}</b>` : '<span class="linie">______</span>'));
}

// Fertiger Brieftext (für Notizen), mit eingesetzten Wörtern.
export function briefText(def, reihenfolge, woerter) {
  return reihenfolge.map((id) => def.schnipsel[id].replace(/\{(\d)\}/g, (m, n) => woerter[n] || '______')).join('\n');
}

const DREH = [-1.6, 1.1, -0.7, 1.7, -1.2, 0.6, -0.4, 1.3];
const huelle = (inner, i, klasse = '') => {
  const h = el('div', 'schnipselhuelle ' + klasse);
  h.style.setProperty('--dreh', `${DREH[i % DREH.length]}deg`);
  h.append(inner);
  return h;
};

// ---------------------------------------------------------------- Teil 1: Lücken
// zustand.woerter wird gefüllt; sichere() speichert. Ergebnis: true oder false (abgebrochen).
export function lueckenFuellen(ui, def, zustand, sichere) {
  const t = def.luecken_phase;
  return new Promise((fertig) => {
    const kopf = el('div', '', ui.markeHtml('nachbildung'));
    const f = ui.fenster({ titel: t.titel, klasse: 'breit', kopf, beiSchliessen: (w) => fertig(w === true) });
    f.inhalt.append(el('p', 'auftrag', esc(t.einleitung)));
    const weiter = el('button', 'knopf', 'Weiter zum Brief'); weiter.hidden = true;
    const pruefen = el('button', 'knopf', 'Prüfen');
    f.fuss.append(el('div', 'links'), pruefen, weiter);
    weiter.addEventListener('click', () => f.schliessen(true));
    const felder = [];
    const nrs = Object.keys(def.luecken);
    nrs.forEach((nr, i) => {
      const l = def.luecken[nr];
      const s = el('div', 'schnipsel');
      const teile = def.schnipsel[l.schnipsel].split(`{${nr}}`);
      const input = el('input', 'luecke'); input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
      input.setAttribute('autocapitalize', 'off'); input.setAttribute('aria-label', `Fehlendes Wort ${i + 1}`);
      s.append(document.createTextNode(teile[0].replace(/\{\d\}/g, '______')), input, document.createTextNode((teile[1] || '').replace(/\{\d\}/g, '______')));
      const rueck = el('div', 'rueck');
      const wahl = el('div', 'wahl lueckenwahl'); wahl.hidden = true;
      const block = el('div', 'lueckenblock');
      block.append(huelle(s, i), rueck, wahl);
      f.inhalt.append(block);
      const fd = { nr, l, input, rueck, wahl, fehler: 0, geloest: false };
      felder.push(fd);
      if (zustand.woerter[nr]) loese(fd, zustand.woerter[nr], true);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); pruefeAlle(); } });
    });

    function loese(fd, wort, still = false) {
      fd.geloest = true;
      fd.input.value = wort; fd.input.disabled = true; fd.input.classList.add('richtig');
      fd.wahl.hidden = true;
      if (!still) { zustand.woerter[fd.nr] = wort; sichere(); }
      if (felder.length === nrs.length && felder.every((x) => x.geloest)) { pruefen.hidden = true; weiter.hidden = false; }
    }

    function zeigeWahl(fd) {
      if (!fd.wahl.hidden) return;
      fd.wahl.hidden = false;
      fd.wahl.innerHTML = `<span class="klein">${esc(t.auswahlHinweis)}</span>`;
      for (const w of fd.l.auswahl) {
        const b = el('button', '', esc(w));
        b.addEventListener('click', () => {
          if (fd.geloest) return;
          const r = pruefeWort(w, fd.l);
          if (r.ok) { fd.rueck.className = 'rueck richtig'; fd.rueck.textContent = t.richtig; loese(fd, fd.l.loesung); }
          else { b.disabled = true; fd.rueck.className = 'rueck falsch'; fd.rueck.textContent = r.text; }
        });
        fd.wahl.append(b);
      }
    }

    function pruefeAlle() {
      for (const fd of felder) {
        if (fd.geloest) continue;
        const r = pruefeWort(fd.input.value, fd.l);
        if (r.ok) {
          fd.rueck.className = 'rueck richtig';
          fd.rueck.textContent = r.genau ? t.richtig : t.schreibweise.replace('{w}', fd.l.loesung);
          loese(fd, fd.l.loesung);
        } else {
          fd.rueck.className = 'rueck falsch';
          fd.rueck.textContent = r.leer ? t.leer : r.text;
          if (!r.leer) { fd.fehler++; if (fd.fehler >= 2) zeigeWahl(fd); }
        }
      }
    }
    pruefen.addEventListener('click', pruefeAlle);
    if (felder.every((x) => x.geloest)) { pruefen.hidden = true; weiter.hidden = false; }
    else if (!ui.touch) felder.find((x) => !x.geloest).input.focus();
  });
}

// ---------------------------------------------------------------- Teil 2: Ordnen
// Ergebnis: Reihenfolge (Liste der IDs) oder null (abgebrochen).
export function briefOrdnen(ui, def, woerter) {
  const t = def.ordnen;
  const plaetze = def.anzahl - 1;
  return new Promise((fertig) => {
    const kopf = el('div', '', ui.markeHtml('nachbildung'));
    const f = ui.fenster({ titel: t.titel, klasse: 'voll briefordnen', kopf, beiSchliessen: (w) => fertig(Array.isArray(w) ? w : null) });
    f.inhalt.append(el('p', 'auftrag', `${esc(t.einleitung)} <span class="klein">${esc(t.bedienung)}</span>`));
    const raster = el('div', 'briefraster');
    const stapel = el('div', 'stapel'), bogen = el('div', 'bogen');
    raster.append(stapel, bogen);
    f.inhalt.append(raster);
    // Rückmeldung und Hinweis stehen fest über den Knöpfen, damit sie die Schnipsel nicht verdrängen
    const meldung = el('div', 'briefmeldung');
    const rueck = el('div', 'rueck');
    const hilfenEl = el('div', 'hilfen');
    meldung.append(rueck, hilfenEl);
    f.el.insertBefore(meldung, f.fuss);

    // Hinweise gibt es erst nach dem ersten Prüfen: Zuerst sollen die Spielenden selbst ordnen.
    let n = 0, geprueft = false;
    const hinweis = el('button', 'knopf still');
    const hinweisText = () => {
      hinweis.disabled = !geprueft || n >= t.hilfen.length;
      hinweis.textContent = !geprueft ? t.hinweisGesperrt : n >= t.hilfen.length ? 'Alle Hinweise gezeigt' : `Hinweis (${n + 1} von ${t.hilfen.length})`;
    };
    hinweisText();
    hinweis.addEventListener('click', () => {
      if (!geprueft || n >= t.hilfen.length) return;
      hilfenEl.innerHTML = '';   // nur der jeweils neueste Hinweis
      rueck.className = 'rueck'; rueck.textContent = '';   // die alte Fehlermeldung macht dem Hinweis Platz
      hilfenEl.append(el('div', 'rueck hilfe', `<b>Hinweis ${n + 1}:</b> ${esc(t.hilfen[n]).replace(/\n/g, '<br>')}`)); n++;
      hinweisText();
    });
    const pruefen = el('button', 'knopf', 'Brief prüfen');
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    const links = el('div', 'links'); links.append(hinweis);
    f.fuss.append(links, pruefen, weiter);

    // Zustand: wo liegt welcher Schnipsel? 'stapel', 'ablage' oder Platznummer
    const lage = Object.fromEntries(def.stapel.map((id) => [id, 'stapel']));
    let wahl = null, geloest = false;
    const brief = () => Array.from({ length: plaetze }, (_, i) => Object.keys(lage).find((id) => lage[id] === i) || null);
    const ablage = () => Object.keys(lage).find((id) => lage[id] === 'ablage') || null;

    const karte = (id) => {
      const b = el('button', 'schnipsel', schnipselHtml(def, id, woerter));
      b.dataset.id = id;
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        if (geloest) return;
        if (wahl && wahl !== id && lage[id] !== 'stapel') { lege(wahl, lage[id]); return; }   // auf belegten Platz tippen = tauschen
        wahl = wahl === id ? null : id;
        zeichne();
      });
      return huelle(b, def.stapel.indexOf(id), wahl === id ? 'gewaehlt' : '');
    };

    function lege(id, ziel) {
      const alt = lage[id];
      const belegt = Object.keys(lage).find((x) => x !== id && lage[x] === ziel && ziel !== 'stapel');
      if (belegt) lage[belegt] = alt;   // Tausch: der verdrängte Schnipsel nimmt den alten Platz ein
      lage[id] = ziel;
      wahl = null;
      rueck.className = 'rueck'; rueck.textContent = '';
      zeichne();
    }

    function platz(ziel, inhaltId, beschriftung, klasse) {
      const p = el('div', 'platz ' + klasse);
      p.append(el('span', 'nr', esc(beschriftung)));
      if (inhaltId) p.append(karte(inhaltId));
      else p.append(el('span', 'frei', wahl ? 'Hierher legen' : ''));
      p.classList.toggle('bereit', !!wahl && !geloest);
      p.addEventListener('click', () => { if (wahl && !geloest) lege(wahl, ziel); });
      return p;
    }

    function zeichne() {
      stapel.innerHTML = ''; bogen.innerHTML = '';
      const kopfS = el('div', 'spaltenkopf', 'Schnipsel');
      stapel.append(kopfS);
      const imStapel = def.stapel.filter((id) => lage[id] === 'stapel');
      for (const id of imStapel) stapel.append(karte(id));
      if (!imStapel.length) stapel.append(el('div', 'leer', 'Alle Schnipsel sind gelegt.'));
      stapel.classList.toggle('bereit', !!wahl && lage[wahl] !== 'stapel' && !geloest);
      bogen.append(el('div', 'spaltenkopf', 'Brief'));
      const b = brief();
      for (let i = 0; i < plaetze; i++) bogen.append(platz(i, b[i], String(i + 1), 'briefplatz'));
      bogen.append(platz('ablage', ablage(), 'Gehört nicht dazu', 'ablage'));
    }
    stapel.addEventListener('click', () => { if (wahl && lage[wahl] !== 'stapel' && !geloest) lege(wahl, 'stapel'); });

    pruefen.addEventListener('click', () => {
      if (!geprueft) { geprueft = true; hinweisText(); }
      const r = pruefeBrief(def, brief(), ablage());
      if (r.ok) {
        geloest = true; wahl = null; zeichne();
        const b = brief(), posB = b.indexOf('B');
        rueck.className = 'rueck richtig';
        rueck.textContent = `${t.erfolg} ${posB === 1 ? t.erfolgB2 : t.erfolgB5}`;
        pruefen.hidden = true; hinweis.hidden = true; hilfenEl.innerHTML = '';
        weiter.hidden = false;
      } else {
        rueck.className = 'rueck falsch'; rueck.textContent = r.text;
      }
    });
    weiter.addEventListener('click', () => f.schliessen(brief()));
    zeichne();
  });
}
