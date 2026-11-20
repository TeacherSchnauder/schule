// Kapitel I – Marx & Engels: Der Preis des Fortschritts.
// Verbindet Welt, Daten und Stationen mit dem Spielkern. Kapitel II und III bekommen später eigene Ordner.
import * as THREE from 'three';
import { baueAussen } from './welt.js';
import { baueSpinnsaal } from './spinnsaal.js';
import { baueKontor } from './kontor.js';
import { baueKeller } from './keller.js';
import { baueFeld } from './feld.js';
import { Station1, FERTIG1, SPERRE1 } from './stationen/station-1.js';
import { Station2 } from './stationen/station-2.js';
import { Station5, FERTIG5 } from './stationen/station-5.js';
import { Station3, FERTIG3 } from './stationen/station-3.js';
import { Station4, FERTIG4 } from './stationen/station-4.js';
import { baueFigur, FIGUREN } from '../../engine/figur.js';
import { Brief, VERGABE, BIS_STATION, neuerBrief } from './stationen/brief.js';
import { Korridor } from '../../engine/korridor.js';
import { Passanten } from '../../engine/passanten.js';
import { Pfad } from '../../engine/pfad.js';
import { vorhersageText } from '../../ui/vorhersage.js';
import { verhoerText } from '../../ui/verhoer.js';
import { zeitungenText } from '../../ui/zeitungen.js';

// Zusätzliche Felder im Spielstand von Kapitel I
// Tiefe-Update: Ergebnisse der zweistufigen Auswahl, Vorhersagen, Verhöre, Zeitungen und die Schalter der Lehrkraft
export const standZusatz = () => ({ brief: neuerBrief(), auswahl2: {}, vorhersagen: {}, verhoere: {}, zeitungen: {}, schalter: {} });

export async function ladeDaten() {
  const lade = async (name) => {
    const r = await fetch(new URL('./' + name, import.meta.url));
    if (!r.ok) throw new Error(`${name} konnte nicht geladen werden (${r.status}).`);
    return r.json();
  };
  const [inhalte, dialoge, vorhersagen, verhoere, zeitungen] = await Promise.all(['inhalte.json', 'dialoge.json', 'vorhersagen.json', 'verhoere.json', 'zeitungen.json'].map(lade));
  return { ...inhalte, dialoge, vorhersagen, verhoere, zeitungen };
}

export function baueKapitel(spiel, ui, daten) {
  const aussen = baueAussen();
  const saal = baueSpinnsaal();
  const kontor = baueKontor();
  const keller = baueKeller();
  const feld = baueFeld();
  const nord = aussen.nord;
  const HOF_EINTRITT = { x: 0, z: -90.7 };
  const st = () => spiel.stand;
  let nordtorOffen = () => st().schritt >= 6;

  // Leute auf den Straßen: Bahnsteig, Kai, Geschäftsstraße und Gasse
  const La = aussen.pfad.laenge, Lb = nord.pfad.laenge;
  const leute = new Passanten(aussen.szene, [
    { pfad: new Pfad([[-25, 16], [-6, 16]]), von: 0, bis: 19, spuren: [-4.6, 0.9], anzahl: 5, qMin: -4.7, qMax: 1.3, figuren: { stand: 0.35 } },
    { pfad: aussen.pfad, von: 38, bis: La - 7, spuren: [-3.0, 1.5, -1.6, 2.6], anzahl: 13, qMin: -3.4, qMax: 2.85 },
    { pfad: nord.pfad, von: 1.5, bis: 31, spuren: [-1.8, 0.8], anzahl: 6, qMin: -2.4, qMax: 1.0, figuren: { stand: 0.4 } },
    { pfad: nord.pfad, von: 50, bis: Lb - 2.5, spuren: [-1.2, 1.2], anzahl: 3, qMin: -1.6, qMax: 1.6, figuren: { stand: 0 } },
  ], { seed: 1845 });
  const dynamisch = () => leute.hindernisse();

  const welt = {
    pfade: { a: aussen.pfad, b: nord.pfad },
    // Auf beiden Straßen geht man frei: Bahnsteig, Kai und Gassen sind begehbar, nicht nur die Mittellinie.
    korridore: { a: new Korridor({ ...aussen.korridor, dynamisch }), b: new Korridor({ ...nord.korridor, dynamisch }) },
    enden: {
      a: {
        ende: { bereich: 'hof', ...HOF_EINTRITT },
        sperren: [{ s: aussen.pfad.laenge - SPERRE1, offen: () => st().s1 >= FERTIG1 || st().schritt > 0, tu: () => { if (!gesehen().gesperrt1 || spiel.zeit - gesehen().gesperrt1 > 12) { gesehen().gesperrt1 = spiel.zeit; ui.kommentar(station1.bereit ? daten.dialoge.genug1 : daten.dialoge.gesperrt1, 4500); } } }],
      },
      b: {
        anfang: { bereich: 'hof', x: -7, z: -116.2 },
        ende: { bereich: 'irkhof', ...nord.hof.eintritt },
        sperren: [{ s: nord.sperreS, offen: () => st().s3 >= FERTIG3, tu: () => { if (!gesehen().gesperrt3 || spiel.zeit - gesehen().gesperrt3 > 12) { gesehen().gesperrt3 = spiel.zeit; ui.kommentar(daten.dialoge.gesperrt3, 4500); } } }],
      },
    },
    szenen: {
      aussen: { szene: aussen.szene, sonne: aussen.sonne, folgeSonne: aussen.folgeSonne },
      saal: { szene: saal.szene, sonne: saal.sonne },
      kontor: { szene: kontor.szene, sonne: kontor.sonne },
      keller: { szene: keller.szene, sonne: keller.sonne },
      feld: { szene: feld.szene, sonne: feld.sonne },
    },
    bereiche: {
      hof: {
        flaechen: [{ minX: -16.6, maxX: 3.2, minZ: -116.9, maxZ: -89.9 }, { minX: -3, maxX: 3, minZ: -91, maxZ: -86.9 }, { minX: -8.9, maxX: -5.1, minZ: -119.4, maxZ: -115.2 }],
        hindernisse: [...aussen.hof.hindernisse, { minX: -9.4, maxX: -4.6, minZ: -118.2, maxZ: -117.0, aus: () => nordtorOffen() }],
        ausgaenge: [
          { minX: -2.8, maxX: 2.8, minZ: -88.7, maxZ: -86, tu: (sp) => { sp.aufStrasse(sp.pfade.a.laenge - 1.2, true, true, 'a'); ziel(); } },
          { minX: -8.9, maxX: -5.1, minZ: -119.6, maxZ: -118.3, tu: (sp) => { sp.aufStrasse(0.8, false, true, 'b'); ziel(); if (!gesehen().strasse3) { gesehen().strasse3 = true; ui.kommentar(daten.dialoge.strasse3); } } },
        ],
        kamera: { abstand: 6.6, grenzen: { minX: -16.3, maxX: 14, minZ: -128, maxZ: -78 } },
      },
      saal: { flaechen: [saal.flaeche], hindernisse: saal.hindernisse, kamera: { abstand: 5.0, grenzen: saal.grenzen } },
      kontor: { flaechen: [kontor.flaeche], hindernisse: kontor.hindernisse, kamera: { abstand: 4.8, grenzen: kontor.grenzen } },
      feld: { flaechen: [feld.flaeche], hindernisse: feld.hindernisse, kamera: { abstand: 6.6, grenzen: feld.grenzen } },
      keller: { flaechen: [keller.flaeche], hindernisse: keller.hindernisse, kamera: { abstand: 4.4, grenzen: keller.grenzen } },
      irkhof: {
        flaechen: nord.hof.flaechen, hindernisse: nord.hof.hindernisse, kamera: nord.hof.kamera,
        ausgaenge: [{ ...nord.hof.ausgang, tu: (sp) => { sp.aufStrasse(sp.pfade.b.laenge - 1.2, true, true, 'b'); ziel(); } }],
      },
    },
    titelKamera: aussen.titelKamera,
    update(dt, t, sp) {
      if (sp.szeneName === 'aussen') {
        aussen.update(dt, t, sp.kamera);
        leute.setzeAnteil(sp.qualitaet === 'niedrig' ? 0.5 : 1);
        leute.update(dt, sp);
      }
      else if (sp.szeneName === 'saal') saal.update(dt, t);
      else if (sp.szeneName === 'kontor') kontor.update(dt, t);
      else if (sp.szeneName === 'feld') feld.update(dt, t, sp.kamera);
      else keller.update(dt, t);
    },
  };

  const station1 = new Station1(spiel, ui, daten, aussen);
  const station = new Station2(spiel, ui, daten, aussen, saal);
  const station5 = new Station5(spiel, ui, daten, aussen, feld);
  const station3 = new Station3(spiel, ui, daten, aussen, kontor);
  const station4 = new Station4(spiel, ui, daten, aussen, keller);
  // Engels' zerrissener Brief: Schnipsel als Belohnung in Station I–IV, Zusammensetzen nach Station IV
  const brief = new Brief(spiel, ui, daten);
  for (const s of [station1, station, station3, station4]) s.schnipsel = (id) => brief.gib(id);
  // Bausteine A, C und D lassen sich im Lehrkraft-Menü abschalten (Voreinstellung: an)
  const tiefe = { aktiv: (n) => (typeof st().schalter?.[n] === 'boolean' ? st().schalter[n] : daten.kapitel.tiefe?.[n] !== false) };
  for (const s of [station, station3, station5]) s.tiefe = tiefe;
  station5.briefFertig = () => brief.fertig;
  brief.nachher = () => station5.aufbruch();
  ui.inventarZusatz = () => brief.inventarHtml();
  // Ziel und Marker: die Station, die gerade an der Reihe ist
  const ziel = () => {
    const z = st();
    if (spiel.szeneName === 'feld' || (z.s4 >= FERTIG4 && spiel.szeneName === 'aussen' && spiel.ort.bereich === 'irkhof')) station5.aktualisiere();
    else if (z.s1 < FERTIG1 && z.schritt === 0 && spiel.szeneName === 'aussen' && spiel.ort.art === 'schiene' && spiel.ort.pfad === 'a') station1.aktualisiere();
    else if (z.schritt < 6 || spiel.szeneName === 'saal') station.aktualisiere();
    else if (st().s3 < FERTIG3 || spiel.szeneName === 'kontor') station3.aktualisiere();
    else station4.aktualisiere();
  };
  station.weiter = ziel; station1.nachher = ziel; station3.nachher = ziel; station4.nachher = ziel; station5.nachher = ziel;
  const starteStationen = () => {
    station1.start(); station.start(); station3.start(); station4.start(); station5.start(FERTIG4);
    brief.start(() => station5.aufbruchOrt, () => spiel.ort.bereich === 'irkhof' && st().s4 >= FERTIG4);
    ziel();
  };

  // Porträts für Dialoge: Büsten der Figuren einmalig in kleine Bilder rendern.
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
    for (const [name, def] of Object.entries(FIGUREN)) {
      const f = baueFigur(def);
      f.gruppe.rotation.y = -0.32;
      sz.add(f.gruppe);
      const k = def.groesse / 1.76;
      cam.position.set(0.2 * k, 1.66 * k, 2.25 * k); cam.lookAt(0, 1.6 * k, 0);
      r.render(sz, cam);
      aus[name] = r.domElement.toDataURL('image/jpeg', 0.88);
      sz.remove(f.gruppe);
    }
    r.setPixelRatio(alt); r.setSize(gr.x, gr.y, false);
    return aus;
  };

  // Engels' Kommentare unterwegs (erfunden, einmalig)
  const gesehen = () => spiel.stand.gesehen;
  spiel.beiStrecke = (s, pfad) => {
    if (pfad === 'a') {
      if (s > 40 && !gesehen().weg1) { gesehen().weg1 = true; ui.kommentar(daten.dialoge.weg1); }
      if (s > 96 && !gesehen().weg2) { gesehen().weg2 = true; ui.kommentar(daten.dialoge.weg2); }
    } else if (s > 52 && !gesehen().gasse) { gesehen().gasse = true; ui.kommentar(daten.dialoge.gasse); }
  };
  spiel.beiBereich = (id) => {
    if (id === 'hof' && !gesehen().hof && spiel.stand.schritt === 0) { gesehen().hof = true; ui.kommentar(daten.dialoge.hof); }
    if (id === 'irkhof' && !gesehen().irkhof) { gesehen().irkhof = true; ui.kommentar(daten.dialoge.irkhof); }
    ziel();
  };

  ui.planFn = () => stadtplan(spiel, aussen, daten);
  // Lehrkraft: direkt zu einer Station springen. Funde, Belege und Einträge der Stationen davor werden freigeschaltet.
  const gib = (bis, funde, belege) => {
    const z = st();
    for (const e of daten.tagebuch) { if (e.id === bis) break; if (e.reiter !== 'stadt' && !z.tagebuch.includes(e.id)) z.tagebuch.push(e.id); }
    for (const f of funde) if (!z.funde.includes(f)) z.funde.push(f);
    for (const b of belege) if (!z.belege.includes(b)) z.belege.push(b);
  };
  const sprung = (vor, ort) => async () => {
    spiel.sperre();
    await ui.blende(true);
    vor();
    spiel.aktiviereSzene('aussen');
    ort();
    starteStationen(); ui.setzeSiegel();
    spiel.sichere();
    await ui.blende(false);
    spiel.entsperre();
  };
  const B2 = ['beleg_rechnung', 'beleg_zehn', 'beleg_mary', 'beleg_whitlow'];
  const B4 = [...B2, 'beleg_kontor', 'beleg_manifest', 'beleg_chadwick', 'beleg_geruecht'];
  const schnipsel = (ids) => { brief.gibStill(ids); };
  // Stand direkt vor dem Zusammensetzen des Briefs: Station I–IV fertig, alle Schnipsel gesammelt
  const vorBrief = () => {
    gib('s_charter', [1, 2, 3, 4], B4); st().s1 = FERTIG1; st().schritt = 6; st().s3 = FERTIG3; st().s4 = FERTIG4;
    st().brief = { ...neuerBrief(), schnipsel: [...VERGABE] };
  };
  const briefOrt = () => spiel.inBereich('irkhof', nord.hof.eintritt.x - 1, nord.hof.eintritt.z, Math.PI);
  ui.lehrkraft = {
    spruenge: [
      { name: 'Station I: Die Stadt', tu: sprung(() => {}, () => spiel.aufStrasse(0, false, true, 'a')) },
      { name: 'Station II: Spinnerei', tu: sprung(() => { schnipsel(BIS_STATION[2]); }, () => spiel.inBereich('hof', -4, -96, Math.PI)) },
      { name: 'Station III: Kontor', tu: sprung(() => { gib('p_pym', [2], B2); st().schritt = 6; schnipsel(BIS_STATION[3]); }, () => spiel.aufStrasse(6, false, true, 'b')) },
      { name: 'Station IV: Arbeiterviertel', tu: sprung(() => { gib('s_irk', [2, 3], [...B2, 'beleg_kontor', 'beleg_manifest']); st().schritt = 6; st().s3 = FERTIG3; schnipsel(BIS_STATION[4]); }, () => spiel.aufStrasse(nord.pfad.laenge - 8, false, true, 'b')) },
      { name: 'Engels’ Brief (nach Station IV)', tu: sprung(vorBrief, briefOrt) },
      { name: 'Station V: Versammlung', tu: sprung(() => { vorBrief(); st().brief.fertig = true; st().brief.phase = 4; if (!st().tagebuch.includes('d_vater')) st().tagebuch.push('d_vater'); }, () => { spiel.aktiviereSzene('feld'); spiel.inBereich('feld', feld.punkte.eintritt.x, feld.punkte.eintritt.z, Math.PI); }) },
    ],
    schalter: [
      ['vorhersage', 'Vorhersagen (Station II und III)'],
      ['verhoer', 'Verhör mit Mr. Whitlow (Station III)'],
      ['zeitungen', 'Zwei Zeitungen (Station V)'],
    ].map(([n, name]) => ({ name, an: () => tiefe.aktiv(n), tu: () => { st().schalter = { ...st().schalter, [n]: !tiefe.aktiv(n) }; spiel.sichere(); ziel(); } })),
  };

  // Notizen kopieren: Vorhersagen, Verhörprotokoll, Zeitungsnotiz und Aufgaben mit gezeigter Lösung
  ui.notizenZusatz = () => {
    const z = [], s = st();
    const vh = Object.values(daten.vorhersagen).filter((v) => s.vorhersagen?.[v.id]?.wert);
    if (vh.length) z.push('', 'VORHERSAGEN', ...vh.map((v) => '- ' + vorhersageText(v, s.vorhersagen[v.id])));
    for (const v of Object.values(daten.verhoere)) z.push(...verhoerText(v, s.verhoere?.[v.id]));
    for (const v of Object.values(daten.zeitungen)) z.push(...zeitungenText(v, s.zeitungen?.[v.id]));
    const titel = {};
    const sammle = (o) => { if (o && typeof o === 'object') { if (o.stufe1 && o.id) titel[o.id] = o.titel + ': ' + o.stufe1.frage; else Object.values(o).forEach(sammle); } };
    sammle(daten);
    const ns = Object.entries(s.auswahl2 || {}).filter(([, e]) => !e.selbst).map(([id]) => '- ' + (titel[id] || id));
    if (ns.length) z.push('', 'NICHT SELBST GELÖST (Lösung nach dem vierten Fehlversuch gezeigt)', ...ns);
    return z;
  };

  return {
    welt, station, station1, station3, station4, station5, brief,

    bereite() {
      ui.portraits = portraits();
      // Infopunkte am Weg: freiwillig, historisch belegt, landen im Tagebuch unter „Stadt 1845“
      let liest = false;
      for (const ip of daten.infopunkte) {
        spiel.registriere({
          id: ip.id, szene: 'aussen', pos: aussen.infoOrte[ip.id], radius: ip.radius, hoehe: 1.7, text: ip.text,
          tu: async () => {
            if (liest) return; liest = true;
            try {
              const e = daten.tagebuch.find((x) => x.id === ip.eintrag);
              const neu = !spiel.stand.tagebuch.includes(e.id);
              await ui.karte({ titel: e.titel, marke: e.marke, text: e.text, quelle: e.quelle, knopf: neu ? 'Ins Tagebuch' : 'Weiter' });
              if (neu) {
                ui.schalteFrei(e.id);
                const ids = daten.infopunkte.map((x) => x.eintrag);
                const n = ids.filter((id) => spiel.stand.tagebuch.includes(id)).length;
                ui.melde(`Stadt 1845: <b>${n} von ${ids.length}</b> Orten entdeckt`);
                station1.nachInfo(); ziel();
              }
            } finally { liest = false; }
          },
        });
      }
      spiel.aktiviereSzene('aussen');
      spiel.aufStrasse(0, false, true, 'a');
    },

    async beginne(wahl) {
      const o = spiel.stand.ort;
      if (wahl === 'weiter') {
        // gespeicherten Ort wiederherstellen
        const innen = { saal, kontor, keller, feld }[o.szene];
        if (innen) { spiel.aktiviereSzene(o.szene); spiel.inBereich(o.szene, o.x, o.z, Math.PI); }
        else if (o.art === 'frei' && welt.bereiche[o.bereich]) spiel.inBereich(o.bereich, o.x, o.z, Math.PI);
        else spiel.aufStrasse(o.s || 0, false, true, welt.pfade[o.pfad] ? o.pfad : 'a');
        const b = spiel.bereich;
        if (b && !spiel._begehbar(b, spiel.pos.x, spiel.pos.z)) {
          if (innen) spiel.inBereich(o.szene, innen.punkte.eintritt.x, innen.punkte.eintritt.z, Math.PI);
          else if (o.bereich === 'irkhof') spiel.inBereich('irkhof', nord.hof.eintritt.x - 1, nord.hof.eintritt.z, Math.PI);
          else spiel.inBereich('hof', HOF_EINTRITT.x, HOF_EINTRITT.z, Math.PI);
        }
        starteStationen();
        if (innen) { await ui.blende(true); }
        ui.blendeTitel();
        spiel.zustand = 'spiel';
        spiel.kam.sprung = true;
        if (innen) { ui.canvas.classList.remove('sepia'); await ui.blende(false); }
        ui.zeigeHud();
        return;
      }
      // Neues Spiel: Überblendung vom Foto in die Welt, Kamerafahrt zum Bahnhof
      spiel.aufStrasse(0, false, true, 'a');
      ui.blendeTitel();
      const weg = ui.ueberspringen(() => spiel.ueberspringeFahrt());
      await spiel.fahrt(6.5);
      weg();
      ui.zeigeHud();
      starteStationen();
      await ui.dialog(daten.dialoge.ankunft);
      ui.schalteFrei('d_reise', 'p_marx', 'p_engels');
      await ui.steuerungsHinweis();
      spiel.sichere();
    },
  };
}

// ---------------------------------------------------------------------------
// Stilisierter Stadtplan als SVG, gezeichnet aus den Daten der Welt.
function stadtplan(spiel, aussen, daten) {
  const X0 = -84, Z0 = -214, M = 3;
  const px = (x) => ((x - X0) * M).toFixed(1), pz = (z) => ((z - Z0) * M).toFixed(1);
  const B = (36 - X0) * M, H = (34 - Z0) * M;
  const achse = aussen.achse, pfad = aussen.pfad;
  const linie = (fn, n, von, bis) => { const p = []; for (let i = 0; i <= n; i++) { const [x, z] = fn(von + (bis - von) * i / n); p.push(`${px(x)},${pz(z)}`); } return p; };
  const kanalL = linie((s) => { const p = achse.punkt(s), n = achse.rechts(s); return [p.x + n.x * 5, p.z + n.z * 5]; }, 40, 30, 225);
  const kanalR = linie((s) => { const p = achse.punkt(s), n = achse.rechts(s); return [p.x + n.x * 19, p.z + n.z * 19]; }, 40, 30, 225).reverse();
  const weg = linie((s) => { const p = pfad.punkt(s); return [p.x, p.z]; }, 50, 0, pfad.laenge);
  const haus = (x, z, b, t, f = '#b98a6f') => `<rect x="${px(x - b / 2)}" y="${pz(z - t / 2)}" width="${b * M}" height="${t * M}" fill="${f}" stroke="#6b4634" stroke-width="1"/>`;
  const fertig = spiel.stand.funde.includes(2);
  const wegB = linie((s) => { const p = aussen.nord.pfad.punkt(s); return [p.x, p.z]; }, 40, 0, aussen.nord.pfad.laenge);
  const kreis = (x, z, nr, text, tx, tz) => { const f = spiel.stand.funde.includes(nr); return `<circle cx="${px(x)}" cy="${pz(z)}" r="13" fill="${f ? '#8f3f2c' : '#efe4cc'}" stroke="#2b2520" stroke-width="1.5"/><text x="${px(x)}" y="${(+pz(z) + 5).toFixed(1)}" text-anchor="middle" font-size="13" class="t" style="fill:${f ? '#f6e6c6' : '#2b2520'}">${['', 'I', 'II', 'III', 'IV', 'V'][nr]}</text><text x="${px(tx)}" y="${pz(tz)}" font-size="12" class="t">${text}</text>`; };
  const ort = { saal: [-21, -103.5], kontor: [-13, -137.5], keller: [-62, -181.6], feld: [-70, -205] }[spiel.szeneName] || [spiel.pos.x, spiel.pos.z];
  const zeile = [[-8, 12], [-21.5, 12.5], [-35, 12], [-48.5, 13], [-61.5, 11], [-73.5, 11], [-83.2, 6.5]];
  return `<svg class="plan" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Stadtplan">
    <rect width="${B}" height="${H}" fill="#e6d8b6"/>
    <polygon points="${kanalL.concat(kanalR).join(' ')}" fill="#9fb0a6" stroke="#6f8279" stroke-width="1"/>
    <line x1="0" y1="${pz(23)}" x2="${B}" y2="${pz(23)}" stroke="#4b4743" stroke-width="3" stroke-dasharray="10 5"/>
    ${haus(-18, 7, 20, 7, '#c9a184')}
    ${zeile.map(([z, w]) => haus(-10.5, z, 10, w)).join('')}
    ${[[4, 16], [-18, 22], [-44, 18], [-68, 24], [-98, 20]].map(([z, w]) => haus(29, z, 12, w, '#a98672')).join('')}
    <rect x="${px(-17)}" y="${pz(-117.4)}" width="${20.6 * M}" height="${28.2 * M}" fill="#d9c9a3" stroke="#6b4634" stroke-width="1.5"/>
    ${haus(-25.5, -103.5, 17, 26, '#a5644a')}
    <circle cx="${px(-34)}" cy="${pz(-131)}" r="7" fill="#74402f"/>
    <polyline points="${weg.join(' ')}" fill="none" stroke="#7a5f2c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="0" y="${pz(-196)}" width="${B}" height="${8.5 * M}" fill="#6f7a70" stroke="#4b5a52" stroke-width="1"/>
    <text x="${px(-30)}" y="${pz(-189.5)}" font-size="11" font-style="italic" style="fill:#efe4cc">Irk</text>
    ${[[-126, 11], [-137.5, 11], [-149, 11]].map(([z, w]) => haus(-15.6, z, 10, w)).join('')}
    ${[[-125, 10], [-136, 11], [-147.5, 11]].map(([z, w]) => haus(0.2, z, 7, w)).join('')}
    ${[[-22.5, 11], [-33, 10], [-42.5, 9]].map(([x, w]) => haus(x, -182.8, w, 8, '#8a6c5c')).join('')}
    ${[[-33, 10], [-42.5, 9]].map(([x, w]) => haus(x, -169.2, w, 8, '#8a6c5c')).join('')}
    <rect x="${px(-63.4)}" y="${pz(-186.3)}" width="${16.3 * M}" height="${18.7 * M}" fill="#cbbb96" stroke="#6b4634" stroke-width="1.5"/>
    ${haus(-67.4, -177, 8, 19, '#8a6c5c')}${haus(-55, -163.6, 16.5, 8, '#8a6c5c')}
    <polyline points="${wegB.join(' ')}" fill="none" stroke="#7a5f2c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    ${kreis(-15.6, -137.5, 3, 'Kontor', -46, -136)}
    ${kreis(-55, -177, 4, 'Hof am Irk', -82, -160)}
    <text x="${px(-82)}" y="${pz(-208)}" font-size="12" class="t">V Versammlung: Feld vor der Stadt ↖</text>
    <text x="${px(-30)}" y="${pz(29)}" font-size="13" class="t">Bahnhof</text>
    <text x="${px(12)}" y="${pz(-40)}" font-size="12" font-style="italic" text-anchor="middle" transform="rotate(-90 ${px(12)} ${pz(-40)})">Kanal</text>
    ${kreis(-12, 20, 1, 'Die Stadt', -40, 2)}
    <circle cx="${px(-25.5)}" cy="${pz(-103.5)}" r="15" fill="${fertig ? '#8f3f2c' : '#efe4cc'}" stroke="#2b2520" stroke-width="1.5"/>
    <text x="${px(-25.5)}" y="${(+pz(-103.5) + 5).toFixed(1)}" text-anchor="middle" font-size="14" class="t" fill="${fertig ? '#f6e6c6' : '#2b2520'}" style="fill:${fertig ? '#f6e6c6' : '#2b2520'}">II</text>
    <text x="${px(-60)}" y="${pz(-84)}" font-size="13" class="t">Spinnerei</text>
    <circle cx="${px(ort[0])}" cy="${pz(ort[1])}" r="7" fill="#a23c2a" stroke="#f6eedb" stroke-width="2.5"/>
    <text x="${(+px(ort[0]) + 12).toFixed(1)}" y="${(+pz(ort[1]) + 4).toFixed(1)}" font-size="12" font-weight="600">Ihr seid hier</text>
    <text x="${B - 12}" y="18" text-anchor="end" font-size="12">N ↑</text>
  </svg>`;
}
