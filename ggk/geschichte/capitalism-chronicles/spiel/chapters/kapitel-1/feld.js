// Kapitel I – Feld vor der Stadt am Abend: Versammlung der Chartisten (Station V). Eigene Szene.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial, himmel, Rauch, schild, passant, zufall, schornstein, laterne, fass, kiste } from '../../engine/bausteine.js';
import { baueFigur, FIGUREN, dreheZu, animiereFigur } from '../../engine/figur.js';

const ABEND = new THREE.Vector3(-0.85, 0.16, -0.5).normalize();

export function baueFeld() {
  const szene = new THREE.Scene();
  szene.fog = new THREE.Fog(0xe0a46c, 40, 260);
  const b = new Bauer(81), licht = new Bauer(82).teileStapel(b);
  const rnd = zufall(83);
  const hind = [], rauchQuellen = [];

  // Boden: Moor und Wiese, ein Pfad zur Tribüne
  b.quader(600, 0.1, 600, 0x6b6748, { y: -0.05, streu: 0.02 });
  for (let i = 0; i < 260; i++) {
    const r = 6 + rnd() * 90, w = rnd() * Math.PI * 2;
    b.brocken(0.25 + rnd() * 0.5, rnd() < 0.5 ? 0x5d5b3d : 0x787250, { x: Math.cos(w) * r, y: 0, z: Math.sin(w) * r, sy: 0.35, streu: 0.08 });
  }
  b.quader(3.2, 0.03, 30, 0x7a6a52, { x: 0, y: 0.02, z: 4, streu: 0.06 });

  // Tribüne mit Fahnen
  const TZ = -8;
  b.quader(7, 1.2, 3.4, FARBEN.holz, { y: 0.6, z: TZ, streu: 0.08 });
  b.quader(7.2, 0.1, 3.6, FARBEN.holzHell, { y: 1.25, z: TZ });
  for (let i = 0; i < 3; i++) b.quader(1.4, 0.3, 0.45, FARBEN.holz, { x: -2.6, y: 0.15 + i * 0.3, z: TZ + 1.95 - i * 0.4 });
  for (const x of [-3.3, 3.3]) b.zylinder(0.08, 0.1, 5.4, 6, FARBEN.braun, { x, y: 2.7, z: TZ - 1.5 });
  b.quader(1.0, 1.0, 0.6, FARBEN.braun, { x: 0.6, y: 1.8, z: TZ + 0.8 });
  hind.push({ minX: -3.6, maxX: 3.6, minZ: TZ - 1.8, maxZ: TZ + 1.8 }, { minX: -3.4, maxX: -1.8, minZ: TZ + 1.7, maxZ: TZ + 2.3 });
  // Fahnen am Rand
  for (const [x, z, f] of [[-9, -6, 0x6b2f25], [9, -6, 0x3d4a3b], [-13, 2, 0x6b2f25], [13, 2, 0x5a4638]]) {
    b.zylinder(0.05, 0.06, 4.2, 6, FARBEN.braun, { x, y: 2.1, z });
    b.quader(1.4, 0.9, 0.03, f, { x: x + 0.72, y: 3.6, z, streu: 0.06 });
    hind.push({ x, z, r: 0.2 });
  }
  // Fackeln und Laternen
  for (const [x, z] of [[-4.2, TZ + 2.2], [4.2, TZ + 2.2], [-11, 9], [11, 9]]) {
    b.zylinder(0.05, 0.07, 1.8, 6, FARBEN.braun, { x, y: 0.9, z });
    licht.brocken(0.2, 0xffb35c, { x, y: 1.95, z, sy: 1.3 });
    hind.push({ x, z, r: 0.2 });
  }

  // Menge: Bögen um die Tribüne, mit Gasse in der Mitte
  const farben = [0x4a3b2c, 0x55504a, 0x3d4a3b, 0x5a6468, 0x6b5a47, 0x3a3836, 0x6b4f3a];
  for (let reihe = 0; reihe < 5; reihe++) {
    const r = 6.5 + reihe * 1.5, n = 9 + reihe * 2;
    for (let i = 0; i < n; i++) {
      const w = -1.05 + (2.1 * i) / (n - 1) + (rnd() - 0.5) * 0.08;
      const x = Math.sin(w) * r, z = TZ + Math.cos(w) * r;
      if (Math.abs(x) < 1.9 || rnd() < 0.12) continue;
      const kleid = rnd() < 0.35;
      passant(b, { x, z, ry: Math.atan2(-x, TZ - z) + (rnd() - 0.5) * 0.4, rock: farben[(i + reihe) % farben.length], kleid, hut: !kleid && rnd() < 0.6, g: 0.9 + rnd() * 0.14 });
      hind.push({ x, z, r: 0.32 });
    }
  }

  // Wagen mit der Zeitkapsel (links hinten)
  const WX = -9.5, WZ = 12;
  b.mit({ x: WX, z: WZ, ry: 0.3 }, () => {
    b.quader(1.8, 0.14, 3.0, FARBEN.holz, { y: 0.9 });
    for (const sx of [-1, 1]) b.quader(0.08, 0.4, 3.0, FARBEN.holz, { x: sx * 0.86, y: 1.15 });
    for (const sx of [-1, 1]) for (const sz of [-0.9, 0.9]) b.zylinder(0.55, 0.55, 0.1, 10, FARBEN.braun, { x: sx * 1.0, y: 0.55, z: sz, rz: Math.PI / 2 });
    b.quader(0.42, 0.26, 0.3, 0x8a8f8e, { x: 0.2, y: 1.1, z: 0.4 });
    b.quader(0.44, 0.04, 0.32, FARBEN.messing, { x: 0.2, y: 1.24, z: 0.4 });
    kiste(b, { x: -0.4, y: 0.97, z: -0.8, s: 0.6 });
  });
  laterne(b, licht, { x: WX + 1.8, z: WZ - 0.6, h: 2.4 });
  fass(b, { x: WX - 1.6, z: WZ + 1.2 });
  hind.push({ x: WX, z: WZ, r: 1.7 }, { x: WX + 1.8, z: WZ - 0.6, r: 0.25 }, { x: WX - 1.6, z: WZ + 1.2, r: 0.4 });

  // Stadt am Horizont
  for (let i = 0; i < 30; i++) {
    const w = -2.4 + i * 0.165 + rnd() * 0.05, r = 110 + rnd() * 40;
    const x = Math.sin(w) * r, z = -Math.cos(w) * r, h = 7 + rnd() * 12;
    b.quader(12 + rnd() * 10, h, 10, FARBEN.ziegelRuss, { x, y: h / 2, z, ry: w });
    if (rnd() < 0.5) { const kh = 24 + rnd() * 14; rauchQuellen.push({ x: x + 4, y: schornstein(b, { x: x + 4, z: z + 3, h: kh, r: 1.4 }), z: z + 3, groesse: 3, hoehe: 24 }); }
  }

  szene.add(b.netz(weltMaterial()));
  szene.add(licht.netz(lichtMaterial(), { schatten: false }));
  const rauch = new Rauch(rauchQuellen, { jeQuelle: 7 });
  szene.add(rauch.netz);
  const sky = himmel(ABEND, { horizont: 0xe8935a, zenit: 0x4f6a86, glut: 0xffa860 });
  szene.add(sky);

  // Banner
  const banner = schild("THE PEOPLE'S CHARTER", { breite: 6.4, hoehe: 1.3, zeile2: 'UNIVERSAL SUFFRAGE · VOTE BY BALLOT', groesse: 0.44, grund: '#6b2f25', farbe: '#f0dcae', rand: '#d8b76a' });
  banner.position.set(0, 4.6, TZ - 1.48); szene.add(banner);
  const banner2 = banner.clone(); banner2.rotation.y = Math.PI; banner2.position.z -= 0.02; szene.add(banner2);

  // Licht: tiefe Abendsonne, warmes Streulicht, Fackelschein
  szene.add(new THREE.HemisphereLight(0xf2cfa4, 0x5a4a3a, 1.7));
  const sonne = new THREE.DirectionalLight(0xffb878, 2.4);
  sonne.position.copy(ABEND).multiplyScalar(60);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  const sc = sonne.shadow.camera; sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.near = 5; sc.far = 140;
  sonne.shadow.bias = -0.0006; sonne.shadow.normalBias = 0.05;
  szene.add(sonne, sonne.target);
  for (const [x, z] of [[-4.2, TZ + 2.2], [4.2, TZ + 2.2]]) { const f = new THREE.PointLight(0xff9a4a, 6, 9, 1.8); f.position.set(x, 2.2, z); szene.add(f); }

  // Figuren
  const holt = baueFigur(FIGUREN.holt); holt.gruppe.position.set(-1.2, 1.3, TZ + 0.4);
  const grimshaw = baueFigur(FIGUREN.grimshaw); grimshaw.gruppe.position.set(6.2, 0, TZ + 3.4); grimshaw.gruppe.visible = false;
  for (const f of [holt, grimshaw]) { f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); }
  hind.push({ x: 6.2, z: TZ + 3.4, r: 0.4, aus: () => !grimshaw.gruppe.visible });
  const blick = { holt: null, grimshaw: null };

  return {
    szene, sonne, hindernisse: hind,
    flaeche: { minX: -16, maxX: 16, minZ: TZ + 1.9, maxZ: 18 },
    grenzen: { minX: -40, maxX: 40, minZ: -40, maxZ: 40 },
    punkte: {
      eintritt: { x: 0, z: 15, ry: Math.PI },
      holt: new THREE.Vector3(-1.2, 0, TZ + 2.6),
      tribuene: new THREE.Vector3(-2.6, 0, TZ + 3.1),
      grimshaw: new THREE.Vector3(5.4, 0, TZ + 4.6),
      kapsel: new THREE.Vector3(WX + 1.3, 0, WZ - 1.8),
    },
    setzeGrimshaw(an) { grimshaw.gruppe.visible = an; },
    blickZu(wer, pos) { blick[wer] = pos; },
    update(dt, t, kamera) {
      rauch.update(t);
      sky.position.copy(kamera.position);
      for (const [n, f, ruhe] of [['holt', holt, 0], ['grimshaw', grimshaw, -2.4]]) {
        const p = blick[n];
        dreheZu(f.gruppe, p ? Math.atan2(p.x - f.gruppe.position.x, p.z - f.gruppe.position.z) : ruhe, dt, 4);
        animiereFigur(f, dt, 0);
      }
    },
  };
}
