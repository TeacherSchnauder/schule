// Kapitel III – „Die Kette“: ein Ausstellungsgang mit fünf Räumen vom Baumwollfeld bis zum Laden, dahinter die Statistikwand.
// Alles ist frei erfunden und stilisiert; die Modemarke in der Zentrale trägt kein Logo und keinen echten Namen.
import * as THREE from 'three';
import { schild, passant } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';
import { schreibflaeche, zeilen } from './flaeche.js';

const N = 6, FELD = 11;   // sechs Abschnitte zu je 11 m entlang der x-Achse
export const RAUM_IDS = ['feld', 'spinnerei', 'naeherei', 'zentrale', 'laden', 'statistik'];

export function baueKette() {
  const BX = (N * FELD) / 2, BZ = 5, H = 4.4;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 561, wand: 0xdedad0, sockel: 0xb9b4a8, sockelH: 0, boden: 0xa39c8e, decke: 0xe6e3da, balken: false, fenster: [], hintergrund: 0x1e2226, nebel: [0x9a9c9c, 34, 110], hemi: [0xf2f0ea, 0x8a8478, 1.6], sonneStaerke: 1.5 });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(-BX + 1.6);
  const mitte = (i) => -BX + FELD * (i + 0.5);
  const NORD = -BZ;
  // Trennwände zwischen den Räumen (Nordhälfte) und farbige Rückwände
  const RUECK = [0xd9c08a, 0xc4c8c4, 0xcdd6c2, 0xe9edf0, 0xe6d6b8, 0xd4d0c4];
  const BODEN = [0xa07a4c, 0x8f9290, 0x9a968c, 0xe4e6e6, 0xc9a878, 0xb4ae9e];
  const TITEL = ['1 · Baumwollfeld', '2 · Spinnerei', '3 · Näherei bei Dhaka', '4 · Die Zentrale', '5 · Laden in Deutschland', 'Statistikwand'];
  const preisschilder = {};
  for (let i = 0; i < N; i++) {
    const x = mitte(i);
    b.flaeche(FELD - 0.2, H, RUECK[i], { x, y: H / 2, z: NORD + 0.02, streu: 0.02 });
    b.quader(FELD - 0.2, 0.04, 6.4, BODEN[i], { x, y: 0.0, z: NORD + 3.2, streu: 0.05 });
    if (i > 0) { b.quader(0.24, H, 3.6, 0xbdb8ac, { x: x - FELD / 2, y: H / 2, z: NORD + 1.8 }); hind.push({ minX: x - FELD / 2 - 0.2, maxX: x - FELD / 2 + 0.2, minZ: NORD, maxZ: NORD + 3.7 }); }
    const s = schild(TITEL[i], { breite: 4.6, hoehe: 0.5, grund: '#2f3a40', farbe: '#f1e6c8', rand: null, schrift: 'Abril Fatface', groesse: 0.58 });
    s.position.set(x, H - 0.45, NORD + 0.06); szene.add(s);
    for (const dx of [-3, 3]) licht.quader(1.8, 0.05, 0.3, 0xf8f4e8, { x: x + dx, y: H - 0.05, z: -1.5 });
    if (i < 5) {
      // Preisschild als Aufsteller am Gangrand
      const p = schreibflaeche(1.7, 1.15, '#f6f1e2');
      p.netz.position.set(x + 3.9, 1.5, NORD + 4.6); szene.add(p.netz);
      b.quader(1.8, 1.25, 0.05, 0x2f3a40, { x: x + 3.9, y: 1.5, z: NORD + 4.57 });
      b.quader(0.06, 0.9, 0.06, 0x55504a, { x: x + 3.9, y: 0.45, z: NORD + 4.55 });
      b.quader(0.6, 0.04, 0.4, 0x55504a, { x: x + 3.9, y: 0.02, z: NORD + 4.55 });
      hind.push({ x: x + 3.9, z: NORD + 4.55, r: 0.4 });
      preisschilder[RAUM_IDS[i]] = p;
    }
  }
  // Laufrichtung: Pfeile am Boden
  for (let x = -BX + 4; x < BX - 3; x += 5.5) { b.quader(1.0, 0.012, 0.14, 0xd9b76a, { x, y: 0.03, z: 3.2 }); b.quader(0.4, 0.012, 0.14, 0xd9b76a, { x: x + 0.42, y: 0.03, z: 3.06, ry: -0.7 }); b.quader(0.4, 0.012, 0.14, 0xd9b76a, { x: x + 0.42, y: 0.03, z: 3.34, ry: 0.7 }); }

  // Eingang: Sockel mit T-Shirt
  const EX = -BX + 3.2, EZ = 1.2;
  b.quader(0.9, 1.0, 0.9, 0xe9e6dc, { x: EX, y: 0.5, z: EZ });
  b.quader(0.62, 0.06, 0.56, 0xf6f4ee, { x: EX, y: 1.04, z: EZ, streu: 0.01 }); b.quader(0.22, 0.055, 0.2, 0xf6f4ee, { x: EX - 0.37, y: 1.04, z: EZ - 0.15, ry: 0.5, streu: 0.01 }); b.quader(0.22, 0.055, 0.2, 0xf6f4ee, { x: EX + 0.37, y: 1.04, z: EZ - 0.15, ry: -0.5, streu: 0.01 });
  b.quader(0.16, 0.012, 0.22, 0xc9443a, { x: EX + 0.16, y: 1.078, z: EZ + 0.12, ry: 0.3 });
  licht.zylinder(0.5, 0.5, 0.02, 16, 0xfff6dc, { x: EX, y: H - 0.03, z: EZ });
  hind.push({ x: EX, z: EZ, r: 0.7 });

  // 1 Baumwollfeld
  let x0 = mitte(0);
  for (let i = 0; i < 6; i++) for (let k = 0; k < 4; k++) {
    const x = x0 - 4.2 + i * 1.25 + (k % 2) * 0.3, z = NORD + 0.9 + k * 0.85;
    b.zylinder(0.03, 0.05, 0.75, 5, 0x6f7f4a, { x, y: 0.4, z });
    b.kugel(0.2, 0x7c9254, { x, y: 0.62, z, sy: 0.9, streu: 0.08 });
    for (const [dx, dy, dz] of [[0.12, 0.82, 0.05], [-0.1, 0.7, 0.12], [0.02, 0.92, -0.08]]) b.kugel(0.075, 0xf6f2e6, { x: x + dx, y: dy, z: z + dz, streu: 0.02 });
  }
  passant(b, { x: x0 - 1.8, z: NORD + 2.2, ry: 0.6, kleid: true, hut: false, rock: 0xb0563c });
  passant(b, { x: x0 + 2.2, z: NORD + 1.3, ry: -0.4, kleid: true, hut: false, rock: 0x5a7f6a });
  b.zylinder(0.3, 0.36, 0.7, 8, 0xa58e63, { x: x0 - 0.6, y: 0.37, z: NORD + 3.9 }); for (let i = 0; i < 5; i++) b.kugel(0.13, 0xf6f2e6, { x: x0 - 0.6 + Math.cos(i * 1.3) * 0.15, y: 0.76, z: NORD + 3.9 + Math.sin(i * 1.3) * 0.15 });
  licht.zylinder(0.5, 0.5, 0.03, 16, 0xffe6a8, { x: x0 + 3.6, y: 3.3, z: NORD + 0.06, rx: Math.PI / 2 });
  hind.push({ minX: x0 - 5, maxX: x0 + 3.2, minZ: NORD, maxZ: NORD + 3.6 }, { x: x0 - 0.6, z: NORD + 3.9, r: 0.5 });

  // 2 Spinnerei: moderne Ringspinnmaschinen, dieselbe Grundform wie 1845, hellere Farben
  x0 = mitte(1);
  for (const z of [NORD + 1.2, NORD + 2.9]) {
    b.quader(7.6, 0.9, 0.7, 0xc9cdc8, { x: x0 - 0.6, y: 0.55, z }); b.quader(7.6, 0.12, 0.8, 0x7c858a, { x: x0 - 0.6, y: 1.06, z });
    b.quader(0.5, 1.5, 0.8, 0x8f9aa0, { x: x0 - 4.6, y: 0.75, z }); licht.quader(0.02, 0.2, 0.3, 0x9fd4b0, { x: x0 - 4.86, y: 1.2, z });
    for (let i = 0; i < 16; i++) b.zylinder(0.07, 0.09, 0.3, 6, [0xf2efe6, 0xd9b76a, 0x7aa0b0, 0xc97a6a][i % 4], { x: x0 - 4.0 + i * 0.46, y: 1.27, z, streu: 0.04 });
    hind.push({ minX: x0 - 4.9, maxX: x0 + 3.3, minZ: z - 0.5, maxZ: z + 0.5 });
  }
  passant(b, { x: x0 + 1.2, z: NORD + 2.05, ry: 0.2, kleid: false, hut: false, rock: 0x5f7f8f, hose: 0x3b4a5e });
  passant(b, { x: x0 + 3.9, z: NORD + 2.2, ry: -1.2, kleid: false, hut: false, rock: 0xe6dcc6, hose: 0x4b4743 });

  // 3 Näherei bei Dhaka
  x0 = mitte(2);
  const STOFF = [0xc9443a, 0x3f6f8a, 0xd9b46a, 0x5a8f6a, 0xf2efe6, 0x8a5a8a];
  for (let k = 0; k < 3; k++) for (let i = 0; i < 4; i++) {
    const x = x0 - 3.9 + i * 1.9, z = NORD + 0.95 + k * 1.15;
    b.quader(1.2, 0.05, 0.6, 0xd9d2c0, { x, y: 0.76, z }); b.quader(0.05, 0.74, 0.5, 0x7c858a, { x: x - 0.55, y: 0.37, z }); b.quader(0.05, 0.74, 0.5, 0x7c858a, { x: x + 0.55, y: 0.37, z });
    b.quader(0.42, 0.26, 0.18, 0xf4f2ec, { x: x - 0.1, y: 0.95, z: z - 0.05 }); b.quader(0.14, 0.2, 0.18, 0xf4f2ec, { x: x + 0.14, y: 0.88, z: z - 0.05 });
    b.quader(0.4, 0.02, 0.3, STOFF[(i + k * 2) % 6], { x: x + 0.3, y: 0.795, z: z + 0.1, ry: 0.2 });
    if (!(k === 2 && i === 0)) {   // sitzende Näherin, von hinten/seitlich
      const f = STOFF[(i * 2 + k) % 6];
      b.zylinder(0.17, 0.22, 0.5, 7, f, { x, y: 0.75, z: z + 0.55, sz: 0.8 }); b.kugel(0.11, 0xb07e5c, { x, y: 1.15, z: z + 0.53, sy: 1.1 }); b.kugel(0.125, 0x1d1a18, { x, y: 1.2, z: z + 0.57, sy: 0.9 });
      b.quader(0.4, 0.05, 0.4, 0x55504a, { x, y: 0.45, z: z + 0.55 });
    }
  }
  hind.push({ minX: x0 - 4.8, maxX: x0 + 2.6, minZ: NORD, maxZ: NORD + 4.0 });
  for (let i = 0; i < 5; i++) b.quader(0.9, 0.3, 0.6, STOFF[i], { x: x0 + 3.6, y: 0.17 + i * 0.3, z: NORD + 1.0, ry: (i % 2) * 0.15, streu: 0.05 });
  for (let i = 0; i < 6; i++) b.quader(0.5, 0.05, 0.4, 0xf6f4ee, { x: x0 + 3.5, y: 0.83 + i * 0.05, z: NORD + 2.4, ry: i * 0.05 }); b.quader(0.8, 0.8, 0.6, 0xa58e63, { x: x0 + 3.5, y: 0.4, z: NORD + 2.4 });
  hind.push({ minX: x0 + 3.0, maxX: x0 + 4.2, minZ: NORD, maxZ: NORD + 2.8 });
  licht.quader(0.7, 0.26, 0.04, 0x3fae6a, { x: x0 - 4.2, y: 2.9, z: NORD + 0.08 });
  const ins = schild('Inspektion · geprüft', { breite: 1.3, hoehe: 0.3, grund: '#f1ecd9', farbe: '#2b5a3a', rand: '#2b5a3a', schrift: 'Source Serif 4', groesse: 0.5 });
  ins.position.set(x0 + 1.4, 2.7, NORD + 0.07); szene.add(ins);

  // 4 Die Zentrale einer erfundenen Modemarke
  x0 = mitte(3);
  for (const dx of [-4.6, 2.0]) { b.quader(0.06, 2.6, 2.8, 0xbcd4dc, { x: x0 + dx, y: 1.3, z: NORD + 1.5, streu: 0.01 }); b.quader(0.1, 0.08, 2.8, 0x8f9aa0, { x: x0 + dx, y: 2.62, z: NORD + 1.5 }); }
  const boerse = schreibflaeche(3.6, 2.0, '#10161c', 110);
  boerse.netz.position.set(x0 - 1.3, 2.1, NORD + 0.09); szene.add(boerse.netz);
  b.quader(3.8, 2.2, 0.06, 0x2a2c30, { x: x0 - 1.3, y: 2.1, z: NORD + 0.04 });
  const PX = x0 - 1.3, PZ = NORD + 2.4;   // Stehpult mit dem Vermögensregler
  b.quader(0.1, 1.05, 0.1, 0x8f9aa0, { x: PX, y: 0.52, z: PZ }); b.quader(0.8, 0.05, 0.5, 0xf4f4f2, { x: PX, y: 1.08, z: PZ, rx: 0.2 }); b.zylinder(0.3, 0.3, 0.03, 12, 0x8f9aa0, { x: PX, y: 0.02, z: PZ });
  licht.quader(0.5, 0.02, 0.06, 0x7ec8e0, { x: PX, y: 1.12, z: PZ + 0.1, rx: 0.2 });
  hind.push({ x: PX, z: PZ, r: 0.5 });
  const SX = x0 + 3.4, SZ = NORD + 1.6;   // Schreibtisch der Einkäuferin
  b.quader(1.8, 0.06, 0.9, 0xf4f4f2, { x: SX, y: 0.76, z: SZ }); b.quader(0.06, 0.74, 0.8, 0x8f9aa0, { x: SX - 0.85, y: 0.37, z: SZ }); b.quader(0.06, 0.74, 0.8, 0x8f9aa0, { x: SX + 0.85, y: 0.37, z: SZ });
  b.quader(0.4, 0.02, 0.28, 0x8c9096, { x: SX - 0.2, y: 0.8, z: SZ + 0.1 }); licht.quader(0.4, 0.27, 0.02, 0xcfe0ea, { x: SX - 0.2, y: 0.94, z: SZ - 0.05, rx: -0.2 });
  for (let i = 0; i < 3; i++) b.quader(0.3, 0.03, 0.24, STOFF[i + 1], { x: SX + 0.5, y: 0.8 + i * 0.03, z: SZ, ry: i * 0.2 });
  hind.push({ minX: SX - 1.0, maxX: SX + 1.0, minZ: SZ - 0.5, maxZ: SZ + 0.5 });
  b.zylinder(0.22, 0.18, 0.45, 8, 0xf4f4f2, { x: x0 - 4.0, y: 0.22, z: NORD + 3.2 }); for (let i = 0; i < 5; i++) b.kugel(0.24, 0x4f6a4c, { x: x0 - 4.0 + Math.cos(i * 1.3) * 0.18, y: 0.8 + (i % 3) * 0.22, z: NORD + 3.2 + Math.sin(i * 1.3) * 0.18, sy: 1.3 });
  hind.push({ x: x0 - 4.0, z: NORD + 3.2, r: 0.45 });
  const zs = schild('Zentrale', { breite: 1.6, hoehe: 0.36, grund: '#f4f4f2', farbe: '#2f3a40', rand: null, schrift: 'Source Serif 4', groesse: 0.6 });
  zs.position.set(x0 + 3.4, 2.6, NORD + 0.07); szene.add(zs);

  // 5 Laden in Deutschland
  x0 = mitte(4);
  for (const dx of [-3.4, -0.8]) {
    b.quader(1.9, 0.04, 0.04, 0x8f9aa0, { x: x0 + dx, y: 1.6, z: NORD + 1.6 }); for (const sx of [-0.9, 0.9]) b.quader(0.04, 1.6, 0.04, 0x8f9aa0, { x: x0 + dx + sx, y: 0.8, z: NORD + 1.6 });
    for (let i = 0; i < 9; i++) b.quader(0.05, 0.62, 0.42, STOFF[(i + (dx < -2 ? 0 : 3)) % 6], { x: x0 + dx - 0.78 + i * 0.195, y: 1.24, z: NORD + 1.6, streu: 0.05 });
    hind.push({ minX: x0 + dx - 1.0, maxX: x0 + dx + 1.0, minZ: NORD + 1.3, maxZ: NORD + 1.9 });
  }
  b.quader(2.6, 2.2, 0.4, 0xc9a878, { x: x0 - 2.2, y: 1.1, z: NORD + 0.25 });
  for (let e = 0; e < 3; e++) for (let i = 0; i < 5; i++) for (let k = 0; k < 3; k++) b.quader(0.4, 0.05, 0.3, e === 1 ? 0xf6f4ee : STOFF[(i + e) % 6], { x: x0 - 3.2 + i * 0.5, y: 0.55 + e * 0.62 + k * 0.055, z: NORD + 0.5, streu: 0.03 });
  const KX = x0 + 2.6, KZ = NORD + 1.5;   // Kasse
  b.quader(1.6, 0.95, 0.7, 0xc9a878, { x: KX, y: 0.475, z: KZ }); b.quader(1.7, 0.05, 0.8, 0xa88a5e, { x: KX, y: 0.97, z: KZ }); b.quader(0.3, 0.22, 0.26, 0x2a2c30, { x: KX + 0.4, y: 1.1, z: KZ }); licht.quader(0.26, 0.16, 0.02, 0xcfe0ea, { x: KX + 0.4, y: 1.18, z: KZ + 0.14 });
  hind.push({ minX: KX - 0.9, maxX: KX + 0.9, minZ: KZ - 0.45, maxZ: KZ + 0.45 });
  passant(b, { x: KX - 0.1, z: KZ - 0.8, ry: 0, kleid: false, hut: false, rock: 0x3b4a5e, hose: 0x33312f });
  passant(b, { x: x0 - 2.0, z: NORD + 2.5, ry: 2.8, kleid: true, hut: false, rock: 0xb0563c });
  hind.push({ x: x0 - 2.0, z: NORD + 2.5, r: 0.4 });
  licht.quader(3.0, 0.5, 0.05, 0xfff0c8, { x: x0 - 2.2, y: 2.75, z: NORD + 0.1 });
  const ls = schild('Mode · Neu eingetroffen', { breite: 2.8, hoehe: 0.36, grund: '#fff0c8', farbe: '#5b3a26', rand: null, schrift: 'Source Serif 4', groesse: 0.56 });
  ls.position.set(x0 - 2.2, 2.75, NORD + 0.14); szene.add(ls);

  // 6 Statistikwand: Balkenwand der Kette (links) und Statistiktafel mit Stehpult (rechts)
  x0 = mitte(5);
  const balken = schreibflaeche(3.6, 1.9, '#f6f1e2', 120);
  balken.netz.position.set(x0 - 2.9, 2.0, NORD + 0.09); szene.add(balken.netz); b.quader(3.8, 2.1, 0.06, 0x2f3a40, { x: x0 - 2.9, y: 2.0, z: NORD + 0.04 });
  const tafel = schreibflaeche(4.4, 2.4, '#fbf8ef', 120);
  tafel.netz.position.set(x0 + 2.2, 2.1, NORD + 0.09); szene.add(tafel.netz); b.quader(4.6, 2.6, 0.06, 0x2f3a40, { x: x0 + 2.2, y: 2.1, z: NORD + 0.04 });
  const TX = x0 + 2.2, TZ = NORD + 2.3;
  b.quader(0.1, 1.05, 0.1, 0x8f9aa0, { x: TX, y: 0.52, z: TZ }); b.quader(1.0, 0.05, 0.55, 0xc9a878, { x: TX, y: 1.08, z: TZ, rx: 0.2 }); b.zylinder(0.3, 0.3, 0.03, 12, 0x8f9aa0, { x: TX, y: 0.02, z: TZ });
  for (let i = 0; i < 5; i++) licht.quader(0.05, 0.03, 0.26, 0xd9b76a, { x: TX - 0.32 + i * 0.16, y: 1.13, z: TZ, rx: 0.2 });
  hind.push({ x: TX, z: TZ, r: 0.55 });
  b.quader(1.6, 0.45, 0.5, 0x3f6670, { x: x0 - 2.9, y: 0.23, z: NORD + 2.0 }); hind.push({ minX: x0 - 3.8, maxX: x0 - 2.0, minZ: NORD + 1.7, maxZ: NORD + 2.3 });
  r.schliesse();
  r.sonne.shadow.mapSize.set(2048, 2048);

  // Figuren mit Namen
  const figuren = {};
  const stelle = (name, x, z, ry) => { const f = baueFigur(FIG[name]); f.gruppe.position.set(x, 0, z); f.gruppe.rotation.y = ry; f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); figuren[name] = f; hind.push({ x, z, r: 0.45 }); };
  stelle('rokeya', mitte(2) - 3.9, NORD + 4.4, 0.5);
  stelle('einkaeuferin', mitte(3) + 3.4, NORD + 0.85, 0);

  // Börsentafel: bewegte Kurslinie (Modell, keine echten Kurse), höchstens zwei Bilder pro Sekunde
  const kurs = Array.from({ length: 48 }, (_, i) => 0.5 + Math.sin(i * 0.35) * 0.12 + Math.sin(i * 1.3) * 0.05);
  let uhr = 0, versatz = 0, fest = null;
  const maleBoerse = (delta = 0) => boerse.male((g, w, h) => {
    g.strokeStyle = '#24313a'; g.lineWidth = 1;
    for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(0, h * i / 6); g.lineTo(w, h * i / 6); g.stroke(); }
    g.strokeStyle = '#7ec8e0'; g.lineWidth = 3; g.beginPath();
    kurs.forEach((v, i) => { const x = w * 0.05 + (w * 0.9 * i) / (kurs.length - 1), y = h * (0.9 - v * 0.7); if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.stroke();
    g.fillStyle = '#cfe0ea'; g.font = `${Math.round(h * 0.085)}px "Source Serif 4", Georgia, serif`; g.textBaseline = 'top';
    g.fillText('Aktienkurs der Modemarke (Modell)', w * 0.05, h * 0.05);
    g.fillStyle = delta >= 0 ? '#cfe0ea' : '#e0c8a0'; g.textAlign = 'right';
    g.fillText(`${delta >= 0 ? '+' : '−'}${Math.abs(delta).toFixed(1).replace('.', ',')} %`, w * 0.95, h * 0.05); g.textAlign = 'left';
  });
  maleBoerse();

  return {
    szene, get sonne() { return r.sonne; }, flaeche: r.flaeche, hindernisse: hind, grenzen: { ...r.grenzen, maxY: H + 3 }, figuren,
    punkte: {
      eintritt: { x: tuer.x, z: tuer.z - 0.4 }, tuer, eingang: new THREE.Vector3(EX + 0.2, 0, EZ + 1.3),
      feld: new THREE.Vector3(mitte(0) + 3.9, 0, NORD + 5.6), spinnerei: new THREE.Vector3(mitte(1) + 3.9, 0, NORD + 5.6),
      naeherei: new THREE.Vector3(mitte(2) - 3.9, 0, NORD + 4.4), zentrale: new THREE.Vector3(PX, 0, PZ + 0.2), laden: new THREE.Vector3(mitte(4) + 3.9, 0, NORD + 5.6),
      statistik: new THREE.Vector3(TX, 0, TZ + 0.2), ende: new THREE.Vector3(mitte(5) - 2.9, 0, NORD + 3.2),
    },
    // Preisschild eines Raums: { name, wert (Prozent oder null), hinweis }
    zeigePreis(raum, { name, wert, hinweis = '' }) {
      preisschilder[raum]?.male((g, w, h) => zeilen(g, w, h, [['Vom Ladenpreis', 'k'], ['kommen hier an:', 'k'], [wert === null ? 'Werte folgen' : `${String(wert).replace('.', ',')} %`, 'h'], [name, 'k'], ...(hinweis ? [[hinweis, 'k']] : [])], { gross: 0.2, klein: 0.105, oben: 0.13, links: 0.08 }));
    },
    // Balkenwand: anteile [{ name, wert }]
    zeigeBalken(anteile, ladenpreis) {
      balken.male((g, w, h) => {
        zeilen(g, w, h, [[`Ein T-Shirt für ${ladenpreis} €: Wer bekommt was?`, 'h']], { gross: 0.085, oben: 0.1, links: 0.05 });
        const bekannt = anteile.filter((a) => a.wert !== null), summe = bekannt.reduce((s, a) => s + a.wert, 0);
        const x0b = w * 0.05, bw = w * 0.9, y = h * 0.3, bh = h * 0.2;
        g.fillStyle = '#d9d2c0'; g.fillRect(x0b, y, bw, bh);
        let x = x0b;
        bekannt.forEach((a, i) => { const ww = Math.max(4, bw * a.wert / 100); g.fillStyle = ['#7a2e34', '#2e5f6a', '#b08a3e', '#5a6470', '#47593f'][i % 5]; g.fillRect(x, y, ww, bh); x += ww; });
        g.fillStyle = '#2b2520'; g.font = `${Math.round(h * 0.062)}px "Source Serif 4", Georgia, serif`; g.textBaseline = 'top';
        let ty = h * 0.58;
        for (const a of anteile) { g.fillText(`${a.name}: ${a.wert === null ? 'Werte folgen' : String(a.wert).replace('.', ',') + ' %'}`, x0b, ty); ty += h * 0.078; }
        if (summe < 100) { g.fillStyle = '#6a6458'; g.fillText('grau: noch nicht belegt', x0b + bw * 0.55, h * 0.53); }
      });
    },
    zeigeTafel(liste) { tafel.male((g, w, h) => zeilen(g, w, h, liste, { gross: 0.1, klein: 0.062, oben: 0.12 })); },
    // fester Kurs, solange der Vermögensregler offen ist (null: wieder laufen lassen)
    setzeKurs(delta) { fest = delta; if (delta !== null) maleBoerse(delta); },
    update(dt) {
      for (const n in figuren) animiereFigur(figuren[n], dt, 0);
      uhr += dt;
      if (uhr > 0.6 && fest === null) { uhr = 0; versatz += 0.35; kurs.shift(); kurs.push(0.5 + Math.sin((48 + versatz / 0.35) * 0.35) * 0.12 + Math.sin(versatz * 3.1) * 0.06); maleBoerse((kurs[47] - kurs[46]) * 40); }
    },
  };
}
