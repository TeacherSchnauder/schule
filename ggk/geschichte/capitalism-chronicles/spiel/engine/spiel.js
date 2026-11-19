// Spielkern: Schleife, Bewegung auf der Straße und in Stationsbereichen, Kamera, Interaktion, Speicherung.
import * as THREE from 'three';
import { baueFigur, animiereFigur, dreheZu, FIGUREN } from './figur.js';
import { Steuerung } from './steuerung.js';
import { ladeStand, speichereStand, loescheStand, neuerStand } from './speicher.js';
import { musik } from './musik.js';

const TEMPO = 4.3;          // Gehgeschwindigkeit in m/s
const RADIUS = 0.36;        // Körperradius für Hindernisse
const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _ziel = new THREE.Vector3();

const winkelDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
const begrenze = (x, a, b) => Math.max(a, Math.min(b, x));
const weich = (t) => t * t * (3 - 2 * t);

export class Spiel {
  constructor(canvas, ui) {
    this.canvas = canvas;
    this.ui = ui;
    this.zustand = 'laden';   // laden | titel | fahrt | spiel
    this.sperren = 0;
    this.zeit = 0;
    this.interaktionen = [];
    this.naechste = null;
    this.beiBild = [];        // Rückrufe (dt, zeit)
    this.stand = ladeStand() || neuerStand();
    this.hatStand = !!ladeStand();

    this.touch = window.matchMedia('(pointer: coarse)').matches;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.AgXToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.kamera = new THREE.PerspectiveCamera(55, 1, 0.3, 700);
    this.kam = { yaw: Math.PI, blick: 0, neig: 0.3, abstand: 6.6, fest: null, sprung: true, ruhe: 0 };

    this.steuerung = new Steuerung(canvas, ui.joystick);
    this.steuerung.beiTaste = (code) => this._taste(code);

    this.marx = baueFigur(FIGUREN.marx);
    this.engels = baueFigur(FIGUREN.engels);
    for (const f of [this.marx, this.engels]) f.gruppe.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    // Der Begleiter wird durchscheinend, wenn er zwischen Kamera und Spielfigur steht.
    this.engels.gruppe.traverse(o => { if (o.isMesh) o.material = o.material.clone(); });
    this._durch = 1;
    this.pos = this.marx.gruppe.position;
    this.ort = { art: 'schiene', s: 0, bereich: null, pfad: 'a' };
    this.szeneName = 'aussen';

    // Zielmarker: kleine Messingraute über dem nächsten Ziel
    const mg = new THREE.OctahedronGeometry(0.22, 0);
    mg.scale(1, 1.5, 1);
    this.marker = new THREE.Mesh(mg, new THREE.MeshBasicMaterial({ color: 0xe0b860 }));
    this.marker.visible = false;
    this.ring = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.7, 24), new THREE.MeshBasicMaterial({ color: 0xe0b860, transparent: true, opacity: 0.75, depthWrite: false }));
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    this.ziel = null;

    this.qualitaet = this.stand.qualitaet || (this.touch ? 'mittel' : 'hoch');
    this._fps = { n: 0, t: 0, geprueft: false };

    window.addEventListener('resize', () => this._groesse());
    this._letzte = performance.now();
    this._speicherUhr = 0;
  }

  // -------------------------------------------------------------------------
  setzeWelt(welt) {
    this.welt = welt;
    this.pfade = welt.pfade;
    this.pfad = welt.pfade[this.ort.pfad] || welt.pfade.a;
    this.setzeQualitaet(this.qualitaet, false);
    this._groesse();
  }

  get szene() { return this.welt.szenen[this.szeneName].szene; }
  get bereich() { return this.ort.art === 'frei' ? this.welt.bereiche[this.ort.bereich] : null; }
  // Begehbarer Streifen der aktuellen Straße (falls das Kapitel einen angibt): dann geht man auf der Straße frei.
  get korridor() { return this.ort.art === 'schiene' ? this.welt.korridore?.[this.ort.pfad] || null : null; }
  korridorFrei(x, z) { const k = this.korridor; return k ? k.frei(x, z, RADIUS) : true; }
  get blockiert() { return this.sperren > 0 || this.zustand !== 'spiel'; }

  sperre() { this.sperren++; this.steuerung.loslassen(); this.ui.versteckeHinweis(); }
  entsperre() { this.sperren = Math.max(0, this.sperren - 1); this.steuerung.gesperrt = true; }

  setzeQualitaet(q, merken = true) {
    this.qualitaet = q;
    const pr = q === 'hoch' ? 2 : q === 'mittel' ? 1.5 : 1;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pr));
    const gr = q === 'hoch' ? 2048 : 1024;
    for (const k in this.welt.szenen) {
      const so = this.welt.szenen[k].sonne;
      if (!so) continue;
      so.castShadow = q !== 'niedrig';
      if (so.shadow.mapSize.x !== gr) {
        so.shadow.mapSize.set(gr, gr);
        if (so.shadow.map) { so.shadow.map.dispose(); so.shadow.map = null; }
      }
    }
    if (merken) { this.stand.qualitaet = q; this.sichere(); }
    this._groesse();
  }

  _groesse() {
    const b = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(b, h, false);
    this.kamera.aspect = b / h;
    this.kamera.fov = b / h < 0.9 ? 70 : (b / h < 1.3 ? 62 : 55);
    this.kamera.updateProjectionMatrix();
  }

  // -------------------------------------------------------------------------
  // Ortswechsel

  aktiviereSzene(name) {
    this.szeneName = name;
    // Raummusik: Kapitel können den Schlüssel verfeinern (z. B. Jahr der Straße in Kapitel II).
    musik.raum(this.musikSchluessel ? this.musikSchluessel(name) : name);
    const s = this.szene;
    s.add(this.marx.gruppe, this.engels.gruppe, this.marker, this.ring);
    this.engels.gruppe.visible = !this.ohneBegleiter;
    this.kam.sprung = true;
  }

  aufStrasse(s, rueckwaerts = false, sperren = true, pfad = null) {
    const id = pfad || this.ort.pfad || 'a';
    this.pfad = this.pfade[id];
    this.ort = { art: 'schiene', s: begrenze(s, 0, this.pfad.laenge), bereich: null, pfad: id };
    this.pfad.punkt(this.ort.s, this.pos);
    const t = this.pfad.tangente(this.ort.s, _v);
    const ry = Math.atan2(t.x, t.z);
    this.marx.gruppe.rotation.y = rueckwaerts ? ry + Math.PI : ry;
    // Blickte die Kamera schon in Straßenrichtung, bleibt die Bedeutung der Tasten gleich: keine Sperre nötig.
    const gleich = Math.cos(this.kam.yaw - ry) > 0.5;
    this.kam.yaw = ry; this.kam.blick = 0;
    this._setzeBegleiter();
    this.steuerung.gesperrt = sperren && !gleich;
  }

  inBereich(id, x, z, ry = null, sperren = true) {
    const b = this.welt.bereiche[id];
    this.ort = { art: 'frei', s: this.ort.s, bereich: id, pfad: this.ort.pfad };
    this.pos.set(x, 0, z);
    this._befreie(b);
    if (ry !== null) { this.marx.gruppe.rotation.y = ry; this.kam.yaw = ry; }
    this.kam.blick = 0;
    this._setzeBegleiter();
    this.steuerung.gesperrt = sperren;
  }

  async wechsleSzene(name, bereich, x, z, ry) {
    this.sperre();
    await this.ui.blende(true);
    this.aktiviereSzene(name);
    if (bereich) this.inBereich(bereich, x, z, ry);
    this._kamera(0.016);
    this.sichere();
    await this.ui.blende(false);
    this.entsperre();
  }

  _setzeBegleiter() {
    const ry = this.marx.gruppe.rotation.y;
    const e = this.engels.gruppe;
    if (this.ort.art === 'schiene') {
      const n = this.pfad.rechts(this.ort.s, _v);
      this.pfad.punkt(this.ort.s - 0.5, e.position).addScaledVector(n, 1.1);
      const k = this.korridor;
      if (k && !k.frei(e.position.x, e.position.z, RADIUS)) e.position.copy(this.pos);
    } else {
      e.position.set(this.pos.x - Math.cos(ry) * 0.95 - Math.sin(ry) * 0.7, 0, this.pos.z + Math.sin(ry) * 0.95 - Math.cos(ry) * 0.7);
      const b = this.bereich;
      if (b && !this._begehbar(b, e.position.x, e.position.z)) e.position.copy(this.pos);
    }
    e.rotation.y = ry;
  }

  // -------------------------------------------------------------------------
  // Interaktion

  registriere(i) {
    // { id, szene, pos: Vector3 | () => Vector3, radius, hoehe, text, wenn: () => bool, tu: () => void }
    this.interaktionen = this.interaktionen.filter(x => x.id !== i.id);
    this.interaktionen.push({ radius: 2.5, hoehe: 2.0, wenn: () => true, ...i });
  }

  setzeZiel(text, pos = null, szene = null) {
    this.ziel = pos ? { pos, szene: szene || this.szeneName } : null;
    this.ui.setzeZiel(text);
  }

  interagiere() {
    if (this.blockiert || !this.naechste) return;
    const n = this.naechste;
    this.naechste = null;
    this.ui.versteckeHinweis();
    n.tu();
  }

  _taste(code) {
    if (this.ui.taste(code)) return;
    if (code === 'KeyE' || code === 'Space' || code === 'Enter') this.interagiere();
    else if (code === 'KeyT') this.ui.oeffneTagebuch();
    else if (code === 'KeyM') this.ui.oeffneStadtplan();
  }

  _interaktion() {
    if (this.blockiert || this.kam.fest) { this.naechste = null; this.ui.versteckeHinweis(); this.ring.visible = false; return; }
    let best = null, bd = 1e9;
    for (const i of this.interaktionen) {
      if (i.szene !== this.szeneName || !i.wenn()) continue;
      const p = typeof i.pos === 'function' ? i.pos() : i.pos;
      const d = Math.hypot(p.x - this.pos.x, p.z - this.pos.z);
      if (d < i.radius && d < bd) { best = i; bd = d; }
    }
    this.naechste = best;
    if (best) {
      const p = typeof best.pos === 'function' ? best.pos() : best.pos;
      _v.set(p.x, best.hoehe, p.z).project(this.kamera);
      const sx = (_v.x * 0.5 + 0.5) * window.innerWidth;
      const sy = (-_v.y * 0.5 + 0.5) * window.innerHeight;
      this.ui.zeigeHinweis(best.text, sx, sy, _v.z < 1);
      this.ring.visible = true;
      this.ring.position.set(p.x, 0.06, p.z);
      const s = 1 + Math.sin(this.zeit * 4) * 0.06;
      this.ring.scale.set(s, s, s);
    } else {
      this.ui.versteckeHinweis();
      this.ring.visible = false;
    }
  }

  // -------------------------------------------------------------------------
  // Bewegung

  _begehbar(b, x, z) {
    let innen = false;
    for (const f of b.flaechen) {
      if (x >= f.minX + RADIUS && x <= f.maxX - RADIUS && z >= f.minZ + RADIUS && z <= f.maxZ - RADIUS) { innen = true; break; }
    }
    if (!innen) return false;
    for (const h of b.hindernisse) {
      if (h.aus && h.aus()) continue;
      if (h.r !== undefined) {
        if (Math.hypot(x - h.x, z - h.z) < h.r + RADIUS) return false;
      } else if (x > h.minX - RADIUS && x < h.maxX + RADIUS && z > h.minZ - RADIUS && z < h.maxZ + RADIUS) return false;
    }
    // bewegliche Hindernisse (Leute, die unterwegs sind)
    if (b.dynamisch) for (const h of b.dynamisch()) if (Math.hypot(x - h.x, z - h.z) < h.r + RADIUS) return false;
    return true;
  }

  // Liegt die Figur in einem Hindernis (z. B. nach dem Laden eines Spielstands), wird sie zum nächsten freien Punkt versetzt.
  _befreie(b) {
    if (!b || this._begehbar(b, this.pos.x, this.pos.z)) return;
    for (let r = 0.25; r <= 6; r += 0.25) {
      for (let k = 0; k < 16; k++) {
        const w = (k / 16) * Math.PI * 2;
        const x = this.pos.x + Math.cos(w) * r, z = this.pos.z + Math.sin(w) * r;
        if (this._begehbar(b, x, z)) { this.pos.x = x; this.pos.z = z; return; }
      }
    }
  }

  // Bewegt einen Punkt um (dx, dz). Ist der Weg versperrt, wird schräg am Hindernis entlang ausgewichen,
  // statt stehen zu bleiben: So bleibt man an Ecken, Säulen und Personen nicht hängen.
  _schiebe(ok, x, z, dx, dz) {
    if (ok(x + dx, z + dz)) return [x + dx, z + dz];
    for (const w of [0.4, -0.4, 0.8, -0.8, 1.2, -1.2, 1.5, -1.5]) {
      const c = Math.cos(w), s = Math.sin(w), f = Math.max(0.3, c);
      const nx = (dx * c - dz * s) * f, nz = (dx * s + dz * c) * f;
      if (ok(x + nx, z + nz)) return [x + nx, z + nz];
    }
    return [x, z];
  }

  // Steht die Figur auf keinem freien Punkt (z. B. nach dem Laden), wird sie zum nächsten freien Punkt versetzt.
  _befreieMit(ok, p) {
    if (ok(p.x, p.z)) return;
    for (let r = 0.25; r <= 6; r += 0.25) {
      for (let k = 0; k < 16; k++) {
        const w = (k / 16) * Math.PI * 2;
        const x = p.x + Math.cos(w) * r, z = p.z + Math.sin(w) * r;
        if (ok(x, z)) { p.x = x; p.z = z; return; }
      }
    }
  }

  // Freies Gehen auf einer Straße mit Korridor. Die Lage auf der Straße (s) steuert weiter Sperren, Enden und Ereignisse.
  _bewegeKorridor(dt, a, k) {
    const m = this.marx;
    if (a.x === 0 && a.y === 0) return 0;
    const yaw = this.kam.yaw;
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const dx = (fx * a.y - fz * a.x), dz = (fz * a.y + fx * a.x);
    const l = Math.hypot(dx, dz) || 1;
    const sx = dx * TEMPO * dt, sz = dz * TEMPO * dt;
    const ok = (x, z) => k.frei(x, z, RADIUS);
    const L = this.pfad.laenge;
    const enden = this.welt.enden[this.ort.pfad] || {};
    dreheZu(m.gruppe, Math.atan2(dx / l, dz / l), dt, 11);
    // Ende oder Anfang der Straße erreicht? Dann wie bisher in den angrenzenden Bereich wechseln.
    const roh = this.pfad.lage(this.pos.x + sx, this.pos.z + sz);
    const e = roh.s >= L ? enden.ende : (roh.s <= 0 ? enden.anfang : null);
    if (e && Math.abs(roh.q) < k.endeBreite && (!e.wenn || e.wenn())) {
      const vor = roh.s >= L;
      const ep = this.engels.gruppe.position.clone();
      const ry = this._bahnYaw() + (vor ? 0 : Math.PI);
      this.inBereich(e.bereich, e.x, e.z, null, false);
      this.engels.gruppe.position.copy(ep);
      this.marx.gruppe.rotation.y = ry;
      if (Math.cos(this.kam.yaw - ry) < 0.3) { this.kam.yaw = ry; this.steuerung.gesperrt = true; }
      this.beiBereich?.(e.bereich);
      return 0;
    }
    if (!ok(this.pos.x, this.pos.z)) this._befreieMit(ok, this.pos);
    const [nx, nz] = this._schiebe(ok, this.pos.x, this.pos.z, sx, sz);
    if (nx === this.pos.x && nz === this.pos.z) return 0;
    const neu = this.pfad.lage(nx, nz);
    // Sperren auf der Straße: erst nach dem Fund der Station geht es weiter
    for (const sp of enden.sperren || []) {
      if (!sp.offen() && this.ort.s <= sp.s && neu.s > sp.s) { sp.tu?.(); return 0; }
    }
    const weg = Math.hypot(nx - this.pos.x, nz - this.pos.z);
    this.pos.x = nx; this.pos.z = nz;
    this.ort.s = begrenze(neu.s, 0, L);
    this.beiStrecke?.(this.ort.s, this.ort.pfad);
    return Math.min(1, Math.hypot(a.x, a.y), weg / (TEMPO * dt) + 0.2);
  }

  _bewege(dt) {
    const a = this.steuerung.achsen();
    const m = this.marx;
    let tempo = 0;
    const k = this.korridor;
    if (k) {
      tempo = this._bewegeKorridor(dt, a, k);
      if (this.ort.art !== 'schiene') return;     // in einen Bereich gewechselt
    } else if (this.ort.art === 'schiene') {
      const L = this.pfad.laenge;
      if (a.y !== 0) {
        let s = this.ort.s + a.y * TEMPO * dt;
        const enden = this.welt.enden[this.ort.pfad] || {};
        const e = s >= L && a.y > 0 ? enden.ende : (s <= 0 && a.y < 0 ? enden.anfang : null);
        if (e && (!e.wenn || e.wenn())) {
          const ep = this.engels.gruppe.position.clone();
          const yaw = this._bahnYaw() + (a.y < 0 ? Math.PI : 0);
          this.inBereich(e.bereich, e.x, e.z, null, false);
          this.engels.gruppe.position.copy(ep);
          this.kam.yaw = yaw; this.marx.gruppe.rotation.y = yaw;
          if (a.y < 0) this.steuerung.gesperrt = true;
          this.beiBereich?.(e.bereich);
          return;
        }
        s = begrenze(s, 0, L);
        // Sperren auf der Straße: erst nach dem Fund der Station geht es weiter
        for (const sp of enden.sperren || []) {
          if (!sp.offen() && this.ort.s <= sp.s && s > sp.s) { s = sp.s; sp.tu?.(); }
        }
        if (s !== this.ort.s) tempo = Math.abs(a.y);
        this.ort.s = s;
        this.pfad.punkt(s, this.pos);
        const t = this.pfad.tangente(s, _v);
        dreheZu(m.gruppe, Math.atan2(t.x, t.z) + (a.y < 0 ? Math.PI : 0), dt, 9);
        this.beiStrecke?.(s, this.ort.pfad);
      }
    } else {
      const b = this.bereich;
      if (a.x !== 0 || a.y !== 0) {
        const yaw = this.kam.yaw;
        const fx = Math.sin(yaw), fz = Math.cos(yaw);
        const dx = (fx * a.y - fz * a.x), dz = (fz * a.y + fx * a.x);
        const l = Math.hypot(dx, dz) || 1;
        const sx = dx * TEMPO * dt, sz = dz * TEMPO * dt;
        if (!this._begehbar(b, this.pos.x, this.pos.z)) this._befreie(b);
        const [nx, nz] = this._schiebe((x, z) => this._begehbar(b, x, z), this.pos.x, this.pos.z, sx, sz);
        if (nx !== this.pos.x || nz !== this.pos.z) tempo = Math.min(1, Math.hypot(a.x, a.y));
        this.pos.x = nx; this.pos.z = nz;
        dreheZu(m.gruppe, Math.atan2(dx / l, dz / l), dt, 11);
        for (const g of b.ausgaenge || []) {
          if (nx >= g.minX && nx <= g.maxX && nz >= g.minZ && nz <= g.maxZ && (!g.wenn || g.wenn())) { g.tu(this); return; }
        }
      }
    }
    animiereFigur(m, dt, tempo);
    this._tempo = tempo;
  }

  _bahnYaw() {
    const t = this.pfad.tangente(this.ort.s, _v);
    return Math.atan2(t.x, t.z);
  }

  _begleiter(dt) {
    const e = this.engels, ep = e.gruppe.position;
    const ry = this.marx.gruppe.rotation.y;
    const k = this.korridor;
    if (this.ort.art === 'schiene' && !k) {
      const n = this.pfad.rechts(this.ort.s, _v);
      this.pfad.punkt(this.ort.s - 0.5, _ziel).addScaledVector(n, 1.1);
    } else {
      // im Bereich und im Korridor: Abstand zu Marx halten statt einem festen Punkt nachzulaufen
      let ux = ep.x - this.pos.x, uz = ep.z - this.pos.z;
      const ab = Math.hypot(ux, uz);
      if (ab < 1e-3) { ux = -Math.cos(ry); uz = Math.sin(ry); } else { ux /= ab; uz /= ab; }
      if (ab > 1.9 || ab < 0.75) _ziel.set(this.pos.x + ux * 1.35, 0, this.pos.z + uz * 1.35);
      else _ziel.copy(ep);
    }
    const dx = _ziel.x - ep.x, dz = _ziel.z - ep.z;
    const d = Math.hypot(dx, dz);
    let tempo = 0;
    const schwelle = 0.08;
    if (d > schwelle) {
      const v = Math.min(TEMPO * 1.12, d * 3.2 + 0.4);
      const schritt = Math.min(d, v * dt);
      let nx = ep.x + dx / d * schritt, nz = ep.z + dz / d * schritt;
      const b = this.bereich;
      const ok = b ? (x, z) => this._begehbar(b, x, z) : k ? (x, z) => k.frei(x, z, RADIUS * 0.9) : null;
      // Steht der Begleiter gerade auf keinem freien Punkt (z. B. nach einem Ortswechsel), geht er ungehindert weiter.
      if (ok && ok(ep.x, ep.z) && !ok(nx, nz)) [nx, nz] = this._schiebe(ok, ep.x, ep.z, nx - ep.x, nz - ep.z);
      const weg = Math.hypot(nx - ep.x, nz - ep.z);
      if (weg > 1e-4) {
        tempo = Math.min(1, weg / dt / TEMPO);
        dreheZu(e.gruppe, Math.atan2(nx - ep.x, nz - ep.z), dt, 9);
      }
      ep.x = nx; ep.z = nz;
    } else {
      // im Stand: zur Spielfigur oder in Blickrichtung drehen
      const zu = this.engelsBlick ?? ry;
      dreheZu(e.gruppe, zu, dt, 4);
    }
    animiereFigur(e, dt, tempo);
  }

  // -------------------------------------------------------------------------
  // Kamera

  kameraFest(pos, ziel) { this.kam.fest = { pos: pos.clone(), ziel: ziel.clone() }; this.marx.gruppe.visible = this.engels.gruppe.visible = false; }
  kameraFrei() { this.kam.fest = null; this.marx.gruppe.visible = true; this.engels.gruppe.visible = !this.ohneBegleiter; }

  // Tauscht die Spielfigur aus (anderes Kapitel, andere Rolle, andere Kleidung). Ort und Blickrichtung bleiben.
  wechsleFigur(def) {
    const alt = this.marx, neu = baueFigur(def);
    neu.gruppe.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
    neu.gruppe.position.copy(alt.gruppe.position); neu.gruppe.rotation.y = alt.gruppe.rotation.y;
    neu.gruppe.visible = alt.gruppe.visible;
    const eltern = alt.gruppe.parent;
    if (eltern) { eltern.remove(alt.gruppe); eltern.add(neu.gruppe); }
    this.marx = neu; this.pos = neu.gruppe.position;
  }

  // Feste Ansicht auf eine Wandfläche; lässt unten Platz für das Bedienfeld.
  kameraAufFlaeche(mitte, normale, breite, hoehe, anteilOben = 0.54) {
    const tanV = Math.tan(THREE.MathUtils.degToRad(this.kamera.fov / 2));
    const dH = (hoehe / 2) / (tanV * anteilOben);
    const dB = (breite / 2) / (tanV * this.kamera.aspect);
    const d = Math.max(dH, dB);
    const H = d * tanV;
    const ziel = mitte.clone().add(new THREE.Vector3(0, -(1 - anteilOben) * H, 0));
    const pos = ziel.clone().addScaledVector(normale, d);
    this.kameraFest(pos, ziel);
  }

  _kamera(dt) {
    const k = this.kam, cam = this.kamera;
    const blick = this.steuerung.nimmBlick();
    if (this.zustand === 'titel' || this.zustand === 'fahrt') return;
    if (k.fest) {
      const r = k.sprung ? 1 : Math.min(1, dt * 4.5);
      cam.position.lerp(k.fest.pos, r);
      this._blickZiel = (this._blickZiel || k.fest.ziel.clone()).lerp(k.fest.ziel, r);
      cam.lookAt(this._blickZiel);
      k.sprung = false;
      return;
    }
    if (!this.blockiert) {
      if (blick.dx || blick.dy) k.ruhe = 0;
      k.neig = begrenze(k.neig + blick.dy * 0.004, 0.1, 0.75);
      if (this.ort.art === 'schiene' && !this.korridor) k.blick = begrenze(k.blick - blick.dx * 0.005, -0.85, 0.85);
      else k.yaw -= blick.dx * 0.005;
    }
    k.ruhe += dt;
    let yaw;
    if (this.ort.art === 'schiene' && !this.korridor) {
      const bahn = this._bahnYaw();
      k.yaw += winkelDiff(bahn, k.yaw) * Math.min(1, dt * 3);
      if (this._tempo > 0.1 && !this.steuerung.zieht()) k.blick *= Math.max(0, 1 - dt * 1.2);
      yaw = k.yaw + k.blick;
    } else {
      // sanft hinter die Laufrichtung drehen, wenn länger nicht umgesehen wurde
      if (this._tempo > 0.1 && k.ruhe > 1.2 && !this.steuerung.zieht()) {
        const d = winkelDiff(this.marx.gruppe.rotation.y, k.yaw);
        if (Math.abs(d) < 2.0) k.yaw += d * Math.min(1, dt * 0.9);
      }
      yaw = k.yaw;
    }
    const b = this.bereich;
    const abst = b?.kamera?.abstand ?? 6.6;
    k.abstand += (abst - k.abstand) * Math.min(1, dt * 3);
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    _ziel.set(this.pos.x, 1.5, this.pos.z);
    const ch = Math.cos(k.neig) * k.abstand, sh = Math.sin(k.neig) * k.abstand;
    _w.set(_ziel.x - fx * ch, _ziel.y + sh, _ziel.z - fz * ch);
    const kor = this.korridor;
    if (kor?.kamera) {
      // Kamera nicht in Häuser oder den Zug stellen: entlang der Blickachse näher an die Figur rücken.
      const ox = _w.x - _ziel.x, oz = _w.z - _ziel.z;
      let t = 1;
      while (t > 0.3 && !kor.luft(_ziel.x + ox * t, _ziel.z + oz * t)) t -= 0.05;
      _w.x = _ziel.x + ox * t; _w.z = _ziel.z + oz * t;
      _w.y += (1 - t) * 0.6;
    }
    const g = b?.kamera?.grenzen;
    if (g) {
      // Stößt die Kamera an eine Wand, rückt sie entlang der Blickachse näher an die Figur.
      const ox = _w.x - _ziel.x, oy = _w.y - _ziel.y, oz = _w.z - _ziel.z;
      let t = 1;
      if (ox > 1e-4) t = Math.min(t, (g.maxX - _ziel.x) / ox); else if (ox < -1e-4) t = Math.min(t, (g.minX - _ziel.x) / ox);
      if (oz > 1e-4) t = Math.min(t, (g.maxZ - _ziel.z) / oz); else if (oz < -1e-4) t = Math.min(t, (g.minZ - _ziel.z) / oz);
      if (oy > 1e-4 && g.maxY !== undefined) t = Math.min(t, (g.maxY - _ziel.y) / oy);
      t = begrenze(t, 0.55, 1);
      _w.set(_ziel.x + ox * t, _ziel.y + oy * t, _ziel.z + oz * t);
      _w.x = begrenze(_w.x, g.minX, g.maxX);
      _w.z = begrenze(_w.z, g.minZ, g.maxZ);
      if (g.maxY !== undefined) _w.y = Math.min(_w.y, g.maxY);
    }
    if (k.sprung) { cam.position.copy(_w); k.sprung = false; this._blickZiel = null; }
    else cam.position.lerp(_w, Math.min(1, dt * 7));
    _ziel.y += 0.25;
    this._blickZiel = (this._blickZiel || _ziel.clone()).lerp(_ziel, Math.min(1, dt * 12));
    cam.lookAt(this._blickZiel);
    this._begleiterSicht(dt);
  }

  _begleiterSicht(dt) {
    const e = this.engels.gruppe.position, c = this.kamera.position, p = this.pos;
    const vx = p.x - c.x, vz = p.z - c.z, l2 = vx * vx + vz * vz || 1;
    const t = ((e.x - c.x) * vx + (e.z - c.z) * vz) / l2;
    const abst = Math.abs((e.x - c.x) * vz - (e.z - c.z) * vx) / Math.sqrt(l2);
    const ziel = t > -0.1 && t < 0.92 && abst < 0.6 ? 0.28 : 1;
    if (Math.abs(ziel - this._durch) < 0.005 && (ziel === 1 || this._durch === ziel)) return;
    this._durch += (ziel - this._durch) * Math.min(1, dt * 8);
    if (Math.abs(ziel - this._durch) < 0.01) this._durch = ziel;
    const d = this._durch;
    this.engels.gruppe.traverse(o => { if (o.isMesh) { o.material.transparent = d < 1; o.material.opacity = d; o.material.depthWrite = d >= 1; } });
  }

  // Kamerafahrt vom Titelbild zur Spielfigur
  setzeTitelKamera() {
    const t = this.welt.titelKamera;
    this.kamera.position.copy(t.pos);
    this.kamera.lookAt(t.ziel);
  }

  fahrt(dauer = 5.5) {
    return new Promise((fertig) => {
      this.zustand = 'fahrt';
      const t = this.welt.titelKamera;
      const p0 = t.pos.clone(), z0 = t.ziel.clone();
      // Zielpose wie im Spiel
      const yaw = this.kam.yaw;
      const z1 = new THREE.Vector3(this.pos.x, 1.75, this.pos.z);
      const p1 = new THREE.Vector3(z1.x - Math.sin(yaw) * Math.cos(this.kam.neig) * this.kam.abstand, 1.5 + Math.sin(this.kam.neig) * this.kam.abstand, z1.z - Math.cos(yaw) * Math.cos(this.kam.neig) * this.kam.abstand);
      const mitte = p0.clone().lerp(p1, 0.5); mitte.y += 7;
      const kurve = new THREE.QuadraticBezierCurve3(p0, mitte, p1);
      let u = 0;
      const zz = new THREE.Vector3();
      const schritt = (dt) => {
        u = Math.min(1, u + dt / dauer);
        const w = weich(u);
        kurve.getPoint(w, this.kamera.position);
        zz.copy(z0).lerp(z1, weich(Math.min(1, u * 1.15)));
        this.kamera.lookAt(zz);
        if (u >= 1 || this._fahrtEnde) {
          this.beiBild = this.beiBild.filter(f => f !== schritt);
          this._fahrtEnde = false;
          this.kam.sprung = true;
          this.zustand = 'spiel';
          fertig();
        }
      };
      this.beiBild.push(schritt);
    });
  }
  ueberspringeFahrt() { if (this.zustand === 'fahrt') this._fahrtEnde = true; }

  // -------------------------------------------------------------------------
  // Speichern

  sichere() {
    const o = this.stand.ort;
    o.art = this.ort.art; o.s = this.ort.s; o.bereich = this.ort.bereich; o.pfad = this.ort.pfad;
    o.x = this.pos.x; o.z = this.pos.z; o.szene = this.szeneName;
    return speichereStand(this.stand);
  }

  setzeZurueck() {
    loescheStand();
    window.location.reload();
  }

  // -------------------------------------------------------------------------
  start() {
    this.renderer.setAnimationLoop((ms) => this._bild(ms));
  }

  _bild(ms) {
    const dt = Math.min(0.1, Math.max(0.001, (ms - this._letzte) / 1000));
    this._letzte = ms;
    this.zeit += dt;

    if (this.zustand === 'spiel' && !this.blockiert) this._bewege(dt);
    else { animiereFigur(this.marx, dt, 0); this._tempo = 0; }
    if (this.zustand !== 'laden' && !this.ohneBegleiter) this._begleiter(dt);
    for (const f of this.beiBild.slice()) f(dt, this.zeit);
    this._kamera(dt);
    this._interaktion();

    // Zielmarker
    const z = this.ziel;
    if (z && z.szene === this.szeneName && this.zustand === 'spiel' && !this.kam.fest) {
      const p = typeof z.pos === 'function' ? z.pos() : z.pos;
      this.marker.visible = true;
      this.marker.position.set(p.x, (p.y ?? 2.6) + Math.sin(this.zeit * 2.4) * 0.12, p.z);
      this.marker.rotation.y = this.zeit * 1.6;
    } else this.marker.visible = false;

    const so = this.welt.szenen[this.szeneName];
    if (so.folgeSonne) so.folgeSonne(this.zustand === 'spiel' ? this.pos : this.welt.titelKamera.fokus);
    this.welt.update(dt, this.zeit, this);
    this.renderer.render(this.szene, this.kamera);

    // Position regelmäßig sichern
    if (this.zustand === 'spiel') {
      this._speicherUhr += dt;
      if (this._speicherUhr > 4) { this._speicherUhr = 0; this.sichere(); }
      this._messe(dt);
    }
  }

  // Senkt die Grafikqualität einmalig, wenn das Gerät zu langsam ist.
  _messe(dt) {
    const f = this._fps;
    if (f.geprueft) return;
    f.n++; f.t += dt;
    if (f.t > 4) {
      f.geprueft = true;
      const fps = f.n / f.t;
      if (fps < 27 && this.qualitaet !== 'niedrig' && !this.stand.qualitaet) {
        this.setzeQualitaet(this.qualitaet === 'hoch' ? 'mittel' : 'niedrig', false);
        this.ui.melde('Grafikqualität wurde für dieses Gerät verringert.');
      }
    }
  }
}
