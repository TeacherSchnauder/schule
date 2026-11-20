// Station 1 – Die Stadt. Kerngedanke: Industrialisierung und Urbanisierung teilen Manchester in zwei Städte.
// Die Infopunkte am Weg sind die Hinweise; am Fabriktor wird Bilanz gezogen.
import { zuordnung, auswahl2, notiz } from '../../../ui/raetsel.js';

export const FERTIG1 = 1;
export const SPERRE1 = 3.5;   // Meter vor dem Ende der Straße am Fabriktor

export class Station1 {
  constructor(spiel, ui, daten, aussen) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.aussen = aussen;
    this.t = daten.station1; this.laeuft = false;
  }
  get s() { return this.spiel.stand.s1; }
  get gefunden() { const tb = this.spiel.stand.tagebuch; return this.daten.infopunkte.filter((i) => tb.includes(i.eintrag)).length; }
  get bereit() { return this.gefunden >= this.t.mindestens; }
  eintrag(id) { return this.daten.tagebuch.find((e) => e.id === id); }
  ort() { const p = this.aussen.pfad; return p.punkt(p.laenge - SPERRE1); }

  start() {
    const { spiel } = this;
    spiel.registriere({
      id: 'bilanz1', szene: 'aussen', pos: () => this.ort(), radius: 3.2, hoehe: 2.2, text: 'Mit Engels Bilanz ziehen',
      wenn: () => spiel.ort.pfad === 'a' && spiel.ort.art === 'schiene' && this.s < FERTIG1 && this.bereit,
      tu: async () => { if (this.laeuft) return; this.laeuft = true; try { await this.bilanz(); } finally { this.laeuft = false; } },
    });
  }

  // Nach jedem neu entdeckten Infopunkt
  nachInfo() {
    if (this.s < FERTIG1 && this.gefunden === this.t.mindestens && !this.spiel.stand.gesehen.genug1) {
      this.spiel.stand.gesehen.genug1 = true;
      setTimeout(() => this.ui.kommentar(this.daten.dialoge.genug1), 600);
    }
  }

  aktualisiere() {
    const { spiel, aussen } = this, z = this.t.ziele;
    if (this.bereit) { const o = this.ort(); return spiel.setzeZiel(z.bilanz, { x: o.x, y: 3.0, z: o.z }, 'aussen'); }
    const tb = spiel.stand.tagebuch;
    const offen = this.daten.infopunkte.find((i) => !tb.includes(i.eintrag));
    const p = aussen.infoOrte[offen.id];
    spiel.setzeZiel(z.suchen.replace('{n}', this.gefunden), { x: p.x, y: 2.8, z: p.z }, 'aussen');
  }

  async bilanz() {
    const { ui, spiel } = this, t = this.t, dlg = this.daten.dialoge;
    await ui.dialog(dlg.bilanz1);
    if (!(await zuordnung(ui, t.ordnen))) return;
    ui.schalteFrei('b_industrialisierung', 'd_zweistaedte');
    const d = this.eintrag('d_zweistaedte');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    await ui.dialog(dlg.nachOrdnen1);
    await this.schnipsel?.('F');
    if (!(await auswahl2(ui, t.denkpause, spiel.stand.auswahl2))) return;
    ui.schalteFrei('b_quellenkritik');
    const text = await notiz(ui, t.denkpause.notiz, spiel.stand.notizen.s1_denkpause || '');
    if (text === null) return;
    spiel.stand.notizen.s1_denkpause = text;
    if (!spiel.stand.funde.includes(1)) spiel.stand.funde.push(1);
    ui.setzeSiegel();
    ui.schalteFrei('f_zweistaedte');
    const f = this.eintrag('f_zweistaedte');
    await ui.karte({ titel: 'Fund gesichert: Zwei Städte in einer', marke: f.marke, text: f.text, knopf: 'Siegel setzen' });
    await ui.dialog(dlg.ende1);
    spiel.stand.s1 = FERTIG1; spiel.sichere(); this.nachher?.();
  }
}
