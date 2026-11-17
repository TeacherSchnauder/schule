// Die fest definierte Straße: eine Kurve, auf der sich die Figuren nur vor und zurück bewegen.
import * as THREE from 'three';

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
