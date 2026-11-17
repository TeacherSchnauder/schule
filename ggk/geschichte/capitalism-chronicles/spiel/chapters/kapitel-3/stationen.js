// Kapitel III – die sechs Stationen der Vorbereitung (T0 bis T5). Was eine Rolle sieht und abgibt, steht in inhalte.json.
import { el, esc } from '../../ui/oberflaeche.js';
import { rechenblatt } from '../../ui/raetsel.js';
import { waehleRolle } from '../../ui/rollen.js';
import { importDialog, importiereText, ausStand, ausText, fuegeHinzu } from '../../ui/akte.js';
import { befragung } from '../../ui/befragung.js';
import { werkbank, vorleseSeiten, alsText, vorlesekarte } from '../../ui/werkbank.js';
import { lorenzRegler, statistikwand, mehrfachwahl, vermoegensregler } from '../../ui/statistik.js';

// Einfache Wahl ohne richtig/falsch (Tipp). Ergebnis: id oder null.
function waehle(ui, { titel, frage, optionen }) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel, beiSchliessen: (w) => fertig(w || null) });
    f.inhalt.append(el('p', 'auftrag', esc(frage)));
    const liste = el('div', 'optionen simwahl');
    let wahl = null;
    const ok = el('button', 'knopf', 'Tipp abgeben'); ok.disabled = true;
    for (const [id, text] of optionen) { const b = el('button', 'option', esc(text)); b.addEventListener('click', () => { wahl = id; [...liste.children].forEach((x) => x.classList.toggle('gewaehlt', x === b)); ok.disabled = false; }); liste.append(b); }
    ok.addEventListener('click', () => f.schliessen(wahl));
    f.inhalt.append(liste); f.fuss.append(ok);
  });
}

export function baueStationen(k) {
  const { ui, daten, st, szenen, spiel } = k;
  const { saal, asservaten, zeugen, kette } = szenen;
  const rolle = () => daten.rollen.find((r) => r.id === st().rolle) || daten.rollen[3];
  const partei = () => ['anklage', 'verteidigung'].includes(rolle().id);
  const Z = daten.gegenwart.zahlen;
  const zahlText = (z) => (z.ohneWert || z.wert === null ? '' : `${String(z.wert).replace('.', ',')} ${z.einheit}: `) + z.text;
  const zahlEintrag = (id) => ({ id: 'zahl_' + id, titel: 'Zahl: ' + Z[id].text.split(/[;:(]/)[0].trim().slice(0, 60), text: zahlText(Z[id]) + (Z[id].hinweis ? ` (${Z[id].hinweis})` : ''), kapitel: 3, marke: Z[id].marke, quelle: Z[id].quelle });
  const beweisEintrag = (b) => ({ id: 'beweis_' + b.id, titel: 'Beweisstück: ' + b.titel, text: `${b.text} Grenze: ${b.zeigtNicht}`, kapitel: b.kapitel, marke: b.marke, quelle: b.herkunft });
  const inAkte = (eintraege) => { const n = fuegeHinzu(st().akte, eintraege); if (n) { ui.melde(`Neu in der Akte: <b>${n} ${n === 1 ? 'Eintrag' : 'Einträge'}</b>`); ui.hud.querySelector('[data-a="inventar"] .punkt').hidden = false; } spiel.sichere(); return n; };
  k.inAkte = inAkte; k.beweisEintrag = beweisEintrag; k.rolleDaten = rolle;

  // Zahlenkarten mit Quelle; jede Zahl lässt sich in die Akte legen.
  const zahlenfenster = (titel, ids, einleitung = '') => new Promise((fertig) => {
    const f = ui.fenster({ titel, klasse: 'breit', beiSchliessen: (w) => fertig(w === true) });
    if (einleitung) f.inhalt.append(el('p', 'auftrag', esc(einleitung)));
    for (const id of ids) {
      const z = Z[id], drin = () => st().akte.some((e) => e.id === 'zahl_' + id);
      const d = el('div', 'zahlkarte', `<div><b>${z.ohneWert || z.wert === null ? '' : esc(String(z.wert).replace('.', ',') + ' ' + z.einheit)}</b> ${ui.markeHtml(z.marke)}<p>${esc(z.text)}</p>${z.hinweis ? `<p class="klein">Hinweis: ${esc(z.hinweis)}</p>` : ''}<p class="quelle">Quelle: ${esc(z.quelle)} · Stand: ${esc(z.stand)}</p></div>`);
      const b = el('button', 'knopf still', drin() ? 'In der Akte' : 'In die Akte'); b.disabled = drin(); b.dataset.akte = '1';
      b.addEventListener('click', () => { inAkte([zahlEintrag(id)]); b.disabled = true; b.textContent = 'In der Akte'; });
      d.append(b); f.inhalt.append(d);
    }
    const ok = el('button', 'knopf', 'Weiter'); ok.addEventListener('click', () => f.schliessen(true)); f.fuss.append(ok);
  });

  // ------------------------------------------------------------ T0 Der Saal
  const t0 = {
    id: 't0',
    schritte: [
      {
        szene: 'saal', pos: saal.punkte.imhof, text: 'Mit Dr. Imhof sprechen', tu: async () => {
          await k.sag('t0_start');
          const w = await waehleRolle(ui, daten.rollen);
          st().rolle = w.rolle; st().figur = w.figur;
          st().notizen.rolle = rolle().name + ': ' + rolle().auftrag;
          k.setzeFigur(); k.zeigeSaal();
          await k.sag('t0_rolle');
        },
      },
      {
        szene: 'saal', pos: saal.punkte.akte, text: 'Die Akte anlegen', tu: async () => {
          const opt = { fundNamen: {}, tippNamen: daten.tippNamen, prognosen: daten.prognosen };
          const gefunden = { 1: ausStand(1, k.leseStandVon(1), { ...opt, fundNamen: daten.fruehereFunde['1'] }), 2: ausStand(2, k.leseStandVon(2), { ...opt, fundNamen: daten.fruehereFunde['2'] }) };
          let ausTextN = 0;
          const neu = await importDialog(ui, {
            gefunden, texte: daten.import,
            beiText: (t) => { const e = ausText(importiereText(t), opt); if (e.length) ausTextN += e.length; return e; },
          });
          fuegeHinzu(st().akte, neu);
          st().importiert = [gefunden[1].length ? 'geraet1' : '', gefunden[2].length ? 'geraet2' : '', ausTextN ? 'text' : ''].filter(Boolean).join('+') || 'keine';
          if (!neu.length) await ui.karte({ titel: 'Akte angelegt', text: daten.import.ohne });
          else ui.melde(`Akte angelegt: <b>${neu.length} Einträge</b> aus Kapitel I und II`);
          if (st().kurz) k.sichereKurz();
          await ui.karte({ titel: daten.spielregeln.titel, text: daten.spielregeln.text, knopf: 'Verstanden' });
          ui.schalteFrei('b_regeln');
          await k.sag('t0_akte');
        },
      },
    ],
  };

  // ------------------------------------------------------------ T1 Asservatenkammer
  const sichte = () => new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Asservatenkammer: acht Beweisstücke', klasse: 'voll', beiSchliessen: (w) => fertig(w === true) });
    const P = partei(), gewaehlt = new Set(), gesehen = new Set();
    f.inhalt.append(el('p', 'auftrag', P ? 'Seht euch die Stücke an und legt genau drei in eure Akte: mindestens eines aus Kapitel I und eines aus Kapitel II. Blasse Stücke stammen aus der Vergangenheit.' : 'Seht euch mindestens vier Stücke an. Als ' + rolle().name + ' bekommt ihr alle acht in eure Akte. Achtet bei jedem Stück auf die Grenze.'));
    const raster = el('div', 'asservaten'), liste = el('div', 'faecher'), detail = el('div', 'detail', '<p class="klein">Wählt ein Fach.</p>'), rueck = el('div', 'rueck');
    raster.append(liste, detail); f.inhalt.append(raster, rueck);
    const zeige = (b, knopf) => {
      gesehen.add(b.id); knopf.classList.add('gesehen');
      [...liste.children].forEach((x) => x.classList.toggle('gewaehlt', x === knopf));
      const alt = b.notiz ? st().akte.find((e) => e.id === `k${b.notiz[0]}_notiz_${b.notiz[1]}`) : null;
      detail.innerHTML = `<h3 class="zw">${b.fach} · ${esc(b.titel)} ${ui.markeHtml(b.marke)}</h3><p class="klein">${esc(b.herkunft)}</p><p>${esc(b.text)}</p><p><b>Was es nicht zeigt:</b> ${esc(b.zeigtNicht)}</p>${alt ? `<blockquote>Ihr habt damals geschrieben: ${esc(alt.text)}</blockquote>` : ''}`;
      if (P) {
        const a = el('button', 'knopf still', gewaehlt.has(b.id) ? 'Aus der Akte nehmen' : 'In die Akte'); a.dataset.akte = '1';
        a.addEventListener('click', () => { if (gewaehlt.has(b.id)) gewaehlt.delete(b.id); else if (gewaehlt.size < 3) gewaehlt.add(b.id); else { rueck.className = 'rueck falsch'; rueck.textContent = 'Ihr habt schon drei Stücke. Nehmt erst eines heraus.'; return; } knopf.classList.toggle('inakte', gewaehlt.has(b.id)); a.textContent = gewaehlt.has(b.id) ? 'Aus der Akte nehmen' : 'In die Akte'; rueck.textContent = ''; rueck.className = 'rueck'; });
        detail.append(a);
      }
    };
    for (const b of daten.beweise) {
      const kn = el('button', 'fach' + (b.sepia ? ' sepia' : ''), `<i>${b.fach}</i><span>${esc(b.titel)}</span><small>Kapitel ${'I'.repeat(b.kapitel)}</small>`); kn.dataset.id = b.id;
      kn.addEventListener('click', () => zeige(b, kn)); liste.append(kn);
    }
    const ok = el('button', 'knopf', 'Fertig');
    ok.addEventListener('click', () => {
      const wahl = daten.beweise.filter((b) => gewaehlt.has(b.id));
      if (P) {
        if (wahl.length !== 3) { rueck.className = 'rueck falsch'; rueck.textContent = `Legt genau drei Stücke in die Akte (bisher ${wahl.length}).`; return; }
        if (!wahl.some((b) => b.kapitel === 1) || !wahl.some((b) => b.kapitel === 2)) { rueck.className = 'rueck falsch'; rueck.textContent = 'Ihr braucht mindestens ein Stück aus Kapitel I und eines aus Kapitel II.'; return; }
        inAkte(wahl.map(beweisEintrag)); st().notizen.t1_auswahl = wahl.map((b) => b.titel).join(', ');
      } else {
        if (gesehen.size < 4) { rueck.className = 'rueck falsch'; rueck.textContent = `Seht euch mindestens vier Stücke an (bisher ${gesehen.size}).`; return; }
        inAkte(daten.beweise.map(beweisEintrag)); st().notizen.t1_auswahl = 'alle acht Beweisstücke';
      }
      for (const id of gesehen) ui.schalteFrei('d_' + id);
      f.schliessen(true);
    });
    f.fuss.append(ok);
  });
  const t1 = {
    id: 't1',
    schritte: [
      { szene: 'asservaten', pos: asservaten.punkte.regal, text: 'Die Beweisstücke sichten', tu: async () => { if (!await sichte()) return false; if (rolle().id === 'sachverstaendige' && !await k.denk('t1_grenzen')) return false; } },
      { szene: 'asservaten', pos: asservaten.punkte.tisch, text: 'Denkpause am Tisch', tu: async () => { if (!await k.denk('t1_denkpause')) return false; } },
    ],
  };

  // ------------------------------------------------------------ T2 Die Kette und die Statistikwand
  const K = daten.kette, V = daten.vermoegen, G = daten.gegenwart.kette;
  const raum = (id) => K.raeume.find((r) => r.id === id);
  const raumKarte = async (id) => { const r = raum(id); await ui.karte({ titel: r.titel, marke: r.marke, text: r.text, quelle: r.quelle || null }); ui.schalteFrei('o_' + id); };
  const t2 = {
    id: 't2',
    schritte: [
      {
        szene: 'kette', pos: kette.punkte.eingang, text: 'Das T-Shirt ansehen', tu: async () => {
          const t = await waehle(ui, { titel: K.eingang.titel, frage: K.eingang.frage, optionen: K.eingang.optionen });
          if (!t) return false;
          st().tippKette = t;
          inAkte([beweisEintrag(daten.beweise.find((b) => b.id === 'tshirt'))]); ui.schalteFrei('d_tshirt');
        },
      },
      { szene: 'kette', pos: kette.punkte.feld, text: 'Das Schild am Baumwollfeld lesen', tu: () => raumKarte('feld') },
      { szene: 'kette', pos: kette.punkte.spinnerei, text: 'Das Schild an der Spinnerei lesen', tu: () => raumKarte('spinnerei') },
      {
        szene: 'kette', pos: kette.punkte.naeherei, text: 'Mit Rokeya sprechen', tu: async () => {
          await k.sag('t2_rokeya'); ui.schalteFrei('p_rokeya');
          await raumKarte('naeherei');
          if (!await zahlenfenster('Die Näherei in Zahlen', raum('naeherei').zahlen, 'Jede Zahl hat eine Quelle. Achtet darauf, wofür sie spricht und von wem sie stammt. Legt in die Akte, was ihr braucht.')) return false;
          await ui.karte({ titel: K.vorsicht.titel, marke: K.vorsicht.marke, text: K.vorsicht.text });
        },
      },
      {
        szene: 'kette', pos: kette.punkte.zentrale, text: 'An das Stehpult treten', tu: async () => {
          await raumKarte('zentrale');
          await ui.karte({ titel: V.begriff.titel, marke: V.begriff.marke, text: V.begriff.text }); ui.schalteFrei('b_vermoegen');
          if (!await vermoegensregler(ui, V.regler, { boersenwert: null, beiKurs: (d) => kette.setzeKurs(d) })) return false;
          if (!await zahlenfenster(V.kartenTitel, V.karten, 'Beide Personen leben; sie erscheinen hier nur mit belegten Zahlen. Schätzungen von Vermögen schwanken: Achtet auf das Datum und den Schätzer.')) return false;
          const kurs = Z.wechselkurs_taka.wert;
          if (kurs) {
            const jahr = Math.round((Z.mindestlohn_bd.wert * 12) / kurs);
            if (!await rechenblatt(ui, { titel: 'Dividende und Jahreslohn', angaben: [`Mindestlohn: ${Z.mindestlohn_bd.wert} Taka im Monat`, `Wechselkurs: ${kurs} Taka je Euro (Stand ${Z.wechselkurs_taka.stand})`], fragen: [{ frage: 'Wie hoch ist der Jahreslohn einer Näherin zum Mindestlohn in Euro? Rundet auf ganze Euro.', einheit: '€', loesung: jahr, weg: `${Z.mindestlohn_bd.wert} × 12 ÷ ${kurs} ≈ ${jahr} €.`, sonst: 'Rechnet: Monatslohn mal 12, geteilt durch den Wechselkurs.' }] })) return false;
          }
          if (!await mehrfachwahl(ui, V.nichtZeigt)) return false;
          if (rolle().id === 'sachverstaendige' && !await k.denk('t2_vergleich')) return false;
          await ui.karte({ titel: V.waegen.titel, marke: 'position', text: V.waegen.positionen, tabelle: { kopf: V.waegen.kopf, zeilen: V.waegen.zeilen }, klasse: 'breit' });
          ui.schalteFrei('b_waegen');
        },
      },
      {
        szene: 'kette', pos: kette.punkte.laden, text: 'Das Schild am Laden lesen', tu: async () => {
          await raumKarte('laden');
          const tipp = K.eingang.optionen.find((o) => o[0] === st().tippKette)?.[1] || '–', n = Z.anteil_naeherin;
          await ui.karte({ titel: 'Euer Tipp und die Schätzung', marke: n.marke, text: `Euer Tipp am Eingang: ${tipp}.\nGeschätzter Anteil der Näherin am Ladenpreis von ${G.ladenpreis} €: etwa ${String(n.wert).replace('.', ',')} %, das sind rund 0,18 €.\n${n.hinweis}.\n${G.hinweis}`, quelle: n.quelle });
          st().notizen.t2_tipp = `Tipp: ${tipp}. Schätzung (Clean Clothes Campaign 2017): etwa ${String(n.wert).replace('.', ',')} % des Ladenpreises.`;
          inAkte([zahlEintrag('anteil_naeherin')]);
          await ui.karte({ titel: K.vergleich.titel, marke: K.vergleich.marke, text: K.vergleich.text, tabelle: K.vergleich.tabelle, klasse: 'breit' }); ui.schalteFrei('o_vergleich');
        },
      },
      {
        szene: 'kette', pos: kette.punkte.statistik, text: 'Die Statistikwand öffnen', tu: async () => {
          const S = daten.statistiken, sach = rolle().id === 'sachverstaendige';
          const l = await lorenzRegler(ui, S.lorenz, { pflicht: sach });
          if (!l) return false;
          ui.schalteFrei('b_gini');
          const e = await statistikwand(ui, S.statistiken, { titel: 'Statistikwand: Verteilung in Zahlen', min: 2, pflicht: ['gini_de_einkommen', 'gini_de_vermoegen'], alle: sach, gesehen: st().statistikGesehen || [] });
          st().statistikGesehen = e.gesehen; inAkte(e.akte);
          if (!e.fertig) return false;
          if (sach && !st().akte.some((x) => x.id.startsWith('statistik_'))) inAkte([{ id: 'statistik_gini_de_vermoegen', titel: 'Statistik: Gini Deutschland: Vermögen', text: S.statistiken.find((x) => x.id === 'gini_de_vermoegen').lesehilfe, kapitel: 3, marke: 'tatsache', quelle: S.statistiken.find((x) => x.id === 'gini_de_vermoegen').quelle }]);
          if (!await k.denk('t2_statistik')) return false;
        },
      },
      { szene: 'kette', pos: kette.punkte.ende, text: 'Denkpause am Ende der Kette', tu: async () => { if (!await k.denk('t2_denkpause')) return false; } },
    ],
  };

  // ------------------------------------------------------------ T3 Zeugenzimmer
  const ZEUGEN = daten.dialoge.zeugen;
  const zeuge = (id) => ({ ...ZEUGEN.find((z) => z.id === id), name: daten.personen[id].name, kapitel: ['mary'].includes(id) ? 1 : ['jack', 'annie', 'haendler'].includes(id) ? 2 : 3 });
  const erledigt = (id) => (st().befragt[id]?.erledigt === true);
  const t3fertig = () => {
    const r = rolle();
    if (!r.pflichtZeugen.every(erledigt)) return false;
    if (partei()) return r.gegenZeugen.some(erledigt);
    return ZEUGEN.filter((z) => z.id !== 'kaya' && erledigt(z.id)).length >= (r.freiZeugen || 0);
  };
  k.zeigeZeugentafel = () => { const r = rolle(); zeugen.zeigeTafel(ZEUGEN.filter((z) => partei() ? z.id !== 'kaya' : true).map((z) => ({ name: daten.personen[z.id].name.split(',')[0].replace('Herr Roth', 'Herr Roth und Frau Weber'), erledigt: erledigt(z.id), pflicht: r.pflichtZeugen.includes(z.id) }))); };
  const zeugenwahl = () => new Promise((fertig) => {
    const r = rolle(), P = partei();
    const f = ui.fenster({ titel: 'Zeugenzimmer', klasse: 'breit', beiSchliessen: (w) => { zeugen.zeige(null); fertig(w === true); } });
    const male = () => {
      f.inhalt.innerHTML = `<p class="auftrag">${P ? 'Befragt eure drei Zeugen und mindestens einen Zeugen der Gegenseite. Stellt jedem mindestens drei Fragen und legt eine Aussage in die Akte.' : `Befragt Dr. Kaya und mindestens ${r.freiZeugen} weitere Zeugen eurer Wahl.`} Blasse Zeugen kommen aus Kapitel I und II.</p>`;
      const liste = el('div', 'zeugenliste');
      for (const z of ZEUGEN) {
        if (P && z.id === 'kaya') continue;
        const art = r.pflichtZeugen.includes(z.id) ? 'Pflicht' : P ? 'Gegenseite (mindestens einer)' : 'frei wählbar';
        const b = el('button', 'zeuge' + (erledigt(z.id) ? ' fertig' : ''), `<img alt="" src="${ui.portraits[z.id] || ''}"><b>${esc(daten.personen[z.id].name)}</b><small>${art}${erledigt(z.id) ? ' · befragt' : ''}</small>`); b.dataset.zeuge = z.id;
        b.addEventListener('click', async () => {
          zeugen.zeige(z.id);
          const fremd = P && r.gegenZeugen.includes(z.id);
          const e = await befragung(ui, zeuge(z.id), { zahlen: Z, bild: ui.portraits[z.id], vorher: st().befragt[z.id]?.gestellt || [], zuerst: fremd ? ZEUGEN.find((x) => x.id === z.id).fragen.find((q) => q.unbequem)?.id : null });
          st().befragt[z.id] = { gestellt: e.gestellt, erledigt: e.erledigt || erledigt(z.id) };
          inAkte(e.akte); if (e.gestellt.length) ui.schalteFrei('p_' + z.id);
          zeugen.zeige(null); k.zeigeZeugentafel(); male();
        });
        liste.append(b);
      }
      f.inhalt.append(liste);
    };
    male();
    const ok = el('button', 'knopf', 'Befragungen abschließen'), rueck = el('div', 'rueck');
    ok.addEventListener('click', () => {
      if (!t3fertig()) { rueck.className = 'rueck falsch'; rueck.textContent = P ? 'Es fehlen noch Befragungen: alle drei Pflichtzeugen und ein Zeuge der Gegenseite (je drei Fragen und eine Aussage in der Akte).' : `Es fehlen noch Befragungen: Dr. Kaya und ${r.freiZeugen} weitere Zeugen (je drei Fragen und eine Aussage in der Akte).`; f.inhalt.append(rueck); return; }
      st().notizen.t3_zeugen = ZEUGEN.filter((z) => erledigt(z.id)).map((z) => daten.personen[z.id].name.split(',')[0]).join(', ');
      f.schliessen(true);
    });
    f.fuss.append(ok);
  });
  const t3 = {
    id: 't3',
    schritte: [
      { szene: 'zeugen', pos: zeugen.punkte.tisch, text: 'Zeugen befragen', tu: async () => { if (!await zeugenwahl()) return false; } },
      {
        szene: 'zeugen', pos: zeugen.punkte.karte, text: 'Die Gegenstimme lesen', tu: async () => {
          const g = daten.zitate[rolle().gegenstimme];
          await ui.karte({ titel: `${g.name}: ${g.werk}`, marke: 'position', text: `${g.paraphrase}\n${g.einwand}`, quelle: `${g.quelleParaphrase}; Einwand: ${g.quelleEinwand}`, knopf: 'In die Akte' });
          inAkte([{ id: 'stimme_' + rolle().gegenstimme, titel: `Gegenwartsstimme: ${g.name}`, text: `${g.paraphrase} ${g.einwand}`, kapitel: 3, marke: 'position', quelle: g.quelleParaphrase }]);
          ui.schalteFrei('d_' + rolle().gegenstimme);
        },
      },
    ],
  };

  // ------------------------------------------------------------ T4 Werkbank
  const TITEL = { plaedoyer: 'Plädoyer-Werkbank', gutachten: 'Gutachten-Werkbank', kriterien: 'Kriterien-Baukasten der Jury' };
  k.seiten = () => {
    const r = rolle(), w = st().werkbank[r.werkbank];
    if (!w) return null;
    const extra = st().notizen.t5_gegenseite ? { kopf: daten.denkpausen[r.gegenseite].titel, text: st().notizen.t5_gegenseite } : null;
    return vorleseSeiten(r.werkbank, w, st().akte, extra);
  };
  k.vorlesen = () => { const s = k.seiten(); return s ? vorlesekarte(ui, { rolle: rolle().name, farbe: rolle().farbe, seiten: s }) : Promise.resolve(); };
  const t4 = {
    id: 't4',
    schritte: [{
      szene: 'saal', pos: () => saal.punkte.platz[rolle().id], text: 'Die Werkbank öffnen', tu: async () => {
        const r = rolle(), modus = r.werkbank;
        const tipps = st().akte.filter((e) => e.tipps).map((e) => e.titel + ': ' + e.text).join(' · ');
        const w = await werkbank(ui, {
          modus, titel: TITEL[modus], akte: st().akte, wert: st().werkbank[modus] || null,
          kriterien: daten.kriterien, urteilsformen: daten.urteilsformen, bausteine: daten.bausteine,
          adressaten: ['Anklage', 'Verteidigung', 'Sachverständige'], fuerWahl: ['Anklage', 'Verteidigung', 'beide', 'unklar'],
          kapselText: 'Drei Prognosen von Marx: Was ist daraus geworden? ' + (tipps ? 'Eure Tipps: ' + tipps : 'Nutzt das Beweisstück „Zeitkapsel“.'),
          zeigeAkte: () => k.zeigeAkte(), beiAenderung: (z) => { st().werkbank[modus] = z; spiel.sichere(); },
        });
        if (!w) return false;
        st().werkbank[modus] = w; st().werkbankFertig = true;
        st().notizen.werkbank = alsText(`${TITEL[modus]} (${r.name})`, vorleseSeiten(modus, w, st().akte));
        spiel.sichere();
        await k.vorlesen();
      },
    }],
  };

  // ------------------------------------------------------------ T5 Die Gegenseite
  const schluss = () => new Promise((fertig) => {
    const f = ui.fenster({ titel: 'Die Vorbereitung ist abgeschlossen', schliessbar: false, beiSchliessen: () => fertig() });
    f.inhalt.innerHTML = `<p>${esc(daten.ende)}</p><p class="klein">Für die Lehrkraft: Die Beamer-Ansicht für das Tribunal öffnet ihr über die Einstellungen (Zahnrad) oder mit der Adresse <b>kapitel-3.html?beamer</b>.</p>`;
    const vor = el('button', 'knopf still', 'Karte zum Vorlesen'); vor.addEventListener('click', () => k.vorlesen());
    const kop = el('button', 'knopf still', 'Notizen kopieren'); kop.addEventListener('click', () => ui.kopiere(ui.notizenText(), kop));
    const ok = el('button', 'knopf', 'Schließen'); ok.addEventListener('click', () => f.schliessen());
    const links = el('div', 'links'); links.append(vor, kop); f.fuss.append(links, ok);
  });
  const t5 = {
    id: 't5',
    schritte: [{
      szene: 'saal', pos: saal.punkte.imhof, text: 'Mit Dr. Imhof sprechen', tu: async () => {
        await k.sag('t5_start');
        const id = rolle().gegenseite;
        const t = await k.notizFrei(id, st().notizen.t5_gegenseite || '');
        if (t === null) return false;
        st().notizen.t5_gegenseite = t;
        if (k.seiten()) st().notizen.werkbank = alsText(`${TITEL[rolle().werkbank]} (${rolle().name})`, k.seiten());
        spiel.sichere();
        await k.sag('t5_ende');
        k.zeigeSaal();
        await schluss();
      },
    }],
  };
  return [t0, t1, t2, t3, t4, t5];
}
