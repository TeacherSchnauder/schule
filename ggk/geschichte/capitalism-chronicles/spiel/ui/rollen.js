// Rollenwahl: vier gleich große Karten in neutralen Rollenfarben, dazu die Wahl der Spielfigur.
import { el, esc } from './oberflaeche.js';

// rollen: [{ id, name, farbe, auftrag, abgabe }] · Ergebnis: { rolle, figur }
export function waehleRolle(ui, rollen, { titel = 'Welche Rolle übernimmt eure Gruppe?', figuren = [['studentin', 'Studentin'], ['student', 'Student']], vorgabe = null } = {}) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel, klasse: 'breit', schliessbar: false, beiSchliessen: (w) => fertig(w) });
    f.inhalt.append(el('p', 'auftrag', 'Eure Lehrkraft hat die Rollen verteilt. Alle Geräte einer Gruppe wählen dieselbe Rolle.'));
    const raster = el('div', 'rollenwahl');
    let rolle = vorgabe?.rolle || null, figur = vorgabe?.figur || figuren[0][0];
    const ok = el('button', 'knopf', 'Rolle übernehmen'); ok.disabled = !rolle;
    for (const r of rollen) {
      const b = el('button', 'rolle' + (rolle === r.id ? ' an' : ''), `<b>${esc(r.name)}</b><span>${esc(r.auftrag)}</span><small>Am Ende: ${esc(r.abgabe)}</small>`);
      b.style.setProperty('--rf', r.farbe); b.dataset.rolle = r.id;
      b.addEventListener('click', () => { rolle = r.id; [...raster.children].forEach((x) => x.classList.toggle('an', x === b)); ok.disabled = false; });
      raster.append(b);
    }
    const wahl = el('div', 'wahl figurwahl');
    for (const [id, name] of figuren) {
      const b = el('button', figur === id ? 'an' : '', esc(name));
      b.addEventListener('click', () => { figur = id; [...wahl.children].forEach((x) => x.classList.toggle('an', x === b)); });
      wahl.append(b);
    }
    f.inhalt.append(raster, el('p', 'klein', 'Eure Spielfigur:'), wahl);
    ok.addEventListener('click', () => f.schliessen({ rolle, figur }));
    f.fuss.append(ok);
  });
}
