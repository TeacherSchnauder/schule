// Kapitel I – Innenraum der Spinnerei (Station 2). Eigene kleine Szene, wird beim Betreten aktiviert.
import * as THREE from 'three';
import { Bauer, FARBEN, weltMaterial, lichtMaterial, schild, zufall, kiste } from '../../engine/bausteine.js';
import { baueFigur, animiereFigur, dreheZu, FIGUREN } from '../../engine/figur.js';

const BX = 13, BZ = 7, H = 5.2;          // halbe Breite, halbe Tiefe, Höhe des Saals
const SCH = 0.5;                          // Meter Balkenhöhe je Schilling
const BASIS = 0.9;                        // Unterkante der Balken

export function baueSpinnsaal() {
  const szene = new THREE.Scene();
  szene.background = new THREE.Color(0x2a221c);
  szene.fog = new THREE.Fog(0x6b5a48, 18, 60);
  const b = new Bauer(31), licht = new Bauer(32).teileStapel(b);
  const rnd = zufall(33);
  const hind = [];

  // --- Raumhülle ---------------------------------------------------------------
  for (let i = 0; i < 28; i++) b.quader(BX * 2, 0.1, 0.5, FARBEN.holz, { y: -0.05, z: -BZ + 0.25 + i * 0.5, streu: 0.09 });
  b.quader(BX * 2, 0.2, BZ * 2, 0x4a3a2c, { y: H + 0.1 });
  for (let x = -BX + 1.6; x < BX; x += 2.75) b.quader(0.28, 0.4, BZ * 2, FARBEN.braun, { x, y: H - 0.2 });
  const wand = (x, y, z, bw, bh, bt, f = FARBEN.kalk) => b.quader(bw, bh, bt, f, { x, y, z, streu: 0.03 });
  // Nordwand (geschlossen, Fenster als leuchtende Flächen)
  wand(0, H / 2, -BZ - 0.2, BX * 2, H, 0.4);
  b.quader(BX * 2, 1.1, 0.06, 0x8b6a4c, { y: 0.55, z: -BZ + 0.02 });
  // West- und Ostwand
  wand(-BX - 0.2, H / 2, 0, 0.4, H, BZ * 2 + 0.8);
  wand(BX + 0.2, H / 2, 0, 0.4, H, BZ * 2 + 0.8);
  b.quader(0.06, 1.1, BZ * 2, 0x8b6a4c, { x: -BX + 0.02, y: 0.55 });
  // Südwand mit echten Fensteröffnungen: das Sonnenlicht fällt in den Saal
  const fensterX = [];
  for (let x = -BX + 3.6; x < BX - 1; x += 3.25) fensterX.push(x);
  const FB = 1.5, FU = 1.3, FO = 4.3;
  // einseitige Flächen: von außen durchsichtig, damit die Kamera hinter der Wand stehen kann
  const innen = (x, y, bw, bh, f = FARBEN.kalk) => b.flaeche(bw, bh, f, { x, y, z: BZ, ry: Math.PI, streu: 0.03 });
  innen(0, FU / 2, BX * 2, FU);
  innen(0, (FO + H) / 2, BX * 2, H - FO);
  {
    let links = -BX;
    for (const fx of [...fensterX, null]) {
      const rechts = fx === null ? BX : fx - FB / 2;
      const w = rechts - links;
      if (w > 0.01) innen(links + w / 2, (FU + FO) / 2, w, FO - FU);
      if (fx !== null) links = fx + FB / 2;
    }
  }
  innen(0, 0.55, BX * 2, 1.1, 0x8b6a4c);
  for (const fx of fensterX) {
    // Sprossen (werfen Schatten), helles Glas dahinter
    b.quader(0.07, FO - FU, 0.07, FARBEN.eisen, { x: fx, y: (FU + FO) / 2, z: BZ });
    for (const fy of [2.3, 3.3]) b.quader(FB, 0.07, 0.07, FARBEN.eisen, { x: fx, y: fy, z: BZ });
  }
  // heller Himmel hinter den Südfenstern (wirft keinen Schatten, damit die Sonne hereinfällt)
  const draussen = new THREE.Mesh(new THREE.PlaneGeometry(BX * 2, FO - FU), new THREE.MeshBasicMaterial({ color: 0xf3dcb4, fog: false }));
  draussen.position.set(0, (FU + FO) / 2, BZ + 0.45); draussen.rotation.y = Math.PI; szene.add(draussen);
  // Fenster der Nordwand
  for (let x = -BX + 2.2; x < BX; x += 3.25) {
    licht.quader(FB, FO - FU, 0.05, 0xd9c7a2, { x, y: (FU + FO) / 2, z: -BZ + 0.03, streu: 0.04 });
    b.quader(0.07, FO - FU, 0.08, FARBEN.eisen, { x, y: (FU + FO) / 2, z: -BZ + 0.06 });
    for (const fy of [2.3, 3.3]) b.quader(FB, 0.07, 0.08, FARBEN.eisen, { x, y: fy, z: -BZ + 0.06 });
  }
  // Tür (Südwand, westlich)
  const TX = -11.2;
  b.quader(1.7, 2.6, 0.14, FARBEN.braun, { x: TX, y: 1.3, z: BZ - 0.06 });
  b.quader(2.0, 0.18, 0.2, 0x6a5038, { x: TX, y: 2.7, z: BZ - 0.06 });
  licht.quader(0.12, 0.12, 0.06, FARBEN.messing, { x: TX + 0.6, y: 1.2, z: BZ - 0.15 });

  // Gusseiserne Säulen
  for (const sx of [-9.6, -4.1, 1.4]) for (const sz of [-2.62, 3.5]) {
    b.zylinder(0.11, 0.14, H, 8, FARBEN.eisen, { x: sx, y: H / 2, z: sz });
    b.zylinder(0.24, 0.12, 0.3, 8, FARBEN.eisen, { x: sx, y: H - 0.15, z: sz });
    b.zylinder(0.16, 0.22, 0.25, 8, FARBEN.eisen, { x: sx, y: 0.12, z: sz });
    hind.push({ x: sx, z: sz, r: 0.2 });
  }

  // Transmission an der Decke
  const wellen = [];
  for (const wz of [-5.3, -0.4]) {
    b.zylinder(0.06, 0.06, 15.5, 6, FARBEN.eisen, { x: -2.5, y: H - 0.75, z: wz, rz: Math.PI / 2 });
    for (const wx of [-8.4, -2.5, 3.4]) {
      b.quader(0.1, 0.6, 0.1, FARBEN.eisen, { x: wx + 0.5, y: H - 0.45, z: wz });
      wellen.push({ x: wx, z: wz });
    }
  }

  // --- Die beiden Spinnmaschinen (Mules) ---------------------------------------
  const mules = [];
  const baueMule = (z0, neu) => {
    // z0: Lage des Gatters (hinten); der Wagen fährt nach +z aus
    const X0 = -9, X1 = 4, L = X1 - X0, MX = (X0 + X1) / 2;
    const rahmen = neu ? 0x3b4a45 : 0x4b4a47;
    for (const ex of [X0 - 0.15, X1 + 0.15, MX]) {
      b.quader(0.3, 1.9, 1.0, rahmen, { x: ex, y: 0.95, z: z0 + 0.3 });
    }
    b.quader(L, 0.14, 0.2, FARBEN.braun, { x: MX, y: 1.85, z: z0 });          // Gatter
    b.quader(L, 0.12, 0.3, rahmen, { x: MX, y: 1.15, z: z0 + 0.55 });         // Streckwerk
    b.quader(L, 0.08, 0.12, neu ? FARBEN.messing : 0x77726a, { x: MX, y: 1.25, z: z0 + 0.62 });
    for (const sx of [X0 + 0.4, X1 - 0.4, MX - 3, MX + 3]) b.quader(0.1, 0.1, 2.6, FARBEN.eisen, { x: sx, y: 0.05, z: z0 + 1.7 }); // Schienen
    // Antriebsrad am östlichen Ende
    b.zylinder(0.5, 0.5, 0.12, 12, neu ? FARBEN.messing : FARBEN.eisen, { x: X1 + 0.4, y: 1.25, z: z0 + 0.3, rz: Math.PI / 2 });
    // Vorgarnspulen im Gatter
    const n = Math.floor(L / 0.26);
    const spulen = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.07, 0.09, 0.3, 6), new THREE.MeshLambertMaterial({ color: FARBEN.baumwolle, flatShading: true }), n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.makeTranslation(X0 + 0.2 + i * 0.26, 1.62, z0 + 0.05); spulen.setMatrixAt(i, m4); }
    spulen.castShadow = true; szene.add(spulen);
    // Wagen mit Spindeln
    const wagen = new THREE.Group();
    const wb = new Bauer(40 + (neu ? 1 : 0));
    wb.quader(L, 0.42, 0.5, neu ? 0x556b5f : 0x5a5650, { x: MX, y: 0.55 });
    wb.quader(L, 0.08, 0.6, FARBEN.braun, { x: MX, y: 0.8 });
    for (const sx of [X0 + 0.4, X1 - 0.4, MX - 3, MX + 3]) wb.zylinder(0.16, 0.16, 0.12, 8, FARBEN.eisen, { x: sx, y: 0.2, rz: Math.PI / 2 });
    const wn = wb.netz(weltMaterial()); wagen.add(wn);
    const kops = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.065, 0.34, 6), new THREE.MeshLambertMaterial({ color: FARBEN.baumwolle, flatShading: true }), n);
    for (let i = 0; i < n; i++) { m4.makeRotationX(-0.25); m4.setPosition(X0 + 0.2 + i * 0.26, 1.0, 0.02); kops.setMatrixAt(i, m4); }
    kops.castShadow = true; wagen.add(kops);
    szene.add(wagen);
    // Fadenschar zwischen Streckwerk und Spindeln
    const faeden = new THREE.Mesh(new THREE.PlaneGeometry(L - 0.3, 1), new THREE.MeshBasicMaterial({ color: 0xefe6d2, transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false }));
    faeden.rotation.x = -Math.PI / 2;
    szene.add(faeden);
    const mule = { wagen, faeden, z0, MX, phase: rnd() * 6, tempo: neu ? 0 : 1, zielTempo: neu ? 0 : 1 };
    mules.push(mule);
    hind.push({ minX: X0 - 0.5, maxX: X1 + 0.9, minZ: z0 - 0.5, maxZ: z0 + 3.0 });
    return mule;
  };
  const muleNeu = baueMule(-5.9, true);
  const muleAlt = baueMule(-0.9, false);
  // Abdeckplane über der neuen Maschine, solange sie nicht läuft
  const plane = new THREE.Mesh(new THREE.BoxGeometry(13.6, 0.08, 1.5), new THREE.MeshLambertMaterial({ color: 0x8a7c62, flatShading: true }));
  plane.position.set(-2.5, 2.0, -5.5); plane.castShadow = true; szene.add(plane);
  const plane2 = new THREE.Mesh(new THREE.BoxGeometry(13.6, 1.5, 0.06), plane.material);
  plane2.position.set(-2.5, 1.25, -4.74); plane2.castShadow = true; szene.add(plane2);

  // --- Stirnwand im Osten: Fabrikuhr und zwei Balken ---------------------------
  const WX = BX - 0.02;
  const aufWand = (m, y, z, vor = 0) => { m.position.set(WX - vor, y, z); m.rotation.y = -Math.PI / 2; szene.add(m); return m; };
  // Zifferblatt
  const uhrMitte = new THREE.Vector3(WX, 3.55, 0);
  const R = 0.95;
  aufWand(new THREE.Mesh(new THREE.CircleGeometry(R + 0.12, 32), new THREE.MeshLambertMaterial({ color: FARBEN.messing })), uhrMitte.y, 0, 0.01);
  const blatt = aufWand(new THREE.Mesh(new THREE.CircleGeometry(R, 32), new THREE.MeshBasicMaterial({ map: zifferblatt() })), uhrMitte.y, 0, 0.03);
  const sektorMat = (farbe) => new THREE.MeshBasicMaterial({ color: farbe, transparent: true, opacity: 0.6, depthWrite: false });
  const sektoren = [
    aufWand(new THREE.Mesh(new THREE.BufferGeometry(), sektorMat(0x6f8a5c)), uhrMitte.y, 0, 0.05),
    aufWand(new THREE.Mesh(new THREE.BufferGeometry(), sektorMat(0xa5553c)), uhrMitte.y, 0, 0.05),
    aufWand(new THREE.Mesh(new THREE.BufferGeometry(), sektorMat(0x3a3836)), uhrMitte.y, 0, 0.05),
  ];
  const zeigerDreh = new THREE.Group();
  aufWand(zeigerDreh, uhrMitte.y, 0, 0.08);
  const zeiger = new THREE.Mesh(new THREE.BoxGeometry(0.07, R * 0.82, 0.03), new THREE.MeshBasicMaterial({ color: 0x1f1b19 }));
  zeiger.position.y = R * 0.34;
  zeigerDreh.add(zeiger);
  aufWand(new THREE.Mesh(new THREE.CircleGeometry(0.08, 12), new THREE.MeshBasicMaterial({ color: FARBEN.messing })), uhrMitte.y, 0, 0.1);
  const uhrSchild = aufWand(schild('ARBEITSSTUNDEN', { breite: 2.6, hoehe: 0.34, groesse: 0.6, rand: null }), uhrMitte.y + R + 0.42, 0, 0.02);

  // Messlatten und Balken
  const balken = {};
  for (const [name, z, titel] of [['neuwert', -2.9, 'NEUWERT'], ['lohn', 2.9, 'TAGESLOHN']]) {
    aufWand(new THREE.Mesh(new THREE.PlaneGeometry(1.7, 3.9), new THREE.MeshLambertMaterial({ map: messlatte() })), BASIS + 1.75, z, 0.02);
    aufWand(schild(titel, { breite: 1.9, hoehe: 0.36, groesse: 0.6, rand: null }), BASIS - 0.38, z, 0.02);
    const unten = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.62), new THREE.MeshLambertMaterial({ color: name === 'lohn' ? 0x6f8a5c : FARBEN.ocker, flatShading: true }));
    const oben = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1, 0.62), new THREE.MeshLambertMaterial({ color: 0xa5553c, flatShading: true }));
    for (const m of [unten, oben]) { m.position.set(WX - 0.12, BASIS, z + 0.22); szene.add(m); m.visible = false; }
    balken[name] = { unten, oben, wert: 0, ziel: 0, teilung: null };
  }
  const setzeBalken = (bk, dt) => {
    bk.wert += (bk.ziel - bk.wert) * Math.min(1, dt * 10);
    const w = bk.wert;
    const t = bk.teilung;
    const hu = Math.max(0, (t === null ? w : Math.min(w, t)) * SCH);
    const ho = t === null ? 0 : Math.max(0, (w - t) * SCH);
    bk.unten.visible = hu > 0.005; bk.oben.visible = ho > 0.005;
    bk.unten.scale.y = Math.max(hu, 0.001); bk.unten.position.y = BASIS + hu / 2;
    bk.oben.scale.y = Math.max(ho, 0.001); bk.oben.position.y = BASIS + hu + ho / 2;
  };
  const sektorGeo = (h1, h2) => {
    if (h2 - h1 < 0.01) return new THREE.BufferGeometry();
    const k = (Math.PI * 2) / 12;
    return new THREE.RingGeometry(R * 0.42, R * 0.7, 40, 1, Math.PI / 2 - h2 * k, (h2 - h1) * k);
  };
  const tafel = {
    mitte: new THREE.Vector3(WX, 2.75, 0),
    normale: new THREE.Vector3(-1, 0, 0),
    // stunden: Zeigerstellung; neuwert/lohn in Schilling; teilung: Wert, ab dem der Neuwert als Mehrwert gefärbt wird
    setze({ stunden, neuwert, lohn, teilung = null, notwendig = null, ende = 12 }) {
      zeigerDreh.rotation.z = -(stunden / 12) * Math.PI * 2;
      balken.neuwert.ziel = neuwert; balken.neuwert.teilung = teilung;
      balken.lohn.ziel = lohn;
      const g = [
        notwendig === null ? new THREE.BufferGeometry() : sektorGeo(0, Math.min(notwendig, stunden)),
        notwendig === null ? new THREE.BufferGeometry() : sektorGeo(notwendig, Math.max(notwendig, Math.min(stunden, ende))),
        sektorGeo(ende, 12),
      ];
      sektoren.forEach((s, i) => { s.geometry.dispose(); s.geometry = g[i]; });
    },
  };
  tafel.setze({ stunden: 0, neuwert: 0, lohn: 3 });

  // Pult des Aufsehers
  const PX = 10.6, PZ = 5.1;
  b.quader(2.6, 0.18, 2.0, 0x6a5038, { x: PX, y: 0.09, z: PZ });
  b.quader(1.5, 1.05, 0.7, FARBEN.braun, { x: PX, y: 0.7, z: PZ + 0.3 });
  b.quader(1.6, 0.06, 0.85, 0x6a5038, { x: PX, y: 1.3, z: PZ + 0.28, rx: -0.28 });
  b.quader(0.7, 0.04, 0.5, 0xe6dcc6, { x: PX - 0.1, y: 1.36, z: PZ + 0.26, rx: -0.28 });
  b.zylinder(0.03, 0.08, 0.4, 6, FARBEN.messing, { x: PX + 0.6, y: 1.55, z: PZ + 0.5 });
  licht.zylinder(0.12, 0.09, 0.18, 6, FARBEN.lichtWarm, { x: PX + 0.6, y: 1.84, z: PZ + 0.5 });
  b.zylinder(0.2, 0.22, 0.75, 6, FARBEN.holz, { x: PX, y: 0.55, z: PZ - 0.55 });
  hind.push({ minX: PX - 0.9, maxX: PX + 0.9, minZ: PZ - 0.2, maxZ: PZ + 0.9 });
  hind.push({ x: PX, z: PZ - 0.55, r: 0.25 });
  // Körbe und Kisten
  for (const [x, z] of [[6.8, -5.9], [7.9, -6.0], [-12.0, -1.0], [12.0, -5.8]]) { kiste(b, { x, z, ry: rnd(), s: 0.8 }); hind.push({ x, z, r: 0.6 }); }
  for (const [x, z] of [[5.6, 1.2], [-11.8, 2.4]]) {
    b.zylinder(0.42, 0.34, 0.5, 8, FARBEN.jute, { x, y: 0.25, z });
    b.brocken(0.36, FARBEN.baumwolle, { x, y: 0.55, z, sy: 0.6 });
    hind.push({ x, z, r: 0.5 });
  }

  szene.add(b.netz(weltMaterial()));
  szene.add(licht.netz(lichtMaterial(), { schatten: false }));

  // Riemenscheiben (drehen sich)
  const scheibenGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.1, 10);
  scheibenGeo.rotateZ(Math.PI / 2);
  const scheiben = new THREE.InstancedMesh(scheibenGeo, new THREE.MeshLambertMaterial({ color: 0x55504a, flatShading: true }), wellen.length);
  szene.add(scheiben);
  // Riemen
  for (const w of wellen) {
    const r = new THREE.Mesh(new THREE.BoxGeometry(0.1, H - 2.4, 0.02), new THREE.MeshLambertMaterial({ color: 0x3d3229 }));
    r.position.set(w.x, (H - 0.75 + 1.6) / 2, w.z + 0.34);
    r.rotation.x = 0.05;
    szene.add(r);
  }

  // Lichtbahnen aus den Südfenstern
  const LICHT = new THREE.Vector3(-0.28, 0.62, 0.73).normalize();     // Richtung zur Sonne
  const bahnMat = new THREE.MeshBasicMaterial({ color: 0xffdfae, transparent: true, opacity: 0.028, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false });
  for (const fx of fensterX) {
    // Vier Strahlen durch die Fensterecken bis zum Boden; daraus vier dünne Lichtflächen
    const boden = (x, y) => [x - LICHT.x * (y / LICHT.y), 0, BZ - LICHT.z * (y / LICHT.y)];
    const xl = fx - FB / 2, xr = fx + FB / 2;
    const ol = [xl, FO, BZ], or = [xr, FO, BZ], ul = [xl, FU, BZ], ur = [xr, FU, BZ];
    const bol = boden(xl, FO), bor = boden(xr, FO), bul = boden(xl, FU), bur = boden(xr, FU);
    const v = [];
    const viereck = (a, b2, c, d) => v.push(...a, ...b2, ...c, ...a, ...c, ...d);
    viereck(ol, ul, bul, bol); viereck(or, ur, bur, bor); viereck(ol, or, bor, bol); viereck(ul, ur, bur, bul);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    szene.add(new THREE.Mesh(g, bahnMat));
  }

  // Baumwollstaub im Gegenlicht
  const NST = 320;
  const stPos = new Float32Array(NST * 3), stSaat = new Float32Array(NST * 3);
  for (let i = 0; i < NST; i++) {
    stSaat[i * 3] = -BX + rnd() * BX * 2; stSaat[i * 3 + 1] = 0.3 + rnd() * 4.2; stSaat[i * 3 + 2] = -BZ + rnd() * BZ * 2;
  }
  const stGeo = new THREE.BufferGeometry();
  stGeo.setAttribute('position', new THREE.BufferAttribute(stPos, 3));
  const fleck = document.createElement('canvas'); fleck.width = fleck.height = 32;
  { const g2 = fleck.getContext('2d'); const gr = g2.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, 32, 32); }
  const staub = new THREE.Points(stGeo, new THREE.PointsMaterial({ color: 0xfff0d2, size: 0.07, map: new THREE.CanvasTexture(fleck), transparent: true, opacity: 0.5, depthWrite: false, sizeAttenuation: true }));
  staub.frustumCulled = false;
  szene.add(staub);

  // --- Licht -------------------------------------------------------------------
  szene.add(new THREE.HemisphereLight(0xe6d6ba, 0x5a4636, 1.25));
  const sonne = new THREE.DirectionalLight(0xffd9a6, 2.3);
  sonne.position.copy(LICHT).multiplyScalar(30);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  const sc = sonne.shadow.camera;
  sc.left = -17; sc.right = 17; sc.top = 12; sc.bottom = -12; sc.near = 5; sc.far = 60;
  sonne.shadow.bias = -0.0008; sonne.shadow.normalBias = 0.04;
  szene.add(sonne, sonne.target);
  const lampe = new THREE.PointLight(0xffc36e, 14, 10, 1.8);
  lampe.position.set(PX + 0.6, 2.1, PZ + 0.3);
  szene.add(lampe);

  // --- Figuren -------------------------------------------------------------------
  const mary = baueFigur(FIGUREN.mary);
  mary.gruppe.position.set(-2, 0, 2.75); mary.gruppe.rotation.y = Math.PI;
  const whitlow = baueFigur(FIGUREN.whitlow);
  whitlow.gruppe.position.set(-6.8, 0, 5.2); whitlow.gruppe.rotation.y = Math.PI / 2;
  whitlow.gruppe.visible = false;
  for (const f of [mary, whitlow]) { f.gruppe.traverse(o => { if (o.isMesh) o.castShadow = true; }); szene.add(f.gruppe); }
  hind.push({ x: -2, z: 2.75, r: 0.35 });
  hind.push({ x: -6.8, z: 5.2, r: 0.4, aus: () => !whitlow.gruppe.visible });

  const zustand = { maryBlick: null, whitlowBlick: null, neuSichtbar: false };
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), s1 = new THREE.Vector3(1, 1, 1);

  return {
    szene, sonne, hindernisse: hind, tafel, mary, whitlow,
    punkte: {
      eintritt: { x: TX + 0.2, z: 5.2, ry: 2.6 },
      tuer: new THREE.Vector3(TX, 0, BZ - 0.6),
      mary: new THREE.Vector3(-2, 0, 2.75),
      uhr: new THREE.Vector3(11.6, 0, 0),
      pult: new THREE.Vector3(PX, 0, PZ - 0.9),
      maschine: new THREE.Vector3(5.3, 0, -4.6),
      whitlow: new THREE.Vector3(-6.8, 0, 5.2),
    },
    grenzen: { minX: -BX + 0.5, maxX: BX - 0.5, minZ: -BZ + 0.5, maxZ: BZ + 3.4, maxY: H - 0.5 },
    flaeche: { minX: -BX + 0.15, maxX: BX - 0.15, minZ: -BZ + 0.15, maxZ: BZ - 0.15 },
    // Die neue Maschine wird ausgepackt und läuft; tempo 1 entspricht der alten Maschine.
    zeigeNeueMaschine(tempo) {
      plane.visible = false; plane2.visible = false;
      muleNeu.zielTempo = tempo;
    },
    setzeWhitlow(sichtbar) { whitlow.gruppe.visible = sichtbar; },
    blickZu(wer, pos) { zustand[wer + 'Blick'] = pos; },
    update(dt, t) {
      for (const m of mules) {
        m.tempo += (m.zielTempo - m.tempo) * Math.min(1, dt * 1.5);
        m.phase += dt * 0.9 * m.tempo;
        const aus = (0.5 - 0.5 * Math.cos(m.phase)) * 1.5;
        m.wagen.position.z = m.z0 + 1.15 + aus;
        const l = 0.5 + aus;
        m.faeden.scale.y = l;
        m.faeden.position.set(m.MX, 1.12, m.z0 + 0.62 + l / 2);
        m.faeden.rotation.x = -Math.PI / 2 + 0.1;
      }
      for (let i = 0; i < wellen.length; i++) {
        e.set(t * 3.2, 0, 0); q.setFromEuler(e);
        p.set(wellen[i].x, H - 0.75, wellen[i].z);
        m4.compose(p, q, s1); scheiben.setMatrixAt(i, m4);
      }
      scheiben.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NST; i++) {
        const k = i * 3;
        stPos[k] = stSaat[k] + Math.sin(t * 0.21 + i) * 0.5;
        stPos[k + 1] = 0.3 + ((stSaat[k + 1] + t * 0.06 * (0.5 + (i % 5) * 0.2)) % 4.4);
        stPos[k + 2] = stSaat[k + 2] + Math.cos(t * 0.17 + i * 1.7) * 0.5;
      }
      stGeo.attributes.position.needsUpdate = true;
      for (const bk of Object.values(balken)) setzeBalken(bk, dt);
      // Mary arbeitet am Wagen, solange sie nicht angesprochen wird
      animiereFigur(mary, dt, 0);
      if (zustand.maryBlick) {
        dreheZu(mary.gruppe, Math.atan2(zustand.maryBlick.x - mary.gruppe.position.x, zustand.maryBlick.z - mary.gruppe.position.z), dt, 5);
      } else {
        dreheZu(mary.gruppe, Math.PI, dt, 4);
        mary.teile.armL.rotation.x = -0.95 + Math.sin(t * 2.6) * 0.22;
        mary.teile.armR.rotation.x = -0.95 + Math.sin(t * 2.6 + 1.6) * 0.22;
      }
      if (whitlow.gruppe.visible) {
        animiereFigur(whitlow, dt, 0);
        if (zustand.whitlowBlick) dreheZu(whitlow.gruppe, Math.atan2(zustand.whitlowBlick.x - whitlow.gruppe.position.x, zustand.whitlowBlick.z - whitlow.gruppe.position.z), dt, 5);
      }
    },
  };
}

function zifferblatt() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#efe4cc'; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill();
  g.strokeStyle = '#2b2520'; g.lineWidth = 5; g.beginPath(); g.arc(256, 256, 244, 0, 7); g.stroke();
  g.fillStyle = '#2b2520'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '54px "Abril Fatface", Georgia, serif';
  for (let h = 1; h <= 12; h++) {
    const a = (h / 12) * Math.PI * 2;
    g.fillText(String(h), 256 + Math.sin(a) * 205, 256 - Math.cos(a) * 205 + 3);
    g.save(); g.translate(256, 256); g.rotate(a); g.fillRect(-2, -244, 4, 10); g.restore();
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

function messlatte() {
  const px = 128, B = 1.7, HH = 3.9;
  const c = document.createElement('canvas'); c.width = B * px; c.height = HH * px;
  const g = c.getContext('2d');
  g.fillStyle = '#e7dabd'; g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#8a7350'; g.lineWidth = 5; g.strokeRect(4, 4, c.width - 8, c.height - 8);
  g.fillStyle = '#2b2520'; g.strokeStyle = '#2b2520'; g.textAlign = 'right'; g.textBaseline = 'middle';
  g.font = '40px "Abril Fatface", Georgia, serif';
  // Unterkante der Balken liegt 0,2 m über der Tafelunterkante
  const y0 = c.height - 0.2 * px;
  for (let s = 0; s <= 6; s++) {
    const y = y0 - s * SCH * px;
    g.lineWidth = 3; g.beginPath(); g.moveTo(74, y); g.lineTo(c.width - 14, y); g.globalAlpha = 0.45; g.stroke(); g.globalAlpha = 1;
    g.fillText(String(s), 62, y);
  }
  g.font = '19px "Source Serif 4", Georgia, serif'; g.textAlign = 'left';
  g.fillText('Schilling', 14, 30);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
