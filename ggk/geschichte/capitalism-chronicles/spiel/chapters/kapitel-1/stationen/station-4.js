// Station 4 – Das Arbeiterviertel. Kerngedanke: Das Elend ist belegt, die Ursache ist strittig (System oder fehlende Regeln).
import { rechenblatt, zuordnung, auswahl, notiz } from '../../../ui/raetsel.js';

export const FERTIG4 = 7;
const HOF = ['h_pumpe', 'h_abort', 'h_fluss'], WOHNUNG = ['w_ellen', 'w_betten', 'w_wand', 'w_eimer'];

export class Station4 {
  constructor(spiel, ui, daten, aussen, keller) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.nord = aussen.nord; this.keller = keller;
    this.t = daten.station4; this.laeuft = false;
  }
  get s() { return this.spiel.stand.s4; }
  setze(n) { this.spiel.stand.s4 = n; this.spiel.sichere(); this.nachher(); }
  eintrag(id) { return this.daten.tagebuch.find((e) => e.id === id); }
  zahl(liste) { const g = this.spiel.stand.gesehen; return liste.filter((k) => g[k]).length; }

  start() {
    const { spiel, nord, keller } = this, h = nord.hof, p = keller.punkte;
    const einmal = (fn) => async () => { if (this.laeuft) return; this.laeuft = true; try { await fn(); } finally { this.laeuft = false; } };
    const reg = (id, szene, pos, text, wenn, tu, radius = 2.0, hoehe = 1.8) => spiel.registriere({ id, szene, pos, text, wenn, tu: einmal(tu), radius, hoehe });
    const imHof = () => spiel.ort.bereich === 'irkhof';

    reg('h_pumpe', 'aussen', h.pumpe, 'Pumpe ansehen', imHof, () => this.hofpunkt('h_pumpe', 's_pumpe'), 2.4);
    reg('h_abort', 'aussen', h.abort, 'Verschlag ansehen', imHof, () => this.hofpunkt('h_abort', 's_abort'), 2.2);
    reg('h_fluss', 'aussen', h.fluss, 'Über die Mauer blicken', () => imHof() && (this.s < 2 || this.s >= FERTIG4), () => this.hofpunkt('h_fluss', 's_irk'), 2.0);
    reg('keller-aussen', 'aussen', h.keller, 'In den Keller steigen', () => imHof() && this.s >= 1,
      async () => { await spiel.wechsleSzene('keller', 'keller', p.eintritt.x, p.eintritt.z, p.eintritt.ry); this.nachher(); }, 2.2, 1.6);
    reg('keller-innen', 'keller', p.tuer, 'Zum Hof', () => true,
      async () => { await spiel.wechsleSzene('aussen', 'irkhof', h.keller.x + 1.7, h.keller.z, Math.PI / 2); this.nachher(); }, 1.5, 2.0);
    reg('w_ellen', 'keller', p.ellen, 'Ellen ansprechen', () => true, () => this.ellen(), 1.7);
    reg('w_betten', 'keller', p.betten, 'Betten ansehen', () => true, () => this.ding('w_betten', 'betten'), 1.4, 1.2);
    reg('w_wand', 'keller', p.wand, 'Wand untersuchen', () => true, () => this.ding('w_wand', 'wand'), 1.4, 1.3);
    reg('w_eimer', 'keller', p.eimer, 'Eimer ansehen', () => true, () => this.ding('w_eimer', 'eimer'), 1.2, 0.9);
    const texte = { 2: 'Chadwicks Bericht lesen', 3: 'Tabelle weiter prüfen', 4: 'Ursachen ordnen', 5: 'Engels und Chadwick vergleichen', 6: 'Nachdenken' };
    reg('lesen', 'aussen', h.lesen, texte[this.s] || 'Lesen', () => imHof() && this.s >= 2 && this.s < FERTIG4,
      () => [this.tabelle, this.statistik, this.ursachen, this.vergleich, this.denkpause][this.s - 2].call(this), 2.0);
  }

  aktualisiere() {
    const { spiel, nord, keller } = this, z = this.t.ziele, h = nord.hof, p = keller.punkte, s = this.s, g = spiel.stand.gesehen;
    const hoch = (v, y) => ({ x: v.x, y, z: v.z });
    if (s >= FERTIG4) return spiel.setzeZiel(z.fertig, null);
    if (spiel.szeneName === 'keller') {
      if (s === 1) {
        const offen = WOHNUNG.find((k) => !g[k]);
        spiel.setzeZiel(z.wohnung.replace('{n}', this.zahl(WOHNUNG)), hoch(p[offen.slice(2)], 1.9), 'keller');
      } else spiel.setzeZiel(z.raus, hoch(p.tuer, 2.2), 'keller');
      return;
    }
    if (spiel.szeneName !== 'aussen') return spiel.setzeZiel(this.daten.station3.ziele.fertig, null);
    if (spiel.ort.bereich !== 'irkhof') return spiel.setzeZiel(z.weg, hoch(nord.hof.pumpe, 3.2), 'aussen');
    if (s === 0) {
      const offen = HOF.find((k) => !g[k]);
      spiel.setzeZiel(z.hof.replace('{n}', this.zahl(HOF)), hoch(h[offen.slice(2)], 2.6), 'aussen');
    } else if (s === 1) spiel.setzeZiel(z.keller, hoch(h.keller, 2.4), 'aussen');
    else spiel.setzeZiel([z.lesen, z.lesen, z.ursachen, z.vergleich, z.vergleich][s - 2], hoch(h.lesen, 2.5), 'aussen');
  }

  async hofpunkt(id, eintrag) {
    const { ui, spiel } = this, e = this.eintrag(eintrag);
    await ui.karte({ titel: e.titel, marke: e.marke, zitat: e.zitat, text: e.text, quelle: e.quelle, knopf: spiel.stand.tagebuch.includes(e.id) ? 'Weiter' : 'Ins Tagebuch' });
    ui.schalteFrei(e.id);
    spiel.stand.gesehen[id] = true;
    if (this.s === 0 && this.zahl(HOF) === 3) { await ui.dialog(this.daten.dialoge.nachHof); await this.schnipsel?.('B'); this.setze(1); }
    else this.nachher();
  }

  async pruefeWohnung() {
    const { ui } = this;
    if (this.s !== 1 || this.zahl(WOHNUNG) < 4) return this.nachher();
    const d = this.eintrag('d_wohnung');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    ui.schalteFrei('d_wohnung');
    await ui.dialog(this.daten.dialoge.nachWohnung);
    this.setze(2); this.start();
  }

  async ellen() {
    const { ui, spiel, keller } = this, g = spiel.stand.gesehen;
    if (g.w_ellen) return ui.kommentar(this.daten.dialoge.ellenKurz, 3500);
    keller.blickZu(spiel.pos);
    await ui.dialog(this.daten.dialoge.ellen1);
    keller.blickZu(null);
    ui.schalteFrei('p_ellen', 'p_tom');
    ui.gibBeleg('beleg_geruecht');
    g.w_ellen = true;
    return this.pruefeWohnung();
  }

  async ding(id, zeile) {
    await this.ui.dialog([this.daten.dialoge[zeile]]);
    this.spiel.stand.gesehen[id] = true;
    return this.pruefeWohnung();
  }

  async tabelle() {
    const { ui } = this, d = this.eintrag('d_chadwick');
    await ui.karte({ titel: d.titel, marke: d.marke, text: 'Der Beamte Edwin Chadwick ließ für die Regierung auswerten, in welchem Alter die Menschen im Durchschnitt starben. Angaben in Jahren.', tabelle: this.t.tabelle, quelle: 'Edwin Chadwick: Report on the Sanitary Condition of the Labouring Population of Great Britain (1842)' });
    const ok = await rechenblatt(ui, this.t.rechnen);
    if (!ok) return;
    ui.schalteFrei('d_chadwick');
    await ui.dialog(this.daten.dialoge.nachTabelle);
    await this.schnipsel?.('E');
    this.setze(3); this.start();
  }

  async statistik() {
    const { ui } = this;
    await ui.karte({ titel: 'Chadwicks Tabelle (1842)', marke: 'tatsache', text: 'Durchschnittliches Sterbealter in Jahren.', tabelle: this.t.tabelle });
    if (!(await auswahl(ui, this.t.rutland))) return;
    if (!(await auswahl(ui, this.t.durchschnitt))) return;
    ui.schalteFrei('b_durchschnitt');
    ui.gibBeleg('beleg_chadwick');
    this.setze(4); this.start();
  }

  async ursachen() {
    const { ui } = this;
    if (!(await zuordnung(ui, this.t.ursachen))) return;
    ui.schalteFrei('b_ursachen', 'd_miasma');
    await ui.dialog(this.daten.dialoge.nachUrsachen);
    this.setze(5); this.start();
  }

  async vergleich() {
    const { ui } = this;
    if (!(await zuordnung(ui, this.t.vergleich))) return;
    ui.schalteFrei('b_reform', 'd_publichealth');
    const d = this.eintrag('d_publichealth');
    await ui.karte({ titel: d.titel, marke: d.marke, text: d.text, quelle: d.quelle });
    this.setze(6); this.start();
    this.laeuft = false;
    return this.denkpause();
  }

  async denkpause() {
    const { ui, spiel } = this, t = this.t.denkpause;
    if (!(await auswahl(ui, t))) return;
    const text = await notiz(ui, t.notiz, spiel.stand.notizen.s4_denkpause || '');
    if (text === null) return;
    spiel.stand.notizen.s4_denkpause = text;
    if (!spiel.stand.funde.includes(4)) spiel.stand.funde.push(4);
    ui.setzeSiegel();
    ui.schalteFrei('f_verelendung');
    const f = this.eintrag('f_verelendung');
    await ui.karte({ titel: 'Fund gesichert: Verelendung, Ursache strittig', marke: f.marke, text: f.text, knopf: 'Siegel setzen' });
    await ui.dialog(this.daten.dialoge.ende4);
    this.setze(FERTIG4);
    await ui.karte({ ...this.t.abschluss, knopf: 'Zurück in den Hof' });
  }
}
