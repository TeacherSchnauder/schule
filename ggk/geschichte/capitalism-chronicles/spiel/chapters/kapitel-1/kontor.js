// Kapitel I – Kontor von Whitlow & Co. (Station III). Eigene kleine Szene.
import * as THREE from 'three';
import { FARBEN, schild } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, FIGUREN, dreheZu, animiereFigur } from '../../engine/figur.js';

export function baueKontor() {
  const BX = 5.6, BZ = 4, H = 3.5;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 61, wand: 0xc9b996, sockel: 0x5b4231, sockelH: 1.15, boden: 0x7a5a3c, fenster: [-0.6, 2.6], hemi: [0xe8d8ba, 0x5a4636, 1.45] });
  const { b, licht, hind, szene } = r;
  const tuer = r.tuer(-4.2);

  // Stehpult des Kontoristen mit dem Hauptbuch
  const SX = -2.3, SZ = -1.3;
  b.quader(1.5, 1.1, 0.7, FARBEN.braun, { x: SX, y: 0.55, z: SZ });
  b.quader(1.6, 0.06, 0.85, 0x6a5038, { x: SX, y: 1.2, z: SZ + 0.02, rx: 0.26 });
  b.quader(0.8, 0.05, 0.56, 0xe6dcc6, { x: SX, y: 1.25, z: SZ + 0.04, rx: 0.26 });
  b.quader(0.02, 0.055, 0.56, 0x8f3f2c, { x: SX, y: 1.255, z: SZ + 0.04, rx: 0.26 });
  licht.zylinder(0.1, 0.08, 0.16, 6, FARBEN.lichtWarm, { x: SX + 0.62, y: 1.62, z: SZ - 0.2 });
  b.zylinder(0.03, 0.07, 0.36, 6, FARBEN.messing, { x: SX + 0.62, y: 1.38, z: SZ - 0.2 });
  hind.push({ minX: SX - 0.8, maxX: SX + 0.8, minZ: SZ - 0.4, maxZ: SZ + 0.45 });
  // Regal mit Geschäftsbüchern an der Nordwand
  b.quader(3.4, 2.6, 0.4, FARBEN.braun, { x: -1.6, y: 1.3, z: -BZ + 0.22 });
  for (let e = 0; e < 4; e++) for (let i = 0; i < 12; i++) {
    const f = [0x6b2f25, 0x3d4a3b, 0x2f3a4a, 0x5b4231, 0x8a744f][(i * 7 + e * 3) % 5];
    b.quader(0.2, 0.44 + ((i * 5 + e) % 3) * 0.04, 0.26, f, { x: -3.1 + i * 0.27, y: 0.42 + e * 0.6, z: -BZ + 0.36, streu: 0.06 });
  }
  hind.push({ minX: -3.4, maxX: 0.2, minZ: -BZ, maxZ: -BZ + 0.5 });
  // Kassenschrank
  const TX = -4.75, TZ = -3.25;
  b.quader(1.1, 1.5, 0.95, 0x2f3336, { x: TX, y: 0.75, z: TZ });
  b.quader(0.9, 1.3, 0.04, 0x3a3f43, { x: TX, y: 0.75, z: TZ + 0.49 });
  licht.zylinder(0.09, 0.09, 0.05, 8, FARBEN.messing, { x: TX + 0.2, y: 0.85, z: TZ + 0.53, rx: Math.PI / 2 });
  hind.push({ minX: TX - 0.6, maxX: TX + 0.6, minZ: TZ - 0.5, maxZ: TZ + 0.5 });
  // Whitlows Schreibtisch
  const WX = 2.7, WZ = -2.2;
  b.quader(2.4, 0.08, 1.2, 0x5b3a26, { x: WX, y: 0.82, z: WZ });
  for (const sx of [-1, 1]) b.quader(0.6, 0.78, 1.1, 0x5b3a26, { x: WX + sx * 0.85, y: 0.39, z: WZ });
  b.quader(0.9, 0.02, 0.6, 0x2f5a44, { x: WX, y: 0.87, z: WZ + 0.1 });
  b.quader(0.36, 0.03, 0.5, 0xe6dcc6, { x: WX - 0.75, y: 0.88, z: WZ, ry: 0.2 });
  b.quader(0.5, 0.2, 0.3, 0x3d4a3b, { x: WX + 0.8, y: 0.96, z: WZ - 0.2 });
  licht.zylinder(0.11, 0.09, 0.18, 6, FARBEN.lichtWarm, { x: WX + 0.2, y: 1.35, z: WZ - 0.35 });
  b.zylinder(0.03, 0.09, 0.4, 6, FARBEN.messing, { x: WX + 0.2, y: 1.07, z: WZ - 0.35 });
  hind.push({ minX: WX - 1.25, maxX: WX + 1.25, minZ: WZ - 0.65, maxZ: WZ + 0.65 });
  // Stuhl davor
  b.quader(0.5, 0.06, 0.5, 0x5b3a26, { x: 4.6, y: 0.48, z: -0.9 }); b.quader(0.5, 0.6, 0.06, 0x5b3a26, { x: 4.6, y: 0.8, z: -0.65 });
  hind.push({ x: 4.6, z: -0.8, r: 0.35 });
  // Beistelltisch mit dem Angebot der Maschinenfabrik
  const AX = 4.7, AZ = 1.8;
  b.quader(1.0, 0.06, 1.3, 0x6a5038, { x: AX, y: 0.78, z: AZ }); b.quader(0.8, 0.75, 1.1, FARBEN.braun, { x: AX, y: 0.375, z: AZ });
  b.quader(0.5, 0.02, 0.7, 0xe6dcc6, { x: AX - 0.05, y: 0.82, z: AZ, ry: 0.1 });
  b.zylinder(0.16, 0.16, 0.5, 8, 0x8a744f, { x: AX + 0.15, y: 0.9, z: AZ - 0.45, rz: Math.PI / 2 });
  hind.push({ minX: AX - 0.55, maxX: AX + 0.6, minZ: AZ - 0.7, maxZ: AZ + 0.7 });
  // Ofen
  b.zylinder(0.32, 0.36, 1.2, 8, FARBEN.eisen, { x: 4.9, y: 0.6, z: -3.3 }); b.zylinder(0.1, 0.1, 2.2, 6, FARBEN.eisen, { x: 4.9, y: 2.3, z: -3.3 });
  licht.quader(0.2, 0.14, 0.04, 0xf08a3c, { x: 4.9, y: 0.4, z: -2.94 });
  hind.push({ x: 4.9, z: -3.3, r: 0.5 });
  // Teppich
  b.quader(3.4, 0.02, 2.2, 0x6b2f25, { x: 2.4, y: 0.012, z: 0.6, streu: 0.03 });
  b.quader(3.0, 0.022, 1.8, 0x7d4a36, { x: 2.4, y: 0.014, z: 0.6, streu: 0.05 });

  r.schliesse();
  // Preisliste der Konkurrenz an der Westwand, Wandkarte, Uhr
  const liste = schild('PRICE CURRENT', { breite: 0.9, hoehe: 1.2, grund: '#e9dcbc', farbe: '#2b2520', rand: '#8a7350', groesse: 0.13, zeile2: 'Ashworth Bros. · Cotton Yarn' });
  liste.position.set(-BX + 0.05, 1.85, 0.4); liste.rotation.y = Math.PI / 2; szene.add(liste);
  const karte = schild('COTTON', { breite: 2.0, hoehe: 1.2, grund: '#cdbf9c', farbe: '#5b4231', rand: '#5b4231', groesse: 0.2, zeile2: 'New Orleans → Liverpool → Manchester' });
  karte.position.set(2.7, 2.3, -BZ + 0.03); szene.add(karte);
  const lampe = new THREE.PointLight(0xffc36e, 9, 9, 1.8); lampe.position.set(WX, 1.9, WZ); szene.add(lampe);

  const pym = baueFigur(FIGUREN.pym); pym.gruppe.position.set(SX, 0, SZ - 0.85);
  const whitlow = baueFigur({ ...FIGUREN.whitlow, hut: null }); whitlow.gruppe.position.set(WX, 0, WZ - 1.05);
  for (const f of [pym, whitlow]) { f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); }
  hind.push({ x: SX, z: SZ - 0.85, r: 0.35 }, { x: WX, z: WZ - 1.05, r: 0.4 });
  const blick = { pym: null, whitlow: null };

  return {
    szene, sonne: r.sonne, hindernisse: hind, flaeche: r.flaeche, grenzen: r.grenzen,
    punkte: {
      eintritt: { x: -4.2, z: 2.5, ry: Math.PI },
      tuer,
      pym: new THREE.Vector3(SX, 0, SZ + 1.0),
      hauptbuch: new THREE.Vector3(SX + 1.2, 0, SZ + 0.9),
      preisliste: new THREE.Vector3(-BX + 0.8, 0, 0.4),
      angebot: new THREE.Vector3(AX - 1.0, 0, AZ),
      whitlow: new THREE.Vector3(WX, 0, WZ + 1.2),
      tresor: new THREE.Vector3(TX + 0.2, 0, TZ + 1.1),
      fenster: new THREE.Vector3(1.0, 0, BZ - 0.8),
    },
    blickZu(wer, pos) { blick[wer] = pos; },
    update(dt) {
      for (const [n, f] of [['pym', pym], ['whitlow', whitlow]]) {
        const p = blick[n];
        dreheZu(f.gruppe, p ? Math.atan2(p.x - f.gruppe.position.x, p.z - f.gruppe.position.z) : 0, dt, 4);
        animiereFigur(f, dt, 0);
      }
    },
  };
}
