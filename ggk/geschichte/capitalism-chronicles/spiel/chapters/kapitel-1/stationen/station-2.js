// Station 2 – Die Spinnerei. Kerngedanke: Mehrwert aus unbezahlter Mehrarbeit; dazu Entfremdung an der Maschine.
// Ablauf laut Konzept: Gespräch, Fabrikuhr, Rechnen, Zehnstundentag, Entfremdung, Denkpause, Fund.
import { el, esc } from '../../../ui/oberflaeche.js';
import { rechenblatt, zuordnung, auswahl, notiz, zahlText } from '../../../ui/raetsel.js';

const LOHN = 3, JE_STUNDE = 0.5;

export class Station2 {
  constructor(spiel, ui, daten, aussen, saal) {
    this.spiel = spiel; this.ui = ui; this.daten = daten; this.aussen = aussen; this.saal = saal;
    this.t = daten.station2;
    this.laeuft = false;
  }

  get schritt() { return this.spiel.stand.schritt; }
  setzeSchritt(n) { this.spiel.stand.schritt = n; this.spiel.sichere(); this.aktualisiere(); }
  nachher() { this.aktualisiere(); }
  eintrag(id) { return this.daten.tagebuch.find((e) => e.id === id); }

  start() {
    const { spiel, saal, aussen } = this;
    const p = saal.punkte, s = this.schritt;

    // Zustand der Welt aus dem Spielstand wiederherstellen
    if (s >= 3) saal.zeigeNeueMaschine(s >= 4 ? 1.2 : 0);
    if (s >= 4) saal.tafel.setze({ stunden: 10, neuwert: 6, lohn: LOHN, teilung: LOHN, notwendig: 5, ende: 10 });
    else if (s >= 2) saal.tafel.setze({ stunden: 12, neuwert: 6, lohn: LOHN, teilung: LOHN, notwendig: 6 });
    saal.setzeWhitlow(s >= 5);
    if (s >= 6) aussen.hof.oeffneNordtor(true);

    const einmal = (fn) => async () => { if (this.laeuft) return; this.laeuft = true; try { await fn(); } finally { this.laeuft = false; } };

    spiel.registriere({ id: 'tuer-aussen', szene: 'aussen', pos: aussen.hof.tuer, radius: 2.6, hoehe: 2.3, text: 'Spinnsaal betreten',
      tu: einmal(async () => { await spiel.wechsleSzene('saal', 'saal', p.eintritt.x, p.eintritt.z, p.eintritt.ry); this.aktualisiere(); }) });
    spiel.registriere({ id: 'tuer-innen', szene: 'saal', pos: p.tuer, radius: 2.0, hoehe: 2.3, text: 'Zum Hof',
      tu: einmal(async () => { await spiel.wechsleSzene('aussen', 'hof', -11.2, -103.5, Math.PI / 2); this.aktualisiere(); }) });
    spiel.registriere({ id: 'mary', szene: 'saal', pos: p.mary, radius: 2.3, hoehe: 1.95, text: 'Mary ansprechen',
      tu: einmal(() => (this.schritt === 0 ? this.mary1() : this.schritt === 4 ? this.mary2() : this.ui.kommentar(this.daten.dialoge.maryKurz, 3500))) });
    spiel.registriere({ id: 'uhr', szene: 'saal', pos: p.uhr, radius: 2.8, hoehe: 2.2, text: 'Fabrikuhr untersuchen',
      wenn: () => this.schritt === 1, tu: einmal(() => this.uhr()) });
    spiel.registriere({ id: 'pult', szene: 'saal', pos: p.pult, radius: 2.2, hoehe: 1.9, text: 'Am Pult rechnen',
      wenn: () => this.schritt === 2, tu: einmal(() => this.pult()) });
    spiel.registriere({ id: 'maschine', szene: 'saal', pos: p.maschine, radius: 2.4, hoehe: 2.0, text: 'Neue Maschine einstellen',
      wenn: () => this.schritt === 3, tu: einmal(() => this.maschine()) });
    spiel.registriere({ id: 'whitlow', szene: 'saal', pos: p.whitlow, radius: 2.4, hoehe: 2.05, text: 'Mr. Whitlow ansprechen',
      wenn: () => this.schritt === 5, tu: einmal(() => this.whitlow()) });

    this.aktualisiere();
  }

  // Ziel und Marker passend zu Ort und Fortschritt
  aktualisiere() {
    const { spiel, saal, aussen } = this;
    const z = this.t.ziele, p = saal.punkte, s = this.schritt;
    const hoch = (v, y) => ({ x: v.x, y, z: v.z });
    if (s >= 6) {
      if (spiel.szeneName === 'saal') spiel.setzeZiel(z.fertig, hoch(p.tuer, 3.0), 'saal');
      else this.weiter?.();
      return;
    }
    if (spiel.szeneName !== 'aussen' && spiel.szeneName !== 'saal') return;
    if (spiel.szeneName === 'aussen') {
      spiel.setzeZiel(spiel.ort.art === 'schiene' ? z.weg : z.hof, hoch(aussen.hof.tuer, 4.6), 'aussen');
      return;
    }
    const ziele = [
      [z.mary, hoch(p.mary, 2.5)], [z.uhr, hoch(p.uhr, 2.6)], [z.pult, hoch(p.pult, 2.6)],
      [z.maschine, hoch(p.maschine, 2.8)], [z.mary2, hoch(p.mary, 2.5)], [z.whitlow, hoch(p.whitlow, 2.6)],
    ];
    spiel.setzeZiel(ziele[s][0], ziele[s][1], 'saal');
  }

  wendeZu(pos) {
    const m = this.spiel.marx.gruppe;
    m.rotation.y = Math.atan2(pos.x - m.position.x, pos.z - m.position.z);
  }

  // --- Schritt 1: Gespräch mit der Spinnerin --------------------------------------
  async mary1() {
    const { ui, saal, spiel } = this;
    this.wendeZu(saal.punkte.mary);
    saal.blickZu('mary', spiel.pos);
    await ui.dialog(this.daten.dialoge.mary1);
    saal.blickZu('mary', null);
    ui.schalteFrei('p_mary', 'b_ware', 'b_modell');
    this.setzeSchritt(1);
  }

  // --- Schritt 2: Fabrikuhr -------------------------------------------------------
  uhr() {
    const { ui, saal, spiel } = this, t = this.t.uhr, tafel = saal.tafel;
    return new Promise((fertig) => {
      spiel.kameraAufFlaeche(tafel.mitte, tafel.normale, 8.8, 5.0);
      let markiert = false, hilfe = 0;
      const f = ui.fenster({
        titel: t.titel, klasse: 'bedienfeld', art: 'klar unten',
        beiSchliessen: async (ok) => {
          spiel.kameraFrei();
          if (ok === true) {
            ui.schalteFrei('b_arbeitszeit');
            await ui.dialog(this.daten.dialoge.nachUhr);
            this.setzeSchritt(2);
          } else tafel.setze({ stunden: 0, neuwert: 0, lohn: LOHN });
          fertig();
        },
      });
      const auftrag = el('p', 'auftrag', esc(t.einleitung + ' ' + t.auftrag));
      const werte = el('div', 'werte');
      const regler = el('div', 'regler', '<label for="uhrregler">Fabrikuhr</label>');
      const r = el('input'); r.type = 'range'; r.id = 'uhrregler'; r.min = 0; r.max = 12; r.step = 0.5; r.value = 0;
      regler.append(r);
      const rueck = el('div', 'rueck');
      const legende = el('div', 'legende', '<span><i style="background:#6f8a5c"></i>notwendige Arbeitszeit</span><span><i style="background:#a5553c"></i>Mehrarbeit</span>');
      legende.hidden = true;
      f.inhalt.append(auftrag, werte, regler, rueck, legende);
      const hinweis = el('button', 'knopf still', 'Hinweis');
      const marke = el('button', 'knopf', esc(t.knopf));
      const weiter = el('button', 'knopf', esc(t.weiter)); weiter.hidden = true;
      const links = el('div', 'links'); links.append(hinweis);
      f.fuss.append(links, marke, weiter);

      const zeige = () => {
        const h = Number(r.value), n = h * JE_STUNDE;
        werte.innerHTML = `<span>Arbeitsstunden<b>${zahlText(h)}</b></span><span>Neuwert<b>${zahlText(n)} Schilling</b></span><span>Tageslohn<b>${LOHN} Schilling</b></span>` +
          (markiert ? `<span class="mw">Mehrwert<b>${zahlText(Math.max(0, n - LOHN))} Schilling</b></span>` : '');
        tafel.setze({ stunden: h, neuwert: n, lohn: LOHN, teilung: markiert ? LOHN : null, notwendig: markiert ? 6 : null });
        if (markiert && h >= 12 && weiter.hidden) {
          rueck.className = 'rueck richtig'; rueck.textContent = t.ende;
          weiter.hidden = false;
        }
      };
      r.addEventListener('input', zeige);
      hinweis.addEventListener('click', () => {
        if (hilfe >= t.hilfen.length) return;
        rueck.className = 'rueck hilfe'; rueck.textContent = t.hilfen[hilfe++];
        if (hilfe >= t.hilfen.length) hinweis.disabled = true;
      });
      marke.addEventListener('click', () => {
        const h = Number(r.value), n = h * JE_STUNDE;
        if (h === 6) {
          markiert = true;
          marke.hidden = true; hinweis.hidden = true; legende.hidden = false;
          rueck.className = 'rueck richtig'; rueck.textContent = t.erfolg;
          auftrag.hidden = true;
          zeige();
        } else {
          rueck.className = 'rueck falsch';
          rueck.textContent = (h < 6 ? t.zuFrueh : t.zuSpaet).replace('{h}', zahlText(h)).replace('{n}', zahlText(n));
        }
      });
      weiter.addEventListener('click', () => f.schliessen(true));
      zeige();
    });
  }

  // --- Schritt 3: Rechnen am Pult, danach Blick voraus auf 1847 ---------------------
  async pult() {
    const { ui, saal } = this;
    const ok = await rechenblatt(ui, this.t.rechnen);
    if (!ok) return;
    ui.gibBeleg('beleg_rechnung');
    ui.schalteFrei('b_mehrwert', 'd_garn', 'b_voraus');
    const g = this.eintrag('d_garn');
    await ui.karte({ titel: g.titel, marke: g.marke, zitat: g.zitat, text: g.text, quelle: g.quelle });
    await ui.dialog(this.daten.dialoge.zeitung);
    const z = this.eintrag('d_zehn');
    await ui.karte({ titel: z.titel, marke: z.marke, text: z.text, quelle: z.quelle });
    ui.schalteFrei('d_zehn');
    await this.schnipsel?.('C');
    saal.zeigeNeueMaschine(0);
    this.setzeSchritt(3);
  }

  // --- Schritt 4: Zehnstundentag und schnellere Maschine ------------------------------
  maschine() {
    const { ui, saal, spiel } = this, t = this.t.maschine, tafel = saal.tafel;
    return new Promise((fertig) => {
      spiel.kameraAufFlaeche(tafel.mitte, tafel.normale, 8.8, 5.0);
      let hilfe = 0, geloest = false;
      const f = ui.fenster({
        titel: t.titel, klasse: 'bedienfeld', art: 'klar unten',
        beiSchliessen: async (ok) => {
          spiel.kameraFrei();
          let fertigGeloest = false;
          if (ok === true) fertigGeloest = await rechenblatt(ui, { titel: t.titel, angaben: ['Arbeitstag: 10 Stunden', 'Neuwert je Stunde: 0,6 Schilling', 'Tageslohn: 3 Schilling'], fragen: [t.frage] });
          if (fertigGeloest) {
            saal.zeigeNeueMaschine(1.2);
            tafel.setze({ stunden: 10, neuwert: 6, lohn: LOHN, teilung: LOHN, notwendig: 5, ende: 10 });
            ui.gibBeleg('beleg_zehn');
            ui.schalteFrei('b_relativ');
            this.setzeSchritt(4);
            await this.schnipsel?.('X');
          } else {
            saal.zeigeNeueMaschine(0);
            tafel.setze({ stunden: 12, neuwert: 6, lohn: LOHN, teilung: LOHN, notwendig: 6 });
          }
          fertig();
        },
      });
      const auftrag = el('p', 'auftrag', esc(t.einleitung));
      const werte = el('div', 'werte');
      const regler = el('div', 'regler', '<label for="tempo">Neuwert je Stunde</label>');
      const r = el('input'); r.type = 'range'; r.id = 'tempo'; r.min = 0.5; r.max = 0.8; r.step = 0.05; r.value = 0.5;
      regler.append(r);
      const rueck = el('div', 'rueck');
      f.inhalt.append(auftrag, werte, regler, rueck);
      const hinweis = el('button', 'knopf still', 'Hinweis');
      const setzen = el('button', 'knopf', esc(t.knopf));
      const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
      const links = el('div', 'links'); links.append(hinweis);
      f.fuss.append(links, setzen, weiter);
      const rechne = () => { const p = Math.round(Number(r.value) * 100) / 100; const n = Math.round(p * 10 * 100) / 100; return { p, n, m: Math.round((n - LOHN) * 100) / 100 }; };
      const zeige = () => {
        const { p, n, m } = rechne();
        werte.innerHTML = `<span>Arbeitstag<b>10 Stunden</b></span><span>je Stunde<b>${zahlText(p)} Schilling</b></span><span>Neuwert<b>${zahlText(n)} Schilling</b></span><span>Tageslohn<b>${LOHN} Schilling</b></span><span class="mw">Mehrwert<b>${zahlText(m)} Schilling</b></span>`;
        tafel.setze({ stunden: 10, neuwert: n, lohn: LOHN, teilung: LOHN, notwendig: LOHN / p, ende: 10 });
        saal.zeigeNeueMaschine(p / JE_STUNDE);
      };
      r.addEventListener('input', () => { if (!geloest) zeige(); });
      hinweis.addEventListener('click', () => {
        if (hilfe >= t.hilfen.length) return;
        rueck.className = 'rueck hilfe'; rueck.textContent = t.hilfen[hilfe++];
        if (hilfe >= t.hilfen.length) hinweis.disabled = true;
      });
      setzen.addEventListener('click', () => {
        const { p, n, m } = rechne();
        if (Math.abs(p - 0.6) < 0.001) {
          geloest = true; r.disabled = true;
          rueck.className = 'rueck richtig'; rueck.textContent = t.erfolg;
          setzen.hidden = true; hinweis.hidden = true; weiter.hidden = false;
        } else {
          rueck.className = 'rueck falsch';
          rueck.textContent = (p < 0.6 ? t.zuWenig : t.zuViel).replace('{p}', zahlText(p)).replace('{n}', zahlText(n)).replace('{m}', zahlText(m));
        }
      });
      weiter.addEventListener('click', () => f.schliessen(true));
      zeige();
    });
  }

  // --- Schritt 5: Entfremdung --------------------------------------------------------
  async mary2() {
    const { ui, saal, spiel } = this;
    this.wendeZu(saal.punkte.mary);
    saal.blickZu('mary', spiel.pos);
    await ui.dialog(this.daten.dialoge.mary2);
    const ok = await zuordnung(ui, this.t.entfremdung);
    saal.blickZu('mary', null);
    if (!ok) return;
    ui.schalteFrei('b_entfremdung', 'd_entfremdung');
    ui.gibBeleg('beleg_mary');
    const d = this.eintrag('d_entfremdung');
    await ui.karte({ titel: d.titel, marke: d.marke, zitat: d.zitat, text: d.text, quelle: d.quelle });
    saal.setzeWhitlow(true);
    this.setzeSchritt(5);
  }

  // --- Schritt 6 und 7: Denkpause und Fund ---------------------------------------------
  async whitlow() {
    const { ui, saal, spiel, aussen } = this, t = this.t.denkpause;
    this.wendeZu(saal.punkte.whitlow);
    saal.blickZu('whitlow', spiel.pos);
    await ui.dialog(this.daten.dialoge.whitlow);
    const ok = await auswahl(ui, t);
    if (!ok) return;
    ui.schalteFrei('b_awl');
    const text = await notiz(ui, t.notiz, spiel.stand.notizen.s2_denkpause || '');
    if (text === null) return;
    spiel.stand.notizen.s2_denkpause = text;
    ui.schalteFrei('b_einwand');
    ui.gibBeleg('beleg_whitlow');
    await ui.dialog(this.daten.dialoge.nachDenkpause);
    await this.schnipsel?.('R');
    if (!spiel.stand.funde.includes(2)) spiel.stand.funde.push(2);
    ui.setzeSiegel();
    ui.schalteFrei('f_mehrwert');
    const f = this.eintrag('f_mehrwert');
    await ui.karte({ titel: 'Fund gesichert: Mehrwert', marke: f.marke, text: f.text, knopf: 'Siegel setzen' });
    aussen.hof.oeffneNordtor(true);
    await ui.dialog(this.daten.dialoge.ende);
    this.setzeSchritt(6);
  }
}
