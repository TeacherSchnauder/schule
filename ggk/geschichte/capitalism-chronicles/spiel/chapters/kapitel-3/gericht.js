// Kapitel III – Übungsgerichtssaal einer Universität (Moot Court). Frei erfunden, kein realer Raum, kein Hoheitszeichen.
import * as THREE from 'three';
import { schild } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';
import { schreibflaeche, zeilen } from './flaeche.js';

const EICHE = 0xc9a878, EICHE_D = 0xa88a5e, POLSTER = 0x3f6670, GRAU = 0xb9b4a8;

export function baueSaal() {
  const BX = 9, BZ = 7, H = 5.4;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 501, wand: 0xe4e0d6, sockel: EICHE_D, sockelH: 1.3, boden: 0xb39468, decke: 0xeeebe3, balken: false, fenster: [-6.4, -3.2, 3.2, 6.4], fensterB: 2.0, fensterU: 1.5, fensterO: 4.6, hintergrund: 0x20242a, nebel: [0x9a9c9e, 26, 70], hemi: [0xf4f1ea, 0x8f8676, 1.6], sonneStaerke: 1.7 });
  const { b, licht, hind, szene } = r;
  const W = Math.PI / 2;

  // Podest und Richtertisch an der Nordwand
  b.quader(7.4, 0.3, 2.6, EICHE_D, { y: 0.15, z: -BZ + 1.3 });
  b.quader(5.6, 1.1, 0.8, EICHE, { y: 0.85, z: -BZ + 2.0 });
  b.quader(5.8, 0.07, 1.0, EICHE_D, { y: 1.43, z: -BZ + 2.0 });
  b.quader(5.6, 0.5, 0.06, EICHE_D, { y: 0.75, z: -BZ + 2.42 });
  hind.push({ minX: -3.7, maxX: 3.7, minZ: -BZ, maxZ: -BZ + 2.7 });
  // Emblem: Waage und Buch (neutral)
  b.zylinder(0.5, 0.5, 0.05, 20, 0x8a7a55, { y: 4.83, z: -BZ + 0.05, rx: W });
  b.quader(0.05, 0.6, 0.04, 0xe9dcae, { y: 4.86, z: -BZ + 0.1 });
  b.quader(0.75, 0.04, 0.04, 0xe9dcae, { y: 5.10, z: -BZ + 0.1 });
  for (const sx of [-1, 1]) { b.quader(0.02, 0.22, 0.02, 0xe9dcae, { x: sx * 0.34, y: 4.98, z: -BZ + 0.1 }); b.zylinder(0.14, 0.1, 0.04, 8, 0xe9dcae, { x: sx * 0.34, y: 4.86, z: -BZ + 0.1 }); }
  b.quader(0.36, 0.06, 0.05, 0xe9dcae, { y: 4.53, z: -BZ + 0.1 });
  // Leinwand über dem Richtertisch
  const leinwand = schreibflaeche(5.4, 2.1, '#f4f1ea');
  leinwand.netz.position.set(0, 2.95, -BZ + 0.07); szene.add(leinwand.netz);
  b.quader(5.7, 2.4, 0.06, 0x2a2c30, { y: 2.95, z: -BZ + 0.02 });

  // Türen: Asservatenkammer und Zeugenzimmer in der Nordwand, Die Kette in der Ostwand
  const tuerNord = (x, name) => {
    b.quader(1.5, 2.5, 0.08, EICHE_D, { x, y: 1.25, z: -BZ + 0.04 });
    b.quader(1.25, 2.3, 0.1, 0x6f5a40, { x, y: 1.17, z: -BZ + 0.05 });
    licht.quader(0.08, 0.08, 0.06, 0xd9b76a, { x: x + 0.45, y: 1.1, z: -BZ + 0.12 });
    const s = schild(name, { breite: 2.3, hoehe: 0.42, grund: '#2f3a40', farbe: '#f1e6c8', rand: null, schrift: 'Source Serif 4', groesse: 0.56 });
    s.position.set(x, 2.85, -BZ + 0.08); szene.add(s);
    return new THREE.Vector3(x, 0, -BZ + 0.9);
  };
  const tAsservaten = tuerNord(-6.9, 'Asservatenkammer');
  const tZeugen = tuerNord(6.9, 'Zeugenzimmer');
  b.quader(0.08, 2.5, 1.5, EICHE_D, { x: BX - 0.04, y: 1.25, z: 1.4 });
  b.quader(0.1, 2.3, 1.25, 0x6f5a40, { x: BX - 0.05, y: 1.17, z: 1.4 });
  const sk = schild('Die Kette', { breite: 1.9, hoehe: 0.42, grund: '#2f3a40', farbe: '#f1e6c8', rand: null, schrift: 'Source Serif 4', groesse: 0.56 });
  sk.position.set(BX - 0.08, 2.85, 1.4); sk.rotation.y = -W; szene.add(sk);
  const tKette = new THREE.Vector3(BX - 0.9, 0, 1.4);

  // Tisch mit Stühlen; Namensschild steht auf der Tischkante und zeigt zur Kamera (Süden)
  const bank = (x, z, name, farbe, breite = 3.0) => {
    b.quader(breite, 0.07, 0.9, EICHE_D, { x, y: 0.8, z });
    b.quader(breite - 0.1, 0.74, 0.06, EICHE, { x, y: 0.4, z: z - 0.4 });
    for (const sx of [-1, 1]) b.quader(0.07, 0.78, 0.8, EICHE, { x: x + sx * (breite / 2 - 0.05), y: 0.39, z });
    for (const dx of [-0.8, 0, 0.8]) { b.quader(0.46, 0.06, 0.46, POLSTER, { x: x + dx, y: 0.47, z: z + 0.85 }); b.quader(0.46, 0.55, 0.06, POLSTER, { x: x + dx, y: 0.76, z: z + 1.08 }); for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.04, 0.45, 0.04, 0x55504a, { x: x + dx + ax * 0.19, y: 0.225, z: z + 0.85 + az * 0.19 }); }
    b.quader(1.5, 0.3, 0.05, farbe, { x, y: 0.99, z: z + 0.4 });
    const s = schild(name, { breite: 1.4, hoehe: 0.24, grund: '#' + farbe.toString(16).padStart(6, '0'), farbe: '#f6efe0', rand: null, schrift: 'Source Serif 4', groesse: 0.62 });
    s.position.set(x, 0.99, z + 0.43); szene.add(s);
    hind.push({ minX: x - breite / 2, maxX: x + breite / 2, minZ: z - 0.5, maxZ: z + 0.5 });
    hind.push({ minX: x - 1.1, maxX: x + 1.1, minZ: z + 0.6, maxZ: z + 1.15 });
  };
  bank(-3.9, -0.9, 'Anklage', 0x7a2e34);
  bank(3.9, -0.9, 'Verteidigung', 0x2e5f6a);
  // Zeugenstand
  b.quader(1.3, 1.0, 0.08, EICHE, { y: 0.5, z: -2.9 });
  for (const sx of [-1, 1]) b.quader(0.08, 1.0, 0.9, EICHE, { x: sx * 0.65, y: 0.5, z: -3.35 });
  b.quader(1.4, 0.06, 0.2, EICHE_D, { y: 1.03, z: -2.9 });
  b.zylinder(0.015, 0.015, 0.3, 5, 0x35373a, { x: 0.3, y: 1.2, z: -2.9 }); b.kugel(0.04, 0x35373a, { x: 0.3, y: 1.37, z: -2.9 });
  hind.push({ minX: -0.75, maxX: 0.75, minZ: -3.85, maxZ: -2.8 });
  // Sachverständige (West) und Jury (Ost) an den Seitenwänden
  b.quader(0.9, 0.07, 2.6, EICHE_D, { x: -7.6, y: 0.8, z: -2.2 }); b.quader(0.06, 0.74, 2.5, EICHE, { x: -7.2, y: 0.4, z: -2.2 });
  b.quader(0.05, 0.3, 1.5, 0x5a6470, { x: -7.17, y: 0.99, z: -2.2 });
  const ss = schild('Sachverständige', { breite: 1.4, hoehe: 0.24, grund: '#5a6470', farbe: '#f6efe0', rand: null, schrift: 'Source Serif 4', groesse: 0.6 });
  ss.position.set(-7.14, 0.99, -2.2); ss.rotation.y = W; szene.add(ss);
  for (const dz of [-0.8, 0, 0.8]) { b.quader(0.46, 0.06, 0.46, POLSTER, { x: -8.3, y: 0.47, z: -2.2 + dz }); b.quader(0.06, 0.55, 0.46, POLSTER, { x: -8.55, y: 0.76, z: -2.2 + dz }); }
  hind.push({ minX: -BX, maxX: -7.1, minZ: -3.6, maxZ: -0.8 });
  b.quader(0.08, 0.95, 4.0, EICHE, { x: 6.5, y: 0.475, z: -2.4 }); b.quader(0.16, 0.06, 4.1, EICHE_D, { x: 6.5, y: 0.97, z: -2.4 });
  b.quader(2.3, 0.3, 4.0, EICHE_D, { x: 7.8, y: 0.15, z: -2.4 });
  for (const [x, y] of [[7.1, 0], [8.2, 0.3]]) for (const dz of [-1.3, 0, 1.3]) { b.quader(0.46, 0.06, 0.46, POLSTER, { x, y: y + 0.47, z: -2.4 + dz }); b.quader(0.06, 0.55, 0.46, POLSTER, { x: x + 0.25, y: y + 0.76, z: -2.4 + dz }); }
  b.quader(0.05, 0.3, 1.5, 0xb08a3e, { x: 6.44, y: 0.6, z: -2.4 });
  const sj = schild('Jury', { breite: 1.4, hoehe: 0.24, grund: '#b08a3e', farbe: '#2b2520', rand: null, schrift: 'Source Serif 4', groesse: 0.62 });
  sj.position.set(6.41, 0.6, -2.4); sj.rotation.y = -W; szene.add(sj);
  hind.push({ minX: 6.4, maxX: BX, minZ: -4.5, maxZ: -0.3 });
  // Aktentisch vor dem Richtertisch
  b.quader(1.5, 0.06, 0.8, EICHE_D, { x: -2.2, y: 0.78, z: -3.6 }); for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.06, 0.76, 0.06, EICHE, { x: -2.2 + ax * 0.68, y: 0.38, z: -3.6 + az * 0.33 });
  for (let i = 0; i < 4; i++) b.quader(0.34, 0.035, 0.26, [0x7a2e34, 0x2e5f6a, 0x5a6470, 0xb08a3e][i], { x: -2.5 + i * 0.07, y: 0.83 + i * 0.036, z: -3.6, ry: i * 0.18 });
  // Garnspule von 1845 (blass) neben dem T-Shirt von heute: das Motiv des Kapitels
  b.zylinder(0.11, 0.11, 0.03, 10, 0x8f7a5c, { x: -2.05, y: 0.83, z: -3.55 }); b.zylinder(0.085, 0.085, 0.24, 10, 0xc9bda4, { x: -2.05, y: 0.96, z: -3.55 }); b.zylinder(0.11, 0.11, 0.03, 10, 0x8f7a5c, { x: -2.05, y: 1.09, z: -3.55 });
  b.quader(0.42, 0.05, 0.36, 0xf6f4ee, { x: -1.7, y: 0.835, z: -3.58, ry: -0.15, streu: 0.01 }); b.quader(0.15, 0.045, 0.13, 0xf6f4ee, { x: -1.93, y: 0.835, z: -3.72, ry: 0.4, streu: 0.01 }); b.quader(0.15, 0.045, 0.13, 0xf6f4ee, { x: -1.46, y: 0.835, z: -3.68, ry: -0.6, streu: 0.01 }); b.quader(0.1, 0.01, 0.15, 0xc9443a, { x: -1.6, y: 0.865, z: -3.5, ry: 0.3 });
  hind.push({ minX: -2.95, maxX: -1.45, minZ: -4.0, maxZ: -3.2 });
  // Schranke und Publikumsbänke im Süden
  const SZ = 2.9;
  for (const [x0, x1] of [[-8.6, -1.0], [1.0, 8.6]]) { b.quader(x1 - x0, 0.06, 0.14, EICHE_D, { x: (x0 + x1) / 2, y: 0.95, z: SZ }); for (let x = x0 + 0.2; x < x1; x += 0.6) b.quader(0.05, 0.92, 0.05, EICHE, { x, y: 0.46, z: SZ }); }
  for (let i = 0; i < 3; i++) for (const [x0, x1] of [[-8.2, -1.2], [1.2, 8.2]]) {
    const z = 3.9 + i * 1.05, m = (x0 + x1) / 2, w = x1 - x0;
    b.quader(w, 0.07, 0.5, EICHE, { x: m, y: 0.46, z }); b.quader(w, 0.55, 0.07, EICHE_D, { x: m, y: 0.72, z: z + 0.26 });
    for (const sx of [x0 + 0.04, x1 - 0.04]) b.quader(0.08, 0.9, 0.56, EICHE_D, { x: sx, y: 0.45, z: z + 0.03 });
  }
  // Publikum: wenige Zuschauer
  [[-6.5, 0], [-3.2, 0], [2.4, 0], [5.8, 1], [-5.0, 1], [3.6, 2], [-2.0, 2], [7.0, 0]].forEach(([x, i], n) => {
    const z = 3.9 + i * 1.05, f = [0x4f6a5c, 0x6a5a48, 0x3b4a5e, 0x7a5a48, 0x55504a][n % 5];
    b.zylinder(0.17, 0.21, 0.52, 7, f, { x, y: 0.78, z, sz: 0.8 });
    b.kugel(0.115, [0xd9ab8b, 0xc99a78, 0xb07e5c][n % 3], { x, y: 1.19, z, sy: 1.12 });
    b.kugel(0.125, [0x2a2420, 0x5b4231, 0x8b7a66, 0x3a2c22][n % 4], { x, y: 1.24, z: z + 0.03, sy: 0.9 });
  });
  for (const x of [-5.5, 0, 5.5]) for (const z of [-3.5, 1.5]) licht.quader(1.8, 0.05, 0.34, 0xf8f3e4, { x, y: H - 0.06, z });
  r.schliesse();

  const imhof = baueFigur(FIG.imhof);
  imhof.gruppe.position.set(0, 0.3, -BZ + 1.15);
  imhof.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  szene.add(imhof.gruppe);

  return {
    szene, get sonne() { return r.sonne; }, flaeche: { ...r.flaeche, maxZ: SZ - 0.35 }, hindernisse: hind, grenzen: { ...r.grenzen, maxY: H + 3.2, maxZ: BZ + 4.5 },
    punkte: {
      eintritt: { x: 0, z: 1.4 }, imhof: new THREE.Vector3(0, 0, -BZ + 3.2), akte: new THREE.Vector3(-2.2, 0, -2.75),
      tAsservaten, tZeugen, tKette,
      platz: { anklage: new THREE.Vector3(-3.9, 0, 0.85), verteidigung: new THREE.Vector3(3.9, 0, 0.85), sachverstaendige: new THREE.Vector3(-6.4, 0, -2.2), jury: new THREE.Vector3(5.8, 0, -2.4) },
    },
    zeigeLeinwand(liste) { leinwand.male((g, w, h) => zeilen(g, w, h, liste, { gross: 0.15, klein: 0.092, oben: 0.16 })); },
    update(dt) { animiereFigur(imhof, dt, 0); },
  };
}
