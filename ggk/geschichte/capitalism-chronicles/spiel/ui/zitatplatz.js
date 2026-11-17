// Zitatplatz: zeigt eine These Werner Plumpes als gekennzeichnete Paraphrase oder als belegtes Zitat mit Seite.
// Die Einträge stehen in chapters/kapitel-2/zitate-plumpe.json. Plumpes Wortlaut wird nie bearbeitet.
import { el, esc } from './oberflaeche.js';

const saetze = (t) => (t.match(/[^.!?]+[.!?]+/g) || [t]).length;

// Prüft die Einträge beim Laden: Ein Zitat mit mehr als zwei Sätzen oder ohne Seite fällt auf die Paraphrase zurück.
export function pruefeZitate(liste) {
  for (const z of liste) {
    if (z.status === 'zitat' && (!z.zitat || !z.seite || saetze(z.zitat) > 2)) {
      console.warn(`Zitatplatz ${z.id}: Zitat ohne Seite oder länger als zwei Sätze – es wird die Paraphrase gezeigt.`);
      z.status = 'paraphrase';
    }
  }
  return liste;
}

export function zitatplatz(ui, liste, id, knopf = 'Weiter') {
  const z = liste.find((x) => x.id === id);
  if (!z || z.status === 'fehlt') return Promise.resolve(false);
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: z.titel || 'Werner Plumpe', schliessbar: false, kopf: el('div', '', ui.markeHtml('position')), beiSchliessen: () => fertig(true) });
    const glossar = (z.glossar || []).length ? `<div class="glossar"><b>Worterklärungen</b>${z.glossar.map((g) => `<p><i>${esc(g.wort)}:</i> ${esc(g.text)}</p>`).join('')}</div>` : '';
    f.inhalt.innerHTML = z.status === 'zitat'
      ? `<blockquote class="plumpe">„${esc(z.zitat)}“</blockquote><p class="quelle">Werner Plumpe: Das kalte Herz. Kapitalismus: die Geschichte einer andauernden Revolution. Rowohlt Berlin 2019, S. ${esc(z.seite)}.</p>${glossar}`
      : `<p class="paraphrase"><b>Plumpe argumentiert sinngemäß:</b> ${esc(z.paraphrase)}</p><p class="quelle">Zusammenfassung in eigenen Worten nach: ${esc(z.quelleParaphrase)}. Kein wörtliches Zitat.</p>${glossar}`;
    f.inhalt.insertAdjacentHTML('beforeend', `<p class="klein">Das ist die Position eines Historikers, keine unbestrittene Tatsache. ${esc(z.einordnung || '')}</p>`);
    const b = el('button', 'knopf', esc(knopf));
    b.addEventListener('click', () => f.schliessen());
    f.fuss.append(b);
  });
}
