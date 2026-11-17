// Kapitel III – Asservatenkammer (Beweisstücke aus Kapitel I und II) und Zeugenzimmer. Frei erfunden.
import * as THREE from 'three';
import { schild } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';
import { schreibflaeche, zeilen } from './flaeche.js';

const SEPIA = (c) => new THREE.Color(c).lerp(new THREE.Color(0x9a8466), 0.65).getHex();

export function baueAsservaten() {
  const BX = 5.2, BZ = 3.6, H = 3.3;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 521, wand: 0xcfd3cc, sockel: 0x8d968c, sockelH: 0.0, boden: 0x8f8f86, decke: 0xdcdcd4, balken: false, fenster: [], hintergrund: 0x1c2022, nebel: [0x7c8482, 16, 46], hemi: [0xe8eef0, 0x70766f, 1.75], sonneStaerke: 1.2 });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(3.8);
  // Regal an der Nordwand: zwei Reihen mit je vier Fächern
  const RX = -4.4, FB = 2.2, RZ = -BZ + 0.3;
  const stahl = 0x76807a;
  for (let i = 0; i <= 4; i++) b.quader(0.06, 2.5, 0.6, stahl, { x: RX + i * FB, y: 1.25, z: RZ });
  for (const y of [0.25, 1.1, 1.95, 2.5]) b.quader(FB * 4 + 0.06, 0.05, 0.6, stahl, { x: RX + FB * 2, y, z: RZ });
  hind.push({ minX: RX - 0.1, maxX: RX + FB * 4 + 0.1, minZ: -BZ, maxZ: RZ + 0.4 });
  // Kartons im untersten Fach
  for (let i = 0; i < 9; i++) b.quader(0.6, 0.42, 0.42, [0xa58e63, 0x9b8559, 0xb39a6c][i % 3], { x: RX + 0.5 + i * 0.95, y: 0.5, z: RZ, ry: (i % 3 - 1) * 0.06, streu: 0.06 });
  const fach = (n) => ({ x: RX + FB * (((n - 1) % 4) + 0.5), y: n <= 4 ? 1.98 : 1.13, z: RZ });
  const etikett = (n, text) => {
    const f = fach(n);
    const s = schild(`${n} · ${text}`, { breite: 1.7, hoehe: 0.2, grund: '#f1ecd9', farbe: '#2b2520', rand: null, schrift: 'Source Serif 4', groesse: 0.62 });
    s.position.set(f.x, f.y - 0.115, RZ + 0.32); szene.add(s);
    licht.quader(0.5, 0.02, 0.04, 0xf4f0dc, { x: f.x, y: f.y + 0.78, z: RZ + 0.2 });
  };
  // 1 Garnspule
  let f = fach(1); b.zylinder(0.13, 0.13, 0.04, 10, SEPIA(0x7a5a3c), { x: f.x, y: f.y + 0.02, z: f.z }); b.zylinder(0.1, 0.1, 0.3, 10, SEPIA(0xe9e1cf), { x: f.x, y: f.y + 0.19, z: f.z }); b.zylinder(0.13, 0.13, 0.04, 10, SEPIA(0x7a5a3c), { x: f.x, y: f.y + 0.36, z: f.z });
  // 2 Hauptbuch
  f = fach(2); b.quader(0.6, 0.12, 0.44, SEPIA(0x5b3a26), { x: f.x, y: f.y + 0.06, z: f.z, ry: 0.15 }); b.quader(0.56, 0.1, 0.4, SEPIA(0xe9e4d4), { x: f.x + 0.015, y: f.y + 0.065, z: f.z + 0.01, ry: 0.15 });
  // 3 Sterberegister
  f = fach(3); b.quader(0.12, 0.5, 0.36, SEPIA(0x6b6f72), { x: f.x - 0.1, y: f.y + 0.25, z: f.z, rz: 0.12 }); b.quader(0.1, 0.46, 0.34, SEPIA(0x55504a), { x: f.x + 0.08, y: f.y + 0.23, z: f.z });
  // 4 Zeitkapsel
  f = fach(4); b.quader(0.5, 0.22, 0.32, SEPIA(0xb08d48), { x: f.x, y: f.y + 0.11, z: f.z }); b.quader(0.52, 0.06, 0.34, SEPIA(0x9a7a3c), { x: f.x, y: f.y + 0.25, z: f.z }); b.zylinder(0.06, 0.06, 0.02, 8, SEPIA(0x8f3f2c), { x: f.x, y: f.y + 0.29, z: f.z });
  // 5 Haushaltsbuch
  f = fach(5); b.quader(0.36, 0.03, 0.5, SEPIA(0x3f525b), { x: f.x, y: f.y + 0.015, z: f.z, ry: -0.2 }); b.quader(0.34, 0.02, 0.48, SEPIA(0xe9e4d4), { x: f.x, y: f.y + 0.04, z: f.z, ry: -0.2 });
  // 6 Schuh
  f = fach(6); b.quader(0.16, 0.1, 0.42, SEPIA(0x4a3122), { x: f.x, y: f.y + 0.05, z: f.z, ry: 0.5 }); b.quader(0.16, 0.14, 0.2, SEPIA(0x4a3122), { x: f.x - 0.05, y: f.y + 0.14, z: f.z - 0.09, ry: 0.5 }); b.quader(0.18, 0.03, 0.44, SEPIA(0x1d1a18), { x: f.x, y: f.y + 0.012, z: f.z, ry: 0.5 });
  // 7 Leitsätze
  f = fach(7); for (let i = 0; i < 3; i++) b.quader(0.32, 0.012, 0.44, SEPIA(0xe9e4d4), { x: f.x + i * 0.05 - 0.05, y: f.y + 0.01 + i * 0.013, z: f.z, ry: (i - 1) * 0.16 });
  // 8 T-Shirt (Gegenwart: farbig)
  f = fach(8); b.quader(0.5, 0.05, 0.44, 0xf2f0ea, { x: f.x, y: f.y + 0.03, z: f.z, streu: 0.01 }); b.quader(0.18, 0.045, 0.16, 0xf2f0ea, { x: f.x - 0.3, y: f.y + 0.03, z: f.z - 0.12, ry: 0.5, streu: 0.01 }); b.quader(0.18, 0.045, 0.16, 0xf2f0ea, { x: f.x + 0.3, y: f.y + 0.03, z: f.z - 0.12, ry: -0.5, streu: 0.01 }); b.quader(0.12, 0.01, 0.18, 0xc9443a, { x: f.x + 0.12, y: f.y + 0.062, z: f.z + 0.1, ry: 0.3 });
  ['Garnspule', 'Hauptbuch', 'Sterberegister', 'Zeitkapsel', 'Haushaltsbuch', 'Schuh 1948', 'Leitsätze', 'T-Shirt'].forEach((t, i) => etikett(i + 1, t));
  // Tisch mit Lampe in der Raummitte
  const TX = -1.2, TZ = 0.6;
  b.quader(2.4, 0.06, 1.0, 0x9a9488, { x: TX, y: 0.78, z: TZ }); for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.06, 0.76, 0.06, stahl, { x: TX + ax * 1.1, y: 0.38, z: TZ + az * 0.42 });
  b.quader(0.34, 0.03, 0.26, 0x5a6470, { x: TX - 0.5, y: 0.83, z: TZ, ry: 0.2 }); b.quader(0.3, 0.012, 0.42, 0xf1ecd9, { x: TX + 0.3, y: 0.82, z: TZ, ry: -0.1 });
  b.zylinder(0.02, 0.06, 0.4, 6, 0x35373a, { x: TX + 0.95, y: 1.0, z: TZ - 0.3 }); licht.zylinder(0.1, 0.15, 0.12, 8, 0xf4f0dc, { x: TX + 0.95, y: 1.24, z: TZ - 0.3 });
  hind.push({ minX: TX - 1.25, maxX: TX + 1.25, minZ: TZ - 0.55, maxZ: TZ + 0.55 });
  // Rollwagen mit Kartons, Aktenschrank
  b.quader(0.9, 0.05, 0.6, stahl, { x: 3.9, y: 0.3, z: -1.6 }); b.quader(0.7, 0.45, 0.5, 0xa58e63, { x: 3.9, y: 0.55, z: -1.6, ry: 0.1 }); b.quader(0.5, 0.3, 0.4, 0x9b8559, { x: 3.85, y: 0.93, z: -1.6, ry: -0.2 });
  hind.push({ x: 3.9, z: -1.6, r: 0.6 });
  b.quader(0.6, 1.9, 1.6, 0x8d968c, { x: -BX + 0.32, y: 0.95, z: 1.4 }); for (let i = 0; i < 4; i++) b.quader(0.03, 0.4, 1.5, 0x76807a, { x: -BX + 0.63, y: 0.28 + i * 0.46, z: 1.4 });
  hind.push({ minX: -BX, maxX: -BX + 0.7, minZ: 0.5, maxZ: 2.3 });
  for (const x of [-3, 0.6, 4]) licht.quader(1.6, 0.05, 0.16, 0xf0f6f6, { x, y: H - 0.05, z: -0.6 });
  r.schliesse();
  return {
    szene, get sonne() { return r.sonne; }, flaeche: r.flaeche, hindernisse: hind, grenzen: r.grenzen,
    punkte: { eintritt: { x: tuer.x, z: tuer.z - 0.3 }, tuer, regal: new THREE.Vector3(RX + FB * 2, 0, RZ + 1.0), tisch: new THREE.Vector3(TX, 0, TZ + 1.0) },
    update() {},
  };
}

export function baueZeugenzimmer() {
  const BX = 4.8, BZ = 3.4, H = 3.1;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 541, wand: 0xe0d8c6, sockel: 0xa88a5e, sockelH: 1.0, boden: 0x9a7c56, decke: 0xe9e4d8, balken: false, fenster: [-2.2, 1.2], fensterB: 1.6, hintergrund: 0x241f1a, nebel: [0x8a7a66, 16, 46], hemi: [0xf2e8d4, 0x6a5a48, 1.55], sonneStaerke: 1.8 });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(3.6);
  const TX = -0.6, TZ = -0.6;
  b.quader(2.6, 0.07, 1.2, 0xa88a5e, { x: TX, y: 0.78, z: TZ }); for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.08, 0.76, 0.08, 0x8a6e48, { x: TX + ax * 1.15, y: 0.38, z: TZ + az * 0.48 });
  hind.push({ minX: TX - 1.4, maxX: TX + 1.4, minZ: TZ - 0.7, maxZ: TZ + 0.7 });
  // Karaffe, Gläser, Gegenstimme als Karte
  b.zylinder(0.05, 0.08, 0.26, 8, 0xbcd4dc, { x: TX + 0.9, y: 0.95, z: TZ - 0.1 }); for (const dx of [0.6, 0.72]) b.zylinder(0.035, 0.03, 0.1, 6, 0xd4e4e8, { x: TX + dx, y: 0.87, z: TZ + 0.15 });
  b.quader(0.3, 0.012, 0.42, 0xf1ecd9, { x: TX - 0.75, y: 0.823, z: TZ + 0.2, ry: 0.25 });
  // Stühle: zwei vorn (Süden), einer hinten für den Zeugen
  const stuhl = (x, z, ry) => b.mit({ x, z, ry }, () => { b.quader(0.46, 0.06, 0.46, 0x3f6670, { y: 0.47 }); b.quader(0.46, 0.55, 0.06, 0x3f6670, { y: 0.76, z: -0.22 }); for (const [ax, az] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.04, 0.45, 0.04, 0x55504a, { x: ax * 0.19, y: 0.225, z: az * 0.19 }); });
  stuhl(TX - 0.6, TZ + 1.15, Math.PI); stuhl(TX + 0.6, TZ + 1.15, Math.PI);
  hind.push({ minX: TX - 0.9, maxX: TX + 0.9, minZ: TZ + 0.9, maxZ: TZ + 1.4 });
  // Tafel mit den Zeugen an der Nordwand
  const tafel = schreibflaeche(3.4, 1.9, '#f4f1ea');
  tafel.netz.position.set(2.4, 2.0, -BZ + 0.06); szene.add(tafel.netz);
  b.quader(3.6, 2.1, 0.05, 0x8a6e48, { x: 2.4, y: 2.0, z: -BZ + 0.02 });
  // Garderobe und Pflanze
  b.zylinder(0.03, 0.03, 1.8, 6, 0x55504a, { x: -4.2, y: 0.9, z: -2.8 }); b.zylinder(0.25, 0.25, 0.03, 8, 0x55504a, { x: -4.2, y: 0.02, z: -2.8 });
  b.quader(0.3, 0.6, 0.12, 0x6a5a48, { x: -4.2, y: 1.4, z: -2.7 });
  b.zylinder(0.2, 0.16, 0.4, 8, 0x9a6a4a, { x: 4.2, y: 0.2, z: -2.8 }); for (let i = 0; i < 5; i++) b.kugel(0.22, 0x4f6a4c, { x: 4.2 + Math.cos(i * 1.3) * 0.16, y: 0.7 + (i % 3) * 0.2, z: -2.8 + Math.sin(i * 1.3) * 0.16, sy: 1.3 });
  hind.push({ x: 4.2, z: -2.8, r: 0.4 }, { x: -4.2, z: -2.8, r: 0.35 });
  for (const x of [-2.4, 1.6]) licht.zylinder(0.22, 0.3, 0.2, 10, 0xf6e6c0, { x, y: H - 0.5, z: -0.6 });
  r.schliesse();

  // Zeugen sitzen nacheinander auf demselben Platz hinter dem Tisch
  const figuren = {};
  for (const n of ['mary', 'jack', 'annie', 'haendler', 'weber', 'rokeya', 'einkaeuferin', 'kaya']) {
    const f = baueFigur(FIG[n]);
    f.gruppe.position.set(TX + (n === 'weber' ? 0.95 : n === 'haendler' ? -0.2 : 0.3), 0, TZ - 1.05);
    f.gruppe.visible = false;
    f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    szene.add(f.gruppe); figuren[n] = f;
  }
  return {
    szene, get sonne() { return r.sonne; }, flaeche: r.flaeche, hindernisse: hind, grenzen: r.grenzen, figuren,
    punkte: { eintritt: { x: tuer.x, z: tuer.z - 0.3 }, tuer, tisch: new THREE.Vector3(TX, 0, TZ + 1.75), karte: new THREE.Vector3(TX - 1.8, 0, TZ + 0.9), tafel: new THREE.Vector3(2.4, 0, -BZ + 1.2) },
    zeige(name) { for (const n in figuren) figuren[n].gruppe.visible = n === name || (name === 'haendler' && n === 'weber'); },
    // liste: [{ name, erledigt, pflicht }]
    zeigeTafel(liste) {
      tafel.male((g, w, h) => zeilen(g, w, h, [['Zeugen', 'h'], ...liste.map((z) => [`${z.erledigt ? '✓' : '○'}  ${z.name}${z.pflicht ? '  (Pflicht)' : ''}`, 't'])], { gross: 0.12, klein: 0.072, oben: 0.12 }));
    },
    update(dt) { for (const n in figuren) if (figuren[n].gruppe.visible) animiereFigur(figuren[n], dt, 0); },
  };
}
