// Baustein C: Verhör mit drei von acht Fragen.
// Acht Karten in zufälliger Reihenfolge, drei dürfen gestellt werden, die Antwort erscheint sofort.
// Danach übernimmt die Gruppe die passenden Antworten ins Protokoll. Erfolg: beide Zielteile, keine Ausrede.
// Misserfolg: Die Figur beendet das Verhör, alle Karten sind wieder frei; Hinweise gestuft, Lösung nach dem vierten Misserfolg.
import { el, esc } from './oberflaeche.js';
import { mische, hinweisStufen, meldung } from './raetsel.js';

const MAX = 4;

// ablage: Objekt im Spielstand; dort steht danach je id { fragen, protokoll, selbst, misserfolge, erledigt }.
// Ergebnis: true (erledigt) oder false (abgebrochen).
export function verhoer(ui, def, ablage) {
  return new Promise((fertig) => {
    const kopf = def.marke ? el('div', '', ui.markeHtml(def.marke)) : null;
    const f = ui.fenster({ titel: def.titel, klasse: 'breit verhoer', kopf, beiSchliessen: (w) => fertig(w === true) });
    const auftrag = el('p', 'auftrag', esc(def.auftrag));
    const zaehler = el('p', 'klein zaehler');
    const raster = el('div', 'verhoerraster');
    const karten = el('div', 'fragen'); karten.setAttribute('role', 'group'); karten.setAttribute('aria-label', 'Fragen');
    const protokoll = el('div', 'protokoll');
    raster.append(karten, protokoll);
    const rueck = el('div', 'rueck'); rueck.setAttribute('aria-live', 'polite');
    const hilfenEl = el('div', 'hilfen');
    f.inhalt.append(auftrag, zaehler, raster, rueck, hilfenEl);
    const h = hinweisStufen(def.hilfen || [], hilfenEl);
    const links = el('div', 'links'); links.append(h.knopf);
    const abschliessen = el('button', 'knopf', 'Protokoll abschließen'); abschliessen.hidden = true;
    const neu = el('button', 'knopf', 'Neu beginnen'); neu.hidden = true;
    const weiter = el('button', 'knopf', 'Weiter'); weiter.hidden = true;
    f.fuss.append(links, abschliessen, neu, weiter);
    const eintrag = (ablage[def.id] ||= { misserfolge: 0 });
    let gestellt = [], gewaehlt = new Set(), phase = 'fragen';

    const karte = (id) => def.karten.find((k) => k.id === id);
    const zeigeProtokoll = () => {
      protokoll.innerHTML = '';
      protokoll.append(el('h3', '', phase === 'protokoll' ? 'Protokoll: Was gehört hinein?' : `Antworten von ${esc(def.name)}`));
      if (!gestellt.length) protokoll.append(el('p', 'klein leer', 'Noch keine Frage gestellt.'));
      for (const id of gestellt) {
        const k = karte(id);
        const zeile = el('div', 'qa');
        zeile.append(el('p', 'q', esc(k.frage)), el('p', 'a', `<b>${esc(def.name)}:</b> „${esc(k.antwort)}“`));
        if (phase === 'protokoll') {
          const b = el('button', 'uebernehmen', '');
          const setze = () => { const an = gewaehlt.has(id); b.textContent = an ? '✓ im Protokoll' : 'ins Protokoll übernehmen'; b.setAttribute('aria-pressed', String(an)); zeile.classList.toggle('drin', an); };
          b.addEventListener('click', () => { if (gewaehlt.has(id)) gewaehlt.delete(id); else gewaehlt.add(id); setze(); });
          setze(); zeile.append(b);
        }
        protokoll.append(zeile);
      }
    };
    const zeigeKarten = () => {
      karten.innerHTML = '';
      for (const k of mische(def.karten)) {
        const b = el('button', 'option frage', esc(k.frage)); b.dataset.id = k.id;
        b.addEventListener('click', () => {
          if (phase !== 'fragen' || gestellt.includes(k.id)) return;
          gestellt.push(k.id); b.disabled = true; b.classList.add('gestellt');
          zeigeStand();
        });
        karten.append(b);
      }
    };
    const zeigeStand = () => {
      zaehler.textContent = phase === 'fragen' ? `Gestellte Fragen: ${gestellt.length} von ${def.anzahl}` : '';
      if (phase === 'fragen' && gestellt.length >= def.anzahl) {
        phase = 'protokoll';
        for (const b of karten.children) b.disabled = true;
        auftrag.textContent = def.protokollAuftrag;
        abschliessen.hidden = false;
      }
      zeigeProtokoll();
    };
    const beginne = () => {
      gestellt = []; gewaehlt = new Set(); phase = 'fragen';
      auftrag.textContent = def.auftrag;
      abschliessen.hidden = true; neu.hidden = true;
      zeigeKarten(); zeigeStand();
    };
    const fertigMit = (selbst) => {
      phase = 'fertig';
      Object.assign(eintrag, { fragen: [...gestellt], protokoll: [...gewaehlt], selbst, erledigt: true });
      abschliessen.hidden = true; neu.hidden = true; weiter.hidden = false; h.aus();
      for (const b of karten.children) b.disabled = true;
      zeigeProtokoll();
      for (const b of protokoll.querySelectorAll('button')) b.disabled = true;
      if (!ui.touch) weiter.focus();
    };
    abschliessen.addEventListener('click', () => {
      const drin = [...gewaehlt].map(karte);
      const hat = (z) => drin.some((k) => k.ziel === z);
      const gefragt = (z) => gestellt.some((id) => karte(id).ziel === z);
      const ausreden = drin.filter((k) => k.ausrede);
      if (hat('z1') && hat('z2') && !ausreden.length) {
        meldung(rueck, 'richtig', 'Ziel erreicht.', def.erfolg);
        rueck.append(el('p', '', esc(def.schluss)));
        fertigMit(true);
        return;
      }
      eintrag.misserfolge = (eintrag.misserfolge || 0) + 1;
      const gruende = [];
      for (const z of ['z1', 'z2']) if (!hat(z)) gruende.push(gefragt(z) ? def.fehlt[z === 'z1' ? 'ziel1Protokoll' : 'ziel2Protokoll'] : def.fehlt[z]);
      for (const k of ausreden) gruende.push(`„${k.antwort.split('. ')[0]}.“ – ${k.warum}`);
      meldung(rueck, 'falsch', def.abbruch, '');
      const liste = el('ul', 'gruende', gruende.map((g) => `<li>${esc(g)}</li>`).join(''));
      rueck.append(liste);
      phase = 'aus';
      abschliessen.hidden = true;
      for (const b of protokoll.querySelectorAll('button')) b.disabled = true;
      if (eintrag.misserfolge >= MAX) {
        rueck.append(el('p', 'loesung', `<b>Lösung (nicht selbst gelöst):</b> ${esc(def.loesung)}`));
        gestellt = def.karten.filter((k) => k.typ === 'kern').map((k) => k.id);
        gewaehlt = new Set(gestellt);
        fertigMit(false);
        return;
      }
      h.freigeben();
      neu.hidden = false;
    });
    neu.addEventListener('click', () => { rueck.className = 'rueck'; rueck.textContent = ''; beginne(); });
    weiter.addEventListener('click', () => f.schliessen(true));
    beginne();
  });
}

// Zeilen für „Notizen kopieren“
export function verhoerText(def, e) {
  if (!e || !e.erledigt) return [];
  const k = (id) => def.karten.find((x) => x.id === id);
  return [
    '', `VERHÖR: ${def.titel.toUpperCase()}${e.selbst ? '' : ' (nicht selbst gelöst)'}`,
    `Auftrag: ${def.auftrag}`,
    'Gestellte Fragen:', ...e.fragen.map((id) => `- ${k(id).frage}`),
    'Protokoll:', ...(e.protokoll.length ? e.protokoll.map((id) => `- ${def.name}: „${k(id).antwort}“`) : ['- leer']),
  ];
}
