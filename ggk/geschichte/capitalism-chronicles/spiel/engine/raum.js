// Kleiner Innenraum als eigene Szene. Ursprung in der Raummitte, die Südwand (+z) ist von außen
// durchsichtig, damit die Kamera hinter ihr stehen kann.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial } from './bausteine.js';

const LICHT = new THREE.Vector3(-0.28, 0.62, 0.73).normalize();   // Richtung zur Sonne

export function baueRaum({
  bx, bz, h, seed = 51, wand = FARBEN.kalk, sockel = 0x8b6a4c, sockelH = 1.0, boden = FARBEN.holz, decke = 0x4a3a2c,
  fenster = [], fensterB = 1.3, fensterU = 1.1, fensterO = 2.7, hintergrund = 0x2a221c, nebel = [0x6b5a48, 14, 44],
  hemi = [0xe6d6ba, 0x5a4636, 1.3], sonneStaerke = 2.2, balken = true,
}) {
  const szene = new THREE.Scene();
  szene.background = new THREE.Color(hintergrund);
  szene.fog = new THREE.Fog(...nebel);
  const b = new Bauer(seed), licht = new Bauer(seed + 1).teileStapel(b);
  const hind = [];

  for (let z = -bz + 0.25; z < bz; z += 0.5) b.quader(bx * 2, 0.1, 0.5, boden, { y: -0.05, z, streu: 0.09 });
  // Decke und Wände sind einseitig: Von außen und von oben blickt die Kamera in den Raum wie in ein Puppenhaus.
  const W = Math.PI / 2;
  b.flaeche(bx * 2, bz * 2, decke, { y: h, rx: W });
  if (balken) for (let x = -bx + 1; x < bx; x += 1.9) b.flaeche(0.22, bz * 2, FARBEN.braun, { x, y: h - 0.02, rx: W, rz: 0 });
  b.flaeche(bx * 2, h, wand, { y: h / 2, z: -bz, streu: 0.03 });
  b.flaeche(bz * 2, h, wand, { x: -bx, y: h / 2, ry: W, streu: 0.03 });
  b.flaeche(bz * 2, h, wand, { x: bx, y: h / 2, ry: -W, streu: 0.03 });
  if (sockelH > 0) {
    b.flaeche(bx * 2, sockelH, sockel, { y: sockelH / 2, z: -bz + 0.01 });
    b.flaeche(bz * 2, sockelH, sockel, { x: -bx + 0.01, y: sockelH / 2, ry: W });
    b.flaeche(bz * 2, sockelH, sockel, { x: bx - 0.01, y: sockelH / 2, ry: -W });
  }
  // Südwand: einseitige Flächen mit Fensteröffnungen
  const innen = (x, y, bw, bh, f = wand) => b.flaeche(bw, bh, f, { x, y, z: bz, ry: Math.PI, streu: 0.03 });
  const fx = [...fenster].sort((a, c) => a - c);
  if (fx.length) {
    innen(0, fensterU / 2, bx * 2, fensterU);
    innen(0, (fensterO + h) / 2, bx * 2, h - fensterO);
    let links = -bx;
    for (const x of [...fx, null]) {
      const rechts = x === null ? bx : x - fensterB / 2;
      if (rechts - links > 0.01) innen(links + (rechts - links) / 2, (fensterU + fensterO) / 2, rechts - links, fensterO - fensterU);
      if (x !== null) links = x + fensterB / 2;
    }
    for (const x of fx) {
      b.flaeche(0.06, fensterO - fensterU, FARBEN.eisen, { x, y: (fensterU + fensterO) / 2, z: bz - 0.01, ry: Math.PI });
      b.flaeche(fensterB, 0.06, FARBEN.eisen, { x, y: (fensterU + fensterO) / 2, z: bz - 0.01, ry: Math.PI });
    }
    const draussen = new THREE.Mesh(new THREE.PlaneGeometry(bx * 2, fensterO - fensterU), new THREE.MeshBasicMaterial({ color: 0xf3dcb4, fog: false }));
    draussen.position.set(0, (fensterU + fensterO) / 2, bz + 0.4); draussen.rotation.y = Math.PI; szene.add(draussen);
  } else innen(0, h / 2, bx * 2, h);
  if (sockelH > 0) innen(0, sockelH / 2, bx * 2, sockelH, sockel);

  // Tür in der Südwand
  const tuer = (x) => {
    // einseitig wie die Wand, damit die Tür den Blick von außen nicht verdeckt
    b.flaeche(1.3, 2.2, FARBEN.braun, { x, y: 1.1, z: bz - 0.02, ry: Math.PI });
    b.flaeche(1.6, 0.16, 0x6a5038, { x, y: 2.28, z: bz - 0.025, ry: Math.PI });
    licht.flaeche(0.1, 0.1, FARBEN.messing, { x: x - 0.45, y: 1.05, z: bz - 0.03, ry: Math.PI });
    return new THREE.Vector3(x, 0, bz - 0.55);
  };

  let sonne = null;
  return {
    szene, b, licht, hind, tuer, LICHT,
    flaeche: { minX: -bx + 0.12, maxX: bx - 0.12, minZ: -bz + 0.12, maxZ: bz - 0.12 },
    grenzen: { minX: -bx - 2.5, maxX: bx + 2.5, minZ: -bz - 2.5, maxZ: bz + 3.2, maxY: h + 2.4 },
    get sonne() { return sonne; },
    // Geometrie zusammenfassen und Licht setzen
    schliesse() {
      szene.add(b.netz(weltMaterial()));
      szene.add(licht.netz(lichtMaterial(), { schatten: false }));
      szene.add(new THREE.HemisphereLight(...hemi));
      sonne = new THREE.DirectionalLight(0xffd9a6, sonneStaerke);
      sonne.position.copy(LICHT).multiplyScalar(24);
      sonne.castShadow = true;
      sonne.shadow.mapSize.set(1024, 1024);
      const sc = sonne.shadow.camera;
      const r = Math.max(bx, bz) + 3;
      sc.left = -r; sc.right = r; sc.top = r; sc.bottom = -r; sc.near = 4; sc.far = 50;
      sonne.shadow.bias = -0.0008; sonne.shadow.normalBias = 0.04;
      szene.add(sonne, sonne.target);
      return sonne;
    },
  };
}
