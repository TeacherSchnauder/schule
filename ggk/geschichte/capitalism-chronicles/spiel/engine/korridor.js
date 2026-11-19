// Begehbarer Streifen entlang einer Straße: Die Figur geht frei, statt nur vor und zurück.
// Die Straße (Pfad) bleibt die Ordnung des Kapitels: Aus der Lage auf ihr ergeben sich Fortschritt, Sperren und Enden.
//
// baender:     [{ pfad, von, bis, links, rechts }]  begehbar, wenn die Lage auf dem Pfad in [von, bis] und
//              der seitliche Abstand in [links, rechts] liegt (rechts positiv, in Laufrichtung gesehen)
// rechtecke:   [{ minX, maxX, minZ, maxZ }]         zusätzliche Flächen (z. B. Bahnsteig, Vorplatz)
// hindernisse: Kreise { x, z, r }, Rechtecke { minX, maxX, minZ, maxZ }, Mauern { x0, z0, x1, z1, r }
// dynamisch:   () => [{ x, z, r }]                 bewegliche Hindernisse (Passanten)
const _l = { s: 0, q: 0 };

export class Korridor {
  // kamera: Raum, in dem die Kamera stehen darf ({ baender, rechtecke, hindernisse } wie oben, meist großzügiger).
  constructor({ baender = [], rechtecke = [], hindernisse = [], dynamisch = null, endeBreite = 2.4, kamera = null } = {}) {
    this.baender = baender; this.rechtecke = rechtecke; this.hindernisse = hindernisse;
    this.dynamisch = dynamisch; this.endeBreite = endeBreite;
    this.kamera = kamera ? new Korridor(kamera) : null;
  }

  // Darf die Kamera hier stehen (nicht in Häusern, Zügen oder Mauern)?
  luft(x, z) { return this.kamera ? this.kamera.frei(x, z, 0.25) : true; }

  // Liegt der Punkt auf begehbarer Fläche? r: Körperradius
  flaeche(x, z, r) {
    for (const f of this.rechtecke) {
      if (x >= f.minX + r && x <= f.maxX - r && z >= f.minZ + r && z <= f.maxZ - r) return true;
    }
    for (const b of this.baender) {
      const l = b.pfad.lage(x, z, _l);
      if (l.s >= b.von && l.s <= b.bis && l.q >= b.links + r && l.q <= b.rechts - r) return true;
    }
    return false;
  }

  frei(x, z, r, ohne = null) {
    if (!this.flaeche(x, z, r)) return false;
    for (const h of this.hindernisse) if (trifft(h, x, z, r)) return false;
    if (this.dynamisch) for (const h of this.dynamisch()) if (h !== ohne && trifft(h, x, z, r)) return false;
    return true;
  }
}

export function trifft(h, x, z, r) {
  if (h.aus && h.aus()) return false;
  if (h.x0 !== undefined) {
    // Mauer als Strecke mit halber Dicke
    const dx = h.x1 - h.x0, dz = h.z1 - h.z0, l2 = dx * dx + dz * dz || 1;
    const t = Math.max(0, Math.min(1, ((x - h.x0) * dx + (z - h.z0) * dz) / l2));
    return Math.hypot(x - (h.x0 + dx * t), z - (h.z0 + dz * t)) < (h.r || 0.25) + r;
  }
  if (h.r !== undefined) return Math.hypot(x - h.x, z - h.z) < h.r + r;
  return x > h.minX - r && x < h.maxX + r && z > h.minZ - r && z < h.maxZ + r;
}
