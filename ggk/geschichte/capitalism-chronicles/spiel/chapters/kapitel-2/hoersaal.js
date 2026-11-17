// Kapitel II – Hörsaal einer Universität in Frankfurt, heute (A0, Zwischenhalt, Epilog). Frei erfunden, kein realer Raum.
import * as THREE from 'three';
import { FARBEN } from '../../engine/bausteine.js';
import { baueRaum } from '../../engine/raum.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { FIG } from './figuren.js';

// Fläche mit beschriftbarer Leinwand-Textur (Leinwand, Tafel)
function schreibflaeche(breite, hoehe, grund, px = 150) {
  const c = document.createElement('canvas'); c.width = breite * px; c.height = hoehe * px;
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(breite, hoehe), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
  const male = (fn) => { g.fillStyle = grund; g.fillRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
  return { netz: m, male };
}

export function baueHoersaal() {
  const BX = 8.5, BZ = 6.5, H = 5.6;
  const r = baueRaum({ bx: BX, bz: BZ, h: H, seed: 301, wand: 0xdcd8cf, sockel: 0xb9a583, sockelH: 1.2, boden: 0x9c8466, decke: 0xe9e6de, balken: false, fenster: [-6.2, -3.6, 3.6, 6.2], fensterB: 1.9, fensterU: 1.6, fensterO: 4.6, hintergrund: 0x1f2226, nebel: [0x8a8d92, 22, 60], hemi: [0xf2efe8, 0x8a7f70, 1.55], sonneStaerke: 1.6 });
  const { b, licht, hind, szene } = r;
  // Podest und Pult vorn (Nordwand)
  b.quader(BX * 2 - 1, 0.18, 3.2, 0x8a7458, { y: 0.09, z: -BZ + 1.7 });
  const PX = -2.4, PZ = -BZ + 2.3;
  b.quader(2.2, 1.05, 0.75, 0xb9a583, { x: PX, y: 0.7, z: PZ });
  b.quader(2.3, 0.06, 0.85, 0x8a7458, { x: PX, y: 1.25, z: PZ });
  // Laptop
  b.quader(0.42, 0.02, 0.3, 0x8c9096, { x: PX - 0.6, y: 1.29, z: PZ });
  licht.quader(0.42, 0.28, 0.02, 0xbcd0e0, { x: PX - 0.6, y: 1.43, z: PZ - 0.16, rx: -0.2 });
  hind.push({ minX: PX - 1.2, maxX: PX + 1.2, minZ: PZ - 0.5, maxZ: PZ + 0.5 });
  // Zeitkapsel: Messingkassette aus Kapitel I, der Deckel lässt sich öffnen
  const kassette = new THREE.Group();
  const km = new THREE.MeshLambertMaterial({ color: FARBEN.messing, flatShading: true });
  const unten = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.2, 0.32), km);
  unten.position.y = 0.1;
  const deckel = new THREE.Group();
  const dm = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.07, 0.34), km); dm.position.set(0, 0.035, 0.17);
  const siegel = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 10), new THREE.MeshLambertMaterial({ color: 0x8f3f2c })); siegel.position.set(0, 0.08, 0.17);
  deckel.add(dm, siegel); deckel.position.set(0, 0.2, -0.16);
  kassette.add(unten, deckel);
  kassette.position.set(PX + 0.45, 1.28, PZ);
  kassette.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  szene.add(kassette);
  // drei Karten, die beim Öffnen aufsteigen
  const karten = [];
  for (let i = 0; i < 3; i++) {
    const k = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.28), new THREE.MeshBasicMaterial({ color: 0xf1e6c8, side: THREE.DoubleSide }));
    k.position.set(PX + 0.45 + (i - 1) * 0.02, 1.4, PZ); k.visible = false;
    szene.add(k); karten.push(k);
  }
  // Leinwand und Tafel an der Nordwand
  const leinwand = schreibflaeche(6.4, 3.6, '#f4f1ea');
  leinwand.netz.position.set(2.6, 3.25, -BZ + 0.06); szene.add(leinwand.netz);
  b.quader(6.7, 3.9, 0.06, 0x2a2c30, { x: 2.6, y: 3.25, z: -BZ + 0.02 });
  const tafel = schreibflaeche(4.4, 2.2, '#2f4a3c');
  tafel.netz.position.set(-5.0, 2.6, -BZ + 0.06); szene.add(tafel.netz);
  b.quader(4.7, 2.5, 0.06, 0x8a7458, { x: -5.0, y: 2.6, z: -BZ + 0.02 });
  b.quader(4.4, 0.06, 0.14, 0x8a7458, { x: -5.0, y: 1.42, z: -BZ + 0.1 });
  // ansteigende Sitzreihen
  const REIHE0 = -0.6;
  for (let i = 0; i < 6; i++) {
    const z = REIHE0 + i * 1.15, y = 0.22 * (i + 1);
    b.quader(BX * 2 - 0.3, y, 1.15, 0x9c8466, { y: y / 2, z, streu: 0.03 });
    for (const [x0, x1] of [[-7.6, -1.0], [1.0, 7.6]]) {
      const m = (x0 + x1) / 2, w = x1 - x0;
      b.quader(w, 0.05, 0.36, 0xc9b996, { x: m, y: y + 0.74, z: z - 0.32 });
      b.quader(w, 0.72, 0.05, 0xb9a583, { x: m, y: y + 0.38, z: z - 0.5 });
      for (let x = x0 + 0.4; x < x1; x += 0.72) b.quader(0.5, 0.42, 0.08, 0x3f525b, { x, y: y + 0.62, z: z + 0.3, rx: -0.12, streu: 0.06 });
      b.quader(w, 0.06, 0.4, 0x3f525b, { x: m, y: y + 0.42, z: z + 0.08 });
    }
  }
  hind.push({ minX: -BX, maxX: BX, minZ: REIHE0 - 0.8, maxZ: BZ });
  // einige Studierende in den Reihen (Köpfe und Schultern)
  const plaetze = [[-6, 0], [-4.4, 1], [-2.6, 0], [2.2, 1], [4.6, 0], [6.3, 2], [-5.2, 3], [3.4, 3], [-1.8, 4], [5.5, 4], [1.6, 5]];
  plaetze.forEach(([x, i], n) => {
    const z = REIHE0 + i * 1.15 + 0.12, y = 0.22 * (i + 1) + 0.45;
    const f = [0x6b2f25, 0x3f525b, 0x47593f, 0x5a5048, 0x8a744f][n % 5];
    b.zylinder(0.17, 0.21, 0.5, 7, f, { x, y: y + 0.3, z, sz: 0.8 });
    b.kugel(0.115, FARBEN.haut, { x, y: y + 0.7, z, sy: 1.12 });
    b.kugel(0.125, [0x2a2420, 0x5b4231, 0x8b7a66, 0x3a2c22][n % 4], { x, y: y + 0.75, z: z + 0.03, sy: 0.9 });
  });
  // Deckenleuchten
  for (const x of [-5, 0, 5]) for (const z of [-3.5, 1.5]) licht.quader(1.6, 0.05, 0.3, 0xf6f0de, { x, y: H - 0.06, z });
  r.schliesse();

  const imhof = baueFigur(FIG.imhof);
  imhof.gruppe.position.set(PX + 0.1, 0.18, PZ - 0.95);
  imhof.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  szene.add(imhof.gruppe);
  hind.push({ x: PX + 0.1, z: PZ - 0.95, r: 0.45 });

  // Beschriftung
  const zeilen = (g, w, h, liste, { farbe, gross, klein, links = 0.07 }) => {
    let y = h * 0.16;
    for (const [text, art] of liste) {
      const fs = Math.round(h * (art === 'h' ? gross : klein));
      g.font = `${fs}px ${art === 'h' ? '"Abril Fatface", Georgia, serif' : '"Source Serif 4", Georgia, serif'}`;
      g.fillStyle = farbe; g.textBaseline = 'middle';
      g.fillText(text, w * links, y);
      y += fs * 1.55;
    }
  };
  let offen = 0, zielOffen = 0;
  return {
    szene, get sonne() { return r.sonne; }, flaeche: { ...r.flaeche, maxZ: REIHE0 - 0.85 }, hindernisse: hind, grenzen: { ...r.grenzen, maxY: H + 3.5, maxZ: BZ + 4 },
    punkte: { eintritt: { x: 1.5, z: -2.6 }, pult: new THREE.Vector3(PX + 0.5, 0, PZ + 0.9), imhof: new THREE.Vector3(PX + 0.1, 0, PZ - 0.95), leinwand: new THREE.Vector3(2.6, 0, -BZ + 1.4), tafel: new THREE.Vector3(-5.0, 0, -BZ + 1.4) },
    leinwandMitte: new THREE.Vector3(2.6, 3.25, -BZ + 0.06),
    // liste: [[Text, 'h' | 't'], …]
    zeigeLeinwand(liste) { leinwand.male((g, w, h) => zeilen(g, w, h, liste, { farbe: '#2b2520', gross: 0.105, klein: 0.062 })); },
    zeigeTafel(liste) { tafel.male((g, w, h) => zeilen(g, w, h, liste, { farbe: '#eef0e6', gross: 0.12, klein: 0.085 })); },
    oeffneKapsel(an = true) { zielOffen = an ? 1 : 0; },
    update(dt) {
      animiereFigur(imhof, dt, 0);
      offen += (zielOffen - offen) * Math.min(1, dt * 2.2);
      deckel.rotation.x = -offen * 1.9;
      karten.forEach((k, i) => { k.visible = offen > 0.15; k.position.y = 1.42 + offen * (0.45 + i * 0.05); k.position.x = PX + 0.45 + (i - 1) * 0.3 * offen; k.rotation.y = (i - 1) * -0.25; });
    },
  };
}
