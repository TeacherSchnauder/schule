// Kapitel II, Teil a) – eine Fabrikstraße in Lancashire in drei Zeitschichten (1863, um 1910, um 1930).
// Die Grundgruppe bleibt gleich, je Zeitschicht wird eine eigene Gruppe eingeblendet. Die Straße ist nachempfunden.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial, ziegelhaus, schornstein, laterne, passant, ballen, fass, kiste, Rauch, schild, zufall } from '../../engine/bausteine.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { baueUmgebung, strassenboden, schlange } from './umgebung.js';
import { FIG } from './figuren.js';

const PI = Math.PI;
export const UMGEBUNG_A = {
  1863: { horizont: 0xc9c4b8, zenit: 0x8a97a0, glut: 0xe8dcc8, nebel: [0xc4bfb3, 40, 260], licht: [0xe9e2d4, 1.5], hemi: [0xcfd6dc, 0x6a6660, 1.25] },
  1910: { horizont: 0xf3c98e, zenit: 0x7aa0b8, glut: 0xffc680, nebel: [0xe8c08a, 60, 380], licht: [0xffd59a, 2.6], hemi: [0xf2d8b0, 0x6b5a48, 1.15] },
  1930: { horizont: 0xa9aca8, zenit: 0x6d7a83, glut: 0xb8b8b0, nebel: [0xa3a6a2, 30, 220], licht: [0xcfd2d0, 1.1], hemi: [0xb4bcc2, 0x55524e, 1.2] },
};
const TOR_Z = -52;

export function baueStrasseA() {
  const szene = new THREE.Scene();
  const umg = baueUmgebung(szene, new THREE.Vector3(-0.4, 0.55, 0.5));
  const mat = weltMaterial(), lmat = lichtMaterial();
  const hindernisse = [];
  const schichtAn = (j) => () => aktiv !== j;
  let aktiv = 1910;

  // ------------------------------------------------------------ Grundgruppe
  const b = new Bauer(201), l = new Bauer(202).teileStapel(b);
  strassenboden(b, { von: 14, bis: -116 });
  const linksHaus = (z, br, t, et, o = {}) => b.mit({ x: -8.4 - t / 2, z, ry: PI / 2 }, () => ziegelhaus(b, l, { breite: br, tiefe: t, etagen: et, etagenH: 3.4, dach: 'flach', fensterAbstand: 2.0, fensterB: 1.15, fensterH: 2.0, lichtAnteil: 0.1, schornsteine: 0, tuer: false, ...o }));
  linksHaus(-2, 26, 13, 3, { farbe: FARBEN.ziegelDunkel });          // Lagerhaus
  linksHaus(-32, 28, 16, 5);                                           // Spinnerei, südlicher Flügel
  linksHaus(-72, 28, 16, 5);                                           // Spinnerei, nördlicher Flügel
  linksHaus(-104, 22, 14, 3, { farbe: FARBEN.ziegelRuss });
  // Torbau zwischen den Flügeln
  b.quader(1.2, 6.4, 1.6, FARBEN.ziegelDunkel, { x: -9, y: 3.2, z: TOR_Z + 5.4 });
  b.quader(1.2, 6.4, 1.6, FARBEN.ziegelDunkel, { x: -9, y: 3.2, z: TOR_Z - 5.4 });
  b.quader(1.4, 2.6, 12.4, FARBEN.ziegel, { x: -9, y: 6.5, z: TOR_Z });
  b.quader(1.6, 0.3, 12.8, FARBEN.sandstein, { x: -9, y: 7.9, z: TOR_Z });
  b.satteldach(3, 1.6, 3, FARBEN.schiefer, { x: -9, y: 8.05, z: TOR_Z, ry: PI / 2 });
  // Fabrikuhr
  b.zylinder(1.0, 1.0, 0.2, 16, 0xe6dcc6, { x: -8.28, y: 6.5, z: TOR_Z, rz: PI / 2 });
  b.zylinder(1.1, 1.1, 0.14, 16, FARBEN.eisen, { x: -8.32, y: 6.5, z: TOR_Z, rz: PI / 2 });
  b.quader(0.04, 0.7, 0.07, FARBEN.anthrazit, { x: -8.15, y: 6.8, z: TOR_Z });
  b.quader(0.04, 0.07, 0.5, FARBEN.anthrazit, { x: -8.15, y: 6.5, z: TOR_Z - 0.22 });
  // Hof hinter dem Tor (nur Kulisse) und Hauptschornstein
  b.quader(20, 0.06, 10, FARBEN.erde, { x: -19, y: 0.0, z: TOR_Z });
  const kaminTop = schornstein(b, { x: -24, z: TOR_Z, h: 46, r: 1.7 });
  const kamin2Top = schornstein(b, { x: -30, z: -84, h: 38, r: 1.4 });
  for (let i = 0; i < 5; i++) ballen(b, { x: -14 - (i % 2) * 1.4, y: Math.floor(i / 2) * 0.82, z: TOR_Z + 2.5, ry: 0.2 * i });
  // rechte Seite: Reihenhäuser mit Läden im Erdgeschoss
  const HAEUSER = [];
  for (let i = 0; i < 13; i++) {
    const z = 4 - i * 9.2;
    HAEUSER.push(z);
    b.mit({ x: 8.4 + 4.5, z, ry: -PI / 2 }, () => ziegelhaus(b, l, { breite: 9, tiefe: 9, etagen: 2 + (i % 4 === 1 ? 1 : 0), etagenH: 3.0, farbe: i % 2 ? FARBEN.ziegelHell : FARBEN.ziegel, lichtAnteil: 0.08, schornsteine: 2, tuer: i % 3 !== 0 }));
  }
  // Abschluss der Straße: Bahnviadukt im Norden, Querhaus im Süden
  for (let x = -40; x <= 40; x += 10) { b.quader(2.2, 9, 5, FARBEN.ziegelRuss, { x, y: 4.5, z: -118 }); }
  b.quader(90, 2.2, 5.4, FARBEN.ziegelRuss, { y: 10, z: -118 });
  b.quader(90, 0.5, 5.8, FARBEN.sandstein, { y: 11.3, z: -118 });
  b.mit({ x: 0, z: 22, ry: PI }, () => ziegelhaus(b, l, { breite: 44, tiefe: 10, etagen: 3, lichtAnteil: 0.1, schornsteine: 3 }));
  // ferne Schornsteine als Silhouette
  const fern = [[-44, -150, 40], [-12, -170, 48], [22, -160, 36], [48, -140, 44], [36, -60, 34], [44, -20, 30]];
  const fernTop = fern.map(([x, z, h]) => ({ x, z, y: schornstein(b, { x, z, h, r: 1.3 }) }));
  for (const [x, z] of [[30, -36], [34, -84], [-40, -120]]) b.mit({ x, z }, () => ziegelhaus(b, l, { breite: 18, tiefe: 12, etagen: 4, dach: 'flach', lichtAnteil: 0.05, tuer: false }));
  szene.add(b.netz(mat), l.netz(lmat, { schatten: false }));
  hindernisse.push({ minX: -9.8, maxX: -8.3, minZ: TOR_Z - 6.2, maxZ: TOR_Z - 4.6 }, { minX: -9.8, maxX: -8.3, minZ: TOR_Z + 4.6, maxZ: TOR_Z + 6.2 });

  // Schilder, die immer hängen
  const fest = (text, x, y, z, ry, o) => { const s = schild(text, o); s.position.set(x, y, z); s.rotation.y = ry; return s; };
  szene.add(fest('WHITLOW & CO.', -8.25, 8.55, TOR_Z, PI / 2, { breite: 7, hoehe: 0.9 }));

  // ------------------------------------------------------------ Zeitschichten
  const schichten = {};
  const rauch = {};
  const neueSchicht = (jahr, seed, baue) => {
    const g = new THREE.Group();
    const sb = new Bauer(seed), sl = new Bauer(seed + 1).teileStapel(sb);
    const quellen = [];
    baue(sb, sl, g, quellen);
    g.add(sb.netz(mat), sl.netz(lmat, { schatten: false }));
    if (quellen.length) { rauch[jahr] = new Rauch(quellen, { jeQuelle: 10, farbe: 0x7a716a }); g.add(rauch[jahr].netz); }
    g.visible = false;
    szene.add(g);
    schichten[jahr] = g;
  };
  const laden = (sb, sl, i, { farbe = FARBEN.gruen, hell = true, text = null, g = null, vernagelt = false }) => {
    const z = HAEUSER[i];
    sb.quader(0.3, 0.55, 7.2, farbe, { x: 8.2, y: 2.75, z });
    if (vernagelt) for (let k = 0; k < 4; k++) sb.quader(0.08, 0.3, 5.4, FARBEN.holz, { x: 8.3, y: 0.9 + k * 0.45, z, rx: (k % 2 ? 0.03 : -0.03), streu: 0.12 });
    else (hell ? sl : sb).quader(0.08, 1.7, 5.4, hell ? FARBEN.lichtWarm : FARBEN.glas, { x: 8.31, y: 1.45, z, streu: 0.06 });
    if (text && g) g.add(fest(text, 8.02, 2.76, z, -PI / 2, { breite: 6.4, hoehe: 0.5, grund: '#2f3b2c', farbe: '#e6d7a8', rand: null, groesse: 0.62 }));
  };
  const tor = (sb, offen) => {
    for (const s of [-1, 1]) {
      if (offen) sb.quader(4.2, 4.4, 0.16, FARBEN.gruen, { x: -11.1, y: 2.2, z: TOR_Z + s * 4.5, streu: 0.05 });
      else { sb.quader(0.16, 4.4, 4.4, FARBEN.gruen, { x: -9, y: 2.2, z: TOR_Z + s * 2.25, streu: 0.05 }); sb.quader(0.2, 0.2, 4.4, FARBEN.eisen, { x: -8.9, y: 2.2, z: TOR_Z + s * 2.25 }); }
    }
  };
  const aushang = (g, text, zeile2, x, y, z, ry, breite = 1.7, o = {}) => g.add(fest(text, x, y, z, ry, { breite, hoehe: breite * 0.62, grund: '#e9dfc4', farbe: '#2b2520', rand: '#6b4634', groesse: 0.3, zeile2, ...o }));

  // 1863: Baumwollnot. Tor zu, Schornsteine kalt, Schnee, Suppenküche.
  neueSchicht(1863, 211, (sb, sl, g) => {
    tor(sb, false);
    const r = zufall(7);
    for (let i = 0; i < 46; i++) { const sx = r() < 0.5 ? -1 : 1; sb.quader(1 + r() * 1.6, 0.07, 1.2 + r() * 2.5, 0xe8e8e2, { x: sx * (6.6 + r() * 1.4), y: 0.19, z: 8 - r() * 116, ry: r(), streu: 0.03 }); }
    for (let i = 0; i < 16; i++) sb.quader(1.4 + r() * 2, 0.05, 1 + r() * 2, 0xdedcd4, { x: (r() - 0.5) * 10, y: 0.02, z: 6 - r() * 110, ry: r() * 3, streu: 0.03 });
    for (let z = 2; z > -110; z -= 20) laterne(sb, sl, { x: -6.5, z });
    laden(sb, sl, 1, { hell: false, text: 'PAWNBROKER', g, farbe: 0x3a3836 });
    laden(sb, sl, 3, { hell: false, vernagelt: true });
    laden(sb, sl, 5, { hell: false });
    laden(sb, sl, 8, { hell: false, vernagelt: true });
    // Suppenküche des Hilfskomitees
    sb.quader(2.2, 0.9, 1.0, FARBEN.holz, { x: 7.4, y: 0.6, z: -62 });
    sb.zylinder(0.4, 0.34, 0.5, 10, FARBEN.eisen, { x: 7.4, y: 1.3, z: -62 });
    sl.zylinder(0.3, 0.3, 0.03, 10, 0xd9c9a3, { x: 7.4, y: 1.56, z: -62 });
    passant(sb, { x: 8.1, z: -62, ry: -PI / 2, kleid: true, hut: false, rock: 0x4f5560 });
    g.add(fest('RELIEF COMMITTEE', 8.02, 3.2, -62, -PI / 2, { breite: 5, hoehe: 0.6, grund: '#e9dfc4', farbe: '#2b2520', rand: '#6b4634' }));
    hindernisse.push({ ...schlange(sb, { x: 6.9, z: -60.4, n: 9, dz: 0.85, seed: 12, frauen: 0.6 }), aus: schichtAn(1863) });
    hindernisse.push({ minX: 6.3, maxX: 8.6, minZ: -62.7, maxZ: -61.3, aus: schichtAn(1863) });
    aushang(g, 'MILL CLOSED', 'No cotton. No work.', -8.22, 1.9, TOR_Z - 4.2, PI / 2);
    aushang(g, 'EMIGRATION', 'Passage to America and Australia', 8.03, 1.9, -14.5, -PI / 2, 2.0);
    for (const [x, z] of [[-6.8, -20], [-7, -84], [6.9, -40]]) passant(sb, { x, z, ry: r() * 6, kleid: r() < 0.5, hut: true, rock: 0x4b4743 });
  });

  // um 1910: Höhepunkt. Straßenbahn, neuer Websaal, volle Läden, Gewerkschaftsbüro.
  neueSchicht(1910, 221, (sb, sl, g, q) => {
    tor(sb, true);
    q.push({ x: -24, y: kaminTop, z: TOR_Z, groesse: 3.6, hoehe: 26, drift: 36, dauer: 10 }, { x: -30, y: kamin2Top, z: -84, groesse: 3, hoehe: 22, drift: 30, dauer: 9 });
    for (const f of fernTop.slice(0, 4)) q.push({ x: f.x, y: f.y, z: f.z, groesse: 3, hoehe: 20, drift: 30, dauer: 11 });
    // Websaal mit Sägezahndach hinter dem Lagerhaus-Nachbarn
    for (let k = 0; k < 5; k++) { sb.quader(12, 5, 4.4, FARBEN.ziegelHell, { x: -15, y: 2.5, z: -92 - k * 4.4 + 8 }); sb.satteldach(12.2, 1.8, 4.4, FARBEN.schiefer, { x: -15, y: 5, z: -92 - k * 4.4 + 8 }); }
    // Straßenbahn
    sb.mit({ x: 2.3, z: -30 }, () => {
      sb.quader(2.3, 2.3, 9.5, 0x6e2a22, { y: 1.6, streu: 0.03 });
      sl.quader(2.34, 0.75, 9.0, 0xd8c9a0, { y: 2.15 });
      for (let k = -4; k <= 4; k++) sb.quader(2.36, 0.8, 0.12, 0x6e2a22, { y: 2.15, z: k });
      sb.quader(2.3, 1.6, 9.0, 0xd6c6a2, { y: 3.7, streu: 0.03 });
      sb.quader(2.34, 0.6, 8.6, FARBEN.glas, { y: 3.85 });
      sb.quader(2.5, 0.12, 9.8, FARBEN.kohle, { y: 4.6 });
      sb.quader(0.08, 2.2, 0.08, FARBEN.eisen, { y: 5.6, rx: -0.5 });
      for (const zz of [-3, 3]) sb.quader(1.7, 0.5, 1.6, FARBEN.eisen, { y: 0.3, z: zz });
    });
    hindernisse.push({ minX: 1.0, maxX: 3.6, minZ: -35, maxZ: -25, aus: schichtAn(1910) });
    for (const x of [1.55, 3.05]) sb.quader(0.08, 0.03, 126, FARBEN.eisen, { x, y: 0.012, z: -51 });
    for (let z = 6; z > -112; z -= 16) { sb.zylinder(0.12, 0.16, 7.2, 6, FARBEN.eisen, { x: 6.6, y: 3.6, z }); sb.quader(4.4, 0.1, 0.1, FARBEN.eisen, { x: 4.5, y: 6.9, z }); }
    sb.quader(0.03, 0.03, 126, FARBEN.kohle, { x: 2.3, y: 6.62, z: -51 });
    for (let z = 2; z > -110; z -= 20) laterne(sb, sl, { x: -6.5, z });
    const namen = ['DRAPER', 'TEA & COFFEE', 'CO-OPERATIVE STORE', 'BOOTS & CLOGS', 'SEWING MACHINES', 'BUTCHER', 'CYCLES', 'BAKER', 'WEAVERS’ UNION', 'IRONMONGER', 'TOBACCO', 'CHEMIST', 'GROCER'];
    const farben = [0x47593f, 0x6b2f25, 0x2f3a4a, 0x5b4231, 0x47593f, 0x6b2f25, 0x3f525b, 0x5b4231, 0x8f3f2c, 0x2f3a4a, 0x47593f, 0x6b2f25, 0x3f525b];
    for (let i = 0; i < 13; i++) laden(sb, sl, i, { text: namen[i], g, farbe: farben[i] });
    // Auslagen: Stoffballen, Fahrrad, Nähmaschine
    for (let k = 0; k < 4; k++) sb.zylinder(0.16, 0.16, 0.7, 8, [0x8a3b2c, 0x3f5560, 0xb59a5c, 0x5b6b3f][k], { x: 7.6, y: 0.62, z: HAEUSER[0] - 1 + k * 0.7, rx: PI / 2 });
    sb.quader(1.2, 0.5, 3.2, FARBEN.holz, { x: 7.6, y: 0.4, z: HAEUSER[0] });
    sb.mit({ x: 7.5, z: HAEUSER[6] }, () => { for (const zz of [-0.5, 0.5]) sb.zylinder(0.33, 0.33, 0.04, 12, FARBEN.anthrazit, { y: 0.58, z: zz, rz: PI / 2 }); sb.quader(0.04, 0.04, 1.0, 0x6b2f25, { y: 0.85 }); sb.quader(0.04, 0.4, 0.04, 0x6b2f25, { y: 0.75, z: -0.2 }); });
    // Gewerkschaftsbüro mit Fahne
    sb.zylinder(0.05, 0.05, 3.4, 6, FARBEN.eisen, { x: 7.7, y: 4.6, z: HAEUSER[8] + 2.4, rz: 0.5 });
    sb.quader(0.04, 1.2, 1.8, 0x8f3f2c, { x: 6.6, y: 5.0, z: HAEUSER[8] + 2.4 });
    aushang(g, 'FACTORY ACT', 'Hours of work · Inspection', -8.22, 1.9, TOR_Z - 6.9, PI / 2);
    aushang(g, 'NATIONAL INSURANCE 1911', 'Sickness · Unemployment', 8.03, 1.9, -14.5, -PI / 2, 2.2);
    // Fabrikausgang zur Mittagszeit
    const r = zufall(31);
    for (let i = 0; i < 26; i++) { const kleid = r() < 0.6; passant(sb, { x: -7.6 + r() * 3.4, z: TOR_Z - 4 + r() * 22, ry: r() * 6, kleid, hut: !kleid, rock: [0x4b4743, 0x54483c, 0x3d4a3b, 0x5b4231][i % 4] }); }
    hindernisse.push({ minX: -8.4, maxX: -4.6, minZ: TOR_Z - 4.5, maxZ: TOR_Z - 3.2, aus: () => true });
    for (let i = 0; i < 14; i++) { const kleid = r() < 0.5; passant(sb, { x: 6.6 + r() * 1.2, z: 4 - r() * 104, ry: r() * 6, kleid, hut: !kleid, rock: [0x55504a, 0x5b4231, 0x3f525b, 0x6b5a47][i % 4] }); }
    for (const [x, z] of [[-6.8, -24], [-7, -28]]) { fass(sb, { x, z }); kiste(sb, { x: x + 0.2, z: z - 1.2 }); }
  });

  // um 1930: Krise. Vernagelte Fenster, ein Schornstein raucht, Schlange vor dem Arbeitsamt.
  neueSchicht(1930, 231, (sb, sl, g, q) => {
    tor(sb, false);
    q.push({ x: -30, y: kamin2Top, z: -84, groesse: 2.4, hoehe: 16, drift: 26, dauer: 12 });
    for (let k = 0; k < 5; k++) { sb.quader(12, 5, 4.4, FARBEN.ziegelRuss, { x: -15, y: 2.5, z: -92 - k * 4.4 + 8 }); sb.satteldach(12.2, 1.8, 4.4, FARBEN.schiefer, { x: -15, y: 5, z: -92 - k * 4.4 + 8 }); }
    // vernagelte Fenster am südlichen Flügel
    for (let e = 0; e < 2; e++) for (let i = 0; i < 12; i++) if ((i + e) % 3 !== 0) sb.quader(0.1, 2.0, 1.2, FARBEN.holz, { x: -8.32, y: 0.5 + e * 3.4 + 1.87, z: -32 - 11 + i * 2.0, streu: 0.14 });
    g.add(fest('LANCASHIRE COTTON CORPORATION', -8.2, 3.4, TOR_Z, PI / 2, { breite: 8, hoehe: 1.0, grund: '#e4dccb', farbe: '#2b2520', rand: '#2b2520', groesse: 0.42, zeile2: 'This mill is closed' }));
    const r = zufall(41);
    for (let i = 0; i < 22; i++) sb.quader(1.2 + r() * 2.2, 0.02, 0.8 + r() * 1.8, 0x66696a, { x: (r() - 0.5) * 11, y: 0.012, z: 8 - r() * 114, ry: r() * 3, streu: 0.03 });
    for (let z = 2; z > -110; z -= 20) { sb.zylinder(0.09, 0.13, 5.6, 6, FARBEN.eisen, { x: -6.5, y: 2.8, z }); sb.quader(1.2, 0.08, 0.08, FARBEN.eisen, { x: -6.0, y: 5.5, z }); sl.quader(0.4, 0.14, 0.24, 0xe9e2c8, { x: -5.5, y: 5.42, z }); }
    laden(sb, sl, 0, { hell: true, text: 'CLEARANCE SALE', g, farbe: 0x6b2f25 });
    laden(sb, sl, 2, { hell: false, vernagelt: true, text: 'TO LET', g, farbe: 0x3a3836 });
    laden(sb, sl, 4, { hell: true, text: 'WIRELESS · RADIO', g, farbe: 0x2f3a4a });
    laden(sb, sl, 7, { hell: false, text: 'EMPLOYMENT EXCHANGE', g, farbe: 0x3a3836 });
    laden(sb, sl, 9, { hell: false, vernagelt: true });
    laden(sb, sl, 11, { hell: true, text: 'FISH & CHIPS', g, farbe: 0x47593f });
    hindernisse.push({ ...schlange(sb, { x: 6.9, z: -58.6, n: 11, dz: 0.82, seed: 14, frauen: 0.12, hut: 0.95 }), aus: schichtAn(1930) });
    // Bus und Lieferwagen
    sb.mit({ x: -2.6, z: -22 }, () => {
      sb.quader(2.4, 2.6, 8.2, 0x7a2a22, { y: 1.9, streu: 0.03 }); sb.quader(2.44, 0.8, 7.4, FARBEN.glas, { y: 2.5 });
      sb.quader(2.4, 0.2, 8.3, 0xd6c6a2, { y: 3.3 }); for (const zz of [-2.8, 2.8]) for (const xx of [-1.1, 1.1]) sb.zylinder(0.5, 0.5, 0.3, 10, FARBEN.anthrazit, { x: xx, y: 0.5, z: zz, rz: PI / 2 });
    });
    hindernisse.push({ minX: -4, maxX: -1.2, minZ: -26.4, maxZ: -17.6, aus: schichtAn(1930) });
    sb.mit({ x: 4.6, z: -84, ry: 0.05 }, () => { sb.quader(1.8, 1.9, 2.8, 0x3a4a3d, { y: 1.5, z: -0.6 }); sb.quader(1.7, 1.2, 1.4, 0x3a4a3d, { y: 1.1, z: 1.5 }); sb.quader(1.5, 0.5, 0.06, FARBEN.glas, { y: 1.5, z: 2.2 }); for (const zz of [-1.2, 1.4]) for (const xx of [-0.9, 0.9]) sb.zylinder(0.4, 0.4, 0.25, 10, FARBEN.anthrazit, { x: xx, y: 0.4, z: zz, rz: PI / 2 }); });
    hindernisse.push({ minX: 3.5, maxX: 5.7, minZ: -86.4, maxZ: -81.4, aus: schichtAn(1930) });
    aushang(g, 'UNEMPLOYMENT BENEFIT', 'Sign on here · Mon Wed Fri', 8.03, 1.9, HAEUSER[7] + 3.4, -PI / 2, 2.0);
    aushang(g, 'EXPORTS OF COTTON CLOTH', 'India · China · South America', 8.03, 1.9, -14.5, -PI / 2, 2.2);
    for (let i = 0; i < 9; i++) passant(sb, { x: -7.4 + r() * 1.2, z: 2 - r() * 100, ry: r() * 6, kleid: r() < 0.3, hut: true, rock: [0x4b4743, 0x55504a, 0x3a3836][i % 3] });
  });

  // ------------------------------------------------------------ Figuren, die je Schicht erscheinen
  const figuren = {};
  const stelle = (name, def, x, z, ry, jahr) => {
    const f = baueFigur(def); f.gruppe.position.set(x, 0.16 * (Math.abs(x) > 6 ? 1 : 0), z); f.gruppe.rotation.y = ry;
    f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    schichten[jahr].add(f.gruppe); figuren[name] = f;
    hindernisse.push({ x, z, r: 0.45, aus: schichtAn(jahr) });
  };
  stelle('edward', FIG.edward, -6.4, TOR_Z + 1.2, PI / 2, 1863);
  stelle('mary', FIG.maryAlt, 5.4, -57.5, -PI / 2 - 0.5, 1863);
  stelle('arthur', FIG.arthur, -5.2, TOR_Z + 7.5, PI / 2, 1910);
  stelle('arthurAlt', FIG.arthurAlt, -6.4, TOR_Z + 1.2, PI / 2, 1930);
  stelle('jack', FIG.jack, 5.4, -57.0, -PI / 2 - 0.4, 1930);

  const setze = (jahr) => { aktiv = jahr; for (const j in schichten) schichten[j].visible = Number(j) === jahr; umg.setze(UMGEBUNG_A[jahr]); };
  setze(1910);

  return {
    szene, sonne: umg.sonne, folgeSonne: umg.folgeSonne, setze, hindernisse, figuren,
    get jahr() { return aktiv; },
    flaeche: { minX: -8.1, maxX: 8.1, minZ: -108, maxZ: 9 },
    grenzen: { minX: -8.2, maxX: 8.2, minZ: -114, maxZ: 15 },
    punkte: {
      start: { x: 0, z: 4, ry: PI },
      tor: new THREE.Vector3(-6.4, 0, TOR_Z + 1.2), torArthur: new THREE.Vector3(-5.2, 0, TOR_Z + 7.5),
      aushangTor: new THREE.Vector3(-7.4, 0, TOR_Z - 4.2), aushangTor1910: new THREE.Vector3(-7.4, 0, TOR_Z - 6.9), schildTor: new THREE.Vector3(-7.2, 0, TOR_Z - 2.6),
      wand: new THREE.Vector3(7.3, 0, -14.5), amt: new THREE.Vector3(7.0, 0, -65), amt1930: new THREE.Vector3(7.3, 0, HAEUSER[7] + 3.4), union: new THREE.Vector3(7.3, 0, HAEUSER[8]),
      mary: new THREE.Vector3(5.4, 0, -57.5), jack: new THREE.Vector3(5.4, 0, -57),
      haustuer: new THREE.Vector3(7.5, 0, HAEUSER[4]),
    },
    titelKamera: { pos: new THREE.Vector3(1.5, 5.5, 12), ziel: new THREE.Vector3(-3, 6, -50), fokus: new THREE.Vector3(0, 0, -30) },
    update(dt, t) {
      rauch[aktiv]?.update(t);
      for (const n in figuren) if (figuren[n].gruppe.parent.visible) animiereFigur(figuren[n], dt, 0);
    },
  };
}
