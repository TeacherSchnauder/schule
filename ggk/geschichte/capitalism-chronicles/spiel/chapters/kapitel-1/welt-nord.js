// Kapitel I – Außenwelt nördlich der Spinnerei: Geschäftsstraße mit Kontor (Station III),
// Gasse und Hof am Irk (Station IV). Stilisiert, kein maßstabsgetreues Manchester.
import * as THREE from 'three';
import { Pfad } from '../../engine/pfad.js';
import {
  Bauer, FARBEN, weltMaterial, lichtMaterial, ziegelhaus, schornstein, laterne, fass, kiste, passant, schild, bandGeo, zufall,
} from '../../engine/bausteine.js';

export function baueNord(szene, rauchQuellen) {
  const b = new Bauer(41), licht = new Bauer(42).teileStapel(b);
  const rnd = zufall(43);
  const hindB = [];     // Hindernisse auf der begehbaren Straße
  const mensch = (o) => { passant(b, o); hindB.push({ x: o.x, z: o.z, r: 0.32 * (o.g || 1) }); };
  const pfad = new Pfad([[-7, -119], [-7, -135], [-7, -150], [-9, -162], [-16, -171.5], [-26, -176], [-38, -176], [-45.5, -176]]);

  // Pflaster der Straße
  {
    const n = 48, ds = (pfad.laenge + 3) / (n - 1);
    const q = (i, off) => { const s = i * ds - 1.5; const p = pfad.punkt(s); const r = pfad.rechts(s); return new THREE.Vector3(p.x + r.x * off, 0.025, p.z + r.z * off); };
    b.hinzu(bandGeo(n, (i) => [q(i, -3.3), q(i, 3.3)]), FARBEN.pflaster, { streu: 0.07 });
  }
  const haus = (x, z, ry, o) => b.mit({ x, z, ry }, () => ziegelhaus(b, licht, { tiefe: 10, lichtAnteil: 0.22, ...o }));
  const mauer = (x0, z0, x1, z1, h = 2.9, f = FARBEN.ziegelDunkel) => {
    const l = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    b.quader(l, h, 0.45, f, { x: (x0 + x1) / 2, y: h / 2, z: (z0 + z1) / 2, ry });
    b.quader(l + 0.1, 0.14, 0.6, FARBEN.sandstein, { x: (x0 + x1) / 2, y: h + 0.07, z: (z0 + z1) / 2, ry });
  };

  // --- Geschäftsstraße ---------------------------------------------------------
  const W = Math.PI / 2;
  haus(-15.6, -126, W, { breite: 11, etagen: 3, farbe: FARBEN.ziegelHell });
  // Kontorhaus von Whitlow & Co.
  const KZ = -137.5;
  b.mit({ x: -15.6, z: KZ, ry: W }, () => {
    ziegelhaus(b, licht, { breite: 11, tiefe: 10, etagen: 3, etagenH: 3.3, farbe: FARBEN.ziegel, lichtAnteil: 0.5, tuer: false, fensterAbstand: 2.75 });
    b.quader(2.2, 3.0, 0.4, FARBEN.sandstein, { y: 1.5, z: 5.1 });
    b.quader(2.6, 0.26, 0.6, FARBEN.sandstein, { y: 3.1, z: 5.1 });
    b.quader(1.4, 2.4, 0.1, 0x3d4a3b, { y: 1.3, z: 5.32 });
    b.quader(2.6, 0.14, 1.0, 0x857a68, { y: 0.07, z: 5.6 });
    licht.quader(0.1, 0.1, 0.06, FARBEN.messing, { x: 0.5, y: 1.25, z: 5.4 });
  });
  const ks = schild('WHITLOW & CO.', { breite: 5.4, hoehe: 1.0, zeile2: 'COUNTING HOUSE', groesse: 0.5 });
  ks.position.set(-10.52, 4.35, KZ); ks.rotation.y = W; szene.add(ks);
  haus(-15.6, -149, W, { breite: 11, etagen: 4, farbe: FARBEN.ziegelDunkel });
  haus(0.2, -125, -W, { breite: 10, tiefe: 7, etagen: 3, farbe: FARBEN.ziegelDunkel });
  haus(0.2, -136, -W, { breite: 11, tiefe: 7, etagen: 4, farbe: FARBEN.ziegelHell });
  haus(0.2, -147.5, -W, { breite: 11, tiefe: 7, etagen: 3, farbe: FARBEN.ziegel });
  const es = schild('COTTON BROKERS', { breite: 5.2, hoehe: 0.7, groesse: 0.52, grund: '#3a2a22' });
  es.position.set(-3.38, 4.1, -136); es.rotation.y = -W; szene.add(es);
  for (const z of [-124, -143]) { laterne(b, licht, { x: -10.0, z }); hindB.push({ x: -10.0, z, r: 0.2 }); }
  laterne(b, licht, { x: -4.0, z: -131 }); hindB.push({ x: -4.0, z: -131, r: 0.2 });
  mensch({ x: -4.5, z: -128, ry: -1.9, rock: 0x2f2e30 }); mensch({ x: -4.9, z: -128.9, ry: -0.6, rock: 0x4a3b2c });
  mensch({ x: -9.6, z: -145, ry: 1.2, rock: 0x3d4a3b }); mensch({ x: -4.4, z: -141, ry: -1.5, rock: 0x5a6468, kleid: true, hut: false });
  // Händler und Kunden vor den Häusern
  mensch({ x: -9.75, z: -128.6, ry: 1.9, def: { groesse: 1.72, breite: 1.05, dicke: 1.25, rock: 0x232224, hose: 0x2f2e30, weste: 0x6b2f25, haar: 0x8b7a66, bart: 'backenGrau', hut: 'zylinder', seed: 401 } });
  mensch({ x: -9.8, z: -129.6, ry: 1.2, def: { groesse: 1.79, breite: 0.95, rock: 0x2f3438, hose: 0x33312f, weste: 0xb08d48, haar: 0x3a2c22, bart: 'backen', hut: 'melone', seed: 402 } });
  mensch({ x: -4.2, z: -146.2, ry: -1.3, rock: 0x6a5e50, kleid: true, hut: false });
  // Droschke vor dem Maklerhaus
  hindB.push({ minX: -5.65, maxX: -4.15, minZ: -135.7, maxZ: -133.2 });
  b.mit({ x: -4.9, z: -134.5, ry: 0.04 }, () => {
    b.quader(1.3, 1.1, 2.0, 0x2b2a2c, { y: 1.35 });
    b.quader(1.4, 0.1, 2.2, 0x1f1d1c, { y: 1.95 });
    b.quader(1.2, 0.5, 0.7, 0x2b2a2c, { y: 1.05, z: 1.3 });
    for (const sx of [-1, 1]) for (const sz of [-0.6, 0.9]) b.zylinder(0.5, 0.5, 0.08, 10, FARBEN.braun, { x: sx * 0.72, y: 0.5, z: sz, rz: Math.PI / 2 });
  });

  // Torbogen zur Gasse (öffnet sich nach dem Fund der Station III)
  const TZ = -153.2;
  b.quader(3.4, 4.6, 1.0, FARBEN.ziegelDunkel, { x: -12.0, y: 2.3, z: TZ });
  b.quader(3.2, 4.6, 1.0, FARBEN.ziegelDunkel, { x: -1.9, y: 2.3, z: TZ });
  b.quader(13.4, 1.2, 1.0, FARBEN.ziegelDunkel, { x: -7, y: 4.0, z: TZ });
  b.quader(13.6, 0.2, 1.2, FARBEN.sandstein, { x: -7, y: 4.7, z: TZ });
  hindB.push({ minX: -13.7, maxX: -10.3, minZ: TZ - 0.5, maxZ: TZ + 0.5 }, { minX: -3.5, maxX: -0.3, minZ: TZ - 0.5, maxZ: TZ + 0.5 });
  const fluegel = [];
  {
    const holz = new THREE.MeshLambertMaterial({ color: FARBEN.braun, flatShading: true });
    const eisen = new THREE.MeshLambertMaterial({ color: FARBEN.eisen });
    for (const sx of [-1, 1]) {
      const dreh = new THREE.Group();
      dreh.position.set(-6.9 + sx * 3.4, 0, TZ);
      const blatt = new THREE.Mesh(new THREE.BoxGeometry(3.35, 3.3, 0.14), holz);
      blatt.position.set(-sx * 1.68, 1.65, 0); blatt.castShadow = true; blatt.receiveShadow = true;
      const b1 = new THREE.Mesh(new THREE.BoxGeometry(3.35, 0.12, 0.18), eisen); b1.position.set(-sx * 1.68, 2.6, 0);
      const b2 = b1.clone(); b2.position.y = 0.7;
      dreh.add(blatt, b1, b2); szene.add(dreh);
      fluegel.push({ dreh, sx, ziel: 0 });
    }
  }

  // --- Biegung und Gasse ---------------------------------------------------------
  mauer(-10.6, -154.6, -10.6, -160.5, 3.2);
  mauer(-10.6, -160.5, -18, -168, 3.2);
  mauer(-18, -168, -28, -173.2, 3.2);
  haus(0.5, -163, -W, { breite: 14, tiefe: 8, etagen: 4, farbe: FARBEN.ziegelRuss, tuer: false });
  haus(-7.5, -181.5, 0, { breite: 12, tiefe: 8, etagen: 3, farbe: FARBEN.ziegelRuss });
  // Gasse: enge, niedrige Häuser
  for (const [x, w, e] of [[-22.5, 11, 3], [-33, 10, 2], [-42.5, 9, 2]]) haus(x, -182.8, 0, { breite: w, tiefe: 8, etagen: e, etagenH: 2.6, farbe: rnd() < 0.5 ? FARBEN.ziegelRuss : FARBEN.ziegelDunkel, lichtAnteil: 0.08, fensterH: 1.2, fensterB: 0.8 });
  for (const [x, w, e] of [[-33, 10, 2], [-42.5, 9, 3]]) haus(x, -169.2, Math.PI, { breite: w, tiefe: 8, etagen: e, etagenH: 2.6, farbe: FARBEN.ziegelRuss, lichtAnteil: 0.08, fensterH: 1.2, fensterB: 0.8 });
  fass(b, { x: -30, z: -178.2 }); kiste(b, { x: -36.5, z: -173.9, ry: 0.4, s: 0.7 });
  hindB.push({ x: -30, z: -178.2, r: 0.42 }, { x: -36.5, z: -173.9, r: 0.45 });
  mensch({ x: -34, z: -178.1, ry: 2.9, rock: 0x55504a, hut: false }); mensch({ x: -20.5, z: -177.9, ry: 2.4, rock: 0x6b5a47, kleid: true, hut: false });
  mensch({ x: -40.6, z: -173.85, ry: -2.8, rock: 0x6b6f72, kleid: true, hut: false }); mensch({ x: -39.8, z: -174.1, ry: 2.6, rock: 0x4a3b2c, hut: false, g: 0.62 });
  mensch({ x: -27.4, z: -178.3, ry: 0.3, rock: 0x44403b, hut: true });
  // Mauern und Häuser an der Biegung und in der Gasse
  hindB.push(
    { x0: -10.6, z0: -154.6, x1: -10.6, z1: -160.5, r: 0.25 }, { x0: -10.6, z0: -160.5, x1: -18, z1: -168, r: 0.25 }, { x0: -18, z0: -168, x1: -28, z1: -173.2, r: 0.25 },
    { minX: -3.5, maxX: 4.5, minZ: -170, maxZ: -156 }, { minX: -13.5, maxX: -1.5, minZ: -185.5, maxZ: -177.5 },
    { minX: -50, maxX: -17, minZ: -190, maxZ: -178.8 }, { minX: -47.5, maxX: -27.5, minZ: -173.2, maxZ: -165 },
  );

  // --- Hof am Irk ------------------------------------------------------------------
  const HX0 = -63.4, HX1 = -47.1, HZ0 = -186.3, HZ1 = -167.6;
  b.quader(HX1 - HX0 + 3, 0.05, HZ1 - HZ0, 0x5f5345, { x: (HX0 + HX1) / 2 + 1.5, y: 0.03, z: (HZ0 + HZ1) / 2, streu: 0.08 });
  const eng = { tiefe: 8, etagenH: 2.5, lichtAnteil: 0.06, fensterH: 1.1, fensterB: 0.75, fensterAbstand: 2.4, farbe: FARBEN.ziegelRuss };
  haus(HX0 - 4, -172.4, W, { ...eng, breite: 9.6, etagen: 2 });
  haus(HX0 - 4, -181.6, W, { ...eng, breite: 9.4, etagen: 3, farbe: 0x54433b });
  haus(-59.2, HZ1 + 4, Math.PI, { ...eng, breite: 8.4, etagen: 2, farbe: 0x54433b });
  haus(-51, HZ1 + 4, Math.PI, { ...eng, breite: 8, etagen: 3 });
  // Lücken schließen
  b.quader(4.2, 6, 0.5, FARBEN.ziegelRuss, { x: -65.4, y: 3, z: -167.5 });
  // Kellereingang der Wohnung (Westseite, nördliches Haus)
  const KE = new THREE.Vector3(HX0 + 0.9, 0, -181.6);
  b.quader(1.5, 0.5, 1.9, 0x2a2420, { x: HX0 + 0.7, y: -0.2, z: KE.z });
  b.quader(1.5, 0.16, 0.5, 0x6f6455, { x: HX0 + 0.85, y: 0.08, z: KE.z + 1.15 });
  b.quader(1.5, 0.16, 0.5, 0x6f6455, { x: HX0 + 0.85, y: 0.08, z: KE.z - 1.15 });
  b.quader(0.12, 1.5, 1.6, 0x2a2420, { x: HX0 + 0.07, y: 0.75, z: KE.z });
  b.quader(0.1, 0.9, 0.08, FARBEN.eisen, { x: HX0 + 1.55, y: 0.45, z: KE.z + 1.1 });
  b.quader(0.1, 0.9, 0.08, FARBEN.eisen, { x: HX0 + 1.55, y: 0.45, z: KE.z - 1.1 });
  b.quader(0.06, 0.06, 2.2, FARBEN.eisen, { x: HX0 + 1.55, y: 0.9, z: KE.z });
  const hind = [];
  // Pumpe
  const PU = new THREE.Vector3(-55, 0, -176.5);
  b.quader(1.3, 0.2, 1.3, 0x6f6455, { x: PU.x, y: 0.1, z: PU.z });
  b.quader(0.3, 1.5, 0.3, FARBEN.eisen, { x: PU.x, y: 0.95, z: PU.z });
  b.quader(0.12, 0.12, 0.6, FARBEN.eisen, { x: PU.x, y: 1.2, z: PU.z + 0.4 });
  b.quader(0.08, 0.08, 1.0, FARBEN.eisen, { x: PU.x, y: 1.6, z: PU.z - 0.4, rx: 0.5 });
  b.zylinder(0.24, 0.2, 0.32, 8, FARBEN.holz, { x: PU.x, y: 0.36, z: PU.z + 0.75 });
  b.quader(1.6, 0.02, 1.2, 0x3b3a34, { x: PU.x + 0.3, y: 0.06, z: PU.z + 1.3 });   // Pfütze
  hind.push({ x: PU.x, z: PU.z, r: 0.75 });
  passant(b, { x: PU.x - 1.1, z: PU.z + 0.6, ry: 1.2, rock: 0x6b6f72, kleid: true, hut: false }); hind.push({ x: PU.x - 1.1, z: PU.z + 0.6, r: 0.4 });
  // Abort (ein Verschlag für den ganzen Hof)
  const AB = new THREE.Vector3(-61.4, 0, -184.4);
  b.quader(1.7, 2.1, 1.5, 0x5b4231, { x: AB.x, y: 1.05, z: AB.z, streu: 0.09 });
  b.quader(1.9, 0.1, 1.8, FARBEN.schiefer, { x: AB.x, y: 2.2, z: AB.z + 0.05, rx: 0.12 });
  b.quader(0.8, 1.7, 0.06, 0x3d2c20, { x: AB.x + 0.2, y: 0.9, z: AB.z + 0.78, ry: 0.35 });
  hind.push({ minX: AB.x - 0.9, maxX: AB.x + 0.9, minZ: AB.z - 0.8, maxZ: AB.z + 0.8 });
  // Abfallhaufen, Schweinekoben, Wäsche
  for (const [x, z, r] of [[-50.2, -184.2, 1.1], [-49, -183.4, 0.7], [-51.4, -184.9, 0.6]]) b.brocken(r, 0x4a4034, { x, y: r * 0.25, z, sy: 0.5, streu: 0.12 });
  hind.push({ x: -50.2, z: -184.2, r: 1.5 });
  b.mit({ x: -49.6, z: -169.6 }, () => {
    for (const [dx, dz, l, ry] of [[0, 1.2, 3, 0], [-1.5, 0, 2.4, W], [1.5, 0, 2.4, W]]) { b.quader(l, 0.08, 0.08, FARBEN.holz, { x: dx, y: 0.75, z: dz, ry }); b.quader(l, 0.08, 0.08, FARBEN.holz, { x: dx, y: 0.4, z: dz, ry }); }
    b.quader(0.9, 0.5, 0.5, 0xc9a08e, { y: 0.45, z: 0.1, ry: 0.4 }); b.quader(0.3, 0.3, 0.32, 0xc9a08e, { x: 0.5, y: 0.5, z: 0.35, ry: 0.4 });
    b.quader(3, 0.03, 2.4, 0x3f372d, { y: 0.06 });
  });
  hind.push({ minX: -51.2, maxX: -48, minZ: -170.9, maxZ: -168.2 });
  for (const [x0, z0, x1, z1] of [[-62.6, -170, -52, -169], [-62.8, -176, -57, -183.6]]) {
    const l = Math.hypot(x1 - x0, z1 - z0), ry = Math.atan2(-(z1 - z0), x1 - x0);
    b.quader(l, 0.03, 0.03, FARBEN.jute, { x: (x0 + x1) / 2, y: 2.3, z: (z0 + z1) / 2, ry, streu: 0 });
    for (let i = 1; i < 5; i++) { const u = i / 5; b.quader(0.6 + rnd() * 0.4, 0.7 + rnd() * 0.3, 0.02, [0xcfc6b0, 0x9a9488, 0xb9a98c][i % 3], { x: x0 + (x1 - x0) * u, y: 1.9, z: z0 + (z1 - z0) * u, ry, streu: 0.05 }); }
  }
  passant(b, { x: -58.6, z: -170.6, ry: 0.4, rock: 0x55504a, hut: false, g: 0.66 }); hind.push({ x: -58.6, z: -170.6, r: 0.35 });
  passant(b, { x: -57.8, z: -171.2, ry: -1.9, rock: 0x6b5a47, kleid: true, hut: false, g: 0.6 });
  passant(b, { x: -52.6, z: -181.5, ry: 2.6, rock: 0x4a3b2c, hut: true }); hind.push({ x: -52.6, z: -181.5, r: 0.4 });
  // niedrige Mauer zum Fluss
  mauer(HX0, HZ0, HX1 + 0.4, HZ0, 1.05, 0x6f6455);
  // Der Irk: schwarzes, träges Wasser zwischen Mauern
  b.quader(150, 0.04, 8.4, 0x24231f, { x: -55, y: 0.035, z: -191.6, streu: 0.03 });
  for (const [x, z, r] of [[-58, -190.2, 0.8], [-52, -192.4, 0.6], [-44, -190, 0.9], [-66, -192, 0.7], [-36, -191.5, 0.5]]) b.brocken(r, 0x3a362d, { x, y: 0.05, z, sy: 0.3, streu: 0.1 });
  mauer(-130, -196.1, 20, -196.1, 1.3, 0x6f6455);
  mauer(HX1 + 0.4, -187.2, 20, -187.2, 1.3, 0x6f6455);
  mauer(-130, -187.2, HX0, -187.2, 1.3, 0x6f6455);
  // Gerbereien und Werke am anderen Ufer
  for (const [x, w, e, k] of [[-72, 20, 3, 0], [-50, 18, 4, 30], [-30, 16, 3, 0], [-10, 20, 4, 26]]) {
    haus(x, -203, 0, { breite: w, tiefe: 12, etagen: e, etagenH: 3.2, dach: 'flach', farbe: rnd() < 0.5 ? FARBEN.ziegelRuss : 0x4e4038, tuer: false, lichtAnteil: 0.12, schornsteine: 0, seiten: false });
    if (k) rauchQuellen.push({ x: x + 6, y: schornstein(b, { x: x + 6, z: -212, h: k }), z: -212, groesse: 2.4, hoehe: 18 });
  }
  const gs = schild('TANNERY', { breite: 4.6, hoehe: 0.8, groesse: 0.55, grund: '#2b2622' });
  gs.position.set(-50, 5.2, -196.95); szene.add(gs);

  szene.add(b.netz(weltMaterial()));
  szene.add(licht.netz(lichtMaterial(), { schatten: false }));

  let torOffen = false;
  // Begehbare Fläche der Straße: Geschäftsstraße zwischen den Häuserfronten, dahinter Biegung und Gasse
  const korridor = {
    rechtecke: [],
    baender: [
      { pfad, von: 0, bis: 35.5, links: -3.6, rechts: 3.7 },
      { pfad, von: 35.5, bis: pfad.laenge, links: -3.0, rechts: 3.0 },
    ],
    hindernisse: hindB,
    endeBreite: 1.7,
    kamera: {
      baender: [{ pfad, von: -6, bis: 35.5, links: -3.7, rechts: 3.8 }, { pfad, von: 35.5, bis: pfad.laenge + 4, links: -3.1, rechts: 3.1 }],
      hindernisse: hindB.filter((h) => h.minX !== undefined || h.x0 !== undefined),
    },
  };

  return {
    pfad, korridor,
    sperreS: 33.6,
    kontorTuer: new THREE.Vector3(-10.3, 0, KZ),
    tor: new THREE.Vector3(-7, 0, TZ + 1.6),
    hof: {
      flaechen: [{ minX: HX0 + 0.1, maxX: HX1 - 0.2, minZ: HZ0 + 0.3, maxZ: HZ1 - 0.2 }, { minX: -48, maxX: -44.6, minZ: -178.2, maxZ: -173.8 }],
      hindernisse: hind,
      eintritt: { x: -48.4, z: -176 },
      ausgang: { minX: -46.4, maxX: -44.4, minZ: -178.4, maxZ: -173.6 },
      kamera: { abstand: 6.0, grenzen: { minX: HX0 + 0.5, maxX: -30, minZ: HZ0 - 6, maxZ: HZ1 - 0.5 } },
      keller: KE, pumpe: PU, abort: new THREE.Vector3(AB.x + 0.3, 0, AB.z + 1.5), fluss: new THREE.Vector3(-56, 0, HZ0 + 0.9),
      lesen: new THREE.Vector3(-53.2, 0, HZ0 + 0.9),
    },
    oeffneTor(sofort = false) { torOffen = true; for (const f of fluegel) { f.ziel = -f.sx * 1.6; if (sofort) f.dreh.rotation.y = f.ziel; } },
    get torOffen() { return torOffen; },
    update(dt) { for (const f of fluegel) f.dreh.rotation.y += (f.ziel - f.dreh.rotation.y) * Math.min(1, dt * 1.6); },
  };
}
