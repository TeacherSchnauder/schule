// Station 3 – Das Kontor. Kerngedanke: Die Konkurrenz zwingt zur Akkumulation; Marx erkennt zugleich die Produktivkraft an.
import { el, esc } from '../../../ui/oberflaeche.js';
import { rechenblatt, zuordnung, auswahl, notiz, zahlText } from '../../../ui/raetsel.js';

export const FERTIG3 = 8;
const S_KONTOR = 18.5;      // Stelle der Straße vor dem Kontor

export class Station3 {
  constructor(spiel, ui, daten, aussen, kontor) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.nord = aussen.nord; this.aussen = aussen; this.kontor = kontor;
    this.t = daten.station3; this.laeuft = false;
  }
  get s() { return this.spiel.stand.s3; }
  setze(n) { this.spiel.stand.s3 = n; this.spiel.sichere(); this.nachher(); }
  eintrag(id) { return this.daten.tagebuch.find((e) => e.id === id); }
  get dok() { const g = this.spiel.stand.gesehen; return ['k_hauptbuch', 'k_preisliste', 'k_angebot'].filter((k) => g[k]).length; }

  start() {
    const { spiel, nord, kontor } = this, p = kontor.punkte;
    if (this.s >= FERTIG3) nord.oeffneTor(true);
    const einmal = (fn) => async () => { if (this.laeuft) return; this.laeuft = true; try { await fn(); } finally { this.laeuft = false; } };
    const reg = (id, szene, pos, text, wenn, tu, radius = 2.0, hoehe = 1.9) => spiel.registriere({ id, szene, pos, text, wenn, tu: einmal(tu), radius, hoehe });

    reg('kontor-aussen', 'aussen', nord.kontorTuer, 'Kontor betreten', () => spiel.ort.pfad === 'b' && spiel.ort.art === 'schiene',
      async () => { await spiel.wechsleSzene('kontor', 'kontor', p.eintritt.x, p.eintritt.z, p.eintritt.ry); this.nachher(); }, 4.6, 2.3);
    reg('kontor-innen', 'kontor', p.tuer, 'Zur Straße', () => true, async () => {
      spiel.sperre(); await this.ui.blende(true);
      spiel.aktiviereSzene('aussen'); spiel.aufStrasse(S_KONTOR, false, true, 'b'); spiel._kamera(0.016); spiel.sichere();
      await this.ui.blende(false); spiel.entsperre(); this.nachher();
    }, 1.7, 2.2);
    reg('pym', 'kontor', p.pym, 'Mr. Pym ansprechen', () => true,
      () => (this.s === 0 ? this.pym() : this.s === 3 ? this.ordnen() : this.ui.kommentar(this.daten.dialoge.pymKurz, 3500)), 1.9);
    const dok = (id, eintrag, pos, text) => reg(id, 'kontor', pos, text, () => this.s >= 1, () => this.dokument(id, eintrag), 1.7);
    dok('k_hauptbuch', 'd_hauptbuch', p.hauptbuch, this.s === 2 ? 'Am Stehpult rechnen' : 'Hauptbuch lesen');
    dok('k_preisliste', 'd_preisliste', p.preisliste, 'Preisliste lesen');
    dok('k_angebot', 'd_angebot', p.angebot, 'Angebot lesen');
    reg('whitlow-k', 'kontor', p.whitlow, 'Mr. Whitlow ansprechen', () => this.s === 4, () => this.jahre(), 2.0);
    reg('tresor', 'kontor', p.tresor, 'Kassenschrank ansehen', () => this.s === 5, () => this.kreislauf(), 1.8);
    reg('fenster', 'kontor', p.fenster, 'Ans Fenster treten', () => this.s === 6 || this.s === 7, () => (this.s === 6 ? this.fenster() : this.denkpause()), 1.8);
  }

  aktualisiere() {
    const { spiel, kontor, nord, aussen } = this, z = this.t.ziele, p = kontor.punkte, s = this.s;
    const hoch = (v, y) => ({ x: v.x, y, z: v.z });
    if (spiel.szeneName === 'kontor') {
      const ziele = [[z.pym, p.pym], [z.dokumente.replace('{n}', this.dok), null], [z.rechnen, p.hauptbuch], [z.ordnen, p.pym], [z.jahre, p.whitlow], [z.kreislauf, p.tresor], [z.fenster, p.fenster], [z.fenster, p.fenster], [z.fertig, p.tuer]];
      const [text, pos] = ziele[Math.min(s, FERTIG3)];
      let ort = pos;
      if (s === 1) { const g = spiel.stand.gesehen; ort = !g.k_hauptbuch ? p.hauptbuch : !g.k_preisliste ? p.preisliste : p.angebot; }
      spiel.setzeZiel(text, hoch(ort, 2.3), 'kontor');
    } else if (spiel.szeneName === 'aussen') {
      if (spiel.ort.pfad === 'b' && spiel.ort.art === 'schiene') spiel.setzeZiel(s === 0 ? z.weg : z.rein, hoch(nord.kontorTuer, 4.2), 'aussen');
      else spiel.setzeZiel(spiel.szeneName === 'aussen' && spiel.ort.bereich === 'hof' ? z.hof : z.weg, hoch(aussen.hof.nordtor, 3.6), 'aussen');
    } else spiel.setzeZiel(this.daten.station2.ziele.fertig, null);
  }

  wendeZu(pos) { const m = this.spiel.marx.gruppe; m.rotation.y = Math.atan2(pos.x - m.position.x, pos.z - m.position.z); }

  async pym() {
    const { ui, kontor, spiel } = this;
    this.wendeZu(kontor.punkte.pym); kontor.blickZu('pym', spiel.pos);
    await ui.dialog(this.daten.dialoge.pym1);
    kontor.blickZu('pym', null);
    ui.schalteFrei('p_pym');
    this.setze(1);
  }

  async dokument(id, eintrag) {
    const { ui, spiel } = this;
    if (this.s === 2 && id === 'k_hauptbuch') return this.rechnen();
    const e = this.eintrag(eintrag);
    await ui.karte({ titel: e.titel, marke: e.marke, text: e.text, quelle: e.quelle, knopf: spiel.stand.tagebuch.includes(e.id) ? 'Weiter' : 'Ins Tagebuch' });
    ui.schalteFrei(e.id);
    spiel.stand.gesehen[id] = true;
    if (this.s === 1 && this.dok === 3) { await ui.dialog(this.daten.dialoge.nachDokumente); this.setze(2); this.start(); }
    else this.nachher();
  }

  async rechnen() {
    const ok = await rechenblatt(this.ui, this.t.rechnen);
    if (!ok) return;
    this.setze(3); this.start();
  }

  async ordnen() {
    const { ui, kontor, spiel } = this;
    kontor.blickZu('pym', spiel.pos);
    await ui.dialog(this.daten.dialoge.vorOrdnen);
    const ok = await zuordnung(ui, this.t.ordnen);
    kontor.blickZu('pym', null);
    if (!ok) return;
    ui.schalteFrei('b_kapital');
    this.setze(4);
  }

  async jahre() {
    const { ui, kontor, spiel } = this;
    this.wendeZu(kontor.punkte.whitlow); kontor.blickZu('whitlow', spiel.pos);
    await ui.dialog(this.daten.dialoge.whitlowKontor);
    const ok = await this.versuch();
    if (!ok) { kontor.blickZu('whitlow', null); return; }
    const ok2 = await auswahl(ui, this.t.jahre.frage);
    if (!ok2) { kontor.blickZu('whitlow', null); return; }
    ui.schalteFrei('b_konkurrenz', 'b_modell3', 'd_akkumulation');
    ui.gibBeleg('beleg_kontor');
    const d = this.eintrag('d_akkumulation');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    await ui.dialog(this.daten.dialoge.nachJahre);
    kontor.blickZu('whitlow', null);
    this.setze(5);
  }

  // Drei Geschäftsjahre: Entscheidung über den Gewinn, Folgen im Wettbewerb. Zahlen stilisiert.
  versuch() {
    const { ui } = this, t = this.t.jahre;
    return new Promise((fertig) => {
      const f = ui.fenster({ titel: t.titel, klasse: 'breit', kopf: el('div', '', ui.markeHtml('vereinfachung')), beiSchliessen: (w) => fertig(w === true) });
      const auftrag = el('p', 'auftrag', esc(t.einleitung));
      const liste = el('div', 'jahre');
      const wahl = el('div', 'wahl3');
      const rueck = el('div', 'rueck'), hilfenEl = el('div', 'hilfen');
      f.inhalt.append(auftrag, liste, wahl, rueck, hilfenEl);
      let hilfe = 0;
      const hinweis = el('button', 'knopf still', 'Hinweis');
      hinweis.addEventListener('click', () => { if (hilfe < t.hilfen.length) hilfenEl.append(el('div', 'rueck hilfe', esc(t.hilfen[hilfe++]))); if (hilfe >= t.hilfen.length) hinweis.disabled = true; });
      const neu = el('button', 'knopf', 'Noch einmal versuchen'); neu.hidden = true;
      const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
      const links = el('div', 'links'); links.append(hinweis);
      f.fuss.append(links, neu, weiter);
      weiter.addEventListener('click', () => f.schliessen(true));
      let jahr, kosten, preis;
      const beginne = () => {
        jahr = 1; kosten = 10.8; preis = 12;
        liste.innerHTML = `<div class="jahr"><b>1844</b>${esc(t.start)}</div>`;
        rueck.className = 'rueck'; rueck.textContent = '';
        neu.hidden = true; weiter.hidden = true; wahl.hidden = false;
        zeigeWahl();
      };
      const zeigeWahl = () => {
        wahl.innerHTML = '';
        for (const o of t.optionen) {
          const b = el('button', 'option', `<b>${esc(o.titel)}</b><small>${esc(o.text)}</small>`);
          b.addEventListener('click', () => entscheide(o.id));
          wahl.append(b);
        }
        auftrag.textContent = jahr === 1 ? t.einleitung : `Jahr ${1844 + jahr}: Was geschieht mit dem Gewinn von 1.000 Pfund?`;
      };
      const entscheide = (id) => {
        kosten = Math.round((kosten + (id === 'maschine' ? -1.2 : id === 'lohn' ? 0.6 : 0)) * 10) / 10;
        preis = Math.round((preis - 1.2) * 10) / 10;
        const marge = Math.round((preis - kosten) * 10) / 10;
        const art = marge >= 1.2 ? 'gut' : marge >= 0 ? 'null' : 'verlust';
        const text = t.ergebnis[art].replace('{k}', zahlText(kosten)).replace('{p}', zahlText(preis));
        liste.append(el('div', 'jahr ' + (art === 'gut' ? 'gut' : 'schlecht'), `<b>${1844 + jahr}</b>${esc(t.wahlText[id])}<small>${esc(text)}</small>`));
        liste.lastChild.scrollIntoView({ block: 'nearest' });
        if (art !== 'gut') {
          wahl.hidden = true; neu.hidden = false;
          rueck.className = 'rueck falsch'; rueck.textContent = t.ende.pleite;
        } else if (jahr === 3) {
          wahl.hidden = true; weiter.hidden = false; hinweis.hidden = true; hilfenEl.innerHTML = '';
          rueck.className = 'rueck richtig'; rueck.textContent = t.ende.erfolg;
        } else { jahr++; zeigeWahl(); }
      };
      neu.addEventListener('click', beginne);
      beginne();
    });
  }

  async kreislauf() {
    const { ui } = this;
    const ok = await zuordnung(ui, this.t.kreislauf);
    if (!ok) return;
    ui.schalteFrei('b_kreislauf', 'd_personifiziert');
    const d = this.eintrag('d_personifiziert');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    this.setze(6);
  }

  async fenster() {
    const { ui, spiel } = this;
    spiel.marx.gruppe.rotation.y = 0;
    await ui.dialog(this.daten.dialoge.fenster);
    const d = this.eintrag('d_produktivkraft');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    ui.schalteFrei('d_produktivkraft');
    const ok = await auswahl(ui, this.t.garn);
    if (!ok) return;
    ui.schalteFrei('b_garn');
    ui.gibBeleg('beleg_manifest');
    this.setze(7);
    this.laeuft = false;
    return this.denkpause();
  }

  async denkpause() {
    const { ui, spiel, nord } = this, t = this.t.denkpause;
    const ok = await auswahl(ui, t);
    if (!ok) return;
    ui.schalteFrei('b_annahme3');
    const text = await notiz(ui, t.notiz, spiel.stand.notizen.s3_denkpause || '');
    if (text === null) return;
    spiel.stand.notizen.s3_denkpause = text;
    if (!spiel.stand.funde.includes(3)) spiel.stand.funde.push(3);
    ui.setzeSiegel();
    ui.schalteFrei('f_akkumulation');
    const f = this.eintrag('f_akkumulation');
    await ui.karte({ titel: 'Fund gesichert: Akkumulation', marke: f.marke, text: f.text, knopf: 'Siegel setzen' });
    nord.oeffneTor(true);
    await ui.dialog(this.daten.dialoge.ende3);
    this.setze(FERTIG3);
  }
}
