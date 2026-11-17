// Kapitel II – Epilog im Hörsaal: Bilanz der drei Prognosen, Plumpes Fazit und Kritiker, neue Tipps, Notizen.
import { el, esc } from '../../../ui/oberflaeche.js';
import { neueTipps } from './kapsel.js';

function bilanz(ui, liste) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Bilanz: drei Prognosen, 1845 bis 1957', klasse: 'breit', beiSchliessen: (w) => fertig(w === true) });
    let i = 0;
    const weiter = el('button', 'knopf', 'Nächste Prognose');
    f.fuss.append(weiter);
    const zeige = () => {
      const p = liste[i];
      f.inhalt.insertAdjacentHTML('beforeend', `<h3 class="zw">${esc(p.titel)}</h3><div class="bilanz">
        <div><b>Befund ${ui.markeHtml('tatsache')}</b>${esc(p.befund)}</div>
        <div><b>Gegenbefund ${ui.markeHtml('tatsache')}</b>${esc(p.gegenbefund)}</div>
        <div><b>Kontroverse ${ui.markeHtml('kontroverse')}</b>${esc(p.kontroverse)}</div></div>`);
      f.inhalt.lastElementChild.scrollIntoView({ block: 'nearest' });
      if (i === liste.length - 1) weiter.textContent = 'Weiter';
    };
    weiter.addEventListener('click', () => { if (i < liste.length - 1) { i++; zeige(); } else f.schliessen(true); });
    zeige();
  });
}

function schluss(k) {
  const { ui, daten, st } = k;
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Ende von Kapitel II', schliessbar: false, beiSchliessen: () => fertig() });
    f.inhalt.innerHTML = `<p>Ihr habt die Verteidigung gehört: 85 Jahre Lancashire mit Werner Plumpe und das Jahr 1948 mit der Freiburger Schule.</p>
      <div class="tabelle"><table><thead><tr><th>Prognose</th><th>Tipp 1845</th><th>Tipp heute</th></tr></thead><tbody>
      ${daten.kapsel.prognosen.map((p) => `<tr><td>${esc(p.titel)}</td><td>${esc(k.tippText(st().tippsKapitel1?.[p.id]))}</td><td>${esc(k.tippText(st().tippsNeu?.[p.id]))}</td></tr>`).join('')}</tbody></table></div>
      <p>Kopiert jetzt eure Notizen. Ihr braucht sie im Tribunal (Kapitel III): Dort entscheidet ihr über die Leitfrage.</p>`;
    const kopieren = el('button', 'knopf still', 'Notizen kopieren');
    kopieren.addEventListener('click', () => ui.kopiere(ui.notizenText(), kopieren));
    const ok = el('button', 'knopf', 'Schließen');
    ok.addEventListener('click', () => f.schliessen());
    const links = el('div', 'links'); links.append(kopieren);
    f.fuss.append(links, ok);
  });
}

export function stationEpilog(k) {
  const { ui, daten, st, szenen } = k;
  const H = szenen.hoersaal.punkte;
  return {
    id: 'e',
    schritte: [
      { szene: 'hoersaal', pos: H.tafel, text: 'Die Bilanz ansehen', tu: async () => { if (!await bilanz(ui, daten.bilanz)) return false; } },
      {
        szene: 'hoersaal', pos: H.imhof, text: 'Mit Dr. Imhof sprechen', tu: async () => {
          await k.sag('e_plumpe');
          await k.zitat('P5'); await k.zitat('P6'); await k.zitat('P7');
          await k.zeige('d_hayek'); await k.zeige('d_abelshauser');
          await k.sag('e_kritik'); ui.schalteFrei('d_kritiker');
        },
      },
      {
        szene: 'hoersaal', pos: H.pult, text: 'Neue Tipps abgeben', tu: async () => {
          const t = await neueTipps(k);
          if (!t) return false;
          st().tippsNeu = t;
          st().notizen.tipps_neu = daten.kapsel.prognosen.map((p) => `${p.titel} 1845: ${k.tippText(st().tippsKapitel1?.[p.id])} → heute: ${k.tippText(t[p.id])}`).join('\n');
          k.zeigeHoersaal();
          await k.sag('e_ende');
          await schluss(k);
        },
      },
    ],
  };
}
