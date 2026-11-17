// Kapitel III – beschriftbare Fläche (Leinwand, Tafel, Preisschild, Börsentafel) als Canvas-Textur.
import * as THREE from 'three';

export function schreibflaeche(breite, hoehe, grund, px = 140, leuchtet = true) {
  const c = document.createElement('canvas'); c.width = Math.round(breite * px); c.height = Math.round(hoehe * px);
  const g = c.getContext('2d');
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const mat = leuchtet ? new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }) : new THREE.MeshLambertMaterial({ map: tex });
  const netz = new THREE.Mesh(new THREE.PlaneGeometry(breite, hoehe), mat);
  const male = (fn) => { g.fillStyle = grund; g.fillRect(0, 0, c.width, c.height); fn(g, c.width, c.height); tex.needsUpdate = true; };
  male(() => {});
  return { netz, male };
}

// Zeilen [[Text, 'h' | 't' | 'k'], …] untereinander schreiben; lange Zeilen werden verkleinert.
export function zeilen(g, w, h, liste, { farbe = '#2b2520', gross = 0.11, klein = 0.065, links = 0.06, oben = 0.14 } = {}) {
  let y = h * oben;
  for (const [text, art] of liste) {
    let fs = Math.round(h * (art === 'h' ? gross : art === 'k' ? klein * 0.78 : klein));
    const fam = art === 'h' ? '"Abril Fatface", Georgia, serif' : '"Source Serif 4", Georgia, serif';
    g.font = `${fs}px ${fam}`;
    while (g.measureText(text).width > w * (1 - 2 * links) && fs > 9) { fs -= 1; g.font = `${fs}px ${fam}`; }
    g.fillStyle = farbe; g.textBaseline = 'middle'; g.textAlign = 'left';
    g.fillText(text, w * links, y);
    y += Math.round(h * (art === 'h' ? gross : klein)) * 1.5;
  }
}
