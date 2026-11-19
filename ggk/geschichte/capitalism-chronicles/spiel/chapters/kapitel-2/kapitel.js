// Kapitel II – Die Verteidigung: Gewachsen oder gebaut?
// Verbindet Szenen, Daten und Stationen mit dem Spielkern. Texte und Zahlen liegen in den JSON-Dateien dieses Ordners.
import * as THREE from 'three';
import { Pfad } from '../../engine/pfad.js';
import { baueFigur } from '../../engine/figur.js';
import { leseStandVon } from '../../engine/speicher.js';
import { esc } from '../../ui/oberflaeche.js';
import { notiz } from '../../ui/raetsel.js';
import { zeitreise } from '../../ui/zeitreise.js';
import { zitatplatz, pruefeZitate } from '../../ui/zitatplatz.js';
import { simulation, rundenSimulation, freigabe, historisch } from '../../ui/simulation.js';
import { baueHoersaal } from './hoersaal.js';
import { baueStrasseA } from './welt-a.js';
import { baueWohnung } from './wohnung.js';
import { baueFrankfurt } from './welt-b.js';
import { baueBuero } from './buero.js';
import { FIG } from './figuren.js';
import { stationenA } from './stationen/teil-a.js';
import { stationenB } from './stationen/teil-b.js';
import { stationEpilog } from './stationen/epilog.js';

const PI = Math.PI;
export const REIHENFOLGE = ['a0', 'a1', 'a2', 'a3', 'h', 'b1', 'b2', 'b3', 'b4', 'b5', 'e'];

// Zusätzliche Felder im Spielstand von Kapitel II
export const standZusatz = () => ({
  a0: 0, a1: 0, a2: 0, a3: 0, h: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0, e: 0,
  wo: 'hoersaal', innen: null,
  tippsKapitel1: null, tippsNeu: null, sim: {}, b5Aus: null,
});

export async function ladeDaten() {
  const lade = async (name) => {
    const r = await fetch(new URL('./' + name, import.meta.url));
    if (!r.ok) throw new Error(`${name} konnte nicht geladen werden (${r.status}).`);
    return r.json();
  };
  const [inhalte, dialoge, simulationen, zitate] = await Promise.all([lade('inhalte.json'), lade('dialoge.json'), lade('simulationen.json'), lade('zitate-plumpe.json')]);
  return { ...inhalte, dialoge, simulationen, zitate: pruefeZitate(zitate) };
}

export function baueKapitel(spiel, ui, daten) {
  spiel.ohneBegleiter = true;
  const hoersaal = baueHoersaal(), strasse = baueStrasseA(), wohnung = baueWohnung(), frankfurt = baueFrankfurt(), buero = baueBuero();
  const szenen = { hoersaal, strasse, wohnung, frankfurt, buero };
  // Musik je Raum und Zeit: Straße nach Jahr, Frankfurt nach Zeitschicht
  spiel.musikSchluessel = (name) => name === 'strasse' ? `strasse-${strasse.jahr}` : name === 'frankfurt' ? `frankfurt-${frankfurt.schicht}` : name;
  const st = () => spiel.stand;
  const b5Aktiv = () => (st().b5Aus === null ? daten.kapitel.b5Aktiv !== false : !st().b5Aus);

  const welt = {
    pfade: { a: new Pfad([[0, 0], [0, -10]]) },   // Kapitel II hat keine Schienenstrecke; überall wird frei gegangen
    enden: {},
    szenen: {
      hoersaal: { szene: hoersaal.szene, get sonne() { return hoersaal.sonne; } },
      strasse: { szene: strasse.szene, sonne: strasse.sonne, folgeSonne: strasse.folgeSonne },
      wohnung: { szene: wohnung.szene, get sonne() { return wohnung.sonne; } },
      frankfurt: { szene: frankfurt.szene, sonne: frankfurt.sonne, folgeSonne: frankfurt.folgeSonne },
      buero: { szene: buero.szene, get sonne() { return buero.sonne; } },
    },
    bereiche: {
      hoersaal: { flaechen: [hoersaal.flaeche], hindernisse: hoersaal.hindernisse, kamera: { abstand: 5.4, grenzen: hoersaal.grenzen } },
      strasse: { flaechen: [strasse.flaeche], hindernisse: strasse.hindernisse, dynamisch: strasse.leute, kamera: { abstand: 6.6, grenzen: strasse.grenzen } },
      wohnung: { flaechen: [wohnung.flaeche], hindernisse: wohnung.hindernisse, kamera: { abstand: 4.4, grenzen: wohnung.grenzen } },
      frankfurt: { flaechen: frankfurt.flaechen, hindernisse: frankfurt.hindernisse, dynamisch: frankfurt.leute, kamera: { abstand: 6.6, grenzen: frankfurt.grenzen } },
      buero: { flaechen: [buero.flaeche], hindernisse: buero.hindernisse, kamera: { abstand: 4.6, grenzen: buero.grenzen } },
    },
    titelKamera: { pos: new THREE.Vector3(5.5, 4.6, 5.5), ziel: new THREE.Vector3(-1, 1.6, -5), fokus: new THREE.Vector3(0, 0, 0) },
    update(dt, t, sp) { szenen[sp.szeneName].update(dt, t, sp); },
  };

  // ------------------------------------------------------------ Orte: Szene, Zeitschicht, Spielfigur
  const ORTE = {
    hoersaal: { szene: 'hoersaal', figur: 'lena', pos: { ...hoersaal.punkte.eintritt, ry: PI } },
    s1863: { szene: 'strasse', figur: 'lena1863', jahr: 1863, pos: strasse.punkte.start },
    s1910: { szene: 'strasse', figur: 'lena1910', jahr: 1910, pos: strasse.punkte.start },
    s1930: { szene: 'strasse', figur: 'lena1930', jahr: 1930, pos: strasse.punkte.start },
    fMaerz: { szene: 'frankfurt', figur: 'miksch', schicht: 'maerz', pos: frankfurt.punkte.start },
    fJuni: { szene: 'frankfurt', figur: 'miksch', schicht: 'juni', pos: frankfurt.punkte.start },
    fNov: { szene: 'frankfurt', figur: 'miksch', schicht: 'november', pos: frankfurt.punkte.start },
  };
  let figurName = null;
  const setzeFigur = (name) => { if (figurName !== name) { spiel.wechsleFigur(FIG[name]); figurName = name; } };
  const geh = (key, innen = null) => {
    const o = ORTE[key] || ORTE.hoersaal;
    st().wo = ORTE[key] ? key : 'hoersaal'; st().innen = innen;
    if (o.jahr) { strasse.setze(o.jahr); wohnung.setze(o.jahr); }
    if (o.schicht) { frankfurt.setze(o.schicht); if (o.schicht === 'juni' && st().b3 < 1) frankfurt.setzeLaeden(0); }
    if (o.szene === 'hoersaal') zeigeHoersaal();
    setzeFigur(o.figur);
    if (innen) {
      const r = szenen[innen];
      spiel.aktiviereSzene(innen); spiel.inBereich(innen, r.punkte.eintritt.x, r.punkte.eintritt.z, PI);
    } else { spiel.aktiviereSzene(o.szene); spiel.inBereich(o.szene, o.pos.x, o.pos.z, o.pos.ry ?? PI); }
    aktualisiere();
  };
  const hinein = async (raum) => { const r = szenen[raum]; await spiel.wechsleSzene(raum, raum, r.punkte.eintritt.x, r.punkte.eintritt.z, PI); st().innen = raum; spiel.sichere(); aktualisiere(); };
  const hinaus = async () => {
    const aussen = spiel.szeneName === 'wohnung' ? ['strasse', strasse.punkte.haustuer] : ['frankfurt', frankfurt.punkte.buero];
    const s = aussen[0] === 'strasse' ? -1 : 1;
    await spiel.wechsleSzene(aussen[0], aussen[0], aussen[1].x + s * 1.1, aussen[1].z, s * PI / 2);
    st().innen = null; spiel.sichere(); aktualisiere();
  };

  // Leinwand und Tafel im Hörsaal je nach Fortschritt
  const tippText = (t) => (daten.kapsel.tipps.find((x) => x[0] === t) || [0, '–'])[1];
  function zeigeHoersaal() {
    const z = st(), P = daten.kapsel.prognosen;
    if (z.a3 < stationen.a3.schritte.length) {
      hoersaal.zeigeLeinwand([['Kapitel I: Die Anklage', 'h'], ['I   Zwei Städte in einer', 't'], ['II  Mehrwert', 't'], ['III Akkumulation', 't'], ['IV  Verelendung, Ursache strittig', 't'], ['V   Drei Prognosen in der Zeitkapsel', 't']]);
      hoersaal.zeigeTafel([['Marx 1845: drei Prognosen', 'h'], ...P.map((p, i) => [`${i + 1}. ${p.titel}`, 't']), ...(z.a0 >= 3 ? [['Gewachsen oder gebaut?', 'h']] : [])]);
    } else if (z.e === 0 && z.b4 < stationen.b4.schritte.length) {
      hoersaal.zeigeLeinwand([['Frankfurt am Main, 1948', 'h'], ['Teil b) The Architects of Prosperity', 't'], ['Eure Rolle: Leonhard Miksch (1901–1950)', 't'], ['Volkswirt, Schüler Walter Euckens,', 't'], ['Mitarbeiter Ludwig Erhards', 't']]);
      hoersaal.zeigeTafel([['Wer setzt der Macht Grenzen?', 'h'], ['Plumpe: der Wandel selbst', 't'], ['Freiburger Schule: Regeln', 't']]);
    } else {
      hoersaal.zeigeLeinwand([['Bilanz 1845–1957', 'h'], ['Befund · Gegenbefund · Kontroverse', 't'], ['', 't'], ['Im Tribunal entscheidet ihr.', 't']]);
      hoersaal.zeigeTafel([['Eure Tipps: 1845 → heute', 'h'], ...P.map((p, i) => [`${i + 1}. ${tippText(z.tippsKapitel1?.[p.id])} → ${z.tippsNeu ? tippText(z.tippsNeu[p.id]) : '?'}`, 't'])]);
    }
    hoersaal.oeffneKapsel(z.a0 >= 2);
  }

  // ------------------------------------------------------------ Werkzeuge für die Stationen
  const eintrag = (id) => daten.tagebuch.find((x) => x.id === id);
  let station2 = null;
  const k = {
    spiel, ui, daten, st, szenen, geh, hinein, FIG, b5Aktiv, zeigeHoersaal, tippText, leseStandVon,
    figur: () => figurName,
    sag: (id) => ui.dialog(daten.dialoge[id]),
    // Karte aus dem Tagebuch zeigen und freischalten
    zeige: async (id) => {
      const e = eintrag(id), neu = !st().tagebuch.includes(id);
      await ui.karte({ titel: e.titel, marke: e.marke, text: e.text, quelle: e.quelle, knopf: neu ? 'Ins Tagebuch' : 'Weiter' });
      ui.schalteFrei(id);
    },
    zitat: (id) => zitatplatz(ui, daten.zitate, id),
    merke(id, text) {
      const zeilen = (st().notizen.entscheidungen || '').split('\n').filter((x) => x && !x.startsWith(id + ':'));
      zeilen.push(`${id}: ${text}`); st().notizen.entscheidungen = zeilen.join('\n');
    },
    async sim(id, bei = null) {
      const def = daten.simulationen[id];
      const e = await simulation(ui, def, bei);
      if (!e) return null;
      st().sim[id] = e.wahl;
      const text = def.kombis ? e.wahl[0].split('+').map((w, i) => def.entscheidungen[i].optionen.find((o) => o.id === w).text).join(' und ') : e.wahl.map((w) => def.optionen.find((o) => o.id === w).text).join(' und ');
      k.merke(id, text);
      spiel.sichere();
      return e;
    },
    async runden(id, bei = null) {
      const def = daten.simulationen[id];
      const e = await rundenSimulation(ui, def, bei);
      if (!e) return null;
      st().sim[id] = e.runden.map((r) => r.wahl);
      k.merke(id, e.runden.map((r, i) => def.runden[i].optionen.find((o) => o.id === r.wahl).text).join(' → '));
      spiel.sichere();
      return e;
    },
    async freigabe(id, bei = null) {
      const def = daten.simulationen[id];
      const e = await freigabe(ui, def, bei);
      if (!e) return null;
      st().sim[id] = e.frei;
      const namen = def.gruppen.filter((g) => e.frei.includes(g.id)).map((g) => g.name);
      st().notizen.b2_entwurf = `Freigegeben: ${namen.join(', ') || 'nichts'}. Kontrolliert: ${def.gruppen.filter((g) => !e.frei.includes(g.id)).map((g) => g.name).join(', ') || 'nichts'}.`;
      spiel.sichere();
      return e;
    },
    historisch: (id) => historisch(ui, daten.simulationen[id]),
    async denk(id) {
      const t = await notiz(ui, { zuKurz: 'Schreibt mindestens einen Stichpunkt.', ...daten.denkpausen[id] }, st().notizen[id] || '');
      if (t === null) return false;
      st().notizen[id] = t; spiel.sichere();
      return true;
    },
    infos: (station) => daten.infopunkte.filter((i) => i.station === station && st().tagebuch.includes(i.eintrag)).length,
    genug(station) {
      if (k.infos(station) >= 2) return true;
      ui.kommentar({ wer: figurName, text: daten.dialoge.zuWenig.text }, 4500);
      return false;
    },
    reise: (von, bis, ort, ziel, innen = null) => zeitreise(ui, { von, bis, ort }, async () => { geh(ziel, innen); spiel.sichere(); }),
    fund(id) { ui.schalteFrei(id); },
  };

  // ------------------------------------------------------------ Stationen und Ablauf
  const stationen = {};
  for (const s of [...stationenA(k), ...stationenB(k), stationEpilog(k)]) stationen[s.id] = s;
  const fertig = (id) => st()[id] >= stationen[id].schritte.length || (id === 'b5' && !b5Aktiv());
  const aktuell = () => { const id = REIHENFOLGE.find((x) => !fertig(x)); return id ? stationen[id] : null; };
  const TUER = { strasse: () => strasse.punkte.haustuer, wohnung: () => wohnung.punkte.tuer, frankfurt: () => frankfurt.punkte.buero, buero: () => buero.punkte.tuer };
  function aktualisiere() {
    const s = aktuell();
    if (!s) { spiel.setzeZiel('Kapitel II ist abgeschlossen. Eure Notizen findet ihr im Tagebuch.'); return; }
    const i = st()[s.id], schritt = s.schritte[i];
    const text = daten.ziele[s.id][i];
    if (schritt.szene === spiel.szeneName) spiel.setzeZiel(text, schritt.pos, schritt.szene);
    else spiel.setzeZiel(text, TUER[spiel.szeneName]?.() || null, spiel.szeneName);
  }
  let laeuft = false;
  const registriereStationen = () => {
    for (const s of Object.values(stationen)) s.schritte.forEach((schritt, i) => {
      spiel.registriere({
        id: `${s.id}_${i}`, szene: schritt.szene, pos: schritt.pos, radius: schritt.radius || 2.6, hoehe: schritt.hoehe || 1.9, text: schritt.text,
        wenn: () => !laeuft && aktuell() === s && st()[s.id] === i,
        tu: async () => {
          if (laeuft) return; laeuft = true;
          try {
            const ok = await schritt.tu();
            if (ok === false) return;
            st()[s.id] = i + 1;
            if (fertig(s.id)) {
              const d = daten.stationen.find((x) => x.id === s.id);
              if (d && !st().funde.includes(d.nr)) { st().funde.push(d.nr); ui.setzeSiegel(); ui.melde(`Station ${esc(d.roemisch)} abgeschlossen: <b>${esc(d.fund)}</b>`); }
              await s.danach?.();
            }
            spiel.sichere();
          } finally { laeuft = false; aktualisiere(); }
        },
      });
    });
  };

  // Türen zwischen Straße und Innenräumen
  const tuer = (id, szene, pos, text, tu) => spiel.registriere({ id, szene, pos, radius: 1.7, hoehe: 1.6, text, wenn: () => !laeuft, tu });
  // Infopunkte der Straße: historisch belegt, landen im Tagebuch unter „Orte und Zeiten“
  const registriereInfos = () => {
    for (const ip of daten.infopunkte) {
      spiel.registriere({
        id: ip.id, szene: 'strasse', pos: strasse.punkte[ip.ort], radius: 2.4, hoehe: 1.7, text: ip.text,
        wenn: () => !laeuft && strasse.jahr === ip.schicht && !st().tagebuch.includes(ip.eintrag),
        tu: async () => {
          if (laeuft) return; laeuft = true;
          try { await k.zeige(ip.eintrag); ui.melde(`${ip.schicht}: <b>${k.infos(ip.station)} von 3</b> Orten untersucht`); } finally { laeuft = false; aktualisiere(); }
        },
      });
    }
  };

  const portraits = () => {
    const r = spiel.renderer;
    const sz = new THREE.Scene();
    sz.background = new THREE.Color(0x4b3e33);
    sz.add(new THREE.HemisphereLight(0xfff0d8, 0x4a3a2c, 1.7));
    const l = new THREE.DirectionalLight(0xffe2b8, 2.4); l.position.set(1.6, 2.2, 3); sz.add(l);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 20);
    const alt = r.getPixelRatio(), gr = new THREE.Vector2(); r.getSize(gr);
    r.setPixelRatio(1); r.setSize(200, 200, false);
    const aus = {};
    for (const [name, def] of Object.entries(FIG)) {
      const f = baueFigur(def);
      f.gruppe.rotation.y = -0.32; sz.add(f.gruppe);
      const m = def.groesse / 1.76;
      cam.position.set(0.2 * m, 1.66 * m, 2.25 * m); cam.lookAt(0, 1.6 * m, 0);
      r.render(sz, cam);
      aus[name] = r.domElement.toDataURL('image/jpeg', 0.88);
      sz.remove(f.gruppe);
    }
    r.setPixelRatio(alt); r.setSize(gr.x, gr.y, false);
    return aus;
  };

  // Zeitleiste statt Stadtplan
  ui.planFn = () => {
    const a = aktuell();
    return `<div class="zeitleiste">${daten.stationen.map((s) => `<div class="zl ${st().funde.includes(s.nr) ? 'fertig' : ''} ${a && a.id === s.id ? 'jetzt' : ''}"><b>${esc(s.zeit)}</b><span>${esc(s.roemisch)} ${esc(s.name)}</span></div>`).join('')}</div>`;
  };

  // Lehrkraft: Sprung zu einer Station; alles davor gilt als erledigt
  const START = { a0: ['hoersaal'], a1: ['s1863'], a2: ['s1910'], a3: ['s1930'], h: ['hoersaal'], b1: ['fMaerz'], b2: ['fJuni', 'buero'], b3: ['fJuni', 'buero'], b4: ['fNov'], b5: ['fNov', 'buero'], e: ['hoersaal'] };
  const sprung = (id) => async () => {
    spiel.sperre(); await ui.blende(true);
    const z = st(), n = REIHENFOLGE.indexOf(id);
    REIHENFOLGE.forEach((x, i) => { z[x] = i < n ? stationen[x].schritte.length : 0; });
    z.funde = daten.stationen.filter((d) => REIHENFOLGE.indexOf(d.id) < n).map((d) => d.nr);
    if (!z.tippsKapitel1) z.tippsKapitel1 = { p1: 'ja', p2: 'teils', p3: 'nein' };
    if (n > 0 && !z.belege.includes('beleg_buch')) z.belege.push('beleg_tipps', 'beleg_buch');
    buero.zeige(id === 'b4' || id === 'b5' ? [] : []);
    geh(...START[id]);
    ui.setzeSiegel(); spiel.sichere();
    await ui.blende(false); spiel.entsperre();
  };
  const NAMEN = { h: 'Zwischenhalt: Rollenwechsel' };
  ui.lehrkraft = {
    spruenge: REIHENFOLGE.map((id) => ({ name: NAMEN[id] || (() => { const d = daten.stationen.find((x) => x.id === id); return `${d.roemisch}: ${d.name}`; })(), tu: sprung(id) })),
    schalter: [{ name: 'Station B5 (Kartellfall) spielen', an: () => b5Aktiv(), tu: () => { st().b5Aus = b5Aktiv(); spiel.sichere(); aktualisiere(); } }],
  };

  return {
    welt, stationen, k, aktuell,
    bereite() {
      ui.siegelEl.classList.add('viele');
      ui.portraits = portraits();
      registriereStationen(); registriereInfos();
      tuer('t_haus', 'strasse', strasse.punkte.haustuer, 'In die Wohnung gehen', () => hinein('wohnung'));
      tuer('t_wohnung', 'wohnung', wohnung.punkte.tuer, 'Hinaus auf die Straße', hinaus);
      tuer('t_amt', 'frankfurt', frankfurt.punkte.buero, 'In die Verwaltung gehen', () => hinein('buero'));
      tuer('t_buero', 'buero', buero.punkte.tuer, 'Hinaus auf die Straße', hinaus);
      spiel.aktiviereSzene('hoersaal');
      setzeFigur('lena');
      spiel.inBereich('hoersaal', hoersaal.punkte.eintritt.x, hoersaal.punkte.eintritt.z, PI);
      zeigeHoersaal();
    },
    async beginne(wahl) {
      if (wahl === 'weiter') {
        geh(st().wo, st().innen);
        await ui.blende(true);
        ui.blendeTitel();
        spiel.zustand = 'spiel'; spiel.kam.sprung = true;
        ui.canvas.classList.remove('sepia');
        await ui.blende(false);
        ui.zeigeHud();
        return;
      }
      geh('hoersaal');
      ui.blendeTitel();
      const weg = ui.ueberspringen(() => spiel.ueberspringeFahrt());
      await spiel.fahrt(5);
      weg();
      ui.zeigeHud();
      aktualisiere();
      await ui.steuerungsHinweis();
      spiel.sichere();
    },
  };
}
