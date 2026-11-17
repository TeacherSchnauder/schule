// Kapitel III – Das Tribunal: Vorbereitung der Verhandlung in vier Rollengruppen.
// Verbindet Szenen, Daten und Stationen mit dem Spielkern. Texte und Zahlen liegen in den JSON-Dateien dieses Ordners.
// Die Verhandlung selbst findet im Klassenraum statt; dafür gibt es die Beamer-Ansicht (beamer.js).
import * as THREE from 'three';
import { Pfad } from '../../engine/pfad.js';
import { baueFigur } from '../../engine/figur.js';
import { leseStandVon } from '../../engine/speicher.js';
import { el, esc } from '../../ui/oberflaeche.js';
import { notiz } from '../../ui/raetsel.js';
import { zeitreise } from '../../ui/zeitreise.js';
import { waehleRolle } from '../../ui/rollen.js';
import { zeigeAkte, fuegeHinzu } from '../../ui/akte.js';
import { baueSaal } from './gericht.js';
import { baueAsservaten, baueZeugenzimmer } from './archiv.js';
import { baueKette } from './kette.js';
import { FIG, spielfigur } from './figuren.js';
import { baueStationen } from './stationen.js';

const PI = Math.PI;
export const REIHENFOLGE = ['t0', 't1', 't2', 't3', 't4', 't5'];
const KURZ_AUS = ['t1', 't3'];   // entfallen in der Kurzfassung (45 Minuten)

export const standZusatz = () => ({
  t0: 0, t1: 0, t2: 0, t3: 0, t4: 0, t5: 0,
  wo: 'saal', rolle: null, figur: 'studentin',
  akte: [], importiert: null, tippKette: null, befragt: {}, werkbank: {}, werkbankFertig: false, statistikGesehen: [], kurz: null,
});

export async function ladeDaten() {
  const lade = async (name) => {
    const r = await fetch(new URL('./' + name, import.meta.url));
    if (!r.ok) throw new Error(`${name} konnte nicht geladen werden (${r.status}).`);
    return r.json();
  };
  const [inhalte, dialoge, zitate, gegenwart, statistiken] = await Promise.all(['inhalte.json', 'dialoge.json', 'zitate.json', 'gegenwart.json', 'statistiken.json'].map(lade));
  const d = { ...inhalte, dialoge, zitate, gegenwart, statistiken };
  // Tagebuch aus den Daten bilden: Was die Gruppe gesehen hat, kann sie dort nachlesen.
  const T = [];
  for (const b of d.beweise) T.push({ id: 'd_' + b.id, reiter: 'dokumente', marke: b.marke, titel: `Beweisstück ${b.fach}: ${b.titel}`, text: `${b.text} Was es nicht zeigt: ${b.zeigtNicht}`, quelle: b.herkunft });
  for (const [id, g] of Object.entries(zitate)) T.push({ id: 'd_' + id, reiter: 'dokumente', marke: 'position', titel: `${g.name}: ${g.werk}`, text: `${g.paraphrase} ${g.einwand}`, quelle: g.quelleParaphrase });
  for (const r of d.kette.raeume) T.push({ id: 'o_' + r.id, reiter: 'stadt', marke: r.marke, titel: r.titel, text: r.text.replace(/\n/g, ' ') + (r.zahlen ? ' ' + r.zahlen.map((z) => gegenwart.zahlen[z].text).join(' · ') : ''), quelle: r.zahlen ? 'siehe Zahlenkarten; Stand ' + gegenwart.stand : '' });
  T.push({ id: 'o_vergleich', reiter: 'stadt', marke: 'vereinfachung', titel: d.kette.vergleich.titel, text: d.kette.vergleich.tabelle.zeilen.map((z) => `${z[0]} ↔ ${z[1]}`).join(' · ') });
  for (const z of dialoge.zeugen) T.push({ id: 'p_' + z.id, reiter: 'personen', marke: 'erfunden', titel: d.personen[z.id].name, text: z.intro });
  T.push({ id: 'b_regeln', reiter: 'begriffe', marke: 'vereinfachung', titel: d.spielregeln.titel, text: d.spielregeln.text.replace(/\n/g, ' ') });
  T.push({ id: 'b_vermoegen', reiter: 'begriffe', marke: d.vermoegen.begriff.marke, titel: d.vermoegen.begriff.titel, text: d.vermoegen.begriff.text.replace(/\n/g, ' ') });
  T.push({ id: 'b_waegen', reiter: 'begriffe', marke: 'position', titel: d.vermoegen.waegen.titel, text: d.vermoegen.waegen.zeilen.map((z) => `Dafür: ${z[0]} Dagegen: ${z[1]}`).join(' ') + ' ' + d.vermoegen.waegen.positionen });
  T.push({ id: 'b_gini', reiter: 'begriffe', marke: 'vereinfachung', titel: 'Gini-Koeffizient', text: 'Maß für Ungleichheit zwischen 0 (alle haben gleich viel) und 1 (einer hat alles). ' + statistiken.lorenz.erkenntnis.replace(/^Geschafft[^.]*\.\s*/, '') });
  d.tagebuch = T;
  return d;
}

export function baueKapitel(spiel, ui, daten) {
  spiel.ohneBegleiter = true;
  const saal = baueSaal(), asservaten = baueAsservaten(), zeugen = baueZeugenzimmer(), kette = baueKette();
  const szenen = { saal, asservaten, zeugen, kette };
  const st = () => spiel.stand;
  const kurz = () => (st().kurz === null ? daten.kapitel.kurzfassung === true : st().kurz);

  const sz = (o) => ({ szene: o.szene, get sonne() { return o.sonne; } });
  const welt = {
    pfade: { a: new Pfad([[0, 0], [0, -10]]) },
    enden: {},
    szenen: { saal: sz(saal), asservaten: sz(asservaten), zeugen: sz(zeugen), kette: sz(kette) },
    bereiche: {
      saal: { flaechen: [saal.flaeche], hindernisse: saal.hindernisse, kamera: { abstand: 5.8, grenzen: saal.grenzen } },
      asservaten: { flaechen: [asservaten.flaeche], hindernisse: asservaten.hindernisse, kamera: { abstand: 4.6, grenzen: asservaten.grenzen } },
      zeugen: { flaechen: [zeugen.flaeche], hindernisse: zeugen.hindernisse, kamera: { abstand: 4.5, grenzen: zeugen.grenzen } },
      kette: { flaechen: [kette.flaeche], hindernisse: kette.hindernisse, kamera: { abstand: 6.0, grenzen: kette.grenzen } },
    },
    titelKamera: { pos: new THREE.Vector3(6.2, 4.6, 7.4), ziel: new THREE.Vector3(-0.6, 1.7, -5), fokus: new THREE.Vector3(0, 0, 0) },
    update(dt, t, sp) { szenen[sp.szeneName].update(dt, t); },
  };

  // ------------------------------------------------------------ Figur, Orte, Türen
  let figurName = null;
  const setzeFigur = () => { const n = `${st().figur}|${st().rolle}`; if (n !== figurName) { spiel.wechsleFigur(spielfigur(st().figur, st().rolle)); figurName = n; } };
  const geh = (wo) => {
    const name = szenen[wo] ? wo : 'saal', s = szenen[name];
    st().wo = name; setzeFigur();
    spiel.aktiviereSzene(name); spiel.inBereich(name, s.punkte.eintritt.x, s.punkte.eintritt.z, PI);
    if (name === 'zeugen') k.zeigeZeugentafel();
    aktualisiere();
  };
  // Türen: Saal ↔ Nebenräume. zurueck: Punkt im Saal vor der jeweiligen Tür.
  const TUEREN = {
    asservaten: { im: () => saal.punkte.tAsservaten, zurueck: { x: -6.9, z: -4.9, ry: 0 }, name: 'In die Asservatenkammer' },
    zeugen: { im: () => saal.punkte.tZeugen, zurueck: { x: 6.9, z: -4.9, ry: 0 }, name: 'Ins Zeugenzimmer' },
    kette: { im: () => saal.punkte.tKette, zurueck: { x: 7.0, z: 1.4, ry: -PI / 2 }, name: 'In „Die Kette“' },
  };
  const hinein = async (raum) => {
    if (kurz() && KURZ_AUS.includes(raum === 'asservaten' ? 't1' : raum === 'zeugen' ? 't3' : '')) { ui.melde('Heute geschlossen (Kurzfassung).'); return; }
    const s = szenen[raum]; await spiel.wechsleSzene(raum, raum, s.punkte.eintritt.x, s.punkte.eintritt.z, PI); st().wo = raum; if (raum === 'zeugen') k.zeigeZeugentafel(); spiel.sichere(); aktualisiere();
  };
  const hinaus = async () => { const t = TUEREN[spiel.szeneName].zurueck; await spiel.wechsleSzene('saal', 'saal', t.x, t.z, t.ry); st().wo = 'saal'; spiel.sichere(); aktualisiere(); };

  function zeigeSaal() {
    const r = daten.rollen.find((x) => x.id === st().rolle);
    const fertigAlle = REIHENFOLGE.every((id) => fertig(id));
    saal.zeigeLeinwand(fertigAlle
      ? [['Die Verhandlung beginnt in eurer Klasse.', 'h'], [`Eure Rolle: ${r?.name || '–'}`, 't'], ['Eure Karte zum Vorlesen liegt in der Akte.', 't']]
      : [['Ist der Kapitalismus ein Wohlstandsmotor', 'h'], ['oder ein gesellschaftliches Problem?', 'h'], [r ? `Eure Rolle: ${r.name}` : 'Vier Rollen: Anklage · Verteidigung · Sachverständige · Jury', 't'], [kurz() ? 'Kurzfassung: Die Kette · Werkbank · Gegenseite' : 'Asservatenkammer · Die Kette · Zeugenzimmer · Werkbank', 't']]);
  }
  // Preisschilder und Tafeln der Kette aus den Daten
  const G = daten.gegenwart.kette;
  for (const a of G.anteile) kette.zeigePreis(a.raum, { name: a.name, wert: a.wert, hinweis: a.zahl ? 'Schätzung, siehe Quelle' : '' });
  kette.zeigeBalken(G.anteile, G.ladenpreis);
  kette.zeigeTafel([['Verteilung in Zahlen', 'h'], ['Was misst der Gini-Koeffizient?', 't'], ...daten.statistiken.statistiken.map((s) => ['· ' + s.titel, 't'])]);

  // ------------------------------------------------------------ Werkzeuge für die Stationen
  const k = {
    spiel, ui, daten, st, szenen, geh, FIG, leseStandVon, setzeFigur, zeigeSaal, kurz,
    sag: (id) => ui.dialog(daten.dialoge[id]),
    async denk(id) {
      const t = await notiz(ui, { zuKurz: 'Schreibt etwas ausführlicher.', ...daten.denkpausen[id] }, st().notizen[id] || '');
      if (t === null) return false;
      st().notizen[id] = t; spiel.sichere();
      return true;
    },
    notizFrei: (id, vorgabe) => notiz(ui, { zuKurz: 'Schreibt etwas ausführlicher.', ...daten.denkpausen[id] }, vorgabe),
    zeigeAkte: () => {
      const fuss = [];
      if (st().werkbankFertig) { const b = el('button', 'knopf still', 'Karte zum Vorlesen'); b.addEventListener('click', () => k.vorlesen()); fuss.push(b); }
      return zeigeAkte(ui, st().akte, { titel: `Akte der Gruppe${st().rolle ? ' · ' + daten.rollen.find((r) => r.id === st().rolle).name : ''}`, fuss });
    },
    // Kurzfassung: Asservatenkammer und Zeugenzimmer entfallen; ihre wichtigsten Inhalte liegen fest in der Akte.
    sichereKurz() {
      const r = k.rolleDaten(), Z = daten.dialoge.zeugen;
      const aussagen = (r.pflichtZeugen.length > 1 ? r.pflichtZeugen.slice(0, 2).map((id) => [id, Z.find((z) => z.id === id).fragen[0]]) : Z.find((z) => z.id === 'kaya').fragen.slice(0, 2).map((q) => ['kaya', q]))
        .map(([id, q]) => ({ id: `zeuge_${id}_${q.id}`, titel: `Aussage: ${daten.personen[id].name.split(',')[0]}`, text: q.akte, kapitel: id === 'mary' ? 1 : ['jack', 'annie', 'haendler'].includes(id) ? 2 : 3, marke: 'erfunden', quelle: 'Zeugenaussage (erfunden)' }));
      fuegeHinzu(st().akte, [...daten.beweise.map(k.beweisEintrag), ...aussagen]);
    },
  };

  // ------------------------------------------------------------ Stationen und Ablauf
  const stationen = {};
  for (const s of baueStationen(k)) stationen[s.id] = s;
  function fertig(id) { return st()[id] >= stationen[id].schritte.length || (kurz() && KURZ_AUS.includes(id)); }
  const aktuell = () => { const id = REIHENFOLGE.find((x) => !fertig(x)); return id ? stationen[id] : null; };
  const pos = (p) => (typeof p === 'function' ? p() : p);
  function aktualisiere() {
    const s = aktuell();
    if (!s) { spiel.setzeZiel(daten.ende); return; }
    const i = st()[s.id], schritt = s.schritte[i], text = daten.ziele[s.id][i];
    if (schritt.szene === spiel.szeneName) spiel.setzeZiel(text, pos(schritt.pos), schritt.szene);
    else if (spiel.szeneName === 'saal') spiel.setzeZiel(text, TUEREN[schritt.szene].im(), 'saal');
    else spiel.setzeZiel(text, szenen[spiel.szeneName].punkte.tuer, spiel.szeneName);
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
              if (d && !st().funde.includes(d.nr)) { st().funde.push(d.nr); ui.setzeSiegel(); ui.melde(`${esc(d.roemisch)} abgeschlossen: <b>${esc(d.fund)}</b>`); }
            }
            spiel.sichere();
          } finally { laeuft = false; aktualisiere(); }
        },
      });
    });
  };
  const tuer = (id, szene, p, text, tu) => spiel.registriere({ id, szene, pos: p, radius: 1.8, hoehe: 1.6, text, wenn: () => !laeuft, tu });

  const portraits = () => {
    const r = spiel.renderer;
    const sz2 = new THREE.Scene();
    sz2.background = new THREE.Color(0x4a4e52);
    sz2.add(new THREE.HemisphereLight(0xf6f2ea, 0x4a4640, 1.7));
    const l = new THREE.DirectionalLight(0xfff0d8, 2.3); l.position.set(1.6, 2.2, 3); sz2.add(l);
    const cam = new THREE.PerspectiveCamera(24, 1, 0.1, 20);
    const alt = r.getPixelRatio(), gr = new THREE.Vector2(); r.getSize(gr);
    r.setPixelRatio(1); r.setSize(200, 200, false);
    const aus = {};
    for (const [name, def] of Object.entries(FIG)) {
      const f = baueFigur(def);
      f.gruppe.rotation.y = -0.32; sz2.add(f.gruppe);
      const m = def.groesse / 1.76;
      cam.position.set(0.2 * m, 1.66 * m, 2.25 * m); cam.lookAt(0, 1.6 * m, 0);
      r.render(sz2, cam);
      aus[name] = r.domElement.toDataURL('image/jpeg', 0.88);
      sz2.remove(f.gruppe);
    }
    r.setPixelRatio(alt); r.setSize(gr.x, gr.y, false);
    return aus;
  };

  ui.planFn = () => {
    const a = aktuell();
    return `<div class="zeitleiste">${daten.stationen.map((s) => `<div class="zl ${st().funde.includes(s.nr) ? 'fertig' : ''} ${a && a.id === s.id ? 'jetzt' : ''}"><b>${esc(kurz() && KURZ_AUS.includes(s.id) ? 'entfällt' : s.zeit)}</b><span>${esc(s.roemisch)} ${esc(s.name)}</span></div>`).join('')}</div>`;
  };
  // Die Tasche oben rechts zeigt in Kapitel III die Akte.
  ui.oeffneInventar = () => { if (spiel.blockiert) return; ui.hud.querySelector('[data-a="inventar"] .punkt').hidden = true; k.zeigeAkte(); };
  ui.notizenZusatz = () => (st().akte.length ? ['', 'AKTE', ...st().akte.map((e) => `- [Kapitel ${'I'.repeat(e.kapitel)}] ${e.titel}: ${e.text}`)] : []);

  // Lehrkraft: Sprünge, Kurzfassung, Rolle ändern, Beamer-Ansicht
  const sprung = (id) => async () => {
    spiel.sperre(); await ui.blende(true);
    const z = st(), n = REIHENFOLGE.indexOf(id);
    REIHENFOLGE.forEach((x, i) => { z[x] = i < n ? stationen[x].schritte.length : 0; });
    z.funde = daten.stationen.filter((d) => REIHENFOLGE.indexOf(d.id) < n).map((d) => d.nr);
    if (n > 0) { if (!z.rolle) z.rolle = 'jury'; fuegeHinzu(z.akte, daten.beweise.map(k.beweisEintrag)); k.sichereKurz(); }
    if (n < 4) { z.werkbankFertig = false; }
    figurName = null; geh('saal'); zeigeSaal();
    ui.setzeSiegel(); spiel.sichere();
    await ui.blende(false); spiel.entsperre();
  };
  ui.lehrkraft = {
    spruenge: [
      ...REIHENFOLGE.map((id) => { const d = daten.stationen.find((x) => x.id === id); return { name: `${d.roemisch}: ${d.name}`, tu: sprung(id) }; }),
      { name: 'Rolle dieses Geräts ändern', tu: async () => { const w = await waehleRolle(ui, daten.rollen, { titel: 'Rolle dieses Geräts ändern', vorgabe: { rolle: st().rolle, figur: st().figur } }); st().rolle = w.rolle; st().figur = w.figur; st().notizen.rolle = k.rolleDaten().name + ': ' + k.rolleDaten().auftrag; setzeFigur(); zeigeSaal(); if (kurz()) k.sichereKurz(); spiel.sichere(); aktualisiere(); } },
      { name: 'Beamer-Ansicht öffnen', tu: () => { window.open(new URL('kapitel-3.html?beamer', window.location.href).href, '_blank'); } },
    ],
    schalter: [{ name: 'Kurzfassung (45 Minuten)', an: () => kurz(), tu: () => { st().kurz = !kurz(); if (st().kurz && st().rolle) k.sichereKurz(); zeigeSaal(); spiel.sichere(); aktualisiere(); } }],
  };

  return {
    welt, stationen, k, aktuell, fertig,
    bereite() {
      ui.siegelEl.classList.add('viele');
      ui.portraits = portraits();
      ui.portraits.studentin = ui.portraits.studentin; ui.portraits.student = ui.portraits.student;
      registriereStationen();
      for (const [raum, t] of Object.entries(TUEREN)) {
        tuer('t_' + raum, 'saal', t.im, t.name, () => hinein(raum));
        tuer('t_' + raum + '_zurueck', raum, szenen[raum].punkte.tuer, 'Zurück in den Saal', hinaus);
      }
      spiel.aktiviereSzene('saal');
      setzeFigur();
      spiel.inBereich('saal', saal.punkte.eintritt.x, saal.punkte.eintritt.z, PI);
      zeigeSaal();
    },
    async beginne(wahl) {
      if (wahl === 'weiter') {
        geh(st().wo); zeigeSaal();
        await ui.blende(true);
        ui.blendeTitel();
        spiel.zustand = 'spiel'; spiel.kam.sprung = true;
        ui.canvas.classList.remove('sepia');
        await ui.blende(false);
        ui.zeigeHud();
        return;
      }
      figurName = null; geh('saal'); zeigeSaal();
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
