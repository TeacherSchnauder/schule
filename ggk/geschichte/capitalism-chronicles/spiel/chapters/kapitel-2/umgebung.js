// Kapitel II – Himmel, Nebel und Licht einer Außenszene. Jede Zeitschicht setzt ihre eigene Stimmung.
import * as THREE from 'three';
import { Bauer, FARBEN, himmel, passant, zufall } from '../../engine/bausteine.js';

export function baueUmgebung(szene, richtung) {
  const dir = richtung.clone().normalize();
  const sky = himmel(dir);
  szene.add(sky);
  szene.fog = new THREE.Fog(0xcccccc, 40, 300);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x555555, 1);
  const sonne = new THREE.DirectionalLight(0xffffff, 2);
  sonne.castShadow = true;
  sonne.shadow.mapSize.set(2048, 2048);
  const c = sonne.shadow.camera; c.left = -46; c.right = 46; c.top = 46; c.bottom = -46; c.near = 10; c.far = 260;
  sonne.shadow.bias = -0.0006; sonne.shadow.normalBias = 0.04;
  szene.add(hemi, sonne, sonne.target);
  const folgeSonne = (p) => { sonne.target.position.set(p.x, 0, p.z); sonne.position.set(p.x, 0, p.z).addScaledVector(dir, 130); };
  folgeSonne(new THREE.Vector3(0, 0, -30));
  return {
    sonne, folgeSonne,
    // { horizont, zenit, glut, nebel: [farbe, nah, fern], licht: [farbe, stärke], hemi: [himmel, boden, stärke] }
    setze(u) {
      sky.material.uniforms.horizont.value.set(u.horizont);
      sky.material.uniforms.zenit.value.set(u.zenit);
      sky.material.uniforms.glut.value.set(u.glut ?? 0xffc680);
      szene.fog.color.set(u.nebel[0]); szene.fog.near = u.nebel[1]; szene.fog.far = u.nebel[2];
      sonne.color.set(u.licht[0]); sonne.intensity = u.licht[1];
      hemi.color.set(u.hemi[0]); hemi.groundColor.set(u.hemi[1]); hemi.intensity = u.hemi[2];
    },
  };
}

// Straßenboden mit Gehwegen entlang der z-Achse.
export function strassenboden(b, { von = 10, bis = -112, pflaster = FARBEN.pflaster, steig = FARBEN.sandstein, rand = FARBEN.pflasterDunkel } = {}) {
  const l = von - bis, m = (von + bis) / 2;
  b.quader(12, 0.1, l, pflaster, { y: -0.05, z: m, streu: 0.06 });
  for (const sx of [-1, 1]) {
    b.quader(2.4, 0.26, l, steig, { x: sx * 7.2, y: 0.03, z: m, streu: 0.05 });
    b.quader(0.18, 0.28, l, rand, { x: sx * 6.0, y: 0.04, z: m });
  }
  b.quader(500, 0.1, 500, rand, { y: -0.12, z: m, streu: 0.02 });
  for (let z = von; z > bis; z -= 1.6) b.quader(12, 0.02, 0.06, rand, { y: 0.005, z, streu: 0.08 });
}

// Warteschlange aus stehenden Figuren; gibt ein Hindernis zurück.
export function schlange(b, { x, z, n = 8, dz = -0.8, seed = 3, farben = [0x4b4743, 0x54483c, 0x3d4a3b, 0x5b4231, 0x55504a], frauen = 0.5, hut = 0.7 }) {
  const r = zufall(seed);
  for (let i = 0; i < n; i++) {
    const kleid = r() < frauen;
    passant(b, { x: x + (r() - 0.5) * 0.3, z: z + i * dz, ry: (dz < 0 ? 0 : Math.PI) + (r() - 0.5) * 0.5, kleid, hut: !kleid && r() < hut, rock: farben[Math.floor(r() * farben.length)] });
  }
  const z2 = z + (n - 1) * dz;
  return { minX: x - 0.45, maxX: x + 0.45, minZ: Math.min(z, z2) - 0.3, maxZ: Math.max(z, z2) + 0.3 };
}

export { Bauer, FARBEN };
