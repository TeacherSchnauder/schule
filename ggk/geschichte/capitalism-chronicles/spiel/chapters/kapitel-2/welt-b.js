// Kapitel II, Teil b) – ein Trümmerviertel in Frankfurt am Main 1948 in drei Zeitschichten (März, Juni, November).
// Nachempfunden, kein Stadtplan von 1948. Die Schaufenster der Ladenzeile zeigen den Warenstand aus den Simulationen.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial, passant, schild, zufall } from '../../engine/bausteine.js';
import { baueFigur, animiereFigur } from '../../engine/figur.js';
import { Passanten } from '../../engine/passanten.js';
import { Pfad } from '../../engine/pfad.js';
import { baueUmgebung, strassenboden, schlange } from './umgebung.js';
import { FIG } from './figuren.js';

const PI = Math.PI;
export const UMGEBUNG_B = {
  maerz: { horizont: 0xcfc6b6, zenit: 0x8f99a0, glut: 0xe6dccb, nebel: [0xc7bba5, 35, 240], licht: [0xe6ddcc, 1.5], hemi: [0xc4c8c8, 0x625c54, 1.25] },
  juni: { horizont: 0xf0d3a0, zenit: 0x7ea6c4, glut: 0xffd08a, nebel: [0xe6cfa6, 70, 400], licht: [0xffe0ae, 2.5], hemi: [0xe6dcc4, 0x6b6052, 1.2] },
  november: { horizont: 0xb8b3aa, zenit: 0x77808a, glut: 0xbdb8ae, nebel: [0xb0aba2, 25, 200], licht: [0xcfcfcc, 1.0], hemi: [0xb4b8bc, 0x55524e, 1.25] },
};
const PUTZ = [0x8c857a, 0x7f776c, 0x968d7e, 0x766e63];
const RUSS = 0x3e3a36;
export const LAEDEN = [
  { id: 'baecker', name: 'BÄCKEREI', z: -22 }, { id: 'schuhe', name: 'SCHUHE', z: -32 }, { id: 'stoffe', name: 'STOFFE · KLEIDER', z: -42 },
  { id: 'haushalt', name: 'HAUSHALTSWAREN', z: -52 }, { id: 'lebensmittel', name: 'LEBENSMITTEL', z: -62 },
];

function schutt(b, rnd, { x = 0, z = 0, r = 3, h = 1.8, n = 40, farbe = PUTZ[0] }) {
  const farben = [farbe, FARBEN.ziegel, FARBEN.ziegelDunkel, 0x7a7266, 0x6a6258];
  // Erst alle Steine auslosen (gleiche Zufallsfolge wie bisher), dann von außen nach innen ablegen:
  // Ein Stein liegt höchstens so hoch wie der Kegel, aber nie höher als die Steine unter ihm.
  const st = [];
  for (let k = 0; k < n; k++) {
    const a = rnd() * PI * 2, dd = Math.sqrt(rnd()) * r, kegel = Math.max(0, (1 - dd / r) * h) * 0.9;
    st.push({ g: 0.25 + rnd() * 0.5, k, x: x + Math.cos(a) * dd, z: z + Math.sin(a) * dd * 0.6, kegel, rx: rnd() * 3, ry: rnd() * 3 });
  }
  st.sort((p, q) => p.kegel - q.kegel);
  const liegt = [];
  for (const s of st) {
    let auflage = 0;
    for (const t of liegt) if (Math.hypot(s.x - t.x, s.z - t.z) < 0.6 * (s.g + t.g)) auflage = Math.max(auflage, t.y + 0.55 * (s.g + t.g) * 0.7);
    s.y = Math.min(s.kegel, auflage);
    liegt.push(s);
    b.brocken(s.g, farben[s.k % farben.length], { x: s.x, y: s.y, z: s.z, rx: s.rx, ry: s.ry, sy: 0.7 });
  }
}
// Ausgebrannte Fassade, lokal: Front nach +z. offenBis: Breite der Öffnung im Erdgeschoss (für einen Laden).
function ruine(b, rnd, { breite = 14, etagen = 4, eh = 3.3, farbe = PUTZ[0], kaputt = 0.55, erdgeschoss = true, tiefe = 7 }) {
  const n = Math.max(2, Math.round(breite / 2.7)), bw = breite / n, fb = 1.15, fh = 1.85, d = 0.5, hoch = etagen * eh;
  for (let i = 0; i < n; i++) {
    const u0 = -breite / 2 + i * bw, um = u0 + bw / 2, rand = Math.min(i, n - 1 - i);
    const top = hoch * (rand === 0 ? 1 - kaputt * 0.25 * rnd() : (1 - kaputt) + kaputt * rnd()), pw = (bw - fb) / 2;
    for (let e = erdgeschoss ? 0 : 1; e < etagen; e++) {
      const y0 = e * eh, wy0 = y0 + 0.9, wy1 = wy0 + fh;
      const teil = (ya, yb, u, w) => { const y2 = Math.min(yb, top); if (y2 - ya > 0.05) b.quader(w, y2 - ya, d, farbe, { x: u, y: (ya + y2) / 2, streu: 0.06 }); };
      teil(y0, y0 + eh, u0 + pw / 2, pw); teil(y0, y0 + eh, u0 + bw - pw / 2, pw); teil(y0, wy0, um, fb); teil(wy1, y0 + eh, um, fb);
      if (wy1 + 0.9 < top && rnd() < 0.55) b.flaeche(fb * 0.9, 0.9 + rnd(), RUSS, { x: um, y: wy1 + 0.5, z: d / 2 + 0.01, streu: 0.1 });
      if (e === 0 && rnd() < 0.5) b.quader(fb, fh, 0.08, FARBEN.holz, { x: um, y: (wy0 + wy1) / 2, z: 0.05, streu: 0.12 });
    }
    // Brocken nur auf die Pfeiler legen (über Fensteröffnungen trägt nichts) und nur, wo unter der Mauerkrone Mauer steht
    if (top < hoch - 0.3 && (erdgeschoss || top > eh)) for (let k = 0; k < 3; k++) {
      const links = rnd() < 0.5, u = links ? u0 + rnd() * pw : u0 + bw - pw + rnd() * pw;
      b.brocken(0.2 + rnd() * 0.15, farbe, { x: u, y: top + 0.05, z: (rnd() - 0.5) * 0.3, sy: 0.7 });
    }
  }
  const sh = hoch * (0.4 + rnd() * 0.5), sh2 = hoch * (0.3 + rnd() * 0.5);
  b.quader(d, sh, tiefe, farbe, { x: -breite / 2 + d / 2, y: sh / 2, z: -tiefe / 2 });
  b.quader(d, sh2, tiefe * 0.7, farbe, { x: breite / 2 - d / 2, y: sh2 / 2, z: -tiefe * 0.35 });
  for (let k = 0; k < 3; k++) b.quader(0.22, 0.22, tiefe * 0.9, 0x2e2a26, { x: (rnd() - 0.5) * breite * 0.7, y: eh * (1 + k) * 0.8, z: -tiefe / 2, rx: (rnd() - 0.5) * 0.7, rz: (rnd() - 0.5) * 0.3 });
  schutt(b, rnd, { x: 0, z: -tiefe / 2 - 1, r: breite * 0.42, h: 2.2, n: 24, farbe });
}

export function baueFrankfurt() {
  const szene = new THREE.Scene();
  const umg = baueUmgebung(szene, new THREE.Vector3(0.45, 0.6, 0.4));
  const mat = weltMaterial(), lmat = lichtMaterial();
  const hindernisse = [];
  let aktiv = 'maerz';
  const nur = (s) => () => aktiv !== s;
  const b = new Bauer(401), rnd = zufall(9);
  strassenboden(b, { von: 14, bis: -116, pflaster: 0x7a736a, steig: 0x958d80, rand: 0x625b52 });

  // rechte Seite: Ruine, dann die Ladenzeile (Erdgeschoss offen für die Läden), dann Ruinen
  b.mit({ x: 8.65, z: -4, ry: -PI / 2 }, () => ruine(b, rnd, { breite: 20, etagen: 4, kaputt: 0.6, farbe: PUTZ[1] }));
  b.mit({ x: 8.65, z: -42, ry: -PI / 2 }, () => ruine(b, rnd, { breite: 52, etagen: 4, kaputt: 0.5, farbe: PUTZ[2], erdgeschoss: false }));
  b.mit({ x: 8.65, z: -84, ry: -PI / 2 }, () => ruine(b, rnd, { breite: 28, etagen: 5, kaputt: 0.65, farbe: PUTZ[0] }));
  // Ladenfronten: Holzrahmen, Brüstung, Rückwand
  for (const L of LAEDEN) {
    b.quader(0.5, 3.2, 1.0, FARBEN.holz, { x: 8.65, y: 1.6, z: L.z + 4.5, streu: 0.12 });
    b.quader(0.5, 0.7, 8, 0x6a5038, { x: 8.65, y: 0.35, z: L.z, streu: 0.08 });
    b.quader(0.5, 0.45, 8, 0x5a4632, { x: 8.65, y: 3.05, z: L.z });
    b.quader(0.2, 2.6, 8, 0x4a4038, { x: 10.2, y: 1.6, z: L.z });
    b.quader(0.5, 2.3, 1.1, 0x5b4231, { x: 8.6, y: 1.15, z: L.z + 3.3 });   // Tür
    for (let k = 0; k < 3; k++) b.quader(1.0, 0.05, 5.6, FARBEN.holzHell, { x: 9.5, y: 0.86 + k * 0.62, z: L.z - 0.6 });
    const s = schild(L.name, { breite: 6.2, hoehe: 0.6, grund: '#e4d7b8', farbe: '#3a2a1e', rand: '#7a5a3c', groesse: 0.58 });
    s.position.set(8.38, 3.05, L.z); s.rotation.y = -PI / 2; szene.add(s);
  }
  b.quader(0.5, 3.2, 1.0, FARBEN.holz, { x: 8.65, y: 1.6, z: LAEDEN[4].z - 4.5 });
  // linke Seite: Ruinen, Lücke mit Schwarzmarktecke, Baracke der Verwaltung
  b.mit({ x: -8.65, z: -6, ry: PI / 2 }, () => ruine(b, rnd, { breite: 24, etagen: 5, kaputt: 0.6, farbe: PUTZ[3] }));
  b.mit({ x: -8.65, z: -46, ry: PI / 2 }, () => ruine(b, rnd, { breite: 18, etagen: 4, kaputt: 0.7, farbe: PUTZ[0] }));
  b.mit({ x: -8.65, z: -98, ry: PI / 2 }, () => ruine(b, rnd, { breite: 26, etagen: 4, kaputt: 0.55, farbe: PUTZ[2] }));
  // Schwarzmarktecke: Hof zwischen zwei Ruinen mit Mauerresten
  b.quader(12, 0.08, 12, 0x6f685e, { x: -14, y: 0.0, z: -27 });
  b.quader(0.5, 2.4, 10, PUTZ[1], { x: -19.5, y: 1.2, z: -27 });
  b.quader(4, 3.5, 0.5, PUTZ[1], { x: -17.5, y: 1.75, z: -21.5 });
  schutt(b, rnd, { x: -17, z: -31, r: 3, h: 1.6, n: 40 });
  // Baracke der Verwaltung
  const BZ0 = -72;
  b.quader(9, 3.0, 16, 0x7a6a52, { x: -13.2, y: 1.5, z: BZ0, streu: 0.08 });
  b.satteldach(9.6, 1.5, 16.6, 0x4a4540, { x: -13.2, y: 3.0, z: BZ0, ry: PI / 2 });
  for (let k = -3; k <= 3; k++) if (k !== 0) b.quader(0.08, 1.1, 1.2, FARBEN.glas, { x: -8.68, y: 1.8, z: BZ0 + k * 2.1 });
  b.quader(0.1, 2.2, 1.2, 0x5b4231, { x: -8.66, y: 1.1, z: BZ0 });
  b.quader(1.4, 0.2, 2.0, 0x6a5038, { x: -8.2, y: 0.1, z: BZ0 });
  const sv = schild('VERWALTUNG FÜR WIRTSCHAFT', { breite: 6, hoehe: 0.7, grund: '#e9dfc4', farbe: '#2b2520', rand: '#2b2520', groesse: 0.44, zeile2: 'des Vereinigten Wirtschaftsgebietes' });
  sv.position.set(-8.6, 2.75, BZ0); sv.rotation.y = PI / 2; szene.add(sv);
  // Schutt, Ziegelstapel, Lore
  schutt(b, rnd, { x: -7.2, z: -12, r: 2.6, h: 1.8, n: 40 }); schutt(b, rnd, { x: 7.4, z: -8, r: 2.2, h: 1.5, n: 30 });
  schutt(b, rnd, { x: -7.4, z: -56, r: 3, h: 2.2, n: 46 }); schutt(b, rnd, { x: 7.2, z: -92, r: 3.4, h: 2.4, n: 50 }); schutt(b, rnd, { x: -7, z: -104, r: 3, h: 2, n: 40 });
  hindernisse.push({ x: -7.2, z: -12, r: 2.0 }, { x: 7.4, z: -8, r: 1.6 }, { x: -7.4, z: -56, r: 2.3 }, { x: 7.2, z: -92, r: 2.6 }, { x: -7, z: -104, r: 2.3 });
  for (const [x, z] of [[-6.6, 0], [6.7, -74], [-6.6, -84]]) {
    for (let a = 0; a < 3; a++) for (let c = 0; c < 4; c++) for (let e = 0; e < 4; e++) b.quader(0.24, 0.07, 0.11, [FARBEN.ziegel, FARBEN.ziegelHell, FARBEN.ziegelDunkel][(a + c + e) % 3], { x: x + a * 0.26, y: 0.2 + e * 0.075, z: z + c * 0.13, streu: 0.08 });
  }
  for (const x of [-4.4, -3.8]) b.quader(0.06, 0.06, 70, FARBEN.eisen, { x, y: 0.03, z: -70 });
  b.mit({ x: -4.1, z: -92 }, () => { b.quader(1.0, 0.7, 1.4, 0x5a5650, { y: 0.75 }); b.brocken(0.5, FARBEN.ziegel, { y: 1.15 }); b.brocken(0.4, 0x8c857a, { y: 1.2, z: 0.4 }); for (const zz of [-0.45, 0.45]) b.zylinder(0.18, 0.18, 1.1, 8, FARBEN.eisen, { y: 0.2, z: zz, rz: PI / 2 }); });
  hindernisse.push({ minX: -4.8, maxX: -3.4, minZ: -93, maxZ: -91 });
  // Abschluss: Turmruine im Norden, Ruinenzeile im Süden
  const TF = 0x6e665c;
  b.quader(60, 9, 6, PUTZ[3], { y: 4.5, z: -122 });
  for (let k = 0; k < 16; k++) b.quader(2.4, 2 + rnd() * 7, 6, PUTZ[k % 4], { x: -28 + k * 3.7, y: 10 + rnd() * 2, z: -122 });
  b.quader(7, 30, 7, TF, { x: 3, y: 15, z: -150 }); b.quader(5.6, 8, 5.6, TF, { x: 3, y: 34, z: -150 });
  for (const yy of [22, 34]) b.quader(1.2, 3.2, 7.2, 0x2a2724, { x: 3, y: yy, z: -150 });
  b.hinzu(new THREE.ConeGeometry(3.4, 9, 4), TF, { x: 3, y: 41.5, z: -150, ry: PI / 4, rz: 0.12 });
  b.mit({ x: 0, z: 20, ry: PI }, () => ruine(b, rnd, { breite: 40, etagen: 4, kaputt: 0.5, farbe: PUTZ[1] }));
  b.zylinder(0.08, 0.12, 3.6, 6, FARBEN.eisen, { x: -6.4, y: 1.8, z: 6, rz: 0.25 });
  szene.add(b.netz(mat));

  // ------------------------------------------------------------ Warenstand der Läden: 0 leer, 1 wenig, 2 voll
  const WARE = { baecker: [0xc9a36a, 0xb98a45, 0xd9b77a], schuhe: [0x3a2a1e, 0x5b3b24, 0x2a2622], stoffe: [0x8a3b2c, 0x3f5560, 0xb59a5c, 0x5b6b3f], haushalt: [0x8c8c86, 0xb0b0a8, 0x3f525b], lebensmittel: [0x8f3f2c, 0xd9c48a, 0x47593f, 0xe6dcc6] };
  const stand = {};
  for (const L of LAEDEN) {
    stand[L.id] = [];
    for (const stufe of [1, 2]) {
      const g = new THREE.Group(); const wb = new Bauer(410 + stufe), wl = new Bauer(420).teileStapel(wb);
      const r = zufall(L.z * -3 + stufe);
      wl.flaeche(7.0, 2.3, 0xf0b468, { x: 10.05, y: 1.75, z: L.z, ry: -PI / 2, streu: 0.03 });
      const anteil = stufe === 1 ? 0.22 : 0.9;
      for (let k = 0; k < 3; k++) for (let i = 0; i < 11; i++) {
        if (r() > anteil) continue;
        const f = WARE[L.id][Math.floor(r() * WARE[L.id].length)], z = L.z - 3.2 + i * 0.52, y = 0.9 + k * 0.62;
        if (L.id === 'stoffe') wb.zylinder(0.14, 0.14, 0.7, 8, f, { x: 9.5, y: y + 0.14, z, rz: PI / 2 });
        else if (L.id === 'baecker') wb.kugel(0.17, f, { x: 9.5, y: y + 0.12, z, sy: 0.7, sx: 1.5 });
        else if (L.id === 'haushalt') wb.zylinder(0.16, 0.13, 0.24, 8, f, { x: 9.5, y: y + 0.12, z });
        else if (L.id === 'schuhe') wb.quader(0.34, 0.17, 0.16, f, { x: 9.5, y: y + 0.09, z });
        else wb.quader(0.26, 0.3, 0.22, f, { x: 9.5, y: y + 0.15, z });
      }
      const lm = lichtMaterial(); lm.toneMapped = false;
      g.add(wb.netz(mat), wl.netz(lm, { schatten: false }));
      g.visible = false; szene.add(g); stand[L.id][stufe] = g;
    }
    // Bretter vor dem leeren Laden
    const g0 = new THREE.Group(); const vb = new Bauer(430);
    for (let k = 0; k < 5; k++) vb.quader(0.08, 0.34, 6.6, FARBEN.holz, { x: 8.42, y: 0.95 + k * 0.42, z: L.z - 0.6, rx: (k % 2 ? 0.02 : -0.02), streu: 0.14 });
    g0.add(vb.netz(mat)); szene.add(g0); stand[L.id][0] = g0;
  }
  const lampen = LAEDEN.map((L) => { const p = new THREE.PointLight(0xffb866, 0, 8, 1.5); p.position.set(7.2, 1.0, L.z); szene.add(p); return p; });
  const setzeLaden = (id, stufe) => { stand[id].forEach((g, i) => { g.visible = i === stufe; }); lampen[LAEDEN.findIndex((x) => x.id === id)].intensity = stufe * 16; };
  const setzeLaeden = (stufe) => LAEDEN.forEach((L, i) => setzeLaden(L.id, Array.isArray(stufe) ? stufe[i] : stufe));

  // ------------------------------------------------------------ Zeitschichten
  const schichten = {}, figuren = {};
  const leuteFest = {};
  const neueSchicht = (name, seed, baue) => {
    const g = new THREE.Group(); const sb = new Bauer(seed);
    // stehende Leute in der Kleidung von 1948, auf dem Gehweg auf Gehweghöhe
    sb.epoche = 1948; sb.jahreszeit = name === 'juni' ? 'warm' : 'kalt'; sb.boden = (x) => (Math.abs(x) > 6 ? 0.16 : 0); sb.leute = [];
    leuteFest[name] = sb.leute;
    baue(sb, g); g.add(sb.netz(mat)); g.visible = false; szene.add(g); schichten[name] = g;
  };
  const stelle = (name, def, x, z, ry, schicht) => {
    const f = baueFigur(def); f.gruppe.position.set(x, Math.abs(x) > 6 ? 0.16 : 0, z); f.gruppe.rotation.y = ry;
    f.gruppe.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    schichten[schicht].add(f.gruppe); figuren[name] = f;
    hindernisse.push({ x, z, r: 0.45, aus: nur(schicht) });
  };
  const plakat = (g, text, zeile2, x, y, z, ry, o = {}) => { const s = schild(text, { breite: 1.9, hoehe: 1.2, grund: '#e9dfc4', farbe: '#2b2520', rand: '#2b2520', groesse: 0.3, zeile2, ...o }); s.position.set(x, y, z); s.rotation.y = ry; g.add(s); };
  neueSchicht('maerz', 441, (sb) => {
    const r = zufall(51);
    // Schwarzmarkt: Gruppen im Hof und am Straßenrand
    for (let i = 0; i < 12; i++) passant(sb, { x: -16.5 + r() * 6, z: -31 + r() * 8, ry: r() * 6, kleid: r() < 0.3, hut: r() < 0.7, rock: [0x4b4743, 0x55504a, 0x3f4650, 0x5b5348][i % 4] });
    for (let i = 0; i < 5; i++) passant(sb, { x: -7.3 + r() * 1.2, z: -24 - r() * 8, ry: PI / 2 + (r() - 0.5), hut: true, rock: 0x3a3836 });
    hindernisse.push({ ...schlange(sb, { x: 7.0, z: -16.5, n: 8, dz: 0.85, seed: 21, frauen: 0.75, hut: 0.5, farben: [0x55504a, 0x5b5348, 0x4a4e58, 0x6b6a5c] }), aus: nur('maerz') });
    for (let i = 0; i < 6; i++) passant(sb, { x: -5 + r() * 10, z: -70 - r() * 30, ry: r() * 6, kleid: r() < 0.5, hut: r() < 0.5, rock: 0x55504a });
  });
  neueSchicht('juni', 451, (sb) => {
    const r = zufall(52);
    for (const L of LAEDEN) for (let i = 0; i < 5; i++) passant(sb, { x: 6.5 + r() * 1.3, z: L.z - 3 + r() * 6, ry: PI / 2 + (r() - 0.5) * 0.8, kleid: r() < 0.6, hut: r() < 0.5, rock: [0x55504a, 0x5b5348, 0x4a4e58, 0x6b6a5c, 0x7a7468][Math.floor(r() * 5)] });
    for (let i = 0; i < 8; i++) passant(sb, { x: -7.4 + r() * 1.4, z: -r() * 100, ry: r() * 6, kleid: r() < 0.5, hut: r() < 0.5, rock: 0x55504a });
    // Jeep der Besatzungsmacht
    sb.mit({ x: -3.4, z: -10, ry: 0.1 }, () => { sb.quader(1.6, 0.6, 3.2, 0x55603f, { y: 0.8 }); sb.quader(1.5, 0.5, 0.06, FARBEN.glas, { y: 1.4, z: 0.5, rx: -0.2 }); for (const zz of [-1.1, 1.1]) for (const xx of [-0.8, 0.8]) sb.zylinder(0.38, 0.38, 0.25, 10, FARBEN.anthrazit, { x: xx, y: 0.38, z: zz, rz: PI / 2 }); });
    hindernisse.push({ minX: -4.4, maxX: -2.4, minZ: -11.8, maxZ: -8.2, aus: nur('juni') });
  });
  neueSchicht('november', 461, (sb, g) => {
    const r = zufall(53);
    // Kundgebung auf der Straße
    for (let i = 0; i < 70; i++) passant(sb, { x: -4.5 + r() * 9, z: -78 - r() * 16, ry: PI + (r() - 0.5), kleid: r() < 0.3, hut: r() < 0.75, rock: [0x4b4743, 0x55504a, 0x3f4650, 0x5b5348, 0x3a3836][i % 5] });
    hindernisse.push({ minX: -5, maxX: 5, minZ: -95, maxZ: -77.2, aus: nur('november') });
    for (const x of [-3, 2.4]) { sb.quader(0.08, 3.4, 0.08, FARBEN.holz, { x, y: 1.9, z: -80 }); }
    const t = schild('GEGEN PREISWUCHER', { breite: 5.4, hoehe: 0.9, grund: '#f1ece0', farbe: '#8f3f2c', rand: null, groesse: 0.6 }); t.position.set(-0.3, 3.4, -79.9); g.add(t);
    plakat(g, 'GENERALSTREIK', '12. November 1948 · 24 Stunden', 8.36, 1.9, -15.5, -PI / 2, { farbe: '#8f3f2c' });
    plakat(g, 'GENERALSTREIK', '12. November 1948 · 24 Stunden', -8.36, 1.9, -62, PI / 2, { farbe: '#8f3f2c' });
    for (let i = 0; i < 20; i++) sb.quader(1.2 + r() * 2.2, 0.02, 0.8 + r() * 1.8, 0x66696a, { x: (r() - 0.5) * 11, y: 0.012, z: 8 - r() * 80, ry: r() * 3, streu: 0.03 });
    for (const L of LAEDEN) for (let i = 0; i < 2; i++) passant(sb, { x: 6.6 + r(), z: L.z - 3 + r() * 6, ry: PI / 2, kleid: true, hut: false, rock: 0x6b6a5c });
  });
  stelle('haendler', FIG.haendler, -10.5, -26, PI / 2, 'maerz');
  stelle('weberM', FIG.weber, 6.6, -19.5, -PI / 2 + 2.4, 'maerz');
  stelle('schuster', FIG.schuster, 6.9, LAEDEN[1].z + 3.2, -PI / 2, 'juni');
  stelle('weber', FIG.weber, 6.2, LAEDEN[1].z - 1.5, PI / 2, 'juni');
  stelle('kramer', FIG.kramer, 1.5, -70, 0, 'november');
  stelle('weberN', FIG.weber, 6.4, LAEDEN[4].z + 1, -PI / 2 - 0.6, 'november');

  // ------------------------------------------------------------ Leute, die unterwegs sind (je Zeitschicht)
  // März: Hunger und Schwarzmarkt, wenige und langsam; Juni: nach der Währungsreform volle Läden, belebt;
  // November: Generalstreik, Kundgebung im Süden der Straße (die Gehenden bleiben davor).
  const mitte = new Pfad([[0, 10], [0, -106]]);
  const s = (z) => 10 - z;
  const weg = (spuren, anzahl, o = {}) => ({ pfad: mitte, von: s(7), bis: s(-102), spuren, anzahl, qMin: -5.8, qMax: 5.8, ...o });
  const WEGE_B = {
    maerz: [weg([-1.5, 2.5, -4.6], 6, { tempo: 0.85 }), { ...weg([7.2], 2, { tempo: 0.85 }), qMin: 6.4, qMax: 7.9 }],
    juni: [weg([-3.0, 0, 3.0, 5.2, -5.0], 14, { tempo: 1.05 })],
    november: [weg([-2.0, 1.5, 5.2, -5.0], 8, { bis: s(-74) })],
  };
  const unterwegs = {};
  for (const name of ['maerz', 'juni', 'november']) {
    aktiv = name;
    const feste = [...hindernisse.filter((h) => !h.aus || !h.aus()), ...leuteFest[name]];
    unterwegs[name] = new Passanten(schichten[name], WEGE_B[name], { seed: 1948 + name.length, epoche: 1948, jahreszeit: name === 'juni' ? 'warm' : 'kalt', feste, boden: (x) => (Math.abs(x) > 6 ? 0.16 : 0) });
  }

  const setze = (name) => { aktiv = name; for (const s in schichten) schichten[s].visible = s === name; umg.setze(UMGEBUNG_B[name]); setzeLaeden(name === 'maerz' ? 0 : name === 'juni' ? 2 : [1, 2, 2, 2, 1]); };
  setze('maerz');

  return {
    szene, sonne: umg.sonne, folgeSonne: umg.folgeSonne, setze, setzeLaden, setzeLaeden, hindernisse, figuren,
    get schicht() { return aktiv; },
    flaechen: [{ minX: -8.1, maxX: 8.1, minZ: -108, maxZ: 9 }, { minX: -19, maxX: -7, minZ: -32.5, maxZ: -22 }],
    grenzen: { minX: -18, maxX: 8.2, minZ: -114, maxZ: 15 },
    punkte: {
      start: { x: 0, z: 4, ry: PI }, markt: new THREE.Vector3(-10.5, 0, -26), schlange: new THREE.Vector3(6.6, 0, -19.5),
      schuhladen: new THREE.Vector3(6.9, 0, LAEDEN[1].z + 3.2), weber: new THREE.Vector3(6.2, 0, LAEDEN[1].z - 1.5),
      buero: new THREE.Vector3(-7.6, 0, BZ0), vorBuero: { x: -6.6, z: BZ0, ry: -PI / 2 }, kramer: new THREE.Vector3(1.5, 0, -70), weberN: new THREE.Vector3(6.4, 0, LAEDEN[4].z + 1),
      plakat: new THREE.Vector3(7.4, 0, -15.5),
    },
    leute: () => unterwegs[aktiv].hindernisse(),
    update(dt, t, sp) {
      for (const n in figuren) if (figuren[n].gruppe.parent.visible) animiereFigur(figuren[n], dt, 0);
      if (sp) { unterwegs[aktiv].setzeAnteil(sp.qualitaet === 'niedrig' ? 0.5 : 1); unterwegs[aktiv].update(dt, sp); }
    },
  };
}
