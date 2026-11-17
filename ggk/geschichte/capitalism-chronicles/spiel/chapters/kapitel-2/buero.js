// Kapitel II – Notbüro der Verwaltung für Wirtschaft, Frankfurt 1948. Nachempfunden; der genaue Sitz ist nicht geprüft.
import * as THREE from 'three';
import { FARBEN, schild } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';

export function baueBuero() {
  const BX = 5.4, BZ = 3.8, H = 3.0;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 361, wand: 0xc4b89c, sockel: 0x7a6a52, sockelH: 1.0, boden: 0x86694a, fenster: [-1.0, 1.8], hemi: [0xe6dcc4, 0x5a4a3a, 1.5] });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(-4.2);
  const tisch = (x, z, w = 1.8, t = 0.9) => { b.quader(w, 0.06, t, 0x7a5a3c, { x, y: 0.78, z }); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.quader(0.07, 0.76, 0.07, FARBEN.braun, { x: x + sx * (w / 2 - 0.08), y: 0.38, z: z + sz * (t / 2 - 0.08) }); hind.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - t / 2, maxZ: z + t / 2 }); };
  // Mikschs Schreibtisch mit dem Entwurf
  const MX = 1.6, MZ = -1.6;
  tisch(MX, MZ, 2.2, 1.0);
  b.quader(0.5, 0.012, 0.7, 0xe9e4d4, { x: MX - 0.3, y: 0.82, z: MZ, ry: 0.1 });
  b.quader(0.5, 0.012, 0.7, 0xe9e4d4, { x: MX + 0.35, y: 0.82, z: MZ + 0.05, ry: -0.15 });
  b.zylinder(0.04, 0.05, 0.12, 6, FARBEN.anthrazit, { x: MX + 0.9, y: 0.87, z: MZ - 0.3 });
  licht.zylinder(0.12, 0.16, 0.14, 8, 0xf2d9a0, { x: MX - 0.85, y: 1.25, z: MZ - 0.3 }); b.zylinder(0.02, 0.07, 0.4, 6, FARBEN.eisen, { x: MX - 0.85, y: 1.0, z: MZ - 0.3 });
  // Schreibmaschinentisch der Sekretärin
  const SX = -2.6, SZ = -1.9;
  tisch(SX, SZ, 1.5, 0.8);
  b.quader(0.5, 0.2, 0.42, FARBEN.anthrazit, { x: SX, y: 0.91, z: SZ }); b.zylinder(0.05, 0.05, 0.56, 8, 0x1d1a18, { x: SX, y: 1.04, z: SZ - 0.14, rz: Math.PI / 2 });
  b.quader(0.3, 0.3, 0.01, 0xe9e4d4, { x: SX, y: 1.2, z: SZ - 0.16, rx: -0.2 });
  // Aktenregal und Aktenstapel
  b.quader(2.6, 2.3, 0.4, 0x6a5038, { x: -3.6, y: 1.15, z: -BZ + 0.22 });
  for (let e = 0; e < 4; e++) for (let i = 0; i < 10; i++) b.quader(0.2, 0.42, 0.28, [0x8a8068, 0x6b6a5c, 0x55504a, 0x9a8e78][(i + e) % 4], { x: -4.7 + i * 0.25, y: 0.36 + e * 0.55, z: -BZ + 0.36, streu: 0.07 });
  hind.push({ minX: -4.95, maxX: -2.25, minZ: -BZ, maxZ: -BZ + 0.5 });
  for (const [x, z, n] of [[4.6, -3.2, 6], [4.2, -3.3, 3], [-4.8, 0.2, 5]]) for (let k = 0; k < n; k++) b.quader(0.32, 0.07, 0.24, [0xe9e4d4, 0x8a8068, 0xd9c9a3][k % 3], { x, y: 0.035 + k * 0.07, z, ry: k * 0.2 });
  // Kohleofen
  b.zylinder(0.3, 0.34, 1.1, 8, FARBEN.eisen, { x: 4.8, y: 0.55, z: 0.8 }); b.zylinder(0.09, 0.09, 1.9, 6, FARBEN.eisen, { x: 4.8, y: 2.05, z: 0.8 });
  licht.quader(0.04, 0.14, 0.2, 0xf08a3c, { x: 4.46, y: 0.4, z: 0.8 });
  hind.push({ x: 4.8, z: 0.8, r: 0.5 });
  // Radio auf einem Schränkchen
  const RX = 4.6, RZ = -1.2;
  b.quader(0.8, 0.9, 0.5, 0x6a5038, { x: RX, y: 0.45, z: RZ }); b.quader(0.6, 0.4, 0.3, 0x5b3a26, { x: RX, y: 1.1, z: RZ });
  licht.quader(0.02, 0.12, 0.2, 0xd9b76a, { x: RX - 0.31, y: 1.12, z: RZ });
  hind.push({ minX: RX - 0.45, maxX: RX + 0.45, minZ: RZ - 0.3, maxZ: RZ + 0.3 });
  // Karte der Bizone an der Nordwand (stilisiert)
  b.quader(2.6, 1.9, 0.04, 0x5b4231, { x: 1.6, y: 2.0, z: -BZ + 0.03 });
  b.quader(2.4, 1.7, 0.045, 0xd9cfae, { x: 1.6, y: 2.0, z: -BZ + 0.035 });
  b.quader(0.9, 0.8, 0.05, 0x9aa98a, { x: 1.4, y: 2.3, z: -BZ + 0.04, rz: 0.1 }); b.quader(1.0, 0.8, 0.05, 0xb9a583, { x: 1.9, y: 1.65, z: -BZ + 0.04, rz: -0.12 });
  const s = schild('Vereinigtes Wirtschaftsgebiet', { breite: 2.2, hoehe: 0.24, grund: '#d9cfae', farbe: '#2b2520', rand: null, schrift: 'Source Serif 4', groesse: 0.7 });
  s.position.set(1.6, 2.98, -BZ + 0.07); szene.add(s);
  // Besucherstühle
  for (const x of [0.2, 3.0]) { b.quader(0.44, 0.05, 0.44, FARBEN.braun, { x, y: 0.46, z: 0.4 }); b.quader(0.44, 0.5, 0.05, FARBEN.braun, { x, y: 0.72, z: 0.62 }); hind.push({ x, z: 0.45, r: 0.3 }); }
  r.schliesse();

  const figuren = {};
  const stelle = (name, x, z, ry, sichtbar = false) => { const f = baueFigur(FIG[name]); f.gruppe.position.set(x, 0, z); f.gruppe.rotation.y = ry; f.gruppe.visible = sichtbar; f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); figuren[name] = f; hind.push({ x, z, r: 0.45, aus: () => !f.gruppe.visible }); };
  stelle('brenner', SX, SZ - 0.85, 0, true);
  stelle('eucken', MX + 1.9, MZ + 0.3, -1.2);
  stelle('erhard', MX - 0.2, MZ - 1.1, 0.2);
  stelle('armack', MX + 1.9, MZ + 0.3, -1.2);
  return {
    szene, get sonne() { return r.sonne; }, flaeche: r.flaeche, hindernisse: hind, grenzen: r.grenzen, figuren,
    punkte: { eintritt: { x: tuer.x, z: tuer.z }, tuer, tisch: new THREE.Vector3(MX, 0, MZ + 1.0), brenner: new THREE.Vector3(SX, 0, SZ - 0.85), radio: new THREE.Vector3(RX - 0.8, 0, RZ), gast: new THREE.Vector3(MX + 1.9, 0, MZ + 0.3), erhard: new THREE.Vector3(MX - 0.2, 0, MZ - 1.1) },
    zeige(namen) { for (const n of ['eucken', 'erhard', 'armack']) figuren[n].gruppe.visible = namen.includes(n); },
    update(dt) { for (const n in figuren) if (figuren[n].gruppe.visible) animiereFigur(figuren[n], dt, 0); },
  };
}
