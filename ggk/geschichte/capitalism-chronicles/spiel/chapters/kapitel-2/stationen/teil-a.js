// Kapitel II, Teil a) „Die Revolution des Wohlstands“: Hörsaal, Lancashire 1863, um 1910, um 1930, Zwischenhalt.
// Jede Station ist eine Folge von Schritten. Ein Schritt gilt als erledigt, wenn tu() nicht false zurückgibt.
import { zuordnung } from '../../../ui/raetsel.js';
import { haushaltsbuch, rechneKorb } from '../../../ui/haushaltsbuch.js';
import { oeffneKapsel } from './kapsel.js';

export function stationenA(k) {
  const { ui, daten, st, szenen, spiel } = k;
  const { hoersaal, strasse, wohnung } = szenen;
  const P = strasse.punkte;
  const einmal = async (id) => { if (!st().gesehen[id]) { st().gesehen[id] = true; await k.sag(id); } };

  return [
    {
      id: 'a0',
      schritte: [
        { szene: 'hoersaal', pos: hoersaal.punkte.imhof, text: 'Mit Dr. Imhof sprechen', tu: async () => { await k.sag('a0_start'); ui.schalteFrei('d_leitfrage'); } },
        {
          szene: 'hoersaal', pos: hoersaal.punkte.pult, text: 'Die Zeitkapsel öffnen', tu: async () => {
            const tipps = await oeffneKapsel(k);
            if (!tipps) { hoersaal.oeffneKapsel(false); return false; }
            st().tippsKapitel1 = tipps;
            st().notizen.tipps_alt = daten.kapsel.prognosen.map((p) => `${p.titel} Tipp von 1845: ${k.tippText(tipps[p.id])}`).join('\n');
            ui.gibBeleg('beleg_tipps');
          },
        },
        {
          szene: 'hoersaal', pos: hoersaal.punkte.imhof, text: 'Dr. Imhof zuhören', tu: async () => {
            await k.sag('a0_these');
            await k.zitat('P1');
            st().a0 = 3; k.zeigeHoersaal();
            await k.sag('a0_reise');
            ui.gibBeleg('beleg_buch');
            await k.reise(1845, 1863, 'Lancashire · Winter 1862/63', 's1863');
            await k.sag('a1_ankunft');
          },
        },
      ],
    },
    {
      id: 'a1',
      schritte: [
        {
          szene: 'strasse', pos: P.mary, text: 'Mit Mary sprechen', tu: async () => {
            if (!k.genug('a1')) return false;
            await k.sag('a1_mary');
            await haushaltsbuch(ui, daten.haushaltsbuch, { bis: 1863, knopf: 'Zuklappen' });
          },
        },
        {
          szene: 'strasse', pos: P.tor, text: 'Mit Edward Whitlow sprechen', tu: async () => {
            await k.sag('a1_whitlow');
            if (!await k.sim('A1')) return false;
            await k.historisch('A1');
            await k.zitat('P2');
            await k.sag('a1_gegen');
            if (!await k.denk('a1_denkpause')) return false;
            st().a1 = 2;
            await k.reise(1863, 1910, 'Lancashire · Sommer um 1910', 's1910');
            await k.sag('a2_ankunft');
          },
        },
      ],
    },
    {
      id: 'a2',
      schritte: [
        {
          szene: 'strasse', pos: P.torArthur, text: 'Mit Arthur Whitlow sprechen', tu: async () => {
            if (!k.genug('a2')) return false;
            await k.sag('a2_arthur');
            if (!await k.sim('A2')) return false;
            await k.historisch('A2');
            ui.schalteFrei('d_hoehepunkt');
          },
        },
        {
          szene: 'wohnung', pos: wohnung.punkte.annie, text: 'Mit Annie sprechen', tu: async () => {
            await k.sag('a2_annie');
            await haushaltsbuch(ui, daten.haushaltsbuch, { bis: 1910, knopf: 'Weiter' });
            if (!await rechneKorb(ui, daten.haushaltsbuch, 1910)) return false;
            await k.zeige('d_allen'); ui.gibBeleg('beleg_allen');
            await k.zeige('d_pause');
            await k.zitat('P4');
          },
        },
        {
          szene: 'wohnung', pos: wohnung.punkte.buch, text: 'Im Haushaltsbuch nachlesen', tu: async () => {
            if (!await zuordnung(ui, daten.zuordnung_a2)) return false;
            if (!await k.denk('a2_zwischen')) return false;
            if (!await k.denk('a2_denkpause')) return false;
            st().a2 = 3;
            await k.reise(1910, 1930, 'Lancashire · Herbst um 1930', 's1930');
            await k.sag('a3_ankunft');
          },
        },
      ],
    },
    {
      id: 'a3',
      schritte: [
        { szene: 'strasse', pos: P.jack, text: 'Mit Jack sprechen', tu: async () => { if (!k.genug('a3')) return false; await k.sag('a3_jack'); await haushaltsbuch(ui, daten.haushaltsbuch, { bis: 1930, knopf: 'Zuklappen' }); } },
        {
          szene: 'strasse', pos: P.tor, text: 'Mit Arthur Whitlow sprechen', tu: async () => {
            await k.sag('a3_arthur');
            if (!await k.sim('A3')) return false;
            await k.historisch('A3'); ui.gibBeleg('beleg_lcc');
            await k.zitat('P3');
            await k.zeige('d_herrmann');
            if (!await k.denk('a3_zwischen')) return false;
            k.fund('f_teila');
            st().a3 = 2;
            await k.reise(1930, new Date().getFullYear(), 'Frankfurt am Main · heute', 'hoersaal');
          },
        },
      ],
    },
    {
      id: 'h',
      schritte: [
        {
          szene: 'hoersaal', pos: hoersaal.punkte.imhof, text: 'Mit Dr. Imhof sprechen', tu: async () => {
            await k.sag('h_start');
            await k.zeige('p_miksch');
            await k.sag('h_warum');
            await k.zeige('d_spielregel');
            st().h = 1;
            await k.reise(new Date().getFullYear(), 1948, 'Frankfurt am Main · März 1948', 'fMaerz');
            await k.sag('b1_ankunft');
            ui.schalteFrei('p_erhard');
          },
        },
      ],
    },
  ];
}
