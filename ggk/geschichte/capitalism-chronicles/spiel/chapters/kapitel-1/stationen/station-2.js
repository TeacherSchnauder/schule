// Station 2 – Die Spinnerei. Kerngedanke: Mehrwert aus unbezahlter Mehrarbeit; dazu Entfremdung an der Maschine.
// Ablauf laut Konzept: Gespräch, Fabrikuhr, Rechnen, Zehnstundentag, Entfremdung, Denkpause, Fund.
import { el, esc } from '../../../ui/oberflaeche.js';
import { rechenblatt, zuordnung, auswahl2, notiz, zahlText } from '../../../ui/raetsel.js';
import { vorhersageFestlegen, vorhersageAbgleich } from '../../../ui/vorhersage.js';

const LOHN = 3, JE_STUNDE = 0.5;

// Mehrwert-Rechner im Fenster (Aufbau wie ein Regler-Rechner): links Regler, rechts Kennzahlen,
// darunter Marys Arbeitstag als Leiste (0 bis 12 Uhr) und ein Balkenvergleich.
// Die Fabrikuhr und die Balken an der Wand laufen nur noch mit.
function rechner({ regler, kacheln, balkenTitel }) {
  const box = el('div', 'rechner');
  const links = el('div', 'r-regler'), rechts = el('div', 'r-kacheln');
  box.append(links, rechts);
  const felder = {};
  for (const r of regler) {
    const feld = el('div', 'r-feld');
    feld.innerHTML = `<label for="${r.id}">${esc(r.name)} <b></b></label>`;
    if (r.fest) feld.append(el('p', 'r-fest', `<span aria-hidden="true">▪</span> ${esc(r.fest)}`));
    else {
      const inp = el('input'); inp.type = 'range'; inp.id = r.id; inp.min = r.min; inp.max = r.max; inp.step = r.step; inp.value = r.wert;
      feld.append(inp);
      if (r.unter) feld.append(el('p', 'r-unter', esc(r.unter)));
      felder[r.id] = inp;
    }
    feld.wert = feld.querySelector('label b');
    links.append(feld); felder[r.id + 'Wert'] = feld.wert;
  }
  const kz = {};
  for (const [id, name] of kacheln) { const k = el('div', 'r-kachel' + (id === 'mw' ? ' mw' : ''), `<small>${esc(name)}</small><span></span>`); rechts.append(k); kz[id] = k.querySelector('span'); }
  const tag = el('div', 'r-tag', '<h4>Marys Arbeitstag</h4><div class="spur"><i class="lauf"></i><i class="lohn"></i><i class="mehr"></i><i class="weg"></i></div><div class="skala">' +
    Array.from({ length: 13 }, (_, k) => `<span style="left:${(k / 12) * 100}%">${k}</span>`).join('') + '</div>');
  const [lauf, lohn, mehr, weg] = tag.querySelectorAll('.spur i');
  const vergleich = el('div', 'r-vergleich', `<h4>${esc(balkenTitel)}</h4>`);
  const teil = (e, von, bis, text) => {
    const b = Math.max(0, bis - von);
    e.style.left = (von / 12) * 100 + '%'; e.style.width = (b / 12) * 100 + '%';
    e.textContent = b >= 2.6 ? text : b >= 1.2 ? text.split(': ')[1] || text : ''; e.title = text;
  };
  return {
    el: [box, tag, vergleich],
    felder,
    // Kennzahl setzen (Text)
    kachel(id, text) { kz[id].textContent = text; },
    // Arbeitstag: stunden gearbeitet; notwendig: Lohn verdient nach … Stunden (null: noch nicht markiert); ende: Feierabend
    tag({ stunden, notwendig = null, ende = 12 }) {
      const h = Math.min(stunden, ende);
      if (notwendig === null) { teil(lauf, 0, h, 'Arbeitszeit'); teil(lohn, 0, 0, ''); teil(mehr, 0, 0, ''); }
      else { teil(lauf, 0, 0, ''); teil(lohn, 0, Math.min(h, notwendig), 'notwendige Arbeit: Lohn'); teil(mehr, notwendig, Math.max(notwendig, h), 'Mehrarbeit: für Whitlow'); }
      teil(weg, ende, 12, 'gestrichen');
    },
    // Balkenzeilen: [{ name, teile: [{ wert, art: 'lohn'|'mehr'|'neu'|'lohnfix' }], text }], Maßstab 0 bis max Schilling
    balken(zeilen, max = 6) {
      vergleich.querySelectorAll('.r-zeile').forEach((z) => z.remove());
      for (const z of zeilen) {
        const zeile = el('div', 'r-zeile');
        zeile.innerHTML = `<span>${esc(z.name)}</span><span class="bahn">${z.teile.map((t) => `<i class="${t.art}" style="width:${Math.max(0, Math.min(100, (t.wert / max) * 100))}%"></i>`).join('')}</span><span class="wert">${esc(z.text)}</span>`;
        vergleich.append(zeile);
      }
    },
  };
}

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
      wenn: () => this.schritt === 3, tu: einmal(() => this.maschineMitVorhersage()) });
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
        titel: t.titel, klasse: 'bedienfeld rechnerfenster', art: 'klar unten',
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
      const rx = rechner({
        regler: [
          { id: 'uhrregler', name: 'Fabrikuhr: Arbeitsstunden', min: 0, max: 12, step: 0.5, wert: 0 },
          { id: 'tempo1', name: 'Tempo der Maschine', fest: t.tempoFest },
        ],
        kacheln: [['nw', 'Neuwert bis jetzt'], ['lohn', 'Tageslohn'], ['nt', 'Lohn verdient nach'], ['mw', 'Mehrwert für Whitlow']],
        balkenTitel: t.balkenTitel,
      });
      const r = rx.felder.uhrregler;
      rx.felder.tempo1Wert.textContent = '0,5 Schilling je Stunde';
      const rueck = el('div', 'rueck');
      f.inhalt.append(auftrag, ...rx.el, rueck);
      const hinweis = el('button', 'knopf still', 'Hinweis');
      const marke = el('button', 'knopf', esc(t.knopf));
      const weiter = el('button', 'knopf', esc(t.weiter)); weiter.hidden = true;
      const links = el('div', 'links'); links.append(hinweis);
      f.fuss.append(links, marke, weiter);

      const zeige = () => {
        const h = Number(r.value), n = h * JE_STUNDE;
        rx.felder.uhrreglerWert.textContent = `${zahlText(h)} Stunden`;
        rx.kachel('nw', `${zahlText(n)} S.`); rx.kachel('lohn', `${LOHN} S.`);
        rx.kachel('nt', markiert ? '6 Stunden' : '?');
        rx.kachel('mw', markiert ? `${zahlText(Math.max(0, n - LOHN))} S.` : '–');
        rx.tag({ stunden: h, notwendig: markiert ? 6 : null });
        rx.balken([
          { name: 'Neuwert', teile: markiert ? [{ wert: Math.min(n, LOHN), art: 'lohn' }, { wert: Math.max(0, n - LOHN), art: 'mehr' }] : [{ wert: n, art: 'neu' }], text: `${zahlText(n)} S.` },
          { name: 'Tageslohn', teile: [{ wert: LOHN, art: 'lohnfix' }], text: `${LOHN} S.` },
        ]);
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
          marke.hidden = true; hinweis.hidden = true;
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

  // --- Schritt 4 mit Vorhersage (Baustein A-I-1): festlegen, Regler, Abgleich -------------
  async maschineMitVorhersage() {
    const { ui, spiel } = this, ab = spiel.stand.vorhersagen;
    const v = this.tiefe?.aktiv('vorhersage') ? this.daten.vorhersagen['k1-s2-vorhersage-1'] : null;
    if (v && !ab[v.id]?.wert) {
      const wert = await vorhersageFestlegen(ui, v);
      if (!wert) return;
      ab[v.id] = { wert }; spiel.sichere();
    }
    await this.maschine();
    if (v && spiel.stand.schritt >= 4 && ab[v.id]?.wert && !ab[v.id].notiz) {
      const notiz = await vorhersageAbgleich(ui, v, ab[v.id].wert, { id: v.ergebnis, text: v.ergebnisText });
      Object.assign(ab[v.id], { ergebnis: v.ergebnis, notiz }); spiel.sichere();
    }
  }

  // --- Schritt 4: Zehnstundentag und schnellere Maschine ------------------------------
  // Derselbe Rechner wie an der Fabrikuhr; der Arbeitstag ist durch das Gesetz auf 10 Stunden festgelegt,
  // die Gruppe stellt das Tempo der neuen Maschine ein, bis Whitlow wieder 3 Schilling Mehrwert bleiben.
  maschine() {
    const { ui, saal, spiel } = this, t = this.t.maschine, tafel = saal.tafel;
    return new Promise((fertig) => {
      spiel.kameraAufFlaeche(tafel.mitte, tafel.normale, 8.8, 5.0);
      let hilfe = 0, geloest = false;
      const f = ui.fenster({
        titel: t.titel, klasse: 'bedienfeld rechnerfenster', art: 'klar unten',
        beiSchliessen: async (ok) => {
          spiel.kameraFrei();
          if (ok === true) {
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
      const rx = rechner({
        regler: [
          { id: 'tag10', name: 'Arbeitstag', fest: t.tagFest },
          { id: 'tempo', name: t.regler, min: 0.5, max: 0.8, step: 0.05, wert: 0.5, unter: t.unter },
        ],
        kacheln: [['nw', 'Neuwert am Tag'], ['lohn', 'Tageslohn'], ['nt', 'Lohn verdient nach'], ['mw', 'Mehrwert für Whitlow']],
        balkenTitel: t.balkenTitel,
      });
      const r = rx.felder.tempo;
      rx.felder.tag10Wert.textContent = '10 Stunden';
      const rueck = el('div', 'rueck');
      f.inhalt.append(auftrag, ...rx.el, rueck);
      const hinweis = el('button', 'knopf still', 'Hinweis');
      const sechstel = el('button', 'knopf still', esc(t.sechstel));
      const setzen = el('button', 'knopf', esc(t.knopf));
      const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
      const links = el('div', 'links'); links.append(hinweis, sechstel);
      f.fuss.append(links, setzen, weiter);
      let p = 0.5;   // Neuwert je Stunde; 0,5 ist die alte Maschine
      const rund = (x) => Math.round(x * 100) / 100;
      const zeige = () => {
        const n = p * 10, m = n - LOHN, nt = LOHN / p;
        rx.felder.tempoWert.textContent = `${zahlText(rund(p))} Schilling je Stunde`;
        rx.kachel('nw', `${zahlText(rund(n))} S.`); rx.kachel('lohn', `${LOHN} S.`);
        rx.kachel('nt', `${zahlText(Math.round(nt * 10) / 10)} Stunden`); rx.kachel('mw', `${zahlText(rund(Math.max(0, m)))} S.`);
        rx.tag({ stunden: 10, notwendig: nt, ende: 10 });
        rx.balken([
          { name: 'Vorher (12 Std., alt)', teile: [{ wert: LOHN, art: 'lohn' }, { wert: 3, art: 'mehr' }], text: '3 S. Mehrwert' },
          { name: 'Jetzt (10 Std., neu)', teile: [{ wert: Math.min(n, LOHN), art: 'lohn' }, { wert: Math.max(0, m), art: 'mehr' }], text: `${zahlText(rund(Math.max(0, m)))} S. Mehrwert` },
        ]);
        tafel.setze({ stunden: 10, neuwert: n, lohn: LOHN, teilung: LOHN, notwendig: nt, ende: 10, ziel: 6 });
        saal.zeigeNeueMaschine(p / JE_STUNDE);
      };
      r.addEventListener('input', () => { if (geloest) return; r.step = 0.05; p = Math.round(Number(r.value) / 0.05) * 0.05; rueck.className = 'rueck'; rueck.textContent = ''; zeige(); });
      // Nur wenn eine Vorhersage festgelegt wurde: deren Bedingung (ein Sechstel schneller) direkt einstellen
      sechstel.hidden = !spiel.stand.vorhersagen?.['k1-s2-vorhersage-1']?.wert;
      sechstel.addEventListener('click', () => { if (geloest) return; r.step = 'any'; p = JE_STUNDE * 7 / 6; r.value = p; zeige(); rx.felder.tempoWert.textContent = t.sechstelText; rueck.className = 'rueck'; rueck.textContent = ''; });
      hinweis.addEventListener('click', () => {
        if (hilfe >= t.hilfen.length) return;
        rueck.className = 'rueck hilfe'; rueck.textContent = t.hilfen[hilfe++];
        if (hilfe >= t.hilfen.length) hinweis.disabled = true;
      });
      setzen.addEventListener('click', () => {
        const n = rund(p * 10), m = rund(p * 10 - LOHN);
        if (Math.abs(p - 0.6) < 0.001) {
          geloest = true; r.disabled = true; sechstel.hidden = true;
          rueck.className = 'rueck richtig'; rueck.textContent = t.erfolg;
          setzen.hidden = true; hinweis.hidden = true; weiter.hidden = false;
        } else {
          rueck.className = 'rueck falsch';
          rueck.textContent = (p < 0.6 ? t.zuWenig : t.zuViel).replace('{p}', zahlText(rund(p))).replace('{n}', zahlText(n)).replace('{m}', zahlText(m));
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
    const ok = await auswahl2(ui, t, this.spiel.stand.auswahl2);
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
