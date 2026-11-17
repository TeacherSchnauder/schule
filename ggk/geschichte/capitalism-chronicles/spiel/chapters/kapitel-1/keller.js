// Kapitel I – Kellerwohnung im Hof am Irk (Station IV). Eigene kleine Szene.
import * as THREE from 'three';
import { FARBEN } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, FIGUREN, dreheZu, animiereFigur } from '../../engine/figur.js';

export function baueKeller() {
  const BX = 3.5, BZ = 2.9, H = 2.4;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 71, wand: 0x8f8672, sockelH: 0, boden: 0x5a5046, decke: 0x3d3229,
    fenster: [1.6], fensterB: 0.9, fensterU: 1.55, fensterO: 2.05, hintergrund: 0x1c1815, nebel: [0x3a332b, 6, 26], hemi: [0xc4b8a2, 0x4a3d32, 1.25], sonneStaerke: 1.5 });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(-2.4);
  // Stufen hinunter
  b.quader(1.3, 0.2, 0.5, 0x6f6455, { x: -2.4, y: 0.1, z: BZ - 0.45 });
  // feuchte Wand (Nordost): dunkle Flecken, Pfütze
  for (const [x, y, w, h2] of [[2.2, 0.5, 1.6, 1.0], [2.8, 1.2, 0.9, 0.9], [1.4, 0.3, 0.8, 0.6], [3.0, 0.35, 0.6, 0.7]])
    b.flaeche(w, h2, 0x4f5a48, { x, y, z: -BZ + 0.012, streu: 0.12 });
  b.flaeche(1.0, 1.3, 0x4f5a48, { x: BX - 0.012, y: 0.65, z: -1.9, ry: -Math.PI / 2, streu: 0.12 });
  b.quader(1.4, 0.012, 0.8, 0x2f2c27, { x: 2.5, y: 0.006, z: -2.3, streu: 0.02 });
  // Betten: zwei Gestelle und ein Strohsack für sechs Menschen
  for (const [x, z] of [[-2.65, -1.9], [-2.65, -0.2]]) {
    b.quader(1.3, 0.3, 1.5, 0x5b4231, { x, y: 0.28, z });
    b.quader(1.24, 0.14, 1.44, 0xa58e63, { x, y: 0.5, z, streu: 0.07 });
    b.quader(1.1, 0.08, 0.9, 0x6b6f72, { x, y: 0.6, z: z + 0.2, streu: 0.06 });
    hind.push({ minX: x - 0.7, maxX: x + 0.7, minZ: z - 0.8, maxZ: z + 0.8 });
  }
  b.quader(1.5, 0.16, 0.8, 0xa58e63, { x: -0.6, y: 0.08, z: -2.4, streu: 0.08 });
  b.quader(1.2, 0.06, 0.6, 0x55504a, { x: -0.6, y: 0.19, z: -2.4, streu: 0.06 });
  hind.push({ minX: -1.4, maxX: 0.2, minZ: -2.9, maxZ: -2.0 });
  // Herd an der Ostwand
  b.quader(0.7, 0.9, 1.1, 0x4b4743, { x: BX - 0.4, y: 0.45, z: 0.4 });
  b.quader(0.5, H - 0.92, 0.7, 0x4b4743, { x: BX - 0.3, y: 0.9 + (H - 0.92) / 2, z: 0.4 });
  licht.quader(0.04, 0.2, 0.4, 0xf08a3c, { x: BX - 0.77, y: 0.35, z: 0.4 });
  b.zylinder(0.2, 0.16, 0.22, 8, FARBEN.eisen, { x: BX - 0.45, y: 1.02, z: 0.4 });
  hind.push({ minX: BX - 0.8, maxX: BX, minZ: -0.2, maxZ: 1.0 });
  // Tisch, Hocker
  b.quader(1.1, 0.06, 0.7, FARBEN.holz, { x: 0.5, y: 0.72, z: 0.3 });
  for (const [dx, dz] of [[-0.45, -0.25], [0.45, -0.25], [-0.45, 0.25], [0.45, 0.25]]) b.quader(0.07, 0.7, 0.07, FARBEN.holz, { x: 0.5 + dx, y: 0.35, z: 0.3 + dz });
  b.zylinder(0.1, 0.08, 0.1, 6, 0xb9ad94, { x: 0.3, y: 0.8, z: 0.3 }); b.quader(0.24, 0.1, 0.14, 0x8a744f, { x: 0.75, y: 0.8, z: 0.35 });
  b.zylinder(0.18, 0.18, 0.4, 6, FARBEN.holz, { x: 0.4, y: 0.2, z: 1.1 });
  hind.push({ minX: -0.1, maxX: 1.1, minZ: -0.1, maxZ: 0.7 }, { x: 0.4, z: 1.1, r: 0.22 });
  // Wassereimer neben der Tür
  b.zylinder(0.2, 0.16, 0.34, 8, FARBEN.holz, { x: -0.9, y: 0.17, z: BZ - 0.45 }); b.zylinder(0.17, 0.17, 0.02, 8, 0x4a5a5e, { x: -0.9, y: 0.3, z: BZ - 0.45 });
  b.zylinder(0.2, 0.16, 0.34, 8, FARBEN.holz, { x: -0.4, y: 0.17, z: BZ - 0.4 });
  hind.push({ x: -0.65, z: BZ - 0.42, r: 0.4 });
  // Wäscheleine
  b.quader(BX * 2, 0.02, 0.02, FARBEN.jute, { y: 2.0, z: -0.9, streu: 0 });
  for (const [x, w] of [[-1.2, 0.5], [-0.4, 0.7], [1.5, 0.6]]) b.quader(w, 0.6, 0.02, 0x9a9488, { x, y: 1.64, z: -0.9, streu: 0.05 });

  r.schliesse();
  const glut = new THREE.PointLight(0xff9a4a, 5, 5, 1.8); glut.position.set(BX - 1.1, 0.6, 0.4); szene.add(glut);

  const ellen = baueFigur(FIGUREN.ellen); ellen.gruppe.position.set(2.0, 0, 1.5);
  const tom = baueFigur(FIGUREN.tom); tom.gruppe.position.set(-1.7, 0, 0.9);
  for (const f of [ellen, tom]) { f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); }
  hind.push({ x: 2.0, z: 1.5, r: 0.35 }, { x: -1.7, z: 0.9, r: 0.3 });
  let blick = null;

  return {
    szene, sonne: r.sonne, hindernisse: hind, flaeche: r.flaeche, grenzen: r.grenzen,
    punkte: {
      eintritt: { x: -2.4, z: 1.7, ry: Math.PI },
      tuer,
      ellen: new THREE.Vector3(2.0, 0, 1.5),
      betten: new THREE.Vector3(-1.75, 0, -1.0),
      wand: new THREE.Vector3(2.3, 0, -1.9),
      eimer: new THREE.Vector3(-0.65, 0, BZ - 1.0),
    },
    blickZu(pos) { blick = pos; },
    update(dt) {
      dreheZu(ellen.gruppe, blick ? Math.atan2(blick.x - 2.0, blick.z - 1.5) : -2.2, dt, 4);
      dreheZu(tom.gruppe, blick ? Math.atan2(blick.x + 1.7, blick.z - 0.9) : 1.2, dt, 3);
      animiereFigur(ellen, dt, 0); animiereFigur(tom, dt, 0);
    },
  };
}
