// Kapitel II – Wohnung der Arbeiterfamilie in drei Zeitschichten. Der Raum macht das Haushaltsbuch sichtbar.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';

export function baueWohnung() {
  const BX = 4.2, BZ = 3.2, H = 2.9;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 321, wand: 0xcdbf9f, sockel: 0x7a6a52, sockelH: 0.9, boden: 0x86694a, fenster: [1.6], hemi: [0xe8d8ba, 0x5a4636, 1.5] });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(-3.0);
  // Herd an der Nordwand, Tisch in der Mitte: in allen Zeiten gleich
  b.quader(1.3, 0.9, 0.7, FARBEN.eisen, { x: -2.6, y: 0.45, z: -BZ + 0.45 });
  b.quader(0.3, 2.0, 0.3, FARBEN.eisen, { x: -2.6, y: 1.9, z: -BZ + 0.3 });
  licht.quader(0.4, 0.2, 0.04, 0xf08a3c, { x: -2.6, y: 0.4, z: -BZ + 0.81 });
  hind.push({ minX: -3.3, maxX: -1.9, minZ: -BZ, maxZ: -BZ + 0.85 });
  const TX = 0.6, TZ = -0.4;
  b.quader(1.7, 0.07, 1.0, FARBEN.holz, { x: TX, y: 0.76, z: TZ });
  for (const [sx, sz] of [[-0.75, -0.4], [0.75, -0.4], [-0.75, 0.4], [0.75, 0.4]]) b.quader(0.08, 0.74, 0.08, FARBEN.braun, { x: TX + sx, y: 0.37, z: TZ + sz });
  hind.push({ minX: TX - 0.9, maxX: TX + 0.9, minZ: TZ - 0.55, maxZ: TZ + 0.55 });
  for (const sx of [-1.25, 1.25]) { b.quader(0.42, 0.05, 0.42, FARBEN.braun, { x: TX + sx, y: 0.46, z: TZ }); b.quader(0.05, 0.5, 0.42, FARBEN.braun, { x: TX + sx * 1.15, y: 0.72, z: TZ }); }
  // Bett
  b.quader(1.1, 0.4, 2.0, FARBEN.braun, { x: 3.4, y: 0.25, z: -1.9 });
  b.quader(1.0, 0.14, 1.9, 0xb9ad94, { x: 3.4, y: 0.5, z: -1.9 });
  hind.push({ minX: 2.8, maxX: 4.2, minZ: -2.95, maxZ: -0.85 });
  // Haushaltsbuch auf dem Tisch
  b.quader(0.34, 0.04, 0.26, 0x6b2f25, { x: TX - 0.2, y: 0.82, z: TZ + 0.1, ry: 0.2 });
  r.schliesse();

  const mat = weltMaterial(), lmat = lichtMaterial();
  const schichten = {};
  const schicht = (jahr, seed, baue) => {
    const g = new THREE.Group(); const sb = new Bauer(seed), sl = new Bauer(seed + 1).teileStapel(sb);
    baue(sb, sl); g.add(sb.netz(mat), sl.netz(lmat, { schatten: false })); g.visible = false; szene.add(g); schichten[jahr] = g;
  };
  schicht(1863, 331, (sb) => {
    // kahl: Pfandzettel, leeres Regal, Kerze
    sb.quader(1.4, 0.05, 0.3, FARBEN.braun, { x: -0.4, y: 1.6, z: -BZ + 0.2 });
    sb.quader(0.16, 0.01, 0.1, 0xe6dcc6, { x: TX + 0.3, y: 0.81, z: TZ - 0.1, ry: 0.4 });
    sb.quader(0.16, 0.01, 0.1, 0xe6dcc6, { x: TX + 0.5, y: 0.81, z: TZ + 0.15, ry: -0.3 });
    sb.zylinder(0.03, 0.03, 0.14, 6, 0xe6dcc6, { x: TX + 0.6, y: 0.87, z: TZ - 0.3 });
    sb.quader(0.5, 0.4, 0.4, FARBEN.holzHell, { x: -3.6, y: 0.2, z: 1.6 });
  });
  const voll = (sb, sl) => {
    // Tischtuch, Geschirr, Bild, Kommode, Vorhang, Nähmaschine
    sb.quader(1.5, 0.02, 0.8, 0xd9d0bb, { x: TX, y: 0.81, z: TZ });
    for (const sx of [-0.4, 0.4]) sb.zylinder(0.11, 0.09, 0.02, 10, 0xf1ece0, { x: TX + sx, y: 0.83, z: TZ + 0.15 });
    sb.zylinder(0.07, 0.09, 0.16, 8, 0x3f525b, { x: TX, y: 0.9, z: TZ - 0.2 });
    sb.quader(0.7, 0.5, 0.04, 0x8a744f, { x: -0.4, y: 1.9, z: -BZ + 0.04 }); sb.quader(0.56, 0.36, 0.045, 0x6f8279, { x: -0.4, y: 1.9, z: -BZ + 0.045 });
    sb.quader(1.2, 0.9, 0.5, 0x6a5038, { x: 0.6, y: 0.45, z: -BZ + 0.3 });
    sb.quader(0.5, 0.3, 0.26, FARBEN.anthrazit, { x: -3.6, y: 1.0, z: 1.3 }); sb.quader(0.7, 0.8, 0.45, 0x6a5038, { x: -3.6, y: 0.4, z: 1.3 });
    sb.zylinder(0.11, 0.11, 0.03, 10, FARBEN.eisen, { x: -3.3, y: 1.12, z: 1.3, rx: Math.PI / 2 });
    sl.zylinder(0.1, 0.07, 0.16, 6, FARBEN.lichtWarm, { x: 0.6, y: 1.1, z: -BZ + 0.3 });
    sb.quader(0.5, 1.4, 0.04, 0x8f6a52, { x: 0.75, y: 1.9, z: BZ - 0.06 }); sb.quader(0.5, 1.4, 0.04, 0x8f6a52, { x: 2.45, y: 1.9, z: BZ - 0.06 });
  };
  schicht(1910, 341, voll);
  schicht(1930, 351, (sb, sl) => {
    voll(sb, sl);
    // Radio und unbezahlte Rechnungen
    sb.quader(0.5, 0.36, 0.26, 0x5b3a26, { x: 0.2, y: 1.08, z: -BZ + 0.3 }); sl.quader(0.16, 0.12, 0.01, 0xd9b76a, { x: 0.2, y: 1.1, z: -BZ + 0.435 });
    for (let k = 0; k < 4; k++) sb.quader(0.18, 0.008, 0.12, 0xe6dcc6, { x: TX + 0.45 + k * 0.03, y: 0.83 + k * 0.008, z: TZ - 0.2, ry: k * 0.3 });
  });
  hind.push({ minX: -4.1, maxX: -3.2, minZ: 0.95, maxZ: 1.7 }, { minX: -0.1, maxX: 1.3, minZ: -BZ, maxZ: -BZ + 0.6 });

  const annie = baueFigur(FIG.annie); annie.gruppe.position.set(-1.2, 0, -0.6); annie.gruppe.rotation.y = 1.2;
  annie.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  szene.add(annie.gruppe);
  hind.push({ x: -1.2, z: -0.6, r: 0.45, aus: () => !annie.gruppe.visible });
  return {
    szene, get sonne() { return r.sonne; }, flaeche: r.flaeche, hindernisse: hind, grenzen: r.grenzen,
    punkte: { eintritt: { x: tuer.x, z: tuer.z }, tuer, buch: new THREE.Vector3(TX - 0.2, 0, TZ + 0.95), annie: new THREE.Vector3(-1.2, 0, -0.6) },
    setze(jahr) { for (const j in schichten) schichten[j].visible = Number(j) === jahr; annie.gruppe.visible = jahr === 1910; },
    update(dt) { animiereFigur(annie, dt, 0); },
  };
}
