// Zeugenbefragung: Fragen wählen, Antwort lesen, Aussagen in die Akte übernehmen.
// zeuge: { id, name, marke, intro, fragen: [{ id, frage, antwort, zahl?, unbequem?, akte }] }
// zahlen: Nachschlagewerk { id: { text, quelle, hinweis } } für Antworten, die eine belegte Zahl nennen.
// Ergebnis: { gestellt: [Frage-IDs], akte: [Einträge] }; erledigt ist die Befragung ab min Fragen und einem Akteneintrag.
import { el, esc } from './oberflaeche.js';

export function befragung(ui, zeuge, { zahlen = {}, min = 3, bild = '', vorher = [], zuerst = null, kapitel = 3 } = {}) {
  return new Promise((fertig) => {
    const gestellt = new Set(vorher), akte = [];
    const f = ui.fenster({ titel: `Befragung: ${zeuge.name}`, klasse: 'breit', beiSchliessen: () => fertig({ gestellt: [...gestellt], akte, erledigt: gestellt.size >= Math.min(min, zeuge.fragen.length) && (akte.length > 0 || vorher.length > 0) }) });
    const kopf = el('div', 'zeugenkopf', `${bild ? `<img alt="" src="${bild}">` : ''}<p>${esc(zeuge.intro)} ${ui.markeHtml(zeuge.marke || 'erfunden')}</p>`);
    const raster = el('div', 'befragung');
    const liste = el('div', 'fragen'), antwort = el('div', 'antwort', '<p class="klein">Wählt eine Frage.</p>');
    raster.append(liste, antwort);
    const stand = el('p', 'klein');
    f.inhalt.append(kopf, raster, stand);
    const zeigeStand = () => { stand.textContent = `${gestellt.size} von mindestens ${Math.min(min, zeuge.fragen.length)} Fragen gestellt · ${akte.length} Aussagen in der Akte`; fertigKnopf.textContent = gestellt.size >= Math.min(min, zeuge.fragen.length) && akte.length ? 'Befragung beenden' : 'Später fortsetzen'; };
    const fertigKnopf = el('button', 'knopf', 'Später fortsetzen');
    fertigKnopf.addEventListener('click', () => f.schliessen());
    f.fuss.append(fertigKnopf);
    const fragen = zuerst ? [...zeuge.fragen].sort((a, c) => (c.id === zuerst) - (a.id === zuerst)) : zeuge.fragen;
    for (const q of fragen) {
      const b = el('button', 'option' + (gestellt.has(q.id) ? ' gestellt' : ''), esc(q.frage) + (q.unbequem ? ' <em>unbequeme Frage</em>' : ''));
      b.dataset.frage = q.id;
      b.addEventListener('click', () => {
        gestellt.add(q.id); b.classList.add('gestellt');
        [...liste.children].forEach((x) => x.classList.toggle('gewaehlt', x === b));
        const z = q.zahl ? zahlen[q.zahl] : null;
        antwort.innerHTML = `<blockquote>${esc(q.antwort)}</blockquote>` + (z ? `<p class="quelle">${ui.markeHtml(z.marke || 'tatsache')} ${esc(z.text)}${z.hinweis ? ' · ' + esc(z.hinweis) : ''}${z.quelle ? ' · Quelle: ' + esc(z.quelle) : ''}</p>` : '');
        const id = `zeuge_${zeuge.id}_${q.id}`;
        const a = el('button', 'knopf still', akte.some((x) => x.id === id) ? 'In der Akte' : 'In die Akte');
        a.disabled = akte.some((x) => x.id === id);
        a.dataset.akte = '1';
        a.addEventListener('click', () => { akte.push({ id, titel: `Aussage: ${zeuge.name.split(',')[0]}`, text: q.akte || q.antwort, kapitel: q.kapitel || zeuge.kapitel || kapitel, marke: z ? 'tatsache' : zeuge.marke || 'erfunden', quelle: z ? z.quelle : 'Zeugenaussage (erfunden)' }); a.disabled = true; a.textContent = 'In der Akte'; zeigeStand(); });
        antwort.append(a);
        zeigeStand();
      });
      liste.append(b);
    }
    zeigeStand();
  });
}
