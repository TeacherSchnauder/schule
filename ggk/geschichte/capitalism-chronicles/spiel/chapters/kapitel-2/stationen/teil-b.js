// Kapitel II, Teil b) „The Architects of Prosperity“: Frankfurt am Main 1948. Spielfigur: Leonhard Miksch.
import { el, esc } from '../../../ui/oberflaeche.js';

// Ordnungsbaukasten: Prinzipien auf den Entwurf legen. Ergebnis: true oder false (abgebrochen).
function baukasten(ui, def) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: el('div', '', ui.markeHtml('theorie')), beiSchliessen: (w) => fertig(w === true) });
    f.inhalt.append(el('p', 'auftrag', esc(def.einleitung)));
    const rueck = el('div', 'rueck');
    const raster = el('div', 'baukasten'), stapel = el('div', 'stapel'), entwurf = el('div', 'entwurf', '<b>Entwurf der Wettbewerbsordnung</b>');
    raster.append(stapel, entwurf); f.inhalt.append(rueck, raster);
    const weiter = el('button', 'knopf', 'Entwurf prüfen');
    f.fuss.append(weiter);
    const n = def.karten.length;
    const karten = def.karten.map((c, i) => [c, (i * 7 + 3) % n]).sort((a, b) => a[1] - b[1]).map((x) => x[0]);
    const gelegt = new Set();
    for (const c of karten) {
      const b = el('button', 'karte', `${esc(c.text)}${c.detail ? `<small>${esc(c.detail)}</small>` : ''}`);
      b.addEventListener('click', () => {
        if (gelegt.has(c.id)) { gelegt.delete(c.id); stapel.append(b); rueck.className = 'rueck'; rueck.textContent = ''; return; }
        if (!c.gehoert) { rueck.className = 'rueck falsch'; rueck.textContent = c.falsch; return; }
        gelegt.add(c.id); entwurf.append(b); rueck.className = 'rueck'; rueck.textContent = '';
      });
      stapel.append(b);
    }
    weiter.addEventListener('click', () => {
      const fehlt = def.karten.filter((c) => c.gehoert && !gelegt.has(c.id));
      if (fehlt.length) { rueck.className = 'rueck falsch'; rueck.textContent = def.hinweisFehlt + fehlt[0].fehlt; return; }
      if (weiter.dataset.ok) return f.schliessen(true);
      rueck.className = 'rueck richtig'; rueck.textContent = def.erfolg; weiter.dataset.ok = '1'; weiter.textContent = 'Weiter';
    });
  });
}

export function stationenB(k) {
  const { ui, daten, st, szenen } = k;
  const { frankfurt, buero } = szenen;
  const F = frankfurt.punkte, B = buero.punkte;
  const JAHR = new Date().getFullYear();
  const abschlussB = async () => {
    k.fund('f_teilb');
    await k.reise(1948, JAHR, 'Frankfurt am Main · heute', 'hoersaal');
    await k.sag('e_start');
  };

  return [
    {
      id: 'b1',
      schritte: [
        { szene: 'frankfurt', pos: F.schlange, text: 'Mit Frau Weber sprechen', tu: async () => { await k.sag('b1_weber'); } },
        {
          szene: 'frankfurt', pos: F.markt, text: 'Mit dem Händler sprechen', tu: async () => {
            await k.sag('b1_haendler');
            if (!await k.runden('B1')) return false;
            await k.zeige('d_leeremaerkte');
            if (!await k.denk('b1_denkpause')) return false;
            await k.sag('b1_ende');
          },
        },
        {
          szene: 'frankfurt', pos: F.buero, text: 'In die Verwaltung gehen', tu: async () => {
            st().b1 = 3;
            buero.zeige(['eucken']);
            await k.reise(1948, 1948, 'Verwaltung für Wirtschaft · Juni 1948', 'fJuni', 'buero');
          },
        },
      ],
    },
    {
      id: 'b2',
      schritte: [
        { szene: 'buero', pos: B.brenner, text: 'Mit Frau Brenner sprechen', tu: async () => { buero.zeige(['eucken']); await k.sag('b2_brenner'); } },
        {
          szene: 'buero', pos: B.gast, text: 'Mit Professor Eucken sprechen', tu: async () => {
            await k.sag('b2_eucken'); ui.schalteFrei('p_eucken');
            if (!await baukasten(ui, daten.baukasten)) return false;
            ui.schalteFrei('b_prinzipien');
            await k.zeige('d_liste1948');
          },
        },
        {
          szene: 'buero', pos: B.tisch, text: 'Am Entwurf arbeiten', tu: async () => {
            await k.sag('b2_tisch');
            if (!await k.freigabe('B2')) return false;
            ui.gibBeleg('beleg_entwurf');
            await k.zeige('b_smw');
            buero.zeige([]);
          },
        },
      ],
    },
    {
      id: 'b3',
      schritte: [
        {
          szene: 'buero', pos: B.radio, text: 'Das Radio einschalten', tu: async () => {
            buero.zeige([]);
            await k.sag('b3_radio');
            await k.zeige('d_tagx');
            st().b3 = 1; frankfurt.setzeLaeden(2);
            await k.zeige('d_schaufenster');
          },
        },
        {
          szene: 'frankfurt', pos: F.schuhladen, text: 'Mit dem Schuhhändler sprechen', tu: async () => {
            await k.sag('b3_schuster');
            const e = await k.runden('B3', (r) => frankfurt.setzeLaden('schuhe', r.rest > 12 ? 2 : r.rest > 0 ? 1 : 0));
            frankfurt.setzeLaden('schuhe', 2);
            if (!e) return false;
          },
        },
        {
          szene: 'frankfurt', pos: F.weber, text: 'Mit Frau Weber sprechen', tu: async () => {
            await k.sag('b3_weber');
            await k.zeige('d_richtig');
            if (!await k.denk('b3_denkpause')) return false;
            st().b3 = 3;
            await k.reise(1948, 1948, 'Frankfurt am Main · November 1948', 'fNov');
            await k.sag('b4_ankunft');
          },
        },
      ],
    },
    {
      id: 'b4',
      schritte: [
        { szene: 'frankfurt', pos: F.kramer, text: 'Mit der Gewerkschafterin sprechen', tu: async () => { await k.sag('b4_kramer'); await k.zeige('d_ahlen'); ui.gibBeleg('beleg_ahlen'); buero.zeige(['erhard', 'armack']); } },
        { szene: 'frankfurt', pos: F.weberN, text: 'Mit Frau Weber sprechen', tu: async () => { await k.sag('b4_weber'); buero.zeige(['erhard', 'armack']); } },
        {
          szene: 'buero', pos: B.erhard, text: 'Mit Direktor Erhard sprechen', tu: async () => {
            buero.zeige(['erhard', 'armack']);
            await k.sag('b4_erhard');
            if (!await k.sim('B4')) return false;
            await k.historisch('B4'); ui.gibBeleg('beleg_streik');
            await k.sag('b4_armack');
            if (!await k.denk('b4_denkpause')) return false;
            buero.zeige([]);
          },
        },
      ],
      // Ist B5 abgeschaltet, erscheint der Ausblick als Tagebuchseite
      danach: async () => {
        if (k.b5Aktiv()) return;
        await k.zeige('d_kartell'); ui.gibBeleg('beleg_kartell'); await k.zeige('d_miksch1950');
        st().funde.includes(9) || st().funde.push(9);
        await abschlussB();
      },
    },
    {
      id: 'b5',
      schritte: [
        {
          szene: 'buero', pos: B.tisch, text: 'Den Antrag lesen', tu: async () => {
            buero.zeige([]);
            await k.sag('b5_start');
            ui.schalteFrei('b_ordnung');
            if (!await k.sim('B5')) return false;
            await k.historisch('B5');
            await k.zeige('d_kartell'); ui.gibBeleg('beleg_kartell');
            await k.zitat('P8');
            if (!await k.denk('b5_denkpause')) return false;
            await k.sag('b5_ende');
            await k.zeige('d_miksch1950');
          },
        },
      ],
      danach: abschlussB,
    },
  ];
}
