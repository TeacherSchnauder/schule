// Figuren aus Grundformen: erwachsen proportioniert, mit dezenter Lauf- und Leerlaufanimation.
import * as THREE from 'three';
import { Bauer, FARBEN } from './bausteine.js';

const material = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });

// Baut eine Figur. Die Front zeigt nach +z, die Füße stehen auf y = 0.
export function baueFigur(o = {}) {
  let {
    groesse = 1.76, breite = 1,
    rock = FARBEN.anthrazit, rockLang = true,
    hose = 0x3a3836, weste = null, hemd = 0xe6dcc6, halstuch = 0x2a2624,
    haut = FARBEN.haut, haar = 0x2a2420,
    bart = null,            // 'voll' | 'backen' | null
    hut = null,             // 'zylinder' | 'kappe' | null
    kleid = null,           // Farbe des Rocks bei Frauenfiguren
    schuerze = null, tuch = null,
    brille = false, holzschuhe = false, kleidKurz = 0,   // kleidKurz: Saumhöhe über dem Boden in m (0 = bodenlang)
    zopf = false, kragen = null,
    robe = null,            // Farbe einer offenen Robe über der Kleidung
    mappe = null,           // Farbe einer Mappe unter dem Arm
    dupatta = null,         // Farbe eines Schals über der Schulter
    sepiaFigur = false,     // entsättigt: Figur aus der Vergangenheit (Kapitel III)
    seed = 3,
  } = o;
  if (sepiaFigur) {
    const s = (c) => (c === null || c === undefined ? c : new THREE.Color(c).lerp(new THREE.Color(0x9a8466), 0.7).getHex());
    rock = s(rock); hose = s(hose); weste = s(weste); hemd = s(hemd); halstuch = s(halstuch); haut = s(haut); haar = s(haar);
    kleid = s(kleid); schuerze = s(schuerze); tuch = s(tuch); kragen = s(kragen);
  }

  const g = new THREE.Group();
  const innen = new THREE.Group();
  g.add(innen);
  innen.scale.setScalar(groesse / 1.76);

  const rumpf = new Bauer(seed);
  const st = 0.02;
  if (kleid) {
    rumpf.zylinder(0.2, 0.37 - kleidKurz * 0.25, 0.92 - kleidKurz, 8, kleid, { y: 0.49 + kleidKurz / 2, streu: st });
    if (kleidKurz > 0.1) for (const sx of [-0.09, 0.09]) rumpf.quader(0.1, kleidKurz + 0.05, 0.11, 0x8a7a68, { x: sx, y: kleidKurz / 2 + 0.06, streu: 0.01 });
    rumpf.zylinder(0.17, 0.21, 0.52, 7, rock, { y: 1.18, sz: 0.8, streu: st });
    rumpf.quader(0.44 * breite, 0.12, 0.24, rock, { y: 1.42, streu: st });
    if (schuerze) rumpf.quader(0.32, 0.72, 0.03, schuerze, { y: 0.62, z: 0.3, rx: -0.17, streu: st });
    if (schuerze) rumpf.quader(0.24, 0.3, 0.03, schuerze, { y: 1.14, z: 0.168, streu: st });
  } else {
    const unten = rockLang ? 0.56 : 0.82;
    const hoehe = 1.48 - unten;
    rumpf.zylinder(0.2 * breite, (rockLang ? 0.3 : 0.25) * breite, hoehe, 7, rock, { y: unten + hoehe / 2, sz: 0.76, streu: st });
    rumpf.quader(0.52 * breite, 0.14, 0.27, rock, { y: 1.42, streu: st });
    // Hemdbrust, Weste, Halstuch
    rumpf.quader(0.13, 0.26, 0.03, hemd, { y: 1.31, z: 0.158 * (0.9 + breite * 0.1), rx: -0.06, streu: 0.01 });
    if (weste) rumpf.quader(0.2 * breite, 0.34, 0.03, weste, { y: 1.08, z: 0.185 * breite, rx: -0.07, streu: st });
    rumpf.quader(0.11, 0.07, 0.04, halstuch, { y: 1.44, z: 0.14, streu: 0.01 });
  }
  // Hals und Kopf
  rumpf.zylinder(0.055, 0.065, 0.1, 6, haut, { y: 1.5, streu: 0.01 });
  rumpf.kugel(0.118, haut, { y: 1.64, sy: 1.14, sz: 1.04, streu: 0.02 });
  rumpf.quader(0.03, 0.05, 0.04, haut, { y: 1.63, z: 0.125, streu: 0.01 });
  rumpf.quader(0.028, 0.02, 0.02, 0x1d1a18, { x: -0.045, y: 1.665, z: 0.108, streu: 0 });
  rumpf.quader(0.028, 0.02, 0.02, 0x1d1a18, { x: 0.045, y: 1.665, z: 0.108, streu: 0 });
  if (tuch) {
    rumpf.kugel(0.132, tuch, { y: 1.675, z: -0.022, sy: 1.02, streu: st });
    rumpf.kugel(0.07, tuch, { y: 1.6, z: -0.13, streu: st });
  } else {
    // Haar: Kappe über Ober- und Hinterkopf
    rumpf.kugel(0.128, haar, { y: 1.69, z: -0.03, sy: 0.95, sx: 1.03, streu: 0.03 });
    if (kleid) rumpf.kugel(0.07, haar, { y: 1.72, z: -0.13, streu: 0.03 });
  }
  if (bart === 'voll') {
    rumpf.kugel(0.105, haar, { y: 1.555, z: 0.045, sy: 1.0, sx: 1.08, sz: 0.85, streu: 0.03 });
    rumpf.quader(0.2, 0.12, 0.08, haar, { y: 1.63, z: -0.0, sx: 1.12, streu: 0.03 });
    rumpf.kugel(0.15, haar, { y: 1.7, z: -0.05, sy: 0.95, streu: 0.03 }); // dichtes Haar
  } else if (bart === 'backen') {
    rumpf.quader(0.03, 0.13, 0.08, haar, { x: -0.112, y: 1.6, z: 0.02, streu: 0.02 });
    rumpf.quader(0.03, 0.13, 0.08, haar, { x: 0.112, y: 1.6, z: 0.02, streu: 0.02 });
    rumpf.quader(0.09, 0.022, 0.03, haar, { y: 1.595, z: 0.118, streu: 0.02 });
  } else if (bart === 'backenGrau') {
    rumpf.quader(0.04, 0.16, 0.1, 0xa9a39a, { x: -0.115, y: 1.59, z: 0.02, streu: 0.02 });
    rumpf.quader(0.04, 0.16, 0.1, 0xa9a39a, { x: 0.115, y: 1.59, z: 0.02, streu: 0.02 });
  }
  if (brille) {
    for (const sx of [-0.045, 0.045]) rumpf.quader(0.05, 0.04, 0.012, 0x9aa6ad, { x: sx, y: 1.665, z: 0.124, streu: 0 });
    rumpf.quader(0.16, 0.012, 0.012, 0x2a2622, { y: 1.682, z: 0.122, streu: 0 });
  }
  if (robe) {
    rumpf.quader(0.56 * breite, 0.98, 0.07, robe, { y: 0.95, z: -0.19, streu: st });
    for (const sx of [-1, 1]) {
      rumpf.quader(0.13, 0.98, 0.3, robe, { x: sx * 0.25 * breite, y: 0.95, z: -0.03, streu: st });
      rumpf.quader(0.1, 0.9, 0.05, robe, { x: sx * 0.19 * breite, y: 0.99, z: 0.15, streu: st });
    }
    rumpf.quader(0.56 * breite, 0.1, 0.3, robe, { y: 1.46, z: -0.02, streu: st });
  }
  if (mappe) rumpf.quader(0.05, 0.34, 0.26, mappe, { x: 0.4 * breite, y: 1.0, z: 0.04, rx: 0.12, streu: 0.01 });
  if (dupatta) {
    rumpf.quader(0.13, 0.5, 0.05, dupatta, { x: -0.1, y: 1.22, z: 0.17, rz: 0.55, streu: st });
    rumpf.quader(0.14, 0.75, 0.05, dupatta, { x: -0.2, y: 1.05, z: -0.17, streu: st });
    rumpf.quader(0.16, 0.07, 0.3, dupatta, { x: -0.2, y: 1.47, z: 0, streu: st });
  }
  if (zopf) rumpf.kugel(0.065, haar, { y: 1.72, z: -0.14, streu: 0.03 });
  if (kragen) rumpf.quader(0.3 * breite, 0.07, 0.2, kragen, { y: 1.47, z: 0.02, streu: 0.01 });
  if (hut === 'melone') {
    rumpf.zylinder(0.175, 0.175, 0.022, 10, 0x1f1d1c, { y: 1.765, streu: 0.01 });
    rumpf.kugel(0.125, 0x1f1d1c, { y: 1.8, sy: 0.85, streu: 0.02 });
  } else if (hut === 'filzhut') {
    rumpf.zylinder(0.2, 0.2, 0.022, 10, 0x4a4540, { y: 1.765, streu: 0.01 });
    rumpf.zylinder(0.105, 0.125, 0.13, 10, 0x4a4540, { y: 1.84, streu: 0.02 });
    rumpf.zylinder(0.127, 0.127, 0.03, 10, 0x2a2622, { y: 1.79, streu: 0.01 });
  } else if (hut === 'strohhut') {
    rumpf.zylinder(0.24, 0.24, 0.02, 12, 0xd9c48a, { y: 1.775, streu: 0.02 });
    rumpf.zylinder(0.12, 0.125, 0.09, 10, 0xd9c48a, { y: 1.825, streu: 0.02 });
    rumpf.zylinder(0.127, 0.127, 0.03, 10, 0x3f525b, { y: 1.795, streu: 0.01 });
  } else if (hut === 'glocke') {
    rumpf.kugel(0.14, 0x5b3a3a, { y: 1.72, z: -0.01, sy: 0.95, streu: 0.02 });
    rumpf.zylinder(0.15, 0.165, 0.05, 10, 0x5b3a3a, { y: 1.69, streu: 0.02 });
  }
  if (hut === 'zylinder') {
    rumpf.zylinder(0.19, 0.19, 0.025, 10, 0x1f1d1c, { y: 1.765, streu: 0.01 });
    rumpf.zylinder(0.118, 0.112, 0.22, 10, 0x1f1d1c, { y: 1.885, streu: 0.02 });
    rumpf.zylinder(0.116, 0.116, 0.035, 10, 0x4a3b2c, { y: 1.795, streu: 0.01 });
  } else if (hut === 'kappe') {
    rumpf.zylinder(0.13, 0.135, 0.07, 8, 0x3d3a36, { y: 1.77, streu: 0.02 });
    rumpf.quader(0.16, 0.02, 0.1, 0x3d3a36, { y: 1.745, z: 0.13, streu: 0.01 });
  }

  const arm = (seite) => {
    const b = new Bauer(seed + 10 + seite);
    b.quader(0.12, 0.6, 0.14, robe || rock, { y: -0.27, streu: st });
    b.quader(0.085, 0.1, 0.095, haut, { y: -0.61, streu: 0.01 });
    return b;
  };
  const bein = (seite) => {
    const b = new Bauer(seed + 20 + seite);
    if (!kleid) b.quader(0.16, 0.84, 0.18, hose, { y: -0.42, streu: st });
    b.quader(0.16, holzschuhe ? 0.11 : 0.09, 0.28, holzschuhe ? 0x9b7a52 : 0x221f1d, { y: -0.815, z: 0.045, streu: 0.01 });
    return b;
  };

  const teile = {};
  teile.rumpf = rumpf.netz(material); teile.rumpf.matrixAutoUpdate = true;
  innen.add(teile.rumpf);
  for (const [name, bauer, x, y] of [
    ['armL', arm(0), -0.31 * breite, 1.44], ['armR', arm(1), 0.31 * breite, 1.44],
    ['beinL', bein(0), -0.1, 0.86], ['beinR', bein(1), 0.1, 0.86]]) {
    const m = bauer.netz(material); m.matrixAutoUpdate = true;
    m.position.set(x, y, 0);
    innen.add(m); teile[name] = m;
  }

  return { gruppe: g, innen, teile, groesse, phase: Math.random() * 6, gang: 0, blick: 0 };
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

export const FIGUREN = {
  marx: { groesse: 1.75, rock: 0x2b2a2c, hose: 0x33312f, weste: 0x4a3b2c, haar: 0x1f1b19, bart: 'voll', seed: 11 },
  engels: { groesse: 1.83, breite: 0.93, rock: 0x8a744f, hose: 0x55504a, weste: 0x44563f, haar: 0x6a4a2e, bart: 'backen', hut: 'zylinder', seed: 12 },
  mary: { groesse: 1.62, breite: 0.9, rock: 0x6b6f72, kleid: 0x5a6468, schuerze: 0xd8cfb8, tuch: 0xd9d0bb, haar: 0x5b4231, seed: 13 },
  holt: { groesse: 1.74, breite: 0.95, rock: 0x4a3b2c, rockLang: false, hose: 0x55504a, weste: 0x6b5a47, haar: 0x3a2c22, bart: 'backen', hut: 'kappe', seed: 18 },
  grimshaw: { groesse: 1.78, breite: 1.1, rock: 0x232224, hose: 0x2f2e30, weste: 0x6b2f25, haar: 0x8b7a66, bart: 'backenGrau', hut: 'zylinder', seed: 19 },
  pym: { groesse: 1.7, breite: 0.88, rock: 0x3a3836, hose: 0x4b4743, weste: 0x55504a, haar: 0x8b7a66, bart: null, seed: 15 },
  ellen: { groesse: 1.6, breite: 0.9, rock: 0x6b5a47, kleid: 0x54483c, schuerze: 0xb9ad94, tuch: 0xa58e63, haar: 0x3a2c22, seed: 16 },
  tom: { groesse: 1.18, breite: 0.9, rock: 0x6b6f72, rockLang: false, hose: 0x4b4743, haar: 0x6a4a2e, seed: 17 },
  whitlow: { groesse: 1.72, breite: 1.22, rock: 0x3d4a3b, hose: 0x2f2e30, weste: 0xb08d48, haar: 0xa9a39a, bart: 'backenGrau', hut: 'zylinder', seed: 14 },
};
