// Die fest definierte Straße: eine Kurve, auf der sich die Figuren nur vor und zurück bewegen.
import * as THREE from 'three';

const _hv = new THREE.Vector3(), _hn = new THREE.Vector3();

export class Pfad {
  constructor(punkte) {
    this.kurve = new THREE.CatmullRomCurve3(
      punkte.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'centripetal');
    this.kurve.arcLengthDivisions = 600;
    this.laenge = this.kurve.getLength();
    this._t0 = this.kurve.getTangentAt(0).clone();
    this._t1 = this.kurve.getTangentAt(1).clone();
    this._p0 = this.kurve.getPointAt(0).clone();
    this._p1 = this.kurve.getPointAt(1).clone();
  }

  // Punkt bei Bogenlänge s (Meter). Außerhalb der Kurve wird geradlinig verlängert.
  punkt(s, ziel = new THREE.Vector3()) {
    if (s <= 0) return ziel.copy(this._p0).addScaledVector(this._t0, s);
    if (s >= this.laenge) return ziel.copy(this._p1).addScaledVector(this._t1, s - this.laenge);
    return this.kurve.getPointAt(s / this.laenge, ziel);
  }

  tangente(s, ziel = new THREE.Vector3()) {
    if (s <= 0) return ziel.copy(this._t0);
    if (s >= this.laenge) return ziel.copy(this._t1);
    return this.kurve.getTangentAt(s / this.laenge, ziel).setY(0).normalize();
  }

  // Normale nach rechts (in Laufrichtung gesehen).
  rechts(s, ziel = new THREE.Vector3()) {
    this.tangente(s, ziel);
    const tx = ziel.x, tz = ziel.z;
    return ziel.set(-tz, 0, tx);
  }

  // Lage eines Punktes zur Straße: s = Bogenlänge des nächsten Straßenpunkts (über die Enden hinaus verlängert),
  // q = seitlicher Abstand (rechts positiv). Grob über vorberechnete Proben, dann fein.
  lage(x, z, ziel = { s: 0, q: 0 }) {
    if (!this._proben) {
      const p = [], v = new THREE.Vector3();
      for (let s = -30; s <= this.laenge + 30; s += 0.5) { this.punkt(s, v); p.push(s, v.x, v.z); }
      this._proben = new Float32Array(p);
    }
    const pr = this._proben;
    let best = 0, bd = Infinity;
    for (let i = 0; i < pr.length; i += 3) {
      const d = (pr[i + 1] - x) ** 2 + (pr[i + 2] - z) ** 2;
      if (d < bd) { bd = d; best = pr[i]; }
    }
    const v = _hv;
    const abst = (s) => { this.punkt(s, v); return (v.x - x) ** 2 + (v.z - z) ** 2; };
    let lo = best - 0.5, hi = best + 0.5;
    for (let i = 0; i < 14; i++) {
      const a = lo + (hi - lo) / 3, b = hi - (hi - lo) / 3;
      if (abst(a) < abst(b)) hi = b; else lo = a;
    }
    const s = (lo + hi) / 2;
    this.punkt(s, v);
    const n = this.rechts(s, _hn);
    ziel.s = s; ziel.q = (x - v.x) * n.x + (z - v.z) * n.z;
    return ziel;
  }

  // Ort neben der Straße: seitlich > 0 liegt rechts. ry dreht ein Objekt so, dass seine Front (+z) zur Straße zeigt.
  ort(s, seitlich, zurStrasse = true) {
    const p = this.punkt(s);
    const n = this.rechts(s);
    p.addScaledVector(n, seitlich);
    const d = zurStrasse ? (seitlich > 0 ? -1 : 1) : 1;
    const ry = Math.atan2(n.x * d, n.z * d);
    return { x: p.x, z: p.z, ry };
  }
}
