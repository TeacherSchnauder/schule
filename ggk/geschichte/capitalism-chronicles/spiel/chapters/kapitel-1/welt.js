// Kapitel I – Außenwelt des spielbaren Ausschnitts: Bahnhof, Straße am Kanal, Fabrikhof.
// Die Stadt ist stilisiert und kein maßstabsgetreues Manchester.
import * as THREE from 'three';
import { Pfad } from '../../engine/pfad.js';
import { baueNord } from './welt-nord.js';
import {
  Bauer, FARBEN, weltMaterial, lichtMaterial, ziegelhaus, schornstein, laterne, ballen, fass, kiste,
  passant, himmel, Rauch, schild, bandGeo, zufall,
} from '../../engine/bausteine.js';

export const SONNE = new THREE.Vector3(0.8, 0.5, -0.33).normalize();

export function baueAussen() {
  const szene = new THREE.Scene();
  szene.fog = new THREE.Fog(0xf0b77c, 50, 360);

  // Die Straße, auf der Marx und Engels gehen.
  const pfad = new Pfad([[-24, 16], [-12, 16], [-4, 13], [0, 4], [1.5, -10], [2.5, -24], [-1.5, -44], [1.5, -64], [0, -80], [0, -88]]);
  // Die Achse des Kanals; an ihr hängen Ufer, Wasser und Gebäudereihen.
  const achse = new Pfad([[0, 70], [0, 30], [0, 4], [1.5, -10], [2.5, -24], [-1.5, -44], [1.5, -64], [0, -80], [0, -100], [0, -140], [0, -230]]);
  const sZ = (z) => {       // Bogenlänge der Achse zu einer z-Koordinate (Näherung, per Suche)
    let lo = 0, hi = achse.laenge;
    for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; if (achse.punkt(m).z > z) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const anAchse = (z, seitlich) => achse.ort(sZ(z), seitlich);

  const b = new Bauer(5);
  const licht = new Bauer(6).teileStapel(b);
  const rnd = zufall(21);
  const rauchQuellen = [];
  // Hindernisse auf der begehbaren Straße (Korridor): Kreise { x, z, r } und Rechtecke
  const hindA = [];
  const mensch = (o) => { passant(b, o); hindA.push({ x: o.x, z: o.z, r: 0.32 * (o.g || 1) }); };

  // --- Boden, Kanal, Ufer -------------------------------------------------
  const N = 76, DS = achse.laenge / (N - 1);
  const quer = (s, off, y) => { const p = achse.punkt(s); const n = achse.rechts(s); return new THREE.Vector3(p.x + n.x * off, y, p.z + n.z * off); };
  const band = (o1, y1, o2, y2, farbe, streu = 0.05) =>
    b.hinzu(bandGeo(N, (i) => [quer(i * DS, o1, y1), quer(i * DS, o2, y2)]), farbe, { streu });
  band(-140, 0, 4.4, 0, FARBEN.pflasterDunkel, 0.05);
  band(4.4, 0.04, 5.0, 0.04, FARBEN.sandstein, 0.05);     // Kaimauerkrone
  band(5.0, 0.04, 5.0, -2.2, 0x6f6455, 0.06);             // Kaimauer
  band(19.0, -2.2, 19.0, 0.04, 0x6f6455, 0.06);
  band(19.0, 0.04, 160, 0, FARBEN.erde, 0.05);
  band(5.0, -2.2, 19.0, -2.2, 0x3b3a34, 0.02);            // Kanalgrund

  // Straßenpflaster entlang des Laufwegs
  {
    const n = 64, ds = (pfad.laenge + 6) / (n - 1);
    const q = (i, off) => { const s = i * ds - 2; const p = pfad.punkt(s); const r = pfad.rechts(s); return new THREE.Vector3(p.x + r.x * off, 0.02, p.z + r.z * off); };
    b.hinzu(bandGeo(n, (i) => [q(i, -3.3), q(i, 3.3)]), FARBEN.pflaster, { streu: 0.07 });
  }

  // Wasser: eigenes Netz mit bewegten Ecken
  const wasser = baueWasser(achse);
  szene.add(wasser.netz);

  // --- Bahnhof ---------------------------------------------------------------
  // Bahnsteigfläche
  b.quader(46, 0.06, 10, FARBEN.pflaster, { x: -20, y: 0.03, z: 15, streu: 0.06 });
  // Empfangsgebäude (Front nach Süden zum Bahnsteig)
  b.mit({ x: -18, z: 7 }, () => {
    ziegelhaus(b, licht, { breite: 20, tiefe: 7, etagen: 2, etagenH: 3.4, farbe: FARBEN.ziegelHell, lichtAnteil: 0.3, schornsteine: 2, fensterAbstand: 2.6 });
    // Vordach auf gusseisernen Stützen
    b.quader(21, 0.14, 4.2, FARBEN.schiefer, { y: 3.9, z: 5.4, rx: 0.07 });
    for (let i = -2; i <= 2; i++) b.zylinder(0.08, 0.1, 3.7, 6, FARBEN.eisen, { x: i * 4.6, y: 1.85, z: 7.2 });
  });
  // Gleis und Brücke über den Kanal
  for (const dz of [-0.72, 0.72]) b.quader(240, 0.12, 0.1, FARBEN.eisen, { x: -10, y: 0.2, z: 23 + dz, streu: 0.02 });
  for (let x = -76; x < 60; x += 1.4) b.quader(0.28, 0.1, 2.3, FARBEN.braun, { x, y: 0.08, z: 23, streu: 0.08 });
  b.quader(17, 0.5, 4.2, 0x6f6455, { x: 12, y: -0.22, z: 23 });
  for (const x of [8.5, 15.5]) b.quader(1.3, 2.2, 4.4, 0x6f6455, { x, y: -1.2, z: 23 });
  for (const dz of [-2.0, 2.0]) {
    b.quader(17, 0.1, 0.12, FARBEN.eisen, { x: 12, y: 1.1, z: 23 + dz });
    for (let x = 4; x <= 20; x += 2) b.quader(0.1, 1.1, 0.1, FARBEN.eisen, { x, y: 0.55, z: 23 + dz });
  }
  baueZug(b, licht, -19, 23, rauchQuellen);
  // Gepäck auf dem Bahnsteig
  kiste(b, { x: -15, z: 18.6, ry: 0.3 }); kiste(b, { x: -14.1, z: 19.1, ry: -0.2, s: 0.7 }); fass(b, { x: -9, z: 19.2 });
  hindA.push({ x: -15, z: 18.6, r: 0.58 }, { x: -14.1, z: 19.1, r: 0.45 }, { x: -9, z: 19.2, r: 0.4 });
  mensch({ x: -17, z: 13.2, ry: 1.2, rock: 0x4a3b2c }); mensch({ x: -29, z: 18.4, ry: 2.2, rock: 0x5a6468, kleid: true, hut: false });
  mensch({ x: -30, z: 17.6, ry: 1.6, rock: 0x3a3836 });
  // Reisende am Zug, ein Gepäckträger, eine Frau mit Korb, Kinder
  mensch({ x: -21.6, z: 18.7, ry: 0.2, rock: 0x232224 }); mensch({ x: -20.8, z: 18.9, ry: -0.6, rock: 0x4f5a4a, kleid: true, hut: false });
  mensch({ x: -21.1, z: 19.15, ry: -0.2, rock: 0x5a6468, kleid: true, g: 0.66 });
  mensch({ x: -12.9, z: 18.3, ry: 2.6, rock: 0x6b5a47, hut: true }); mensch({ x: -33.5, z: 13.4, ry: 1.0, rock: 0x6a5e50, kleid: true, hut: false });
  mensch({ x: -35.6, z: 18.8, ry: -2.0, rock: 0x55504a }); mensch({ x: -35, z: 18.2, ry: -2.4, rock: 0x4a3b2c, g: 0.72 });
  laterne(b, licht, { x: -27, z: 12.2 }); laterne(b, licht, { x: -9.5, z: 12.2 });
  hindA.push({ x: -27, z: 12.2, r: 0.2 }, { x: -9.5, z: 12.2, r: 0.2 });
  // Empfangsgebäude, Stützen des Vordachs und Wegweiser
  hindA.push({ minX: -28.2, maxX: -7.8, minZ: 3.4, maxZ: 10.6 }, { x: -6.0, z: 10.6, r: 0.12 });
  for (let i = -2; i <= 2; i++) hindA.push({ x: -18 + i * 4.6, z: 14.2, r: 0.12 });

  // Häuser südlich der Gleise (schließen den Blick nach hinten)
  for (const [x, w, e] of [[-58, 16, 3], [-40, 14, 4], [-24, 15, 3], [-8, 13, 4], [34, 18, 4], [56, 15, 3]]) {
    b.mit({ x, z: 36 + rnd() * 3, ry: Math.PI }, () => ziegelhaus(b, licht, { breite: w, tiefe: 10, etagen: e, farbe: rnd() < 0.5 ? FARBEN.ziegel : FARBEN.ziegelDunkel, seiten: false, tuer: false, lichtAnteil: 0.18 }));
  }
  rauchQuellen.push({ x: -44, y: schornstein(b, { x: -44, z: 52, h: 30 }), z: 52, groesse: 2.2, hoehe: 16 });
  // Häuser westlich des Bahnhofs
  for (const [z, w, e] of [[-2, 14, 3], [18, 16, 4]]) {
    b.mit({ x: -44, z, ry: Math.PI / 2 }, () => ziegelhaus(b, licht, { breite: w, tiefe: 10, etagen: e, farbe: FARBEN.ziegelRuss, seiten: false, tuer: false }));
  }

  // --- Häuserzeile links der Straße ------------------------------------------
  const zeile = [
    { z: -8, w: 12, e: 3, dach: 'sattel', f: FARBEN.ziegel },
    { z: -21.5, w: 12.5, e: 4, dach: 'flach', f: FARBEN.ziegelDunkel, lager: true },
    { z: -35, w: 12, e: 3, dach: 'sattel', f: FARBEN.ziegelHell },
    { z: -48.5, w: 13, e: 5, dach: 'flach', f: FARBEN.ziegelRuss },
    { z: -61.5, w: 11, e: 3, dach: 'sattel', f: FARBEN.ziegel },
    { z: -73.5, w: 11, e: 4, dach: 'sattel', f: FARBEN.ziegelDunkel },
    { z: -83.2, w: 6.5, e: 2, dach: 'sattel', f: FARBEN.ziegelHell },
  ];
  for (const h of zeile) {
    const tiefe = 10;
    const o = anAchse(h.z, -(6.2 + tiefe / 2));
    b.mit(o, () => {
      ziegelhaus(b, licht, { breite: h.w, tiefe, etagen: h.e, dach: h.dach, farbe: h.f, lichtAnteil: 0.16, etagenH: h.lager ? 3.5 : 3.1 });
      if (h.lager) {
        // Aufzugsbalken und Luke des Lagerhauses
        b.quader(0.25, 0.25, 2.2, FARBEN.braun, { x: 2.2, y: 13.2, z: tiefe / 2 + 1.0 });
        b.quader(0.05, 5, 0.05, FARBEN.jute, { x: 2.2, y: 10.6, z: tiefe / 2 + 1.9, streu: 0 });
        ballen(b, { x: 2.2, y: 7.6, z: tiefe / 2 + 1.9, ry: 0.4, s: 0.9 });
        for (const [bx, by, bz, br] of [[-3.5, 0, 1.1, 0.1], [-2.1, 0, 1.2, -0.05], [-2.8, 0.8, 1.15, 0.2], [-0.6, 0, 1.3, 1.5], [3.6, 0, 1.0, 0.0], [3.7, 0.8, 1.05, 0.3]])
          ballen(b, { x: bx, y: by, z: tiefe / 2 + bz, ry: br });
      }
    });
    if (h.lager) {
      for (const [bx, bz] of [[-3.5, 1.1], [-2.1, 1.2], [-0.6, 1.3], [3.6, 1.0]]) {
        const lz = tiefe / 2 + bz;
        hindA.push({ x: o.x + Math.cos(o.ry) * bx + Math.sin(o.ry) * lz, z: o.z - Math.sin(o.ry) * bx + Math.cos(o.ry) * lz, r: 0.72 });
      }
    }
  }
  // zweite Reihe und Fabriken im Westen
  for (const [x, z, w, e] of [[-34, -16, 22, 5], [-36, -46, 20, 4], [-33, -72, 16, 5], [-62, -30, 26, 6], [-60, -70, 20, 4]]) {
    b.mit({ x, z, ry: Math.PI / 2 }, () => ziegelhaus(b, licht, { breite: w, tiefe: 13, etagen: e, dach: 'flach', farbe: rnd() < 0.5 ? FARBEN.ziegelRuss : FARBEN.ziegelDunkel, tuer: false, lichtAnteil: 0.1, schornsteine: 0, rueck: true }));
  }
  for (const [x, z, h] of [[-46, -30, 34], [-50, -84, 30]]) rauchQuellen.push({ x, y: schornstein(b, { x, z, h }), z, groesse: 2.3, hoehe: 18 });

  // Laternen, Poller und Leben am Kai
  for (const z of [0, -16, -32, -48, -64, -79]) { const o = anAchse(z, 3.9); laterne(b, licht, { x: o.x, z: o.z }); hindA.push({ x: o.x, z: o.z, r: 0.2 }); }
  for (let z = 2; z > -86; z -= 4) { if (Math.abs((z % 16)) < 1) continue; const o = anAchse(z, 4.5); b.zylinder(0.11, 0.14, 0.6, 6, FARBEN.eisen, { x: o.x, y: 0.3, z: o.z }); hindA.push({ x: o.x, z: o.z, r: 0.15 }); }
  const leute = [[-13, -4.6, 0x4a3b2c, false], [-14, -5.2, 0x5a6468, true], [-27, -4.4, 0x3d4a3b, false], [-40, 3.6, 0x55504a, false], [-41.2, 3.4, 0x6b4f3a, true], [-55, -4.8, 0x3a3836, false], [-68, 3.7, 0x4a3b2c, false], [-76, -4.5, 0x5a6468, true],
    // weitere Gruppen vor den Häusern und am Kai: Gespräche, Kinder, Frauen mit Körben
    [-6.5, -4.9, 0x55504a, false], [-7.4, -5.3, 0x6a5e50, true], [-19.5, 3.5, 0x44403b, false], [-33.2, -4.8, 0x4f5a4a, true], [-34.1, -5.0, 0x4b4743, false],
    [-44.6, -4.7, 0x5b4a4a, true], [-60.2, -4.9, 0x6b5a47, false], [-61.1, -4.6, 0x3f4650, true], [-71.5, 3.5, 0x5b4231, false]];
  for (const [z, off, f, kleid] of leute) { const o = anAchse(z, off); mensch({ x: o.x, z: o.z, ry: o.ry + (rnd() - 0.5) * 1.6, rock: f, kleid, hut: !kleid, g: 0.94 + rnd() * 0.1 }); }
  for (const [z, off, f, kleid] of [[-33.6, -4.2, 0x5a6468, false], [-46, -5.2, 0x4f5a4a, true], [-70.4, -4.9, 0x6b5a47, false], [-71.2, -5.3, 0x54483c, true]]) {
    const o = anAchse(z, off); mensch({ x: o.x, z: o.z, ry: o.ry + (rnd() - 0.5) * 2.4, rock: f, kleid, hut: !kleid && rnd() < 0.6, g: 0.6 + rnd() * 0.14 });
  }
  { const o = anAchse(-26, -4.2); fass(b, { x: o.x, z: o.z }); fass(b, { x: o.x + 0.2, z: o.z - 0.9 }); hindA.push({ x: o.x, z: o.z, r: 0.42 }, { x: o.x + 0.2, z: o.z - 0.9, r: 0.42 }); }
  { const o = anAchse(-52, -4.6); kiste(b, { x: o.x, z: o.z, ry: 0.4 }); kiste(b, { x: o.x - 0.3, z: o.z - 1.1, ry: 0.1, s: 0.7 }); hindA.push({ x: o.x, z: o.z, r: 0.55 }, { x: o.x - 0.3, z: o.z - 1.1, r: 0.45 }); }

  // Lastkähne
  for (const [z, off, ry] of [[-28, 7.2, 0], [-57, 7.3, 0.03], [-12, 16.6, 3.14], [-96, 7.4, 0]]) {
    const o = anAchse(z, off);
    baueKahn(b, o.x, o.z, Math.atan2(achse.tangente(sZ(z)).x, achse.tangente(sZ(z)).z) + ry, rnd);
  }
  // Steinbrücke über den Kanal (im Hintergrund)
  {
    const o = anAchse(-128, 12);
    b.quader(15.5, 0.7, 4.6, 0x857a68, { x: o.x, y: 0.5, z: o.z });
    b.quader(15.5, 1.0, 0.4, 0x857a68, { x: o.x, y: 1.3, z: o.z - 2.2 });
    b.quader(15.5, 1.0, 0.4, 0x857a68, { x: o.x, y: 1.3, z: o.z + 2.2 });
    for (const dx of [-3.4, 3.4]) b.quader(1.4, 2.6, 4.8, 0x7a705f, { x: o.x + dx, y: -1.0, z: o.z });
  }

  // --- Fabriken am anderen Ufer ----------------------------------------------
  const drueben = [
    { z: 4, w: 16, t: 10, e: 2, k: null },
    { z: -18, w: 22, t: 10, e: 3, k: 30 },
    { z: -44, w: 18, t: 10, e: 2, k: null },
    { z: -68, w: 24, t: 11, e: 3, k: 34 },
    { z: -98, w: 20, t: 10, e: 2, k: 28 },
    { z: -150, w: 24, t: 12, e: 3, k: 32 },
  ];
  for (const h of drueben) {
    const o = anAchse(h.z, 22.5 + h.t / 2);
    b.mit({ x: o.x, z: o.z, ry: o.ry }, () => {
      ziegelhaus(b, licht, { breite: h.w, tiefe: h.t, etagen: h.e, etagenH: 3.3, dach: 'flach', farbe: rnd() < 0.5 ? FARBEN.ziegel : FARBEN.ziegelDunkel, tuer: false, lichtAnteil: 0.2, schornsteine: 0, fensterAbstand: 2.0, fensterH: 1.9 });
      if (h.k) {
        const kx = h.w / 2 - 3, kz = -h.t / 2 - 4;
        schornstein(b, { x: kx, z: kz, h: h.k });
      }
    });
    if (h.k) {
      // Mündung in Weltkoordinaten
      const kx = h.w / 2 - 3, kz = -h.t / 2 - 4;
      const wx = o.x + Math.cos(o.ry) * kx + Math.sin(o.ry) * kz;
      const wz = o.z - Math.sin(o.ry) * kx + Math.cos(o.ry) * kz;
      rauchQuellen.push({ x: wx, y: h.k + 0.2, z: wz, groesse: 2.4, hoehe: 20 });
    }
  }
  // hohe Fabriken in zweiter Reihe am anderen Ufer
  for (const [z, w, e] of [[-8, 26, 5], [-40, 22, 6], [-74, 28, 5], [-112, 22, 6]]) {
    const o = anAchse(z, 50);
    b.mit({ x: o.x, z: o.z, ry: o.ry }, () => ziegelhaus(b, licht, { breite: w, tiefe: 14, etagen: e, etagenH: 3.3, dach: 'flach', farbe: rnd() < 0.5 ? FARBEN.ziegelRuss : FARBEN.ziegelDunkel, tuer: false, lichtAnteil: 0.2, schornsteine: 0, fensterAbstand: 2.0, fensterH: 1.9, seiten: false }));
  }
  // Silhouette in der Ferne
  for (let i = 0; i < 16; i++) {
    const x = -150 + i * 20 + rnd() * 8, z = -222 - rnd() * 30;
    if (Math.abs(x - 12) < 12) continue;
    const h = 9 + rnd() * 12;
    b.quader(12 + rnd() * 10, h, 10, FARBEN.ziegelRuss, { x, y: h / 2, z });
    if (rnd() < 0.5) { const kh = 26 + rnd() * 12; rauchQuellen.push({ x: x + 5, y: schornstein(b, { x: x + 5, z: z + 3, h: kh, r: 1.5 }), z: z + 3, groesse: 2.8, hoehe: 22 }); }
  }
  for (let i = 0; i < 6; i++) { const x = 60 + rnd() * 70, z = -20 - i * 30; const h = 10 + rnd() * 9; b.quader(16, h, 14, FARBEN.ziegelRuss, { x, y: h / 2, z }); }

  // --- Fabrikhof der Spinnerei -----------------------------------------------
  const hof = baueHof(b, licht, szene, rauchQuellen, rnd);

  // --- Norden: Geschäftsstraße, Gasse, Hof am Irk --------------------------------
  const nord = baueNord(szene, rauchQuellen);

  // --- Zusammenfassen --------------------------------------------------------
  const mat = weltMaterial();
  szene.add(b.netz(mat));
  const ln = licht.netz(lichtMaterial(), { schatten: false });
  szene.add(ln);

  const rauch = new Rauch(rauchQuellen, { jeQuelle: 8 });
  szene.add(rauch.netz);

  const sky = himmel(SONNE);
  szene.add(sky);

  // Licht: tiefstehende Sonne und warmes Streulicht
  szene.add(new THREE.HemisphereLight(0xe9dcc8, 0x8d7763, 2.1));
  const sonne = new THREE.DirectionalLight(0xffdcae, 2.5);
  sonne.shadow.intensity = 0.82;
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  const sc = sonne.shadow.camera;
  sc.left = -62; sc.right = 62; sc.top = 62; sc.bottom = -62; sc.near = 10; sc.far = 320;
  sonne.shadow.bias = -0.0006; sonne.shadow.normalBias = 0.06;
  szene.add(sonne, sonne.target);
  const folgeSonne = (p) => {
    const x = Math.round(p.x / 6) * 6, z = Math.round(p.z / 6) * 6;
    sonne.target.position.set(x, 0, z);
    sonne.position.set(x + SONNE.x * 150, SONNE.y * 150, z + SONNE.z * 150);
  };

  // Schilder (brauchen geladene Schriften)
  const s1 = schild('MANCHESTER', { breite: 6, hoehe: 0.8, groesse: 0.62 });
  s1.position.set(-18, 4.75, 10.56); szene.add(s1);
  {
    const o = anAchse(-21.5, -6.14);
    const s2 = schild('COTTON WAREHOUSE', { breite: 8, hoehe: 0.75, groesse: 0.55, grund: '#3a2a22' });
    s2.position.set(o.x, 4.2, o.z); s2.rotation.y = o.ry; szene.add(s2);
  }

  // Wegweiser am Bahnhofsvorplatz (Station I)
  {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 3.0, 6), new THREE.MeshLambertMaterial({ color: FARBEN.eisen }));
    post.position.set(-6.0, 1.5, 10.6); post.castShadow = true; szene.add(post);
    for (const [t, y, ry] of [['ARDWICK · CHORLTON', 2.6, -0.5], ['CHEETHAM HILL', 2.1, 2.5]]) {
      const w = schild(t, { breite: 1.9, hoehe: 0.34, groesse: 0.5, grund: '#e9dcbc', farbe: '#2b2520', rand: '#5b4231' });
      w.position.set(-6.0 + Math.sin(ry + Math.PI / 2) * 0.95, y, 10.6 + Math.cos(ry + Math.PI / 2) * 0.95); w.rotation.y = ry; szene.add(w);
      const w2 = w.clone(); w2.rotation.y = ry + Math.PI; w2.position.addScaledVector(new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)), -0.01); szene.add(w2);
    }
  }

  // Infopunkte am Weg: Orte (Inhalte stehen in inhalte.json)
  const ort = (z, seite) => { const o = anAchse(z, seite); return new THREE.Vector3(o.x, 0, o.z); };
  const infoOrte = {
    info_bahn: new THREE.Vector3(-18.5, 0, 19.2),
    info_villen: new THREE.Vector3(-6.0, 0, 11.4),
    info_baumwolle: ort(-21.5, -3.6),
    info_dampf: ort(-38, -3.9),
    info_kanal: ort(-57, 3.7),
    info_wachstum: ort(-75, 3.7),
    info_fabrikgesetz: new THREE.Vector3(-3.4, 0, -87.7),
  };

  // Begehbare Fläche der Straße: Bahnsteig und Vorplatz als Rechtecke, dann der Streifen zwischen Häusern und Kaimauer.
  const korridor = {
    rechtecke: [{ minX: -38.4, maxX: 4.0, minZ: 10.9, maxZ: 19.6 }, { minX: -7.7, maxX: 4.0, minZ: 2, maxZ: 19.6 }],
    baender: [{ pfad, von: 22, bis: pfad.laenge, links: -5.7, rechts: 4.0 }],
    hindernisse: hindA,
    // Die Kamera darf über Bahnsteig, Vorplatz, Kai und Kanal stehen, nicht in Häusern oder im Zug.
    kamera: {
      rechtecke: [{ minX: -38.8, maxX: 30, minZ: 10.7, maxZ: 21.7 }, { minX: -7.9, maxX: 30, minZ: -6, maxZ: 21.7 }],
      baender: [{ pfad, von: 18, bis: pfad.laenge + 4, links: -6.0, rechts: 21 }],
      hindernisse: [{ minX: -28.2, maxX: -7.8, minZ: 3.4, maxZ: 10.6 }],
    },
  };

  return {
    szene, pfad, achse, sonne, folgeSonne, hof, infoOrte, nord, korridor,
    titelKamera: { pos: new THREE.Vector3(2.4, 8.4, 9), ziel: new THREE.Vector3(9.5, 3.4, -70), fokus: new THREE.Vector3(0, 0, -40) },
    update(dt, t, kamera) {
      rauch.update(t);
      wasser.update(t);
      sky.position.copy(kamera.position);
      hof.update(dt, t);
      nord.update(dt);
    },
  };
}

// ---------------------------------------------------------------------------
function baueWasser(achse) {
  const NS = 90, NQ = 6;
  const ds = achse.laenge / (NS - 1);
  const pos = new Float32Array(NS * NQ * 3);
  const basis = [];
  for (let i = 0; i < NS; i++) {
    const p = achse.punkt(i * ds), n = achse.rechts(i * ds);
    for (let j = 0; j < NQ; j++) {
      const off = 5.0 + (14.0 * j) / (NQ - 1);
      const k = (i * NQ + j) * 3;
      pos[k] = p.x + n.x * off; pos[k + 1] = -1.05; pos[k + 2] = p.z + n.z * off;
      basis.push(pos[k], pos[k + 2]);
    }
  }
  const idx = [];
  for (let i = 0; i < NS - 1; i++) for (let j = 0; j < NQ - 1; j++) {
    const a = i * NQ + j, b2 = a + 1, c = a + NQ, d = c + 1;
    idx.push(a, b2, c, b2, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  const mat = new THREE.MeshPhongMaterial({ color: FARBEN.wasser, specular: 0xffd9a8, shininess: 50, flatShading: true });
  const netz = new THREE.Mesh(g, mat);
  netz.receiveShadow = true;
  netz.frustumCulled = false;
  return {
    netz,
    update(t) {
      const a = g.attributes.position.array;
      for (let i = 0, n = basis.length / 2; i < n; i++) {
        const x = basis[i * 2], z = basis[i * 2 + 1];
        a[i * 3 + 1] = -1.05 + Math.sin(x * 0.9 + t * 1.3) * 0.05 + Math.sin(z * 0.6 - t * 0.9 + x * 0.3) * 0.06;
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}

function baueKahn(b, x, z, ry, rnd) {
  b.mit({ x, z, ry }, () => {
    b.quader(2.6, 0.9, 8.4, FARBEN.braun, { y: -0.75, streu: 0.06 });
    b.quader(1.7, 0.9, 1.4, FARBEN.braun, { y: -0.75, z: 4.6, streu: 0.06 });
    b.quader(1.7, 0.9, 1.4, FARBEN.braun, { y: -0.75, z: -4.6, streu: 0.06 });
    b.quader(2.75, 0.12, 8.5, FARBEN.holz, { y: -0.28 });
    for (let i = 0; i < 5; i++) for (let j = 0; j < 2; j++) {
      if (rnd() < 0.2) continue;
      ballen(b, { x: -0.62 + j * 1.24, y: -0.22, z: -2.6 + i * 1.3, ry: Math.PI / 2 + (rnd() - 0.5) * 0.2, s: 0.92 });
    }
    b.zylinder(0.07, 0.09, 2.6, 5, FARBEN.holz, { y: 1.0, z: -3.9 });
  });
}

function baueZug(b, licht, x, z, rauchQuellen) {
  // Lokomotive der 1840er Jahre, Blick nach Osten (+x)
  b.mit({ x, z }, () => {
    const rad = (rx, r) => { for (const dz of [-0.78, 0.78]) b.zylinder(r, r, 0.14, 10, FARBEN.eisen, { x: rx, y: r + 0.26, z: dz, rx: Math.PI / 2 }); };
    b.quader(5.4, 0.3, 1.5, FARBEN.anthrazit, { y: 1.0 });
    b.zylinder(0.72, 0.72, 3.6, 10, 0x3d5145, { x: 0.6, y: 1.9, rz: Math.PI / 2, streu: 0.03 });
    b.zylinder(0.76, 0.76, 0.16, 10, FARBEN.messing, { x: 2.4, y: 1.9, rz: Math.PI / 2 });
    b.zylinder(0.76, 0.76, 0.16, 10, FARBEN.messing, { x: -0.5, y: 1.9, rz: Math.PI / 2 });
    b.zylinder(0.3, 0.22, 1.7, 8, FARBEN.anthrazit, { x: 1.9, y: 3.3 });
    b.zylinder(0.4, 0.3, 0.3, 8, FARBEN.anthrazit, { x: 1.9, y: 4.25 });
    b.zylinder(0.3, 0.36, 0.5, 8, FARBEN.messing, { x: 0.3, y: 2.8 });
    b.quader(1.5, 1.9, 1.7, 0x3d5145, { x: -1.9, y: 2.1 });
    b.quader(1.9, 0.12, 1.9, FARBEN.anthrazit, { x: -1.9, y: 3.3 });
    licht.quader(0.06, 0.5, 0.5, FARBEN.lichtWarm, { x: -1.14, y: 2.5, z: 0 });
    rad(1.7, 0.5); rad(0.2, 0.8); rad(-1.7, 0.8);
    // Tender
    b.quader(3.0, 1.3, 1.6, 0x3d5145, { x: -4.9, y: 1.6 });
    b.quader(2.6, 0.3, 1.2, FARBEN.anthrazit, { x: -4.9, y: 2.35 });
    rad(-4.0, 0.5); rad(-5.8, 0.5);
    // Wagen
    for (const [wx, f] of [[-9.6, 0x6b4f3a], [-15.4, 0x5a4638], [-21.2, 0x6b4f3a]]) {
      b.quader(5.2, 1.9, 1.8, f, { x: wx, y: 1.85 });
      b.quader(5.5, 0.14, 2.0, FARBEN.anthrazit, { x: wx, y: 2.87 });
      for (let i = -2; i <= 2; i++) licht.quader(0.6, 0.6, 0.05, i % 2 ? 0x2b3238 : FARBEN.lichtWarm, { x: wx + i * 0.95, y: 2.15, z: -0.91 });
      rad(wx - 1.6, 0.5); rad(wx + 1.6, 0.5);
    }
  });
  rauchQuellen.push({ x: x + 1.9, y: 4.5, z, groesse: 0.9, hoehe: 7, drift: 6, dauer: 5, farbe: 0xe6dfd2 });
}

// ---------------------------------------------------------------------------
function baueHof(b, licht, szene, rauchQuellen, rnd) {
  const HX0 = -17, HX1 = 3.6, HZ0 = -117.4, HZ1 = -89.2;
  // Hofpflaster
  b.quader(HX1 - HX0, 0.05, HZ1 - HZ0, 0x857a6b, { x: (HX0 + HX1) / 2, y: 0.03, z: (HZ0 + HZ1) / 2, streu: 0.05 });
  const mauer = (x0, z0, x1, z1, h = 2.9) => {
    const l = Math.hypot(x1 - x0, z1 - z0);
    const ry = Math.atan2(-(z1 - z0), x1 - x0);
    b.quader(l, h, 0.5, FARBEN.ziegelDunkel, { x: (x0 + x1) / 2, y: h / 2, z: (z0 + z1) / 2, ry });
    b.quader(l + 0.1, 0.16, 0.64, FARBEN.sandstein, { x: (x0 + x1) / 2, y: h + 0.08, z: (z0 + z1) / 2, ry });
  };
  // Südmauer mit Fabriktor
  mauer(HX0, HZ1, -3.4, HZ1);
  mauer(3.4, HZ1, HX1 + 1.0, HZ1);
  for (const x of [-3.4, 3.4]) {
    b.quader(1.0, 5.0, 1.0, FARBEN.ziegel, { x, y: 2.5, z: HZ1 });
    b.quader(1.25, 0.25, 1.25, FARBEN.sandstein, { x, y: 5.1, z: HZ1 });
    licht.zylinder(0.22, 0.16, 0.45, 4, FARBEN.lichtWarm, { x, y: 5.5, z: HZ1, ry: Math.PI / 4 });
  }
  // Aushang mit den Fabrikgesetzen am linken Torpfeiler
  const aushang = schild('FACTORY ACTS', { breite: 0.78, hoehe: 1.0, grund: '#e9dcbc', farbe: '#2b2520', rand: '#8a7350', groesse: 0.16, zeile2: '1833 · 1844' });
  aushang.position.set(-3.4, 1.75, HZ1 + 0.515); szene.add(aushang);
  b.quader(6.8, 0.16, 0.16, FARBEN.eisen, { x: 0, y: 5.25, z: HZ1 });
  b.quader(6.8, 0.16, 0.16, FARBEN.eisen, { x: 0, y: 3.95, z: HZ1 });
  // offene Torflügel aus Eisenstäben
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 8; i++) b.quader(0.05, 3.0, 0.05, FARBEN.eisen, { x: sx * (4.1 + i * 0.36), y: 1.5, z: HZ1 - 0.36 });
    for (const y of [0.4, 2.8]) b.quader(2.8, 0.06, 0.06, FARBEN.eisen, { x: sx * 5.35, y, z: HZ1 - 0.36 });
  }
  const torSchild = schild('WHITLOW & CO.', { breite: 6.2, hoehe: 1.1, zeile2: 'COTTON SPINNERS · MANCHESTER', groesse: 0.52 });
  torSchild.position.set(0, 4.6, HZ1 + 0.1); szene.add(torSchild);
  const torSchild2 = torSchild.clone(); torSchild2.rotation.y = Math.PI; torSchild2.position.z = HZ1 - 0.1; szene.add(torSchild2);

  // Brüstung zum Kanal
  b.quader(0.5, 0.95, HZ1 - HZ0, 0x857a68, { x: HX1 + 0.35, y: 0.47, z: (HZ0 + HZ1) / 2 });
  // Nordmauer mit dem Tor zum Geschäftsviertel
  mauer(HX0, HZ0, -9.2, HZ0);
  mauer(-4.8, HZ0, HX1 + 1.0, HZ0);
  for (const x of [-9.2, -4.8]) { b.quader(0.8, 3.8, 0.8, FARBEN.ziegel, { x, y: 1.9, z: HZ0 }); b.quader(1.0, 0.2, 1.0, FARBEN.sandstein, { x, y: 3.9, z: HZ0 }); }
  // Torflügel (beweglich)
  const holz = new THREE.MeshLambertMaterial({ color: FARBEN.braun, flatShading: true });
  const fluegel = [];
  for (const sx of [-1, 1]) {
    const dreh = new THREE.Group();
    dreh.position.set(-7 + sx * 2.0, 0, HZ0);
    const blatt = new THREE.Mesh(new THREE.BoxGeometry(1.95, 3.2, 0.14), holz);
    blatt.position.set(-sx * 0.98, 1.6, 0);
    blatt.castShadow = true; blatt.receiveShadow = true;
    const band1 = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.12, 0.18), new THREE.MeshLambertMaterial({ color: FARBEN.eisen }));
    band1.position.set(-sx * 0.98, 2.5, 0);
    const band2 = band1.clone(); band2.position.y = 0.7;
    dreh.add(blatt, band1, band2);
    szene.add(dreh);
    fluegel.push({ dreh, sx, ziel: 0 });
  }

  // Spinnerei: langer Bau an der Westseite, Front nach Osten zum Hof
  const MX = -17 - 8.5, MZ = -103.5;
  b.mit({ x: MX, z: MZ, ry: Math.PI / 2 }, () => {
    ziegelhaus(b, licht, { breite: 26, tiefe: 17, etagen: 5, etagenH: 3.4, dach: 'flach', farbe: FARBEN.ziegel, fensterAbstand: 2.0, fensterB: 1.1, fensterH: 2.1, lichtAnteil: 0.32, tuer: false, schornsteine: 0, rueck: false });
    // Portal
    b.quader(2.6, 3.4, 0.5, FARBEN.sandstein, { y: 1.7, z: 8.6 });
    b.quader(3.0, 0.3, 0.7, FARBEN.sandstein, { y: 3.5, z: 8.6 });
    b.quader(1.9, 2.8, 0.12, FARBEN.braun, { y: 1.42, z: 8.87 });
    b.quader(0.06, 2.8, 0.14, FARBEN.anthrazit, { y: 1.42, z: 8.88 });
    b.quader(3.4, 0.16, 1.0, 0x857a68, { y: 0.08, z: 9.1 });
    // Treppenturm
    b.quader(4, 20, 4, FARBEN.ziegelDunkel, { x: 11.5, y: 10, z: -6 });
    b.satteldach(4.4, 2, 4.4, FARBEN.schiefer, { x: 11.5, y: 20, z: -6 });
  });
  const sp = schild('SPINNING ROOM', { breite: 4.2, hoehe: 0.6, groesse: 0.5, grund: '#2b2622' });
  sp.position.set(-16.93, 4.15, MZ); sp.rotation.y = Math.PI / 2; szene.add(sp);
  licht.zylinder(0.2, 0.14, 0.42, 4, FARBEN.lichtWarm, { x: -16.6, y: 3.0, z: MZ + 2.0, ry: Math.PI / 4 });
  licht.zylinder(0.2, 0.14, 0.42, 4, FARBEN.lichtWarm, { x: -16.6, y: 3.0, z: MZ - 2.0, ry: Math.PI / 4 });
  // Kesselhaus und Schornstein
  b.mit({ x: -27, z: -124 }, () => ziegelhaus(b, licht, { breite: 12, tiefe: 9, etagen: 2, etagenH: 3.6, farbe: FARBEN.ziegelRuss, dach: 'sattel', tuer: false, schornsteine: 0, lichtAnteil: 0.4 }));
  rauchQuellen.push({ x: -34, y: schornstein(b, { x: -34, z: -131, h: 38, r: 1.6 }), z: -131, groesse: 2.8, hoehe: 22 });

  // Hofgerät
  const hind = [];
  const stapel = (x, z, ry, n) => {
    b.mit({ x, z, ry }, () => {
      for (let i = 0; i < n; i++) ballen(b, { x: (i % 2) * 1.4 - 0.7, y: Math.floor(i / 2) * 0.8, z: 0, ry: (rnd() - 0.5) * 0.1 });
    });
    hind.push({ x, z, r: 1.45 });
  };
  stapel(-12.5, -93.2, 0.1, 6); stapel(-8.6, -92.6, -0.2, 4); stapel(0.2, -112.5, 1.4, 5);
  for (const [x, z] of [[-14.5, -113.5], [-13.5, -114.4], [-15.2, -114.8]]) { fass(b, { x, z }); hind.push({ x, z, r: 0.45 }); }
  kiste(b, { x: 2.2, z: -92.4, ry: 0.3 }); hind.push({ x: 2.2, z: -92.4, r: 0.7 });
  // Fuhrwerk
  b.mit({ x: -5, z: -108, ry: 0.5 }, () => {
    b.quader(1.7, 0.16, 3.4, FARBEN.holz, { y: 0.95 });
    for (const sx of [-1, 1]) b.quader(0.08, 0.5, 3.4, FARBEN.holz, { x: sx * 0.82, y: 1.25 });
    for (const sx of [-1, 1]) for (const sz of [-1.1, 1.1]) b.zylinder(0.62, 0.62, 0.1, 10, FARBEN.braun, { x: sx * 0.95, y: 0.62, z: sz, rz: Math.PI / 2 });
    b.quader(0.08, 0.08, 2.4, FARBEN.holz, { x: 0.35, y: 0.8, z: 2.8, rx: 0.2 });
    b.quader(0.08, 0.08, 2.4, FARBEN.holz, { x: -0.35, y: 0.8, z: 2.8, rx: 0.2 });
    ballen(b, { y: 1.03, z: -0.6 }); ballen(b, { y: 1.03, z: 0.7, ry: 0.1 });
  });
  hind.push({ x: -5, z: -108, r: 2.0 });
  // Ladekran am Kai
  b.zylinder(0.16, 0.2, 5.2, 6, FARBEN.braun, { x: 2.4, y: 2.6, z: -101 }); hind.push({ x: 2.4, z: -101, r: 0.3 });
  b.quader(0.2, 0.2, 4.6, FARBEN.braun, { x: 3.6, y: 4.6, z: -101, ry: Math.PI / 2, rx: 0 });
  b.quader(0.16, 0.16, 3.2, FARBEN.braun, { x: 3.2, y: 3.6, z: -101, ry: Math.PI / 2, rx: 0.9 });
  b.quader(0.04, 3.2, 0.04, FARBEN.jute, { x: 5.6, y: 3.0, z: -101, streu: 0 });
  ballen(b, { x: 5.6, y: 0.9, z: -101, ry: 0.5, s: 0.9 });
  // Arbeiter im Hof
  passant(b, { x: -9.5, z: -95, ry: -0.6, rock: 0x6b5a47, hut: false }); hind.push({ x: -9.5, z: -95, r: 0.4 });
  passant(b, { x: 1.4, z: -104, ry: 1.3, rock: 0x55504a }); hind.push({ x: 1.4, z: -104, r: 0.4 });
  laterne(b, licht, { x: -16.2, z: -92 }); laterne(b, licht, { x: -16.2, z: -115 });
  hind.push({ x: -16.2, z: -92, r: 0.3 }, { x: -16.2, z: -115, r: 0.3 });

  let offen = false;
  return {
    hindernisse: hind,
    tuer: new THREE.Vector3(-16.0, 0, MZ),
    nordtor: new THREE.Vector3(-7, 0, HZ0 + 1.2),
    oeffneNordtor(sofort = false) {
      offen = true;
      for (const f of fluegel) { f.ziel = -f.sx * 1.75; if (sofort) f.dreh.rotation.y = f.ziel; }
    },
    get nordtorOffen() { return offen; },
    update(dt) {
      for (const f of fluegel) f.dreh.rotation.y += (f.ziel - f.dreh.rotation.y) * Math.min(1, dt * 1.6);
    },
  };
}
