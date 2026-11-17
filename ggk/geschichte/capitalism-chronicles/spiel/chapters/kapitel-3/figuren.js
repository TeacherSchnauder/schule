// Kapitel III – Figuren. Lebende reale Personen treten nicht auf. Zeugen aus Kapitel I und II erscheinen entsättigt (sepiaFigur).
import { FIGUREN } from '../../engine/figur.js';
import { FIG as FIG2 } from '../kapitel-2/figuren.js';

export const ROLLENFARBE = { anklage: 0x7a2e34, verteidigung: 0x2e5f6a, sachverstaendige: 0x5a6470, jury: 0xb08a3e };
const ROBE = 0x1e1e22;

const GRUND = {
  studentin: { groesse: 1.68, breite: 0.9, rock: 0x4f6a5c, rockLang: false, hose: 0x3b4a5e, hemd: 0xe9e4d8, halstuch: 0xe9e4d8, haar: 0x5b3a26, zopf: true, seed: 131 },
  student: { groesse: 1.8, breite: 0.98, rock: 0x6a5a48, rockLang: false, hose: 0x3b4a5e, hemd: 0xdfe4e8, halstuch: 0xdfe4e8, haar: 0x2a2420, seed: 132 },
};

// Spielfigur je Rolle: Anklage und Verteidigung tragen eine offene Robe, alle eine Mappe in Rollenfarbe.
export function spielfigur(figur = 'studentin', rolle = null) {
  const g = { ...(GRUND[figur] || GRUND.studentin) };
  if (!rolle) return g;
  g.mappe = ROLLENFARBE[rolle];
  if (rolle === 'anklage' || rolle === 'verteidigung') g.robe = ROBE;
  if (rolle === 'sachverstaendige') g.brille = true;
  return g;
}

export const FIG = {
  studentin: GRUND.studentin,
  student: GRUND.student,
  imhof: { ...FIG2.imhof, robe: ROBE },
  rokeya: { groesse: 1.6, breite: 0.9, rock: 0x3f6f8a, kleid: 0x3f6f8a, dupatta: 0xd9b46a, haar: 0x1d1a18, haut: 0xb07e5c, kleidKurz: 0.12, seed: 141 },
  einkaeuferin: { groesse: 1.72, breite: 0.92, rock: 0x3a3d44, rockLang: false, hose: 0x3a3d44, hemd: 0xe9e4d8, halstuch: 0xe9e4d8, haar: 0x6a4a2e, seed: 142 },
  kaya: { groesse: 1.66, breite: 0.92, rock: 0x7a5a48, rockLang: false, hose: 0x33312f, hemd: 0xd9d0bb, halstuch: 0x8f3f2c, haar: 0x2a2420, haut: 0xc99a78, brille: true, seed: 143 },
  // Zeugen aus Kapitel I und II
  mary: { ...FIG2.maryAlt, sepiaFigur: true },
  jack: { ...FIG2.jack, sepiaFigur: true },
  annie: { ...FIG2.annie, sepiaFigur: true },
  haendler: { ...FIG2.haendler, sepiaFigur: true },
  weber: { ...FIG2.weber, sepiaFigur: true },
};
export { FIGUREN };
