// Leute, die auf den Straßen unterwegs sind: Sie gehen auf Spuren entlang einer Straße hin und her,
// bleiben an den Enden kurz stehen, weichen der Spielfigur und einander aus.
//
// wege: [{ pfad, von, bis, spuren: [q, …], anzahl, qMin, qMax, figuren: { stand, art }, tempo }]
// Die Spuren sind seitliche Abstände zur Straße (rechts positiv). Feste Hindernisse auf den Spuren (stehende Leute,
// Fahrzeuge, Schlangen) werden umgangen, wenn sie als feste: [{ x, z, r } | { minX, maxX, minZ, maxZ }] übergeben werden.
// boden(x, z): Bodenhöhe (z. B. Gehweg). jahreszeit: 'kalt' | 'warm'.
import * as THREE from 'three';
import { baueFigur, animiereFigur, dreheZu, zufallsFigur } from './figur.js';
import { zufall } from './bausteine.js';

const _p = new THREE.Vector3(), _n = new THREE.Vector3(), _t = new THREE.Vector3();
const _l = { s: 0, q: 0 };

export class Passanten {
  constructor(szene, wege, { seed = 7, epoche = 1845, jahreszeit = 'kalt', feste = [], boden = null } = {}) {
    this.leute = [];
    this.wege = wege;
    this.boden = boden;
    const rnd = zufall(seed);
    // feste Hindernisse als Kreise in Straßenlage (s, q) je Weg
    const kreise = [];
    for (const h of feste) {
      if (h.r !== undefined) { kreise.push(h); continue; }
      const lx = h.maxX - h.minX, lz = h.maxZ - h.minZ, r = Math.min(lx, lz) / 2;
      const n = Math.max(1, Math.ceil(Math.max(lx, lz) / 0.6));
      for (let k = 0; k <= n; k++) {
        const t = k / n;
        kreise.push(lx > lz ? { x: h.minX + r + (lx - 2 * r) * t, z: (h.minZ + h.maxZ) / 2, r } : { x: (h.minX + h.maxX) / 2, z: h.minZ + r + (lz - 2 * r) * t, r });
      }
    }
    for (const w of wege) {
      w.feste = [];
      for (const k of kreise) {
        const l = w.pfad.lage(k.x, k.z);
        if (l.s > w.von - 3 && l.s < w.bis + 3 && l.q > w.qMin - 1.5 && l.q < w.qMax + 1.5) w.feste.push({ s: l.s, q: l.q, r: k.r });
      }
    }
    let i = 0;
    for (const w of wege) {
      for (let k = 0; k < w.anzahl; k++, i++) {
        const def = zufallsFigur(rnd, { epoche, jahreszeit, ...(w.figuren || {}) });
        const f = baueFigur(def);
        f.gruppe.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
        szene.add(f.gruppe);
        const spur = w.spuren[k % w.spuren.length];
        const kind = def.groesse < 1.45;
        this.leute.push({
          f, w, spur, s: w.von + rnd() * (w.bis - w.von), q: spur,
          dir: rnd() < 0.5 ? 1 : -1,
          tempo: ((kind ? 1.05 : 1.15) + rnd() * 0.45) * (w.tempo || 1),
          pause: rnd() < 0.25 ? rnd() * 3 : 0, steht: 0,
          r: 0.28 * Math.max(0.8, def.groesse / 1.7), hind: { x: 0, z: 0, r: 0.3 }, nr: i,
          sichtbar: true,
        });
      }
    }
    this._anteil = 1;
    for (const p of this.leute) this._setze(p);
  }

  // Bei niedriger Grafikqualität ist nur ein Teil der Leute unterwegs.
  setzeAnteil(a) { this._anteil = a; }

  // Kreise für die Kollision der Spielfigur
  hindernisse() { return this._hind || (this._hind = []); }

  _setze(p) {
    const w = p.w;
    w.pfad.punkt(p.s, _p);
    w.pfad.rechts(p.s, _n);
    const x = _p.x + _n.x * p.q, z = _p.z + _n.z * p.q;
    p.f.gruppe.position.set(x, this.boden ? this.boden(x, z) : 0, z);
    p.hind.x = p.f.gruppe.position.x; p.hind.z = p.f.gruppe.position.z; p.hind.r = p.r;
  }

  update(dt, spiel) {
    const kam = spiel.kamera.position;
    const hind = this.hindernisse(); hind.length = 0;
    // Spielfigur und Begleiter auf jeder Straße einmal verorten
    const andere = [spiel.marx.gruppe.position];
    if (spiel.engels?.gruppe.visible) andere.push(spiel.engels.gruppe.position);
    const lagen = new Map();
    for (const w of this.wege) {
      if (lagen.has(w.pfad)) continue;
      lagen.set(w.pfad, andere.map((a) => { const l = w.pfad.lage(a.x, a.z); return { s: l.s, q: l.q }; }));
    }
    const n = this.leute.length;
    for (let i = 0; i < n; i++) {
      const p = this.leute[i];
      const aktiv = this._anteil >= 1 || (i % Math.round(1 / this._anteil)) === 0;
      const g = p.f.gruppe;
      const nah = Math.hypot(g.position.x - kam.x, g.position.z - kam.z) < 85;
      g.visible = aktiv && nah;
      if (!aktiv) continue;
      if (g.visible) hind.push(p.hind);
      const w = p.w;
      // Ausweichen: Wer vorn im Weg ist, wird seitlich umgangen; ist es zu eng, bleibt man stehen.
      let ziel = p.spur, halt = false;
      const pruefe = (s, q, r) => {
        const ds = (s - p.s) * p.dir, dq = q - p.q;
        if (ds < -0.2 || ds > 2.6 || Math.abs(dq) > 0.95 + r) return;
        const seite = dq > 0.05 ? -1 : dq < -0.05 ? 1 : (p.nr % 2 ? 1 : -1);
        let z = q + seite * (0.95 + r);
        if (z < w.qMin || z > w.qMax) z = q - seite * (0.95 + r);
        if (Math.abs(z - p.spur) < Math.abs(ziel - p.spur) || ziel === p.spur) ziel = Math.max(w.qMin, Math.min(w.qMax, z));
        if (ds < 0.75 + r && Math.abs(dq) < 0.5 + r) halt = true;
      };
      for (const l of lagen.get(w.pfad)) pruefe(l.s, l.q, 0.35);
      for (const h of w.feste) if (Math.abs(h.s - p.s) < 3) pruefe(h.s, h.q, h.r);
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const o = this.leute[j];
        if (o.w.pfad !== w.pfad || !o.f.gruppe.visible) continue;
        if (Math.abs(o.s - p.s) < 3) pruefe(o.s, o.q, o.r);
      }
      let tempo = 0;
      if (p.pause > 0) {
        p.pause -= dt;
      } else if (halt) {
        p.steht += dt;
        if (p.steht > 3.5) { p.dir *= -1; p.steht = 0; }
      } else {
        p.steht = 0;
        p.s += p.dir * p.tempo * dt;
        tempo = p.tempo / 1.7;
        if (p.s > w.bis || p.s < w.von) {
          p.s = Math.max(w.von, Math.min(w.bis, p.s));
          p.dir *= -1;
          p.pause = 0.8 + Math.random() * 2.5;
        }
      }
      p.q += Math.max(-0.9 * dt, Math.min(0.9 * dt, ziel - p.q));
      this._setze(p);
      if (!g.visible) continue;
      // Blickrichtung: Laufrichtung, leicht zur Seite beim Ausweichen
      w.pfad.tangente(p.s, _t);
      const ry = Math.atan2(_t.x * p.dir, _t.z * p.dir) - Math.max(-0.5, Math.min(0.5, (ziel - p.q) * 0.6)) * p.dir;
      dreheZu(g, ry, dt, 6);
      animiereFigur(p.f, dt, tempo);
    }
  }
}
