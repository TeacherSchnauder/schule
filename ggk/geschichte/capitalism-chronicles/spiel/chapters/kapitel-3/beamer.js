// Kapitel III – Beamer-Ansicht für das Tribunal im Plenum (kapitel-3.html?beamer). Läuft ohne 3D-Welt am Gerät der Lehrkraft.
// Es werden keine Daten zwischen Geräten übertragen; gespeichert werden nur die eigenen Eingaben auf diesem Gerät.
import { zeitreiheSvg, hatWerte } from '../../ui/statistik.js';

const SCHLUESSEL = 'capitalism-chronicles-kapitel-3-beamer-v1';
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const FELDER = ['Wohlstandsmotor', 'eher Wohlstandsmotor', 'unentschieden', 'eher Problem', 'gesellschaftliches Problem'];
const TIPPS = [['ja', 'Tritt ein'], ['teils', 'Tritt teilweise ein'], ['nein', 'Tritt nicht ein']];

// Phasen des Tribunals: min = Minuten der Uhr (null = ohne Uhr), kurz = Minuten in der Kurzfassung
export const PHASEN = [
  { id: 'vorher', name: 'Meinungslinie vorher', min: null },
  { id: 'anklage1', name: 'Eröffnung der Anklage', min: 3, rolle: 'anklage' },
  { id: 'verteidigung1', name: 'Eröffnung der Verteidigung', min: 3, rolle: 'verteidigung' },
  { id: 'gutachten', name: 'Gutachten der Sachverständigen und Zeitkapsel', min: 4, rolle: 'sachverstaendige' },
  { id: 'kreuz', name: 'Kreuzbefragung', min: 8, kurz: 4 },
  { id: 'anklage2', name: 'Schlussplädoyer der Anklage', min: 2, rolle: 'anklage' },
  { id: 'verteidigung2', name: 'Schlussplädoyer der Verteidigung', min: 2, rolle: 'verteidigung' },
  { id: 'beratung', name: 'Beratung der Jury', min: 3, rolle: 'jury' },
  { id: 'urteil', name: 'Urteil der Jury', min: null, rolle: 'jury' },
  { id: 'nachher', name: 'Meinungslinie nachher', min: null },
  { id: 'tafel', name: 'Tafelbild: Es kommt darauf an …', min: null },
];

const leer = () => ({ phase: 0, kurz: false, vorher: [0, 0, 0, 0, 0], nachher: [0, 0, 0, 0, 0], tipps: { p1: [0, 0, 0], p2: [0, 0, 0], p3: [0, 0, 0] }, urteil: { form: '', text: '', bausteine: [false, false, false, false] }, tafel: { motor: '', problem: '', zeit: '', verteilung: '', staat: '', gegenwart: '' } });
export function ladeBeamer() { try { const d = JSON.parse(window.localStorage.getItem(SCHLUESSEL) || 'null'); return d ? { ...leer(), ...d } : leer(); } catch (e) { return leer(); } }
const sichere = (z) => { try { window.localStorage.setItem(SCHLUESSEL, JSON.stringify(z)); } catch (e) { /* nur bis zum Schließen */ } };

// Ergebnis des Tribunals als Text (für „Ergebnis kopieren“)
export function ergebnisText(z, daten) {
  const linie = (a) => FELDER.map((f, i) => `${f}: ${a[i]}`).join(' · ');
  const form = daten.urteilsformen.find((u) => u.id === z.urteil.form);
  return ['THE CAPITALISM CHRONICLES – Kapitel III: Ergebnis des Tribunals', '',
    'MEINUNGSLINIE VORHER', linie(z.vorher), '', 'MEINUNGSLINIE NACHHER', linie(z.nachher), '',
    'ZEITKAPSEL: TIPPS DER KLASSE', ...daten.prognosen.map((p) => `${p.titel} ${TIPPS.map(([, n], i) => `${n}: ${z.tipps[p.id][i]}`).join(' · ')}`), '',
    'URTEIL DER JURY', form ? `${form.name}: ${form.satz}` : '(keine Form gewählt)', z.urteil.text || '(keine Begründung eingetragen)',
    `Bausteine: ${daten.bausteine.map((b, i) => `${b.split(':')[0]} ${z.urteil.bausteine[i] ? 'ja' : 'nein'}`).join(' · ')}`, '',
    'TAFELBILD', 'Wohlstandsmotor: ' + z.tafel.motor, 'Gesellschaftliches Problem: ' + z.tafel.problem, 'Es kommt darauf an …',
    '  Zeitraum: ' + z.tafel.zeit, '  Verteilung: ' + z.tafel.verteilung, '  Rolle des Staates: ' + z.tafel.staat, '  Gegenwartsfall: ' + z.tafel.gegenwart].join('\n');
}

export async function starteBeamer(ziel) {
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('../../ui/beamer.css', import.meta.url).href; document.head.append(css);
  document.title = 'The Capitalism Chronicles – Tribunal (Beamer)';
  const lade = async (n) => (await fetch(new URL('./' + n, import.meta.url))).json();
  const [daten, statistiken] = await Promise.all([lade('inhalte.json'), lade('statistiken.json')]);
  const z = ladeBeamer();
  const B = document.createElement('div'); B.id = 'beamer'; ziel.append(B);
  B.innerHTML = `<header><div class="phase"></div><div class="uhr" hidden><b></b><button data-a="uhr">Start</button><button data-a="neu">↺</button></div>
      <nav><button data-a="zurueck">← Zurück</button><button data-a="weiter" class="haupt">Weiter →</button></nav></header>
    <main></main>
    <footer><div class="beweise"></div><div class="rechts"><button data-a="kurz"></button><button data-a="kopieren">Ergebnis kopieren</button><button data-a="neueklasse">Neue Klasse</button></div></footer>
    <div class="gross" hidden></div>`;
  const q = (s) => B.querySelector(s);
  const main = q('main'), uhrEl = q('.uhr'), gross = q('.gross');
  const rolle = (id) => daten.rollen.find((r) => r.id === id);

  // ---------------------------------------------------------------- Uhr
  let rest = 0, laeuft = false, takt = null;
  const minuten = (p) => (z.kurz && p.kurz ? p.kurz : p.min);
  const zeigeUhr = () => { const m = Math.floor(rest / 60), s = rest % 60; uhrEl.querySelector('b').textContent = rest > 0 ? `${m}:${String(s).padStart(2, '0')}` : 'Zeit'; uhrEl.classList.toggle('um', rest <= 0); uhrEl.querySelector('[data-a=uhr]').textContent = laeuft ? 'Pause' : 'Start'; };
  const stoppe = () => { laeuft = false; clearInterval(takt); takt = null; };
  const setzeUhr = (p) => { stoppe(); const m = minuten(p); uhrEl.hidden = !m; rest = (m || 0) * 60; zeigeUhr(); };
  const schalteUhr = () => { if (laeuft) stoppe(); else if (rest > 0) { laeuft = true; takt = setInterval(() => { rest = Math.max(0, rest - 1); if (rest === 0) stoppe(); zeigeUhr(); }, 1000); } zeigeUhr(); };

  // ---------------------------------------------------------------- Bühne je Phase
  const zahlen = (name, werte, beschr) => `<div class="zahlen" data-feld="${name}">${beschr.map((b, i) => `<label><span>${esc(b)}</span><input type="number" min="0" max="40" inputmode="numeric" value="${werte[i]}" data-i="${i}"></label>`).join('')}</div>`;
  const balken = (titel, a) => { const max = Math.max(1, ...a); return `<div class="linie"><h3>${esc(titel)}</h3>${a.map((v, i) => `<div class="b"><span>${esc(FELDER[i])}</span><i style="width:${(v / max) * 100}%"></i><b>${v}</b></div>`).join('')}</div>`; };
  const BUEHNE = {
    vorher: () => `<h1>Ist der Kapitalismus ein Wohlstandsmotor oder ein gesellschaftliches Problem?</h1><p class="hinweis">Stellt euch auf der Linie auf. Die Lehrkraft trägt ein, wie viele in jedem Feld stehen.</p>${zahlen('vorher', z.vorher, FELDER)}`,
    rede: (p) => { const r = rolle(p.rolle); return `<div class="rede" style="--rf:${r.farbe}"><small>Das Wort hat</small><h1>${esc(r.name)}</h1><p>${esc(r.abgabe)}</p></div><p class="hinweis">Lest von eurer Karte zum Vorlesen. Beweisstücke zeigt die Lehrkraft auf Zuruf über die Leiste unten.</p>`; },
    gutachten: () => `<h2>Die Zeitkapsel: drei Prognosen von Marx</h2><div class="kapsel">${daten.prognosen.map((p, i) => `<div><h3>${i + 1}. ${esc(p.titel)}</h3><p><b>Befund:</b> ${esc(p.befund)}</p><p><b>Gegenbefund:</b> ${esc(p.gegenbefund)}</p><p class="klein">Tipps der Klasse heute (Handzeichen):</p>${zahlen('tipps.' + p.id, z.tipps[p.id], TIPPS.map((t) => t[1]))}</div>`).join('')}</div>`,
    kreuz: () => `<h2>Kreuzbefragung</h2><ol class="ablauf"><li>Die <b>Anklage</b> befragt die Verteidigung.</li><li>Die <b>Verteidigung</b> befragt die Anklage.</li><li>Beide dürfen die <b>Sachverständigen</b> befragen.</li><li>Die <b>Jury</b> stellt ihre vorbereiteten Fragen.</li></ol><p class="hinweis">Regel: eine Frage, eine Antwort, dann die nächste Frage. Wer eine Zahl nennt, nennt die Quelle.</p>`,
    beratung: () => `<h2>Die Jury berät</h2><div class="zweispalten"><div><h3>Mögliche Kriterien</h3><ul>${daten.kriterien.map((k) => `<li>${esc(k)}</li>`).join('')}</ul></div><div><h3>Fünf Urteilsformen (gleichrangig)</h3>${daten.urteilsformen.map((u) => `<p class="uf"><b>${esc(u.name)}:</b> ${esc(u.satz)}</p>`).join('')}<p class="klein">Jedes Urteil braucht: ${daten.bausteine.map((b) => esc(b.split(':')[0])).join(' · ')}</p></div></div>`,
    urteil: () => `<h2>Das Urteil der Jury</h2><div class="urteil"><div class="formen">${daten.urteilsformen.map((u) => `<button data-form="${u.id}" class="${z.urteil.form === u.id ? 'an' : ''}"><b>${esc(u.name)}</b><span>${esc(u.satz)}</span></button>`).join('')}</div>
      <div class="muss">${(() => { const u = daten.urteilsformen.find((x) => x.id === z.urteil.form); return u ? `<b>Muss begründen:</b> ${esc(u.mussBegruenden)} <b>Muss den Einwand beantworten:</b> ${esc(u.einwand)}` : 'Die Jury wählt eine Form oder formuliert eine eigene. Keine Form ist „richtig“; bewertet wird die Begründung.'; })()}</div>
      <textarea data-text="urteil.text" placeholder="Begründung der Jury in Stichpunkten">${esc(z.urteil.text)}</textarea>
      <div class="pruefliste">${daten.bausteine.map((b, i) => `<label><input type="checkbox" data-baustein="${i}" ${z.urteil.bausteine[i] ? 'checked' : ''}> ${esc(b)}</label>`).join('')}</div></div>`,
    nachher: () => `<h2>Meinungslinie nachher</h2><p class="hinweis">Stellt euch noch einmal auf. Hat sich etwas verschoben?</p>${zahlen('nachher', z.nachher, FELDER)}<div class="vergleich">${balken('Vorher', z.vorher)}${balken('Nachher', z.nachher)}</div>`,
    tafel: () => `<h2>Tafelbild</h2><div class="tafelbild"><label><span>Wohlstandsmotor</span><textarea data-text="tafel.motor">${esc(z.tafel.motor)}</textarea></label><label><span>Gesellschaftliches Problem</span><textarea data-text="tafel.problem">${esc(z.tafel.problem)}</textarea></label>
      <div class="darauf"><h3>Es kommt darauf an …</h3>${[['zeit', 'Zeitraum: kurz- oder langfristig?'], ['verteilung', 'Verteilung: Wer gewinnt, wer verliert?'], ['staat', 'Rolle des Staates und der Regeln?'], ['gegenwart', 'Was zeigt der Gegenwartsfall?']].map(([k, n]) => `<label><span>${n}</span><input type="text" data-text="tafel.${k}" value="${esc(z.tafel[k])}"></label>`).join('')}</div></div><p class="hinweis">Die dritte Zeile ist ein Befund über die Debatte. Sie ist kein Urteil, das alle übernehmen müssen.</p>`,
  };
  const zeige = () => {
    const p = PHASEN[z.phase];
    q('.phase').innerHTML = `<small>${z.phase + 1} / ${PHASEN.length}${z.kurz ? ' · Kurzfassung' : ''}</small><b>${esc(p.name)}</b>`;
    main.innerHTML = (BUEHNE[p.id] || BUEHNE.rede)(p);
    main.dataset.phase = p.id;
    q('[data-a=zurueck]').disabled = z.phase === 0; q('[data-a=weiter]').disabled = z.phase === PHASEN.length - 1;
    q('[data-a=kurz]').textContent = z.kurz ? 'Kurzfassung: an' : 'Kurzfassung: aus';
    setzeUhr(p); sichere(z);
  };

  // ---------------------------------------------------------------- Eingaben
  const setze = (pfad, wert) => { const t = pfad.split('.'); let o = z; while (t.length > 1) o = o[t.shift()]; o[t[0]] = wert; sichere(z); };
  main.addEventListener('input', (e) => {
    const t = e.target;
    if (t.dataset.text) setze(t.dataset.text, t.value);
    else if (t.dataset.baustein) { z.urteil.bausteine[+t.dataset.baustein] = t.checked; sichere(z); }
    else if (t.closest('.zahlen')) {
      const feld = t.closest('.zahlen').dataset.feld, i = +t.dataset.i, v = Math.max(0, Math.min(99, parseInt(t.value, 10) || 0));
      const a = feld.startsWith('tipps.') ? z.tipps[feld.slice(6)] : z[feld]; a[i] = v; sichere(z);
      if (feld === 'nachher') main.querySelector('.vergleich').innerHTML = balken('Vorher', z.vorher) + balken('Nachher', z.nachher);
    }
  });
  main.addEventListener('click', (e) => { const b = e.target.closest('[data-form]'); if (b) { z.urteil.form = z.urteil.form === b.dataset.form ? '' : b.dataset.form; const text = main.querySelector('textarea').value; z.urteil.text = text; zeige(); } });

  // ---------------------------------------------------------------- Beweisleiste: Beweisstücke und Statistiken groß zeigen
  const leiste = q('.beweise');
  const stats = statistiken.statistiken.filter(hatWerte);
  leiste.innerHTML = daten.beweise.map((b) => `<button data-beweis="${b.id}" title="${esc(b.titel)}"><i>${b.fach}</i>${esc(b.titel)}</button>`).join('') + stats.map((s) => `<button data-stat="${s.id}" class="stat">${esc(s.titel)}</button>`).join('');
  const zeigeGross = (html) => { gross.innerHTML = `<div class="blatt">${html}<button data-a="zu">Schließen (Esc)</button></div>`; gross.hidden = false; };
  leiste.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.beweis) { const x = daten.beweise.find((y) => y.id === b.dataset.beweis); zeigeGross(`<small>Beweisstück ${x.fach} · ${esc(x.herkunft)} · Marke: ${esc(daten.marken[x.marke].name)}</small><h1>${esc(x.titel)}</h1><p>${esc(x.text)}</p><p><b>Was es nicht zeigt:</b> ${esc(x.zeigtNicht)}</p>`); }
    else { const s = stats.find((y) => y.id === b.dataset.stat); zeigeGross(`<small>Statistik · ${esc(s.einheit)}</small><h1>${esc(s.titel)}</h1>${zeitreiheSvg(s)}<p>${esc(s.lesehilfe)}</p><p class="klein">Quelle: ${esc(s.quelle)} · Stand: ${esc(s.stand)}</p>`); }
  });
  gross.addEventListener('click', (e) => { if (e.target === gross || e.target.dataset.a === 'zu') gross.hidden = true; });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') gross.hidden = true; });

  // ---------------------------------------------------------------- Knöpfe
  B.addEventListener('click', async (e) => {
    const a = e.target.closest('header button, footer .rechts button')?.dataset.a; if (!a) return;
    if (a === 'weiter' && z.phase < PHASEN.length - 1) { z.phase++; zeige(); }
    else if (a === 'zurueck' && z.phase > 0) { z.phase--; zeige(); }
    else if (a === 'uhr') schalteUhr();
    else if (a === 'neu') setzeUhr(PHASEN[z.phase]);
    else if (a === 'kurz') { z.kurz = !z.kurz; zeige(); }
    else if (a === 'kopieren') {
      const text = ergebnisText(z, daten), b = e.target;
      try { await navigator.clipboard.writeText(text); b.textContent = 'Kopiert'; setTimeout(() => { b.textContent = 'Ergebnis kopieren'; }, 1800); }
      catch (err) { zeigeGross(`<h1>Ergebnis</h1><p class="klein">Automatisches Kopieren ist hier nicht möglich. Markiert den Text und kopiert ihn von Hand.</p><textarea readonly class="ergebnis">${esc(text)}</textarea>`); }
    } else if (a === 'neueklasse') {
      const b = e.target;
      if (!b.dataset.sicher) { b.dataset.sicher = '1'; b.textContent = 'Wirklich alles leeren?'; setTimeout(() => { delete b.dataset.sicher; b.textContent = 'Neue Klasse'; }, 4000); return; }
      Object.assign(z, leer()); delete b.dataset.sicher; b.textContent = 'Neue Klasse'; zeige();
    }
  });
  zeige();
  window.__beamer = { z, zeige, PHASEN, ergebnis: () => ergebnisText(z, daten), uhr: () => ({ rest, laeuft }) };
}
