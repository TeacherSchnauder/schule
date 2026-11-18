// Engels' zerrissener Brief an den Vater (Nachbildung).
// Die Schnipsel sind Belohnungen in Station I–IV. Nach Station IV setzen die Spielenden den Brief zusammen:
// zwei Fachbegriffe einsetzen, nach der Argumentationslogik ordnen, den fremden Schnipsel aussortieren und begründen.
import { el, esc } from '../../../ui/oberflaeche.js';
import { auswahl } from '../../../ui/raetsel.js';
import { lueckenFuellen, briefOrdnen, schnipselHtml, briefText } from '../../../ui/schnipsel.js';

// Reihenfolge, in der die Schnipsel im Spiel vergeben werden (Station I bis IV)
export const VERGABE = ['F', 'C', 'X', 'R', 'A', 'D', 'B', 'E'];
export const BIS_STATION = { 2: ['F'], 3: ['F', 'C', 'X', 'R'], 4: ['F', 'C', 'X', 'R', 'A', 'D'] };

export const neuerBrief = () => ({ schnipsel: [], woerter: {}, reihenfolge: null, phase: 0, fertig: false });

export class Brief {
  constructor(spiel, ui, daten) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.t = daten.brief; this.laeuft = false;
  }
  get z() {
    const st = this.spiel.stand;
    if (!st.brief || typeof st.brief !== 'object') st.brief = neuerBrief();
    return st.brief;
  }
  get fertig() { return this.z.fertig === true; }

  // Ohne Anzeige (Sprünge der Lehrkraft, Testeinstieg)
  gibStill(ids) { for (const id of ids) if (!this.z.schnipsel.includes(id)) this.z.schnipsel.push(id); }

  // Belohnung in einer Station
  async gib(id) {
    const z = this.z, { ui } = this;
    if (z.schnipsel.includes(id) || z.fertig) return;
    const erst = z.schnipsel.length === 0;
    z.schnipsel.push(id);
    this.spiel.sichere();
    if (erst) await ui.dialog(this.daten.dialoge.briefErst);
    await new Promise((fertig) => {
      const kopf = el('div', '', ui.markeHtml('nachbildung'));
      const f = ui.fenster({ titel: `Briefschnipsel ${z.schnipsel.length} von ${this.t.anzahl}`, schliessbar: false, kopf, beiSchliessen: () => fertig() });
      const s = el('div', 'schnipselhuelle'); s.style.setProperty('--dreh', '-1deg');
      s.append(el('div', 'schnipsel', schnipselHtml(this.t, id, {})));
      f.inhalt.append(s);
      if (!erst) f.inhalt.append(el('p', 'klein', `<b>Engels:</b> ${esc(this.daten.dialoge.briefNoch.text)}`));
      if (erst) f.inhalt.append(el('p', 'klein', esc(this.t.nachbildung)));
      const b = el('button', 'knopf', 'Einstecken');
      b.addEventListener('click', () => f.schliessen());
      f.fuss.append(b);
      if (!ui.touch) b.focus();
    });
    ui.melde(`Briefschnipsel: <b>${z.schnipsel.length} von ${this.t.anzahl}</b>`);
  }

  inventarHtml() {
    const z = this.z, t = this.t;
    if (!z.schnipsel.length && !z.fertig) return '';
    if (z.fertig) return `<div class="beleg"><b>${esc(t.titel)}</b>${esc(t.inventarFertig)}</div>`;
    const ids = VERGABE.filter((id) => z.schnipsel.includes(id));
    return `<div class="beleg"><b>${esc(t.titel)}</b>${esc(t.inventar.replace('{n}', ids.length).replace('{m}', t.anzahl))}</div>` +
      `<div class="schnipselliste">${ids.map((id, i) => `<div class="schnipselhuelle" style="--dreh:${i % 2 ? 0.8 : -0.8}deg"><div class="schnipsel klein">${schnipselHtml(t, id, z.woerter)}</div></div>`).join('')}</div>`;
  }

  // Hintergrund: Was ist belegt, was gedeutet, was erfunden?
  zeigeInfo() {
    const { ui } = this, i = this.t.info;
    return new Promise((fertig) => {
      const f = ui.fenster({ titel: i.titel, schliessbar: false, klasse: 'breit', beiSchliessen: () => fertig() });
      for (const a of i.abschnitte) {
        f.inhalt.append(el('h4', 'infokopf', `${esc(a.kopf)} ${ui.markeHtml(a.marke)}`));
        const ul = el('ul', 'infoliste');
        for (const p of a.punkte) ul.append(el('li', '', esc(p)));
        f.inhalt.append(ul);
      }
      f.inhalt.append(el('div', 'rueck hilfe', `<b>Zum Nachdenken:</b> ${esc(i.frage)}`), el('p', 'quelle', `Quellen: ${esc(i.quelle)}`));
      const b = el('button', 'knopf', esc(i.knopf));
      b.addEventListener('click', () => f.schliessen());
      f.fuss.append(b);
      if (!ui.touch) b.focus();
    });
  }

  // Interaktion im Hof am Irk, an derselben Stelle wie der Aufbruch zur Versammlung
  start(ort, offen) {
    this.spiel.registriere({
      id: 'brief', szene: 'aussen', pos: ort, radius: 2.6, hoehe: 1.9, text: 'Engels’ Brief zusammensetzen',
      wenn: () => !this.fertig && offen(),
      tu: async () => { if (this.laeuft) return; this.laeuft = true; try { await this.zusammensetzen(); } finally { this.laeuft = false; } },
    });
  }

  async zusammensetzen() {
    const { ui, spiel, t } = this, z = this.z;
    if (z.phase === 0) {
      await ui.dialog(this.daten.dialoge.briefStart);
      const fehlt = VERGABE.filter((id) => !z.schnipsel.includes(id));
      if (fehlt.length) { this.gibStill(fehlt); await ui.dialog(this.daten.dialoge.briefNachgereicht); }
      z.phase = 1; spiel.sichere();
    }
    if (z.phase === 1) {
      if (!(await lueckenFuellen(ui, t, z, () => spiel.sichere()))) return;
      z.phase = 2; spiel.sichere();
    }
    if (z.phase === 2) {
      const r = await briefOrdnen(ui, t, z.woerter);
      if (!r) return;
      z.reihenfolge = r; z.phase = 3; spiel.sichere();
    }
    if (z.phase === 3) {
      if (!(await auswahl(ui, t.begruendung))) return;
      z.phase = 4; spiel.sichere();
    }
    // Ergebnis: der ganze Brief
    const text = briefText(t, z.reihenfolge, z.woerter);
    spiel.stand.notizen.brief = text;
    await new Promise((fertig) => {
      const kopf = el('div', '', ui.markeHtml('nachbildung'));
      const f = ui.fenster({ titel: t.ergebnis.titel, schliessbar: false, kopf, beiSchliessen: () => fertig() });
      const bogen = el('div', 'briefganz');
      for (const id of z.reihenfolge) bogen.append(el('p', '', schnipselHtml(t, id, z.woerter)));
      f.inhalt.append(bogen, el('p', 'klein', esc(t.nachbildung)));
      const b = el('button', 'knopf', esc(t.ergebnis.knopf));
      b.addEventListener('click', () => f.schliessen());
      f.fuss.append(b);
    });
    await this.zeigeInfo();
    ui.schalteFrei('d_vater');
    z.fertig = true; spiel.sichere();
    await ui.dialog(this.daten.dialoge.briefFertig);
    this.laeuft = false;
    await this.nachher?.();
  }
}
