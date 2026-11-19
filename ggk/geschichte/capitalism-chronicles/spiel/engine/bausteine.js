// Bausteine: Low-Poly-Geometrie aus Grundformen, zu wenigen Netzen zusammengefasst.
// Alles wird im Code modelliert, es gibt keine externen 3D-Modelle.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { figurStatisch, figurAusPassant } from './figur.js';

// Farbwelt laut Art Direction: gedeckt und warm.
export const FARBEN = {
  ziegel: 0x86553f,
  ziegelDunkel: 0x6c4636,
  ziegelHell: 0x996851,
  ziegelRuss: 0x5b4840,
  kohle: 0x4b4743,
  anthrazit: 0x2e2d2f,
  eisen: 0x35373a,
  braun: 0x5b4231,
  holz: 0x7a5a3c,
  holzHell: 0x9b7a52,
  gruen: 0x47593f,
  ocker: 0xb98a45,
  messing: 0xb08d48,
  sandstein: 0xb7a58a,
  pflaster: 0x7d7468,
  pflasterDunkel: 0x696157,
  erde: 0x6b5d4c,
  schiefer: 0x4d5257,
  glas: 0x2b3238,
  lichtWarm: 0xf6c877,
  baumwolle: 0xe9e1cf,
  jute: 0xa58e63,
  kalk: 0xd3c3a3,
  haut: 0xd9ab8b,
  wasser: 0x748a83,
};

// Zufall mit festem Startwert, damit die Stadt bei jedem Laden gleich aussieht.
export function zufall(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _c = new THREE.Color();

// Sammelt Geometrien mit Eckenfarben und fasst sie zu einem einzigen Netz zusammen.
export class Bauer {
  constructor(seed = 1) {
    this.geos = [];
    this.rnd = zufall(seed);
    this.stapel = [new THREE.Matrix4()];
  }
  get basis() { return this.stapel[this.stapel.length - 1]; }
  // Ein zweiter Bauer (z. B. für leuchtende Fenster) folgt denselben Verschiebungen.
  teileStapel(anderer) { this.stapel = anderer.stapel; return this; }

  // Führt fn in einem verschobenen/gedrehten Koordinatensystem aus.
  mit({ x = 0, y = 0, z = 0, ry = 0, s = 1 } = {}, fn) {
    const m = new THREE.Matrix4().compose(
      new THREE.Vector3(x, y, z),
      new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0)),
      new THREE.Vector3(s, s, s));
    this.stapel.push(new THREE.Matrix4().multiplyMatrices(this.basis, m));
    fn(this);
    this.stapel.pop();
    return this;
  }

  // glatt: die weichen Normalen der Grundform bleiben erhalten (runde Teile wirken weich statt kantig).
  hinzu(geo, farbe, o = {}) {
    const { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1, streu = 0.045, einzeln = false, glatt = false } = o;
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (g.attributes.uv) g.deleteAttribute('uv');
    _e.set(rx, ry, rz);
    _q.setFromEuler(_e);
    _m.compose(_p.set(x, y, z), _q, _s.set(sx, sy, sz));
    _m.premultiply(this.basis);
    g.applyMatrix4(_m);
    if (!glatt || !g.attributes.normal) g.computeVertexNormals();
    const n = g.attributes.position.count;
    const col = new Float32Array(n * 3);
    _c.set(farbe);
    // Glatte Teile bekommen einen einheitlichen Farbton, sonst wirkt die Streuung fleckig.
    const schritt = glatt ? n : einzeln ? 3 : 6;
    let f = 1;
    for (let i = 0; i < n; i++) {
      if (i % schritt === 0) f = 1 + (this.rnd() - 0.5) * 2 * streu;
      col[i * 3] = _c.r * f; col[i * 3 + 1] = _c.g * f; col[i * 3 + 2] = _c.b * f;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    this.geos.push(g);
    return this;
  }

  // einseitige Fläche, Vorderseite zeigt nach +z (mit ry drehen)
  flaeche(b, h, farbe, o) { return this.hinzu(new THREE.PlaneGeometry(b, h), farbe, o); }
  quader(b, h, t, farbe, o) { return this.hinzu(new THREE.BoxGeometry(b, h, t), farbe, o); }
  // Zylinder ab 6 Segmenten werden rund und weich dargestellt; 4- und 5-kantige Prismen (Laternenglas, Spitzen) bleiben kantig.
  zylinder(rOben, rUnten, h, seg, farbe, o) {
    if (seg >= 6) return this.hinzu(new THREE.CylinderGeometry(rOben, rUnten, h, Math.max(seg, 14)), farbe, { glatt: true, ...o });
    return this.hinzu(new THREE.CylinderGeometry(rOben, rUnten, h, seg), farbe, o);
  }
  kugel(r, farbe, o) { return this.hinzu(new THREE.SphereGeometry(r, 14, 10), farbe, { glatt: true, ...o }); }
  // Kapsel (Zylinder mit runden Enden) entlang der y-Achse; laenge ohne die Kappen.
  kapsel(r, laenge, farbe, o) { return this.hinzu(new THREE.CapsuleGeometry(r, laenge, 4, 12), farbe, { glatt: true, ...o }); }
  brocken(r, farbe, o) { return this.hinzu(new THREE.IcosahedronGeometry(r, 0), farbe, { einzeln: true, ...o }); }
  satteldach(b, h, t, farbe, o) { return this.hinzu(prismaGeo(b, h, t), farbe, { einzeln: true, ...o }); }

  get leer() { return this.geos.length === 0; }

  netz(material, { schatten = true } = {}) {
    if (this.leer) return new THREE.Group();
    const g = mergeGeometries(this.geos, false);
    this.geos.forEach(x => x.dispose());
    this.geos = [];
    const m = new THREE.Mesh(g, material);
    m.castShadow = schatten; m.receiveShadow = schatten;
    m.matrixAutoUpdate = false;
    return m;
  }
}

// Satteldach: First entlang der x-Achse, Giebel an beiden Enden. Ursprung in der Mitte der Grundfläche.
export function prismaGeo(b, h, t) {
  const x = b / 2, z = t / 2;
  const v = [
    // Dachfläche vorn (+z)
    -x, 0, z, x, 0, z, x, h, 0,
    -x, 0, z, x, h, 0, -x, h, 0,
    // Dachfläche hinten (-z)
    x, 0, -z, -x, 0, -z, -x, h, 0,
    x, 0, -z, -x, h, 0, x, h, 0,
    // Giebel links
    -x, 0, -z, -x, 0, z, -x, h, 0,
    // Giebel rechts
    x, 0, z, x, 0, -z, x, h, 0,
    // Boden
    -x, 0, -z, x, 0, -z, x, 0, z,
    -x, 0, -z, x, 0, z, -x, 0, z,
  ];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  g.computeVertexNormals();
  return g;
}

// Kantige Teile tragen Flächennormalen und wirken weiter flach schattiert; runde Teile (glatt) wirken weich.
export function weltMaterial() {
  return new THREE.MeshLambertMaterial({ vertexColors: true });
}
export function lichtMaterial() {
  return new THREE.MeshBasicMaterial({ vertexColors: true });
}

// ---------------------------------------------------------------------------
// Gebäude. Lokales Koordinatensystem: Mitte der Grundfläche im Ursprung, Front zeigt nach +z.

export function ziegelhaus(b, licht, o) {
  const {
    breite = 10, tiefe = 9, etagen = 3, etagenH = 3.1, sockel = 0.5,
    farbe = FARBEN.ziegel, dach = 'sattel', dachFarbe = FARBEN.schiefer,
    fensterAbstand = 2.2, fensterB = 1.0, fensterH = 1.7, lichtAnteil = 0.12,
    tuer = true, schornsteine = 1, seiten = true, rueck = false,
  } = o;
  const rnd = b.rnd;
  const h = sockel + etagen * etagenH;
  b.quader(breite, h, tiefe, farbe, { y: h / 2, streu: 0.035 });
  b.quader(breite + 0.12, sockel, tiefe + 0.12, FARBEN.kohle, { y: sockel / 2 });
  // Gesims
  b.quader(breite + 0.3, 0.22, tiefe + 0.3, FARBEN.sandstein, { y: h - 0.11, streu: 0.03 });
  if (dach === 'sattel') {
    b.satteldach(breite + 0.5, Math.min(3.2, tiefe * 0.32), tiefe + 0.5, dachFarbe, { y: h, streu: 0.05 });
  } else {
    b.quader(breite + 0.2, 0.35, tiefe + 0.2, dachFarbe, { y: h + 0.17 });
  }
  const dachH = dach === 'sattel' ? Math.min(3.2, tiefe * 0.32) : 0.35;
  for (let i = 0; i < schornsteine; i++) {
    const sx = (breite / (schornsteine + 1)) * (i + 1) - breite / 2 + (rnd() - 0.5);
    b.quader(0.7, 1.6, 0.7, FARBEN.ziegelDunkel, { x: sx, y: h + dachH * 0.75 + 0.5, z: -tiefe * 0.12 });
    b.quader(0.85, 0.14, 0.85, FARBEN.kohle, { x: sx, y: h + dachH * 0.75 + 1.35, z: -tiefe * 0.12 });
  }
  const fenster = (fx, fy, fz, ry, bw, bh) => {
    const hell = rnd() < lichtAnteil;
    const ziel = hell ? licht : b;
    const dx = Math.sin(ry) * 0.03, dz = Math.cos(ry) * 0.03;
    ziel.quader(bw, bh, 0.06, hell ? FARBEN.lichtWarm : FARBEN.glas, { x: fx + dx, y: fy, z: fz + dz, ry, streu: hell ? 0.12 : 0.1 });
    // Fensterbank
    b.quader(bw + 0.2, 0.1, 0.16, FARBEN.sandstein, { x: fx + dx * 2, y: fy - bh / 2 - 0.05, z: fz + dz * 2, ry, streu: 0.03 });
    // Sprosse
    if (!hell) b.quader(0.05, bh, 0.08, FARBEN.kalk, { x: fx + dx * 1.3, y: fy, z: fz + dz * 1.3, ry, streu: 0.02 });
  };
  const reihe = (laenge, fest, ry, mitTuer) => {
    const n = Math.max(1, Math.floor((laenge - 1.2) / fensterAbstand));
    const start = -((n - 1) * fensterAbstand) / 2;
    const tuerIdx = mitTuer ? Math.floor(n / 2) : -1;
    for (let e = 0; e < etagen; e++) {
      const fy = sockel + e * etagenH + etagenH * 0.55;
      for (let i = 0; i < n; i++) {
        const u = start + i * fensterAbstand;
        if (e === 0 && i === tuerIdx) continue;
        const px = Math.cos(ry) * u + Math.sin(ry) * fest;
        const pz = -Math.sin(ry) * u + Math.cos(ry) * fest;
        fenster(px, fy, pz, ry, fensterB, fensterH);
      }
    }
    if (mitTuer) {
      const u = start + tuerIdx * fensterAbstand;
      const px = Math.cos(ry) * u + Math.sin(ry) * fest;
      const pz = -Math.sin(ry) * u + Math.cos(ry) * fest;
      b.quader(1.25, 2.3, 0.1, FARBEN.braun, { x: px + Math.sin(ry) * 0.03, y: sockel * 0.2 + 1.15, z: pz + Math.cos(ry) * 0.03, ry });
      b.quader(1.55, 0.2, 0.2, FARBEN.sandstein, { x: px + Math.sin(ry) * 0.05, y: sockel * 0.2 + 2.4, z: pz + Math.cos(ry) * 0.05, ry });
    }
  };
  reihe(breite, tiefe / 2, 0, tuer);
  if (seiten) {
    reihe(tiefe, breite / 2, Math.PI / 2, false);
    reihe(tiefe, breite / 2, -Math.PI / 2, false);
  }
  if (rueck) reihe(breite, tiefe / 2, Math.PI, false);
  return h + dachH;
}

// Fabrikschornstein; gibt die Höhe der Mündung zurück.
export function schornstein(b, { x = 0, z = 0, h = 30, r = 1.3, farbe = FARBEN.ziegelDunkel } = {}) {
  b.quader(r * 2.8, 3, r * 2.8, FARBEN.ziegelRuss, { x, y: 1.5, z });
  b.zylinder(r * 0.55, r, h - 3, 8, farbe, { x, y: 3 + (h - 3) / 2, z, streu: 0.05 });
  b.zylinder(r * 0.68, r * 0.62, 0.7, 8, FARBEN.ziegelRuss, { x, y: h - 0.2, z });
  return h + 0.2;
}

export function laterne(b, licht, { x = 0, z = 0, h = 3.4 } = {}) {
  b.zylinder(0.07, 0.11, h, 6, FARBEN.eisen, { x, y: h / 2, z });
  b.zylinder(0.16, 0.2, 0.3, 6, FARBEN.eisen, { x, y: 0.15, z });
  licht.zylinder(0.2, 0.14, 0.42, 4, FARBEN.lichtWarm, { x, y: h + 0.25, z, ry: Math.PI / 4, streu: 0.05 });
  b.zylinder(0.03, 0.26, 0.2, 4, FARBEN.eisen, { x, y: h + 0.56, z, ry: Math.PI / 4 });
}

export function ballen(b, { x = 0, y = 0, z = 0, ry = 0, s = 1 } = {}) {
  b.mit({ x, y, z, ry, s }, () => {
    b.quader(1.3, 0.8, 0.85, FARBEN.baumwolle, { y: 0.4, streu: 0.06 });
    b.quader(0.08, 0.84, 0.89, FARBEN.jute, { x: -0.35, y: 0.4 });
    b.quader(0.08, 0.84, 0.89, FARBEN.jute, { x: 0.35, y: 0.4 });
  });
}

export function fass(b, { x = 0, z = 0, y = 0 } = {}) {
  b.zylinder(0.36, 0.36, 0.95, 8, FARBEN.holz, { x, y: y + 0.475, z });
  b.zylinder(0.38, 0.38, 0.08, 8, FARBEN.eisen, { x, y: y + 0.2, z });
  b.zylinder(0.38, 0.38, 0.08, 8, FARBEN.eisen, { x, y: y + 0.75, z });
}

export function kiste(b, { x = 0, z = 0, y = 0, ry = 0, s = 0.9 } = {}) {
  b.quader(s, s, s, FARBEN.holzHell, { x, y: y + s / 2, z, ry, streu: 0.08 });
  b.quader(s * 1.04, s * 0.1, s * 1.04, FARBEN.holz, { x, y: y + s * 0.95, z, ry });
}

// Eine stehende Nebenfigur, fest in die Welt eingebaut (keine Animation). Aussehen, Größe und Statur
// werden aus dem Ort abgeleitet und sind deshalb bei jedem Laden gleich; Farbe, Kleid, Hut und Maßstab (g) wie angegeben.
// def: vollständige Figurbeschreibung (wie bei baueFigur) statt der Kurzangaben.
// Zeit, Jahreszeit und Bodenhöhe kommen aus dem Aufruf oder vom Bauer (b.epoche, b.jahreszeit, b.boden); b.leute sammelt die Standorte.
export function passant(b, { x = 0, z = 0, ry = 0, y = b.boden ? b.boden(x, z) : 0, rock, hose, hut = true, kleid = false, g = 1, def = null, epoche = b.epoche ?? 1845, jahreszeit = b.jahreszeit ?? 'kalt' } = {}) {
  const rnd = zufall(Math.abs(Math.round(x * 73.1 + z * 19.7 + ry * 7)) + 11);
  figurStatisch(b, def || figurAusPassant({ rock, hose, hut, kleid, g, epoche, jahreszeit }, rnd), { x, z, ry, y });
  if (b.leute) b.leute.push({ x, z, r: 0.32 * g });
}

// ---------------------------------------------------------------------------
// Himmel mit warmem Horizont und Sonnenscheibe.
export function himmel(sonne, { horizont = 0xf0b77c, zenit = 0x6790a6, glut = 0xffc680 } = {}) {
  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: {
      sonne: { value: sonne.clone().normalize() },
      horizont: { value: new THREE.Color(horizont) },
      zenit: { value: new THREE.Color(zenit) },
      glut: { value: new THREE.Color(glut) },
    },
    vertexShader: /* glsl */`
      varying vec3 vR;
      void main() { vR = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform vec3 sonne; uniform vec3 horizont; uniform vec3 zenit; uniform vec3 glut;
      varying vec3 vR;
      void main() {
        vec3 r = normalize(vR);
        float h = clamp(r.y, 0.0, 1.0);
        vec3 c = mix(horizont, zenit, pow(h, 0.62));
        float d = max(dot(r, sonne), 0.0);
        c += glut * pow(d, 5.0) * 0.32;
        c += glut * pow(d, 60.0) * 0.5;
        c = mix(c, vec3(1.0, 0.95, 0.8), smoothstep(0.9988, 0.9993, d));
        c = mix(c, horizont * 0.9, smoothstep(0.0, -0.2, r.y));
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(450, 24, 12), mat);
  m.frustumCulled = false;
  m.renderOrder = -10;
  return m;
}

// ---------------------------------------------------------------------------
// Rauch und Dampf: Low-Poly-Schwaden als Instanzen, Bahn rein aus der Zeit berechnet.
export class Rauch {
  constructor(quellen, { jeQuelle = 9, farbe = 0xa89c92 } = {}) {
    this.quellen = quellen; // {x,y,z, groesse, hoehe, tempo, farbe?}
    this.je = jeQuelle;
    const n = quellen.length * jeQuelle;
    const mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.netz = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 2), mat, n);
    this.netz.frustumCulled = false;
    this.netz.castShadow = false; this.netz.receiveShadow = false;
    const c = new THREE.Color();
    const rnd = zufall(77);
    this.saat = [];
    for (let i = 0; i < n; i++) {
      const q = quellen[Math.floor(i / jeQuelle)];
      c.set(q.farbe ?? farbe);
      const f = 0.92 + rnd() * 0.16;
      c.multiplyScalar(f);
      this.netz.setColorAt(i, c);
      this.saat.push([rnd(), rnd(), rnd()]);
    }
    this.netz.instanceColor.needsUpdate = true;
    this._m = new THREE.Matrix4(); this._q = new THREE.Quaternion(); this._p = new THREE.Vector3(); this._s = new THREE.Vector3(); this._e = new THREE.Euler();
    this.wind = new THREE.Vector3(-0.55, 0, 0.35);
  }
  update(t) {
    const { quellen, je } = this;
    for (let qi = 0; qi < quellen.length; qi++) {
      const q = quellen[qi];
      const dauer = q.dauer ?? 9;
      for (let k = 0; k < je; k++) {
        const i = qi * je + k;
        const sa = this.saat[i];
        let u = ((t / dauer) + k / je + sa[0] * 0.05) % 1;
        const hoch = (q.hoehe ?? 14) * (u * 0.75 + u * u * 0.25);
        const drift = u * u * (q.drift ?? 16);
        this._p.set(
          q.x + this.wind.x * drift + Math.sin(u * 5 + sa[1] * 6.28) * 0.5 * u * (q.groesse ?? 1.5),
          q.y + hoch,
          q.z + this.wind.z * drift + Math.cos(u * 4 + sa[2] * 6.28) * 0.5 * u * (q.groesse ?? 1.5));
        const ein = Math.min(1, u / 0.12), aus = 1 - Math.max(0, (u - 0.7) / 0.3);
        const s = (q.groesse ?? 1.5) * (0.45 + u * 1.5) * ein * aus * aus;
        this._e.set(sa[0] * 6 + t * 0.15, sa[1] * 6 + t * 0.1, sa[2] * 6);
        this._q.setFromEuler(this._e);
        this._m.compose(this._p, this._q, this._s.set(s, s * 0.85, s));
        this.netz.setMatrixAt(i, this._m);
      }
    }
    this.netz.instanceMatrix.needsUpdate = true;
  }
}

// ---------------------------------------------------------------------------
// Beschriftetes Schild als Leinwand-Textur.
export function schild(text, { breite = 4, hoehe = 0.9, grund = '#2b2622', farbe = '#d8b76a', rand = '#b08d48', schrift = 'Abril Fatface', groesse = 0.5, zeile2 = null } = {}) {
  const px = 160;
  const c = document.createElement('canvas');
  c.width = Math.round(breite * px); c.height = Math.round(hoehe * px);
  const g = c.getContext('2d');
  g.fillStyle = grund; g.fillRect(0, 0, c.width, c.height);
  if (rand) { g.strokeStyle = rand; g.lineWidth = 6; g.strokeRect(9, 9, c.width - 18, c.height - 18); }
  g.fillStyle = farbe; g.textAlign = 'center'; g.textBaseline = 'middle';
  let fs = Math.round(hoehe * px * groesse);
  g.font = `${fs}px "${schrift}", Georgia, serif`;
  while (g.measureText(text).width > c.width * 0.88 && fs > 10) { fs -= 2; g.font = `${fs}px "${schrift}", Georgia, serif`; }
  if (zeile2) {
    g.fillText(text, c.width / 2, c.height * 0.38);
    g.font = `${Math.round(fs * 0.5)}px "Source Serif 4", Georgia, serif`;
    g.fillText(zeile2, c.width / 2, c.height * 0.74);
  } else {
    g.fillText(text, c.width / 2, c.height / 2 + fs * 0.04);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  const mat = new THREE.MeshLambertMaterial({ map: tex });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(breite, hoehe), mat);
  m.receiveShadow = true;
  return m;
}

// Band entlang einer Folge von Querschnitten (für Straße, Kanal, Ufer).
// profile: Funktion (i) -> [links: Vector3, rechts: Vector3]
export function bandGeo(n, profil) {
  const pos = [];
  let [l0, r0] = profil(0);
  for (let i = 1; i < n; i++) {
    const [l1, r1] = profil(i);
    pos.push(l0.x, l0.y, l0.z, r0.x, r0.y, r0.z, r1.x, r1.y, r1.z);
    pos.push(l0.x, l0.y, l0.z, r1.x, r1.y, r1.z, l1.x, l1.y, l1.z);
    l0 = l1; r0 = r1;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}
