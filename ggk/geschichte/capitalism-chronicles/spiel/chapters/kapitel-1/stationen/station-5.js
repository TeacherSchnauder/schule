// Station 5 – Die Versammlung. Kerngedanke: Anklage mit Belegen, Streitgespräch, Prognosen in der Zeitkapsel.
import { el, esc, tabelleHtml } from '../../../ui/oberflaeche.js';
import { zuordnung, auswahl } from '../../../ui/raetsel.js';

export const FERTIG5 = 4;

export class Station5 {
  constructor(spiel, ui, daten, aussen, feld) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.nord = aussen.nord; this.feld = feld;
    this.t = daten.station5; this.laeuft = false;
    this.briefFertig = () => true;   // wird von kapitel.js gesetzt
    // schon hier festlegen: aktualisiere() kann vor start() aufgerufen werden (Weiterspielen im Hof am Irk)
    this.aufbruchOrt = { x: this.nord.hof.eintritt.x - 0.6, y: 0, z: this.nord.hof.eintritt.z };
  }
  get s() { return this.spiel.stand.s5; }
  setze(n) { this.spiel.stand.s5 = n; this.spiel.sichere(); this.nachher?.(); }
  eintrag(id) { return this.daten.tagebuch.find((e) => e.id === id); }
  get hofFertig() { return this.spiel.stand.s4 >= this.hofSchwelle; }

  start(hofSchwelle) {
    this.hofSchwelle = hofSchwelle;
    const { spiel, feld, nord } = this, p = feld.punkte;
    feld.setzeGrimshaw(this.s >= 2);
    const einmal = (fn) => async () => { if (this.laeuft) return; this.laeuft = true; try { await fn(); } finally { this.laeuft = false; } };
    const reg = (id, szene, pos, text, wenn, tu, radius = 2.2, hoehe = 1.9) => spiel.registriere({ id, szene, pos, text, wenn, tu: einmal(tu), radius, hoehe });
    reg('aufbruch', 'aussen', this.aufbruchOrt, 'Zur Versammlung aufbrechen', () => spiel.ort.bereich === 'irkhof' && this.hofFertig && this.briefFertig(), () => this.aufbruch(), 2.6);
    reg('holt', 'feld', p.holt, 'Mr. Holt ansprechen', () => true,
      () => (this.s === 0 ? this.holt() : this.ui.kommentar(this.daten.dialoge.holtKurz, 3500)), 2.4, 3.1);
    reg('tribuene', 'feld', p.tribuene, 'Anklageschrift zusammenstellen', () => this.s === 1, () => this.anklage(), 2.0);
    reg('grimshaw', 'feld', p.grimshaw, 'Mr. Grimshaw antworten', () => this.s === 2, () => this.streit(), 2.4);
    reg('kapsel', 'feld', p.kapsel, 'Zeitkapsel', () => this.s === 3, () => this.kapsel(), 2.2);
    reg('ende5', 'feld', p.kapsel, 'Notizen kopieren', () => this.s >= FERTIG5, () => this.schluss(), 2.2);
  }

  aktualisiere() {
    const { spiel, feld } = this, z = this.t.ziele, p = feld.punkte, s = this.s;
    const hoch = (v, y) => ({ x: v.x, y, z: v.z });
    if (spiel.szeneName !== 'feld') return spiel.setzeZiel(this.briefFertig() ? z.hof : z.brief, hoch(this.aufbruchOrt, 2.6), 'aussen');
    const ziele = [[z.holt, hoch(p.holt, 3.6)], [z.anklage, hoch(p.tribuene, 2.6)], [z.grimshaw, hoch(p.grimshaw, 2.7)], [z.kapsel, hoch(p.kapsel, 2.6)], [z.fertig, null]];
    const [text, pos] = ziele[Math.min(s, FERTIG5)];
    spiel.setzeZiel(text, pos, 'feld');
  }

  async aufbruch() {
    const { spiel, ui, feld } = this, p = feld.punkte;
    await ui.dialog(this.daten.dialoge.aufbruch);
    await spiel.wechsleSzene('feld', 'feld', p.eintritt.x, p.eintritt.z, p.eintritt.ry);
    this.nachher?.();
    if (!spiel.stand.gesehen.feld) { spiel.stand.gesehen.feld = true; ui.kommentar(this.daten.dialoge.feld); }
  }

  async holt() {
    const { ui, feld, spiel } = this;
    feld.blickZu('holt', spiel.pos);
    await ui.dialog(this.daten.dialoge.holt1);
    feld.blickZu('holt', null);
    ui.schalteFrei('p_holt', 's_charter', 'b_klassen', 'd_klassenkampf');
    const d = this.eintrag('d_klassenkampf');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    this.setze(1);
  }

  async anklage() {
    const { ui, feld } = this;
    if (!(await zuordnung(ui, this.t.anklage))) return;
    feld.setzeGrimshaw(true);
    await ui.dialog(this.daten.dialoge.nachAnklage);
    ui.schalteFrei('p_grimshaw');
    this.setze(2);
  }

  async streit() {
    const { ui, feld, spiel } = this;
    feld.blickZu('grimshaw', spiel.pos);
    const ok = await this.duell();
    feld.blickZu('grimshaw', null);
    if (!ok) return;
    ui.schalteFrei('d_senior');
    ui.gibBeleg('beleg_senior');
    const d = this.eintrag('d_senior');
    await ui.karte({ titel: d.titel, marke: d.marke, text: d.text, quelle: d.quelle });
    await ui.dialog(this.daten.dialoge.nachDuell);
    this.setze(3);
  }

  // Endgegner: fünf Einwände; widerlegen oder einräumen. Falsche und pauschale Antworten kosten Zustimmung.
  duell() {
    const { ui } = this, t = this.t.duell, MAX = 6, START = 3;
    return new Promise((fertig) => {
      const f = ui.fenster({ titel: t.titel, klasse: 'breit', beiSchliessen: (w) => fertig(w === true) });
      const meter = el('div', 'zustimmung');
      const auftrag = el('p', 'auftrag', esc(t.einleitung));
      const einwand = el('blockquote', 'einwand');
      const liste = el('div', 'optionen');
      const rueck = el('div', 'rueck');
      f.inhalt.append(meter, auftrag, einwand, liste, rueck);
      const weiter = el('button', 'knopf', 'Nächster Einwand'); weiter.hidden = true;
      const neu = el('button', 'knopf', 'Noch einmal'); neu.hidden = true;
      const links = el('div', 'links'); const zahl = el('span', 'klein'); links.append(zahl);
      f.fuss.append(links, neu, weiter);
      let i = 0, z = START;
      const zeigeMeter = () => { meter.innerHTML = `<span>${esc(t.zustimmung)}</span>` + Array.from({ length: MAX }, (_, k) => `<i class="${k < z ? 'an' : ''}"></i>`).join(''); };
      const zeige = () => {
        const e = t.einwaende[i];
        zahl.textContent = `Einwand ${i + 1} von ${t.einwaende.length}`;
        einwand.innerHTML = `<b>Grimshaw:</b> „${esc(e.text)}“`;
        liste.innerHTML = ''; rueck.className = 'rueck'; rueck.textContent = '';
        weiter.hidden = true; neu.hidden = true; zeigeMeter();
        for (const o of e.optionen) {
          const b = el('button', 'option', esc(o.text));
          b.addEventListener('click', () => {
            if (b.disabled) return;
            if (o.richtig) {
              z = Math.min(MAX, z + 1);
              b.classList.add('richtig');
              liste.querySelectorAll('button').forEach((x) => (x.disabled = true));
              rueck.className = 'rueck richtig'; rueck.textContent = o.rueck;
              if (i === t.einwaende.length - 1) { rueck.textContent += ' ' + t.sieg; weiter.textContent = 'Weiter'; }
              weiter.hidden = false;
            } else {
              z -= 1; b.classList.add('falsch'); b.disabled = true;
              rueck.className = 'rueck falsch'; rueck.textContent = o.rueck;
              if (z <= 0) {
                rueck.textContent = o.rueck + ' ' + t.niederlage;
                liste.querySelectorAll('button').forEach((x) => (x.disabled = true));
                neu.hidden = false;
              }
            }
            zeigeMeter();
          });
          liste.append(b);
        }
      };
      weiter.addEventListener('click', () => { if (i < t.einwaende.length - 1) { i++; zeige(); } else f.schliessen(true); });
      neu.addEventListener('click', () => { i = 0; z = START; weiter.textContent = 'Nächster Einwand'; zeige(); });
      zeige();
    });
  }

  async kapsel() {
    const { ui, spiel } = this, t = this.t;
    await ui.dialog(this.daten.dialoge.kapsel);
    const a = this.eintrag('d_allen');
    await ui.karte({ titel: a.titel, marke: a.marke, text: a.text, tabelle: t.tabelle, quelle: a.quelle });
    if (!(await auswahl(ui, t.diagnose))) return;
    ui.schalteFrei('d_allen', 'd_prognosen');
    const p = this.eintrag('d_prognosen');
    await ui.karte({ titel: p.titel, marke: p.marke, text: p.text, quelle: p.quelle });
    const tipps = await this.tippen();
    if (!tipps) return;
    spiel.stand.zeitkapsel = { ...tipps, versiegelt: true };
    const name = Object.fromEntries(t.kapsel.tipps);
    spiel.stand.notizen.s5_zeitkapsel = t.kapsel.prognosen.map((x) => `${x.titel} Euer Tipp: ${name[tipps[x.id]]}`).join('\n');
    if (!spiel.stand.funde.includes(5)) spiel.stand.funde.push(5);
    ui.setzeSiegel();
    ui.schalteFrei('f_anklage');
    const f = this.eintrag('f_anklage');
    await ui.karte({ titel: 'Fund gesichert: Die Anklageschrift', marke: f.marke, text: f.text, knopf: 'Siegel setzen' });
    await ui.dialog(this.daten.dialoge.ende5);
    this.setze(FERTIG5);
    this.laeuft = false;
    return this.schluss();
  }

  tippen() {
    const { ui } = this, k = this.t.kapsel;
    return new Promise((fertig) => {
      const f = ui.fenster({ titel: k.titel, klasse: 'breit', beiSchliessen: (w) => fertig(w && typeof w === 'object' ? w : null) });
      f.inhalt.append(el('p', 'auftrag', esc(k.einleitung)));
      const wahl = {};
      const rueck = el('div', 'rueck');
      for (const p of k.prognosen) {
        const box = el('div', 'prognose', `<b>${esc(p.titel)}</b><small>${esc(p.text)}</small>`);
        const reihe = el('div', 'wahl');
        for (const [id, text] of k.tipps) {
          const b = el('button', '', esc(text));
          b.addEventListener('click', () => { wahl[p.id] = id; reihe.querySelectorAll('button').forEach((x) => x.classList.toggle('an', x === b)); rueck.textContent = ''; });
          reihe.append(b);
        }
        box.append(reihe); f.inhalt.append(box);
      }
      f.inhalt.append(rueck);
      const ok = el('button', 'knopf', esc(k.knopf));
      f.fuss.append(el('div', 'links', '<span class="klein">Danach lassen sich die Tipps nicht mehr ändern.</span>'), ok);
      ok.addEventListener('click', () => {
        if (k.prognosen.some((p) => !wahl[p.id])) { rueck.className = 'rueck falsch'; rueck.textContent = k.fehlt; return; }
        f.schliessen({ ...wahl });
      });
    });
  }

  schluss() {
    const { ui } = this, e = this.t.ende;
    return new Promise((fertig) => {
      const f = ui.fenster({ titel: e.titel, beiSchliessen: () => fertig() });
      f.inhalt.innerHTML = e.text.split('\n').map((x) => `<p>${esc(x)}</p>`).join('');
      const kopieren = el('button', 'knopf still', 'Notizen kopieren');
      kopieren.addEventListener('click', () => ui.kopiere(ui.notizenText(), kopieren));
      const zu = el('button', 'knopf', 'Schließen');
      zu.addEventListener('click', () => f.schliessen());
      f.fuss.append(el('div', 'links'), kopieren, zu);
    });
  }
}
