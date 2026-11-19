// Figuren aus weichen Grundformen (Kapseln, Kugeln, runde Zylinder): erwachsen proportioniert,
// mit dezenter Lauf- und Leerlaufanimation. Dieselben Formen dienen auch für stehende Nebenfiguren (figurStatisch).
import * as THREE from 'three';
import { Bauer, FARBEN, zufall } from './bausteine.js';

const material = new THREE.MeshLambertMaterial({ vertexColors: true });

// Vollständige Beschreibung einer Figur mit Vorgaben.
function normiere(o = {}) {
  const d = {
    groesse: 1.76, breite: 1, dicke: 1, kopf: 1,
    rock: FARBEN.anthrazit, rockLang: true,
    hose: 0x3a3836, weste: null, hemd: 0xe6dcc6, halstuch: 0x2a2624,
    haut: FARBEN.haut, haar: 0x2a2420,
    bart: null,             // 'voll' | 'backen' | 'backenGrau' | 'schnurr' | null
    kurzeHose: false,       // Kinder: Hose bis zum Knie
    hut: null,              // 'zylinder' | 'kappe' | 'melone' | 'filzhut' | 'strohhut' | 'glocke' | 'damenhut' | 'haube' | null
    hutFarbe: null,
    kleid: null,            // Farbe des Rocks bei Frauenfiguren
    schuerze: null, tuch: null, schultertuch: null,
    brille: false, holzschuhe: false, barfuss: false, kleidKurz: 0,   // kleidKurz: Saumhöhe über dem Boden in m (0 = bodenlang)
    zopf: false, kragen: null,
    robe: null,             // Farbe einer offenen Robe über der Kleidung
    mappe: null,            // Farbe einer Mappe unter dem Arm
    korb: null,             // Farbe eines Korbs am Arm
    dupatta: null,          // Farbe eines Schals über der Schulter
    sepiaFigur: false,      // entsättigt: Figur aus der Vergangenheit (Kapitel III)
    seed: 3,
    ...o,
  };
  if (d.sepiaFigur) {
    const s = (c) => (c === null || c === undefined ? c : new THREE.Color(c).lerp(new THREE.Color(0x9a8466), 0.7).getHex());
    for (const k of ['rock', 'hose', 'weste', 'hemd', 'halstuch', 'haut', 'haar', 'kleid', 'schuerze', 'tuch', 'kragen', 'schultertuch', 'hutFarbe', 'korb']) d[k] = s(d[k]);
  }
  return d;
}

// --- Formen ---------------------------------------------------------------------------------
// Koordinaten für eine 1,76 m große Figur; die Größe wird über die Skalierung der ganzen Figur eingestellt.
// FEIN: bewegliche Hauptfiguren mit mehr Rundungen; stehende Nebenfiguren (oft viele) etwas sparsamer.
let FEIN = true;
const _geo = new Map();
const form = (k, mach) => { let g = _geo.get(k); if (!g) { g = mach(); _geo.set(k, g); } return g; };
const kugel = (b, r, f, o) => {
  const [w, h] = FEIN ? (r < 0.03 ? [6, 4] : r < 0.07 ? [10, 7] : [14, 10]) : (r < 0.07 ? [6, 4] : [9, 7]);
  return b.hinzu(form(`k${r}_${w}`, () => new THREE.SphereGeometry(r, w, h)), f, { glatt: true, ...o });
};
const kapsel = (b, r, l, f, o) => {
  const [c, s] = FEIN ? [3, 10] : [2, 7];
  return b.hinzu(form(`c${r}_${l}_${s}`, () => new THREE.CapsuleGeometry(r, l, c, s)), f, { glatt: true, ...o });
};
const rohr = (b, r1, r2, h, f, o) => {
  const s = FEIN ? 16 : 9;
  return b.hinzu(form(`z${r1}_${r2}_${h}_${s}`, () => new THREE.CylinderGeometry(r1, r2, h, s)), f, { glatt: true, ...o });
};

function rumpfFormen(b, d) {
  const st = 0.02;
  const dk = d.dicke, br = d.breite;
  const tiefe = 0.76 * (1 + (dk - 1) * 0.6);
  if (d.kleid) {
    const kk = d.kleidKurz;
    // Rock bis zum Boden (oder zum Saum), oben eng
    rohr(b, 0.2 * (1 + (dk - 1) * 0.6), (0.37 - kk * 0.25) * (1 + (dk - 1) * 0.5), 0.92 - kk, d.kleid, { y: 0.49 + kk / 2, streu: st });
    // Mieder und Schultern
    rohr(b, 0.165 * br * (1 + (dk - 1) * 0.7), 0.205 * (1 + (dk - 1) * 0.8), 0.52, d.rock, { y: 1.18, sz: 0.8 * (1 + (dk - 1) * 0.5), streu: st });
    kapsel(b, 0.07, 0.3 * br, d.rock, { y: 1.415, rz: Math.PI / 2, sz: 1.55, streu: st });
    if (d.schuerze) {
      b.quader(0.32, 0.72, 0.03, d.schuerze, { y: 0.62, z: 0.3 * (1 + (dk - 1) * 0.5), rx: -0.17, streu: st });
      b.quader(0.24, 0.3, 0.03, d.schuerze, { y: 1.14, z: 0.168 * (1 + (dk - 1) * 0.7), streu: st });
    }
    if (d.schultertuch) {
      kapsel(b, 0.09, 0.32 * br, d.schultertuch, { y: 1.39, z: 0.0, rz: Math.PI / 2, sz: 1.7, streu: st });
      b.quader(0.2, 0.26, 0.04, d.schultertuch, { y: 1.27, z: 0.15, rx: -0.12, streu: st });
    }
  } else {
    const unten = d.rockLang ? 0.56 : 0.82;
    const hoehe = 1.48 - unten;
    const rU = (d.rockLang ? 0.3 : 0.25) * br * (1 + (dk - 1) * 0.8);
    rohr(b, 0.2 * br * (1 + (dk - 1) * 0.3), rU, hoehe, d.rock, { y: unten + hoehe / 2, sz: tiefe, streu: st });
    if (dk > 1.08) kugel(b, 0.2 * br, d.rock, { y: 1.0, z: 0.02 + (dk - 1) * 0.12, sx: 1.0 + (dk - 1) * 0.6, sy: 1.15, sz: 0.7 + (dk - 1) * 0.6, streu: st });
    // runde Schultern
    kapsel(b, 0.075, 0.36 * br, d.rock, { y: 1.415, rz: Math.PI / 2, sz: 1.6 * (1 + (dk - 1) * 0.3), streu: st });
    // Hemdbrust, Weste, Halstuch
    const vorn = 0.158 * (0.9 + br * 0.1) * (1 + (dk - 1) * 0.5);
    b.quader(0.13, 0.26, 0.03, d.hemd, { y: 1.31, z: vorn, rx: -0.06, streu: 0.01 });
    if (d.weste) b.quader(0.2 * br, 0.34, 0.03, d.weste, { y: 1.08, z: 0.185 * br * (1 + (dk - 1) * 0.9), rx: -0.07, streu: st });
    kugel(b, 0.05, d.halstuch, { y: 1.44, z: 0.12, sx: 1.2, sy: 0.7, streu: 0.01 });
  }
  if (d.robe) {
    b.quader(0.56 * br, 0.98, 0.07, d.robe, { y: 0.95, z: -0.19, streu: st });
    for (const sx of [-1, 1]) {
      b.quader(0.13, 0.98, 0.3, d.robe, { x: sx * 0.25 * br, y: 0.95, z: -0.03, streu: st });
      b.quader(0.1, 0.9, 0.05, d.robe, { x: sx * 0.19 * br, y: 0.99, z: 0.15, streu: st });
    }
    kapsel(b, 0.06, 0.48 * br, d.robe, { y: 1.46, z: -0.02, rz: Math.PI / 2, sz: 2.2, streu: st });
  }
  if (d.mappe) b.quader(0.05, 0.34, 0.26, d.mappe, { x: 0.4 * br, y: 1.0, z: 0.04, rx: 0.12, streu: 0.01 });
  if (d.dupatta) {
    b.quader(0.13, 0.5, 0.05, d.dupatta, { x: -0.1, y: 1.22, z: 0.17, rz: 0.55, streu: st });
    b.quader(0.14, 0.75, 0.05, d.dupatta, { x: -0.2, y: 1.05, z: -0.17, streu: st });
    b.quader(0.16, 0.07, 0.3, d.dupatta, { x: -0.2, y: 1.47, z: 0, streu: st });
  }
  if (d.kragen) b.quader(0.3 * br, 0.07, 0.2, d.kragen, { y: 1.47, z: 0.02, streu: 0.01 });
  // Hals
  rohr(b, 0.055, 0.065, 0.12, d.haut, { y: 1.5, streu: 0.01 });
  // Kopf mit Haar, Bart und Hut; bei Kindern etwas größer
  b.mit({ y: 1.64, s: d.kopf }, () => kopfFormen(b, d));
}

function kopfFormen(b, d) {
  // Koordinaten relativ zur Kopfmitte (1,64 m)
  const st = 0.02, haar = d.haar;
  kugel(b, 0.118, d.haut, { sy: 1.14, sz: 1.04, streu: 0.02 });
  kugel(b, 0.024, d.haut, { y: -0.012, z: 0.118, sy: 1.3, sz: 1.1, streu: 0.01 });          // Nase
  if (FEIN) for (const sx of [-0.045, 0.045]) kugel(b, 0.014, 0x1d1a18, { x: sx, y: 0.025, z: 0.104, sz: 0.6, streu: 0 });
  if (d.tuch) {
    kugel(b, 0.132, d.tuch, { y: 0.035, z: -0.022, sy: 1.02, streu: st });
    kugel(b, 0.075, d.tuch, { y: -0.04, z: -0.13, streu: st });
  } else if (d.hut !== 'haube') {
    // Haar: Kappe über Ober- und Hinterkopf
    kugel(b, 0.128, haar, { y: 0.05, z: -0.03, sy: 0.95, sx: 1.03, streu: 0.03 });
    if (d.kleid) kugel(b, 0.07, haar, { y: 0.08, z: -0.13, streu: 0.03 });
  }
  if (d.bart === 'voll') {
    kugel(b, 0.105, haar, { y: -0.085, z: 0.045, sy: 1.0, sx: 1.08, sz: 0.85, streu: 0.03 });
    kugel(b, 0.1, haar, { y: -0.01, sx: 1.25, sz: 0.9, sy: 0.7, streu: 0.03 });
    kugel(b, 0.15, haar, { y: 0.06, z: -0.05, sy: 0.95, streu: 0.03 }); // dichtes Haar
  } else if (d.bart === 'schnurr') {
    kapsel(b, 0.016, 0.07, haar, { y: -0.045, z: 0.112, rz: Math.PI / 2, streu: 0.02 });
  } else if (d.bart === 'backen' || d.bart === 'backenGrau') {
    const f = d.bart === 'backenGrau' ? 0xa9a39a : haar;
    for (const sx of [-1, 1]) kapsel(b, 0.022, 0.1, f, { x: sx * 0.112, y: -0.045, z: 0.02, sz: 1.6, streu: 0.02 });
    if (d.bart === 'backen') kapsel(b, 0.012, 0.07, f, { y: -0.045, z: 0.118, rz: Math.PI / 2, streu: 0.02 });
  }
  if (d.brille) {
    for (const sx of [-0.045, 0.045]) b.quader(0.05, 0.04, 0.012, 0x9aa6ad, { x: sx, y: 0.025, z: 0.124, streu: 0 });
    b.quader(0.16, 0.012, 0.012, 0x2a2622, { y: 0.042, z: 0.122, streu: 0 });
  }
  if (d.zopf) kugel(b, 0.065, haar, { y: 0.08, z: -0.14, streu: 0.03 });
  const hf = (c) => d.hutFarbe ?? c;
  const h = d.hut;
  if (h === 'melone') {
    rohr(b, 0.175, 0.175, 0.022, hf(0x1f1d1c), { y: 0.125, streu: 0.01 });
    kugel(b, 0.125, hf(0x1f1d1c), { y: 0.16, sy: 0.85, streu: 0.02 });
  } else if (h === 'filzhut') {
    rohr(b, 0.2, 0.2, 0.022, hf(0x4a4540), { y: 0.125, streu: 0.01 });
    rohr(b, 0.105, 0.125, 0.13, hf(0x4a4540), { y: 0.2, streu: 0.02 });
    rohr(b, 0.127, 0.127, 0.03, 0x2a2622, { y: 0.15, streu: 0.01 });
  } else if (h === 'strohhut') {
    rohr(b, 0.24, 0.24, 0.02, 0xd9c48a, { y: 0.135, streu: 0.02 });
    rohr(b, 0.12, 0.125, 0.09, 0xd9c48a, { y: 0.185, streu: 0.02 });
    rohr(b, 0.127, 0.127, 0.03, 0x3f525b, { y: 0.155, streu: 0.01 });
  } else if (h === 'glocke') {
    const c = hf(0x7a6450);
    kugel(b, 0.132, c, { y: 0.085, z: -0.01, sy: 0.82, streu: 0.02 });
    rohr(b, 0.134, 0.134, 0.028, 0x2a2622, { y: 0.06, streu: 0.01 });
    rohr(b, 0.142, 0.158, 0.03, c, { y: 0.035, z: 0.01, rx: 0.1, streu: 0.02 });
  } else if (h === 'damenhut') {
    // kleiner Damenhut der 1940er Jahre: flacher Kopf, schmale Krempe, leicht schräg
    const c = hf(0x6b5a47);
    rohr(b, 0.165, 0.165, 0.02, c, { y: 0.12, rz: 0.12, streu: 0.01 });
    rohr(b, 0.1, 0.112, 0.075, c, { y: 0.16, rz: 0.12, x: 0.005, streu: 0.02 });
    rohr(b, 0.113, 0.113, 0.022, 0x8f3f2c, { y: 0.135, rz: 0.12, streu: 0.01 });
  } else if (h === 'zylinder') {
    rohr(b, 0.19, 0.19, 0.025, hf(0x1f1d1c), { y: 0.125, streu: 0.01 });
    rohr(b, 0.118, 0.112, 0.22, hf(0x1f1d1c), { y: 0.245, streu: 0.02 });
    rohr(b, 0.116, 0.116, 0.035, 0x4a3b2c, { y: 0.155, streu: 0.01 });
  } else if (h === 'kappe') {
    // Schirmmütze der Arbeiter
    kugel(b, 0.138, hf(0x3d3a36), { y: 0.115, z: -0.005, sy: 0.42, sx: 1.04, streu: 0.02 });
    kugel(b, 0.085, hf(0x3d3a36), { y: 0.095, z: 0.12, sy: 0.16, sx: 1.25, streu: 0.02 });
  } else if (h === 'haube') {
    // Haube der Frauen: Hinterkopf bedeckt, Krempe rahmt das Gesicht
    const c = hf(0xd9d0bb);
    kugel(b, 0.138, c, { y: 0.04, z: -0.035, sy: 1.0, streu: 0.02 });
    rohr(b, 0.155, 0.155, 0.03, c, { y: 0.03, z: 0.03, rx: Math.PI / 2 - 0.25, streu: 0.02 });
    kugel(b, 0.075, haar, { y: 0.02, z: -0.14, sy: 0.7, streu: 0.03 });
  }
}

function armFormen(b, d) {
  const farbe = d.robe || d.rock;
  kapsel(b, 0.058 * (1 + (d.dicke - 1) * 0.5), 0.46, farbe, { y: -0.29, streu: 0.02 });
  kugel(b, 0.048, d.haut, { y: -0.6, sy: 1.25, sz: 0.9, streu: 0.01 });
}

function beinFormen(b, d) {
  const schuh = d.barfuss ? d.haut : d.holzschuhe ? 0x9b7a52 : 0x221f1d;
  if (!d.kleid && d.kurzeHose) {
    // kurze Hose bis zum Knie, darunter Kniestrümpfe oder nackte Beine
    kapsel(b, 0.078, 0.26, d.hose, { y: -0.2, streu: 0.02 });
    kapsel(b, 0.055, 0.06, d.haut, { y: -0.4, streu: 0.01 });
    kapsel(b, 0.058, 0.28, d.barfuss ? d.haut : 0x9a8e78, { y: -0.62, streu: 0.02 });
  } else if (!d.kleid) kapsel(b, 0.072 * (1 + (d.dicke - 1) * 0.4), 0.66, d.hose, { y: -0.42, streu: 0.02 });
  else if (d.kleidKurz > 0.1) kapsel(b, 0.05, d.kleidKurz, d.barfuss ? d.haut : 0x8a7a68, { y: -0.8 + d.kleidKurz / 2 + 0.05, streu: 0.01 });
  kugel(b, 0.078, schuh, { y: -0.82, z: 0.05, sy: 0.5, sz: 1.85, streu: 0.01 });
}

function korbFormen(b, d) {
  // Henkelkorb am rechten Arm
  rohr(b, 0.17, 0.13, 0.17, d.korb, { x: 0.05, y: -0.62, z: 0.1, streu: 0.04 });
  rohr(b, 0.13, 0.13, 0.02, 0xd9d0bb, { x: 0.05, y: -0.54, z: 0.1, streu: 0.02 });
}

const SCHULTER = (d) => 0.31 * d.breite * (1 + (d.dicke - 1) * 0.35);
const HUEFTE = (d) => 0.1 * (1 + (d.dicke - 1) * 0.5);

// Baut eine bewegliche Figur. Die Front zeigt nach +z, die Füße stehen auf y = 0.
export function baueFigur(o = {}) {
  const d = normiere(o);
  const g = new THREE.Group();
  const innen = new THREE.Group();
  g.add(innen);
  innen.scale.setScalar(d.groesse / 1.76);

  const rumpf = new Bauer(d.seed);
  rumpfFormen(rumpf, d);
  const arm = (seite) => { const b = new Bauer(d.seed + 10 + seite); armFormen(b, d); if (seite === 1 && d.korb) korbFormen(b, d); return b; };
  const bein = (seite) => { const b = new Bauer(d.seed + 20 + seite); beinFormen(b, d); return b; };

  const teile = {};
  teile.rumpf = rumpf.netz(material); teile.rumpf.matrixAutoUpdate = true;
  innen.add(teile.rumpf);
  for (const [name, bauer, x, y] of [
    ['armL', arm(0), -SCHULTER(d), 1.44], ['armR', arm(1), SCHULTER(d), 1.44],
    ['beinL', bein(0), -HUEFTE(d), 0.86], ['beinR', bein(1), HUEFTE(d), 0.86]]) {
    const m = bauer.netz(material); m.matrixAutoUpdate = true;
    m.position.set(x, y, 0);
    innen.add(m); teile[name] = m;
  }

  return { gruppe: g, innen, teile, groesse: d.groesse, phase: Math.random() * 6, gang: 0, blick: 0 };
}

// Fügt eine stehende Figur fest in einen Bauer ein (eine einzige Geometrie mit der Welt, keine Animation).
export function figurStatisch(b, o, { x = 0, z = 0, ry = 0, y = 0 } = {}) {
  const d = normiere(o);
  FEIN = false;
  b.mit({ x, y, z, ry, s: d.groesse / 1.76 }, () => {
    rumpfFormen(b, d);
    b.mit({ x: -SCHULTER(d), y: 1.44 }, () => armFormen(b, d));
    b.mit({ x: SCHULTER(d), y: 1.44 }, () => { armFormen(b, d); if (d.korb) korbFormen(b, d); });
    b.mit({ x: -HUEFTE(d), y: 0.86 }, () => beinFormen(b, d));
    b.mit({ x: HUEFTE(d), y: 0.86 }, () => beinFormen(b, d));
  });
  FEIN = true;
}

// tempo: 0 (steht) bis 1 (geht zügig)
export function animiereFigur(f, dt, tempo) {
  f.gang += (tempo - f.gang) * Math.min(1, dt * 9);
  f.phase += dt * (2.2 + f.gang * 7.2);
  const s = Math.sin(f.phase), g = f.gang;
  const { armL, armR, beinL, beinR, rumpf } = f.teile;
  beinL.rotation.x = s * 0.58 * g;
  beinR.rotation.x = -s * 0.58 * g;
  armL.rotation.x = -s * 0.42 * g + Math.sin(f.phase * 0.5) * 0.03 * (1 - g);
  armR.rotation.x = s * 0.42 * g - Math.sin(f.phase * 0.5) * 0.03 * (1 - g);
  armL.rotation.z = -0.05; armR.rotation.z = 0.05;
  rumpf.position.y = Math.abs(Math.cos(f.phase)) * 0.028 * g + Math.sin(f.phase * 0.45) * 0.004 * (1 - g);
  rumpf.rotation.x = 0.05 * g;
  armL.position.y = 1.44 + rumpf.position.y; armR.position.y = 1.44 + rumpf.position.y;
}

// Dreht eine Figur weich in Richtung ry.
export function dreheZu(obj, ry, dt, tempo = 10) {
  let d = ry - obj.rotation.y;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  obj.rotation.y += d * Math.min(1, dt * tempo);
}

// ---------------------------------------------------------------------------------------------
// Zufällige, aber feste Nebenfiguren: Größe, Statur, Kleidung und Haltung unterscheiden sich.
// Die Kleidung folgt einem Profil je Zeit und Ort (siehe PROFILE); jahreszeit 'kalt' oder 'warm'.
const HAAR = [0x1f1b19, 0x2a2420, 0x3a2c22, 0x5b4231, 0x6a4a2e, 0x8b6a46, 0xa47a4a, 0x8b3f22, 0xa9a39a];
const HAUT = [0xd9ab8b, 0xe2b897, 0xcf9f80, 0xe8c2a4, 0xc8977a];
const GRAU = 0xa9a39a;

// Gewichtete Auswahl: [[wert, gewicht], …]
const wahl = (rnd, liste) => {
  let s = 0; for (const [, g] of liste) s += g;
  let x = rnd() * s;
  for (const [v, g] of liste) { if ((x -= g) <= 0) return v; }
  return liste[liste.length - 1][0];
};

// Kleidungsprofile. Quellenlage: allgemeine Kostümgeschichte; die Mengenangaben sind Annäherungen, keine Statistik.
// 1845 Manchester · 1863 Lancashire (Baumwollnot) · 1910 Lancashire (Edwardianische Zeit) · 1930 Lancashire (Weltwirtschaftskrise) · 1948 Frankfurt
const PROFILE = {
  1845: {
    kind: 0.12, frau: 0.36, stand: 0.2,
    arbeiterHut: [['kappe', 4], ['filzhut', 2], [null, 3]], buergerHut: [['zylinder', 1]],
    rockLang: 0.3, bart: [['backen', 0.18], ['voll', 0.12], ['backenGrau', 0.06]],
    frauKopf: [['tuch', 0.45], ['haube', 0.25], [null, 0.3]], kleidKurz: [0, 0], schuerze: 0.55, schultertuch: 0.5, holzschuhe: 0.4, korb: 0.25,
    kindBarfuss: 0.4, kurzeHose: 0,
    arbeit: [0x4a3b2c, 0x55504a, 0x3d4a3b, 0x5a6468, 0x6b5a47, 0x3a3836, 0x4b4743, 0x5b4231, 0x6f6455, 0x44403b],
    buerger: [0x232224, 0x2b2a2c, 0x2f3438, 0x3d4a3b, 0x3a2f28, 0x4a3b2c],
    kleid: [0x5a6468, 0x54483c, 0x4a4e52, 0x6b5a47, 0x5b4a4a, 0x4f5a4a, 0x6a5e50, 0x3f4650, 0x7a6450],
    tuch: [0xd9d0bb, 0xa58e63, 0x8a6e52, 0x9a8e78, 0x8f3f2c, 0x6b6f72, 0xb9ad94, 0x5b4231],
  },
  1863: {   // Baumwollnot, Winter: Umschlagtücher über Kopf und Schultern, Holzschuhe, abgetragene Kleidung
    kind: 0.14, frau: 0.45, stand: 0.06,
    arbeiterHut: [['kappe', 3], ['filzhut', 3], [null, 2]], buergerHut: [['zylinder', 3], ['melone', 1]],
    rockLang: 0.45, bart: [['backen', 0.2], ['voll', 0.15], ['backenGrau', 0.06]],
    frauKopf: [['tuch', 0.7], ['haube', 0.1], [null, 0.2]], kleidKurz: [0, 0], schuerze: 0.5, schultertuch: 0.75, holzschuhe: 0.75, korb: 0.2,
    kindBarfuss: 0.35, kurzeHose: 0,
    arbeit: [0x4a3f36, 0x55504a, 0x4b4743, 0x5b5348, 0x44403b, 0x5a5048, 0x3a3836],
    buerger: [0x232224, 0x2b2a2c, 0x3a2f28],
    kleid: [0x4a4e52, 0x54483c, 0x5b5348, 0x4d4a52, 0x5a5048, 0x6a5e50],
    tuch: [0x8a6e52, 0x6b6f72, 0x5b4231, 0x7a6a58, 0x9a8e78, 0x4f5560],
  },
  1910: {   // Edwardianische Zeit: Schirmmützen, Melonen bei Vorarbeitern und Angestellten, Schnurrbärte;
            // Weberinnen mit Umschlagtuch und Holzschuhen, Röcke bis zum Knöchel, Kinder mit kurzer Hose oder Kittelschürze
    kind: 0.13, frau: 0.48, stand: 0.15,
    arbeiterHut: [['kappe', 7], ['melone', 1], ['strohhut', 0.6], [null, 1]], buergerHut: [['melone', 3], ['strohhut', 1], ['filzhut', 0.5]],
    rockLang: 0.15, bart: [['schnurr', 0.45], ['voll', 0.05], ['backenGrau', 0.03]],
    frauKopf: [['tuch', 0.45], ['strohhut', 0.3], [null, 0.25]], kleidKurz: [0.03, 0.1], schuerze: 0.45, schultertuch: 0.4, holzschuhe: 0.5, korb: 0.25,
    kindBarfuss: 0.08, kurzeHose: 0.8,
    arbeit: [0x4b4743, 0x55504a, 0x5b4231, 0x3d4a3b, 0x4a3b2c, 0x6b5a47, 0x3f4650, 0x44403b],
    buerger: [0x2f3438, 0x3a3836, 0x4a3b2c, 0x2b2a2c, 0x5b5348],
    kleid: [0x3f4a5a, 0x4f5a4a, 0x5b4a4a, 0x54483c, 0x6a5e50, 0x3f4650, 0x7a6450, 0x5a6468],
    tuch: [0x5b4231, 0x6b6f72, 0x3a3836, 0x7a6a58, 0x4f5560, 0x8a6e52],
  },
  1930: {   // Weltwirtschaftskrise: fast nur Schirmmützen, lange Mäntel; Röcke wadenlang, Glockenhut, ältere Frauen mit Tuch
    kind: 0.1, frau: 0.4, stand: 0.08,
    arbeiterHut: [['kappe', 8], ['filzhut', 1.4], ['melone', 0.5], [null, 0.6]], buergerHut: [['filzhut', 2], ['melone', 1]],
    rockLang: 0.5, bart: [['schnurr', 0.2], ['backenGrau', 0.02]],
    frauKopf: [['glocke', 0.45], ['tuch', 0.25], [null, 0.3]], kleidKurz: [0.24, 0.34], schuerze: 0.15, schultertuch: 0.15, holzschuhe: 0.2, korb: 0.25,
    kindBarfuss: 0.04, kurzeHose: 0.9,
    arbeit: [0x4b4743, 0x55504a, 0x3a3836, 0x44403b, 0x5b5348, 0x3f4650],
    buerger: [0x2f3438, 0x3a3836, 0x4a4540],
    kleid: [0x4a4e52, 0x5b4a4a, 0x6b5a47, 0x3f4650, 0x5a5048, 0x6a5e50],
    tuch: [0x6b6f72, 0x5b4231, 0x4f5560, 0x7a6a58],
  },
  1948: {   // Frankfurt nach dem Krieg: Filzhut oder Schiebermütze, umgefärbte Uniformteile (feldgrau), Mäntel;
            // Frauen mit Kopftuch, Röcke wadenlang; Kinder mit kurzer Hose und Kniestrümpfen; keine Melone, kein Zylinder
    kind: 0.12, frau: 0.5, stand: 0.1,
    arbeiterHut: [['filzhut', 4], ['kappe', 3], [null, 3]], buergerHut: [['filzhut', 1]],
    rockLang: 0.5, bart: [['schnurr', 0.1]],
    frauKopf: [['tuch', 0.45], ['damenhut', 0.14], [null, 0.41]], kleidKurz: [0.28, 0.38], schuerze: 0.15, schultertuch: 0.1, holzschuhe: 0, korb: 0.3,
    kindBarfuss: 0.1, kurzeHose: 0.9,
    arbeit: [0x55504a, 0x5d6152, 0x4b4743, 0x5b5348, 0x4a4e58, 0x3f4650, 0x6b6a5c, 0x5a5a58],
    buerger: [0x3a3836, 0x4a4a52, 0x4b4743],
    kleid: [0x55504a, 0x5b5348, 0x4a4e58, 0x6b6a5c, 0x7a7468, 0x5a5048, 0x6b5a47],
    tuch: [0x8f3f2c, 0x6b6f72, 0x9a8e78, 0x5b4a4a, 0x4f5560, 0xb9ad94],
  },
};
const profil = (epoche) => PROFILE[[1948, 1930, 1910, 1863, 1845].find((j) => epoche >= j) || 1845];

export function zufallsFigur(rnd, { art = null, stand = null, epoche = 1845, groesse = null, maedchen: mFest = null, jahreszeit = 'kalt' } = {}) {
  const P = profil(epoche);
  const w = (liste) => liste[Math.floor(rnd() * liste.length)];
  const z = (a, b) => a + rnd() * (b - a);
  const warm = jahreszeit === 'warm';
  const typ = art || (rnd() < P.kind ? 'kind' : rnd() < P.frau ? 'frau' : 'mann');
  const seed = Math.floor(rnd() * 100000);
  const haar = w(HAAR), haut = w(HAUT);
  const dicke = rnd() < 0.18 ? z(1.12, 1.35) : z(0.9, 1.06);
  if (typ === 'kind') {
    const maedchen = mFest ?? rnd() < 0.5;
    const barfuss = rnd() < P.kindBarfuss;
    const d = { groesse: groesse || z(1.02, 1.42), breite: z(0.85, 0.95), dicke: z(0.9, 1.0), kopf: 1.16, haar: haar === GRAU ? 0x6a4a2e : haar, haut, seed, barfuss };
    if (maedchen) return { ...d, kleid: w(P.kleid), rock: w(P.kleid), schuerze: rnd() < 0.6 ? w([0xd8cfb8, 0xb9ad94]) : null, kleidKurz: z(0.18, 0.3), tuch: epoche < 1900 && rnd() < 0.3 ? w(P.tuch) : null, holzschuhe: !barfuss && rnd() < P.holzschuhe };
    return { ...d, rock: w(P.arbeit), rockLang: false, hose: w(P.arbeit), kurzeHose: rnd() < P.kurzeHose, hut: rnd() < 0.55 ? 'kappe' : null, holzschuhe: !barfuss && rnd() < P.holzschuhe };
  }
  if (typ === 'frau') {
    const d = {
      groesse: groesse || z(1.5, 1.7), breite: z(0.86, 0.98), dicke, haar: rnd() < 0.15 ? GRAU : haar, haut, seed,
      kleid: w(P.kleid), rock: w(P.kleid), kleidKurz: z(P.kleidKurz[0], P.kleidKurz[1]),
    };
    const kopf = wahl(rnd, P.frauKopf);
    if (kopf === 'tuch') d.tuch = w(P.tuch);
    else if (kopf) { d.hut = kopf; d.hutFarbe = kopf === 'strohhut' ? null : kopf === 'haube' ? w([0xd9d0bb, 0x3a3836, 0x6b5a47, 0xb9ad94]) : w([0x7a6450, 0x5b3a3a, 0x8a6e52, 0x3f4650, 0x6b5a47, 0x8f3f2c]); }
    if (rnd() < P.schuerze) d.schuerze = w([0xd8cfb8, 0xb9ad94, 0xa9a08c]);
    if (rnd() < P.schultertuch * (warm ? 0.4 : 1)) d.schultertuch = w(P.tuch);
    d.holzschuhe = rnd() < P.holzschuhe;
    if (rnd() < P.korb) d.korb = w([0x9b7a52, 0x7a5a3c, 0xa58e63]);
    return d;
  }
  // Mann
  const buerger = rnd() < (stand ?? P.stand);
  const d = {
    groesse: groesse || z(1.6, 1.86), breite: z(0.88, 1.12), dicke: buerger ? Math.max(dicke, z(1.0, 1.3)) : dicke, haar, haut, seed,
    rock: buerger ? w(P.buerger) : w(P.arbeit), rockLang: buerger ? !warm : rnd() < P.rockLang * (warm ? 0.3 : 1),
    hose: buerger ? w([0x2f2e30, 0x33312f, 0x4b4743]) : w(P.arbeit),
    weste: buerger ? w([0x6b2f25, 0xb08d48, 0x44563f, 0x4a3b2c, 0x5b4a3a, 0x55504a]) : rnd() < 0.4 ? w(P.arbeit) : null,
    hemd: rnd() < 0.7 ? 0xe6dcc6 : 0xcfc6b0, halstuch: w([0x2a2624, 0x8f3f2c, 0x3d4a3b, 0x5b4231, 0xd9d0bb]),
  };
  // Im Sommer 1948 und 1910 gehen manche Arbeiter in Hemd und Weste
  if (warm && !buerger && rnd() < 0.35) { d.rock = d.hemd; d.weste = w(P.arbeit); }
  const bart = wahl(rnd, [...P.bart, [null, 1 - P.bart.reduce((s, [, g]) => s + g, 0)]]);
  if (bart) { d.bart = bart; if (bart === 'backenGrau') d.haar = GRAU; }
  d.hut = buerger ? wahl(rnd, P.buergerHut) : wahl(rnd, P.arbeiterHut);
  if (d.hut === 'strohhut' && !warm) d.hut = 'kappe';
  if (!buerger) d.holzschuhe = rnd() < P.holzschuhe;
  return d;
}

// Nebenfigur aus den knappen Angaben der stehenden Passanten (Farbe, Kleid, Hut, Maßstab), passend zur Zeit.
export function figurAusPassant({ rock, hose, hut = true, kleid = false, g = 1, epoche = 1845, jahreszeit = 'kalt' }, rnd) {
  const P = profil(epoche);
  if (g < 0.8) {
    const d = zufallsFigur(rnd, { art: 'kind', epoche, jahreszeit, groesse: 1.76 * g, maedchen: kleid });
    if (rock !== undefined) { if (kleid) d.kleid = rock; else d.rock = rock; }
    return d;
  }
  const d = zufallsFigur(rnd, { art: kleid ? 'frau' : 'mann', stand: P.stand * 0.6, epoche, jahreszeit });
  if (rock !== undefined) { if (kleid) { d.kleid = rock; } else if (d.rock !== d.hemd) d.rock = rock; }
  if (hose !== undefined && !kleid) d.hose = hose;
  if (!kleid && !hut) d.hut = null;
  if (!kleid && hut && !d.hut) d.hut = wahl(rnd, P.arbeiterHut.filter(([v]) => v && v !== 'strohhut')) || null;
  return d;
}

export const FIGUREN = {
  marx: { groesse: 1.75, rock: 0x2b2a2c, hose: 0x33312f, weste: 0x4a3b2c, haar: 0x1f1b19, bart: 'voll', seed: 11 },
  engels: { groesse: 1.83, breite: 0.93, rock: 0x8a744f, hose: 0x55504a, weste: 0x44563f, haar: 0x6a4a2e, bart: 'backen', hut: 'zylinder', seed: 12 },
  mary: { groesse: 1.62, breite: 0.9, rock: 0x6b6f72, kleid: 0x5a6468, schuerze: 0xd8cfb8, tuch: 0xd9d0bb, haar: 0x5b4231, seed: 13 },
  holt: { groesse: 1.74, breite: 0.95, rock: 0x4a3b2c, rockLang: false, hose: 0x55504a, weste: 0x6b5a47, haar: 0x3a2c22, bart: 'backen', hut: 'kappe', seed: 18 },
  grimshaw: { groesse: 1.78, breite: 1.1, dicke: 1.15, rock: 0x232224, hose: 0x2f2e30, weste: 0x6b2f25, haar: 0x8b7a66, bart: 'backenGrau', hut: 'zylinder', seed: 19 },
  pym: { groesse: 1.7, breite: 0.88, rock: 0x3a3836, hose: 0x4b4743, weste: 0x55504a, haar: 0x8b7a66, bart: null, seed: 15 },
  ellen: { groesse: 1.6, breite: 0.9, rock: 0x6b5a47, kleid: 0x54483c, schuerze: 0xb9ad94, tuch: 0xa58e63, haar: 0x3a2c22, seed: 16 },
  tom: { groesse: 1.18, breite: 0.9, kopf: 1.14, rock: 0x6b6f72, rockLang: false, hose: 0x4b4743, haar: 0x6a4a2e, seed: 17 },
  whitlow: { groesse: 1.72, breite: 1.22, dicke: 1.28, rock: 0x3d4a3b, hose: 0x2f2e30, weste: 0xb08d48, haar: 0xa9a39a, bart: 'backenGrau', hut: 'zylinder', seed: 14 },
};
