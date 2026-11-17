// Baustein „Entscheidung mit Folgen“: Lage → Wahl → Folgen → Wen es trifft.
// Alle Zahlen kommen aus simulationen.json und sind Modellzahlen. Es gibt keine Punkte und keine „richtige“ Wahl;
// deshalb sind die Balken einfarbig. Der historische Verlauf wird danach getrennt gezeigt (siehe historisch()).
import { el, esc } from './oberflaeche.js';

const fmt = (x) => (Math.round(x * 10) / 10).toLocaleString('de-DE');

function kopf(ui, def) {
  const k = el('div', '', ui.markeHtml(def.marke || 'modell'));
  return k;
}
function lageHtml(def) {
  return `<p class="auftrag">${esc(def.lage || '')}</p>
    <details class="annahmen"><summary>Annahmen des Modells zeigen</summary><p>${esc(def.annahmen || '')}</p></details>`;
}
function balken(def, werte) {
  return `<div class="simbalken">${def.kennzahlen.map((k) => {
    const max = k.max || Math.max(k.start, ...(def._max?.[k.id] ? [def._max[k.id]] : [])) * 1.05 || 1;
    const v = werte[k.id] ?? k.start;
    return `<div class="zeile"><span class="name">${esc(k.name)}</span>
      <span class="spur"><i class="vor" style="width:${Math.min(100, k.start / max * 100)}%"></i><i class="nach" style="width:${Math.min(100, Math.max(0, v) / max * 100)}%"></i></span>
      <span class="wert">${fmt(k.start)} → <b>${fmt(v)}</b>${k.einheit ? ' ' + esc(k.einheit) : ''}</span></div>`;
  }).join('')}</div><p class="klein">Heller Balken: vorher. Dunkler Balken: nach eurer Entscheidung. Alle Werte sind Modellzahlen.</p>`;
}
function trifftHtml(def, o, werte) {
  const t = o.trifft || {};
  let figuren = '';
  if (def.belegschaft) {
    const k = def.kennzahlen.find((x) => x.id === def.belegschaft);
    const n = Math.max(0, Math.min(10, Math.round(10 * (werte[k.id] ?? k.start) / k.start)));
    figuren = `<div class="belegschaft" aria-label="${n} von 10 behalten die Arbeit">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? '' : 'weg'}"></i>`).join('')}<small>${n} von 10 behalten hier ihre Arbeit</small></div>`;
  }
  const namen = { belegschaft: 'Belegschaft', eigentuemer: 'Eigentümer', kundschaft: 'Kundschaft', haushalte: 'Haushalte', staat: 'Verwaltung' };
  return `<h3 class="zw">Wen es trifft</h3>${figuren}<div class="trifft">${Object.entries(t).map(([g, s]) => `<div><b>${esc(namen[g] || g)}</b>${esc(s)}</div>`).join('')}</div>`;
}
// größter Wert je Kennzahl über alle Optionen (für die Balkenlänge)
function maxima(def, liste) {
  const m = {};
  for (const k of def.kennzahlen) m[k.id] = Math.max(k.start, ...liste.map((o) => (o.werte?.[k.id] ?? k.start + (o.wirkung?.[k.id] || 0))));
  def._max = m;
}

// Einfache Entscheidung. Varianten: optionen (eine oder bis maxWahl), entscheidungen + kombis (zwei Fragen, ein Ergebnis).
// Ergebnis: { wahl: [ids], werte } oder null (abgebrochen).
export function simulation(ui, def, beiErgebnis = null) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: kopf(ui, def), beiSchliessen: (w) => fertig(w || null) });
    const alle = def.kombis ? Object.values(def.kombis) : def.optionen;
    maxima(def, alle);
    const max = def.maxWahl || 1;
    const wahl = new Set();
    const zeigeWahl = () => {
      f.inhalt.innerHTML = lageHtml(def);
      f.fuss.innerHTML = '';
      const weiter = el('button', 'knopf', 'Entscheiden'); weiter.disabled = true;
      if (def.entscheidungen) {
        const gew = {};
        for (const e of def.entscheidungen) {
          f.inhalt.append(el('h3', 'zw', esc(e.titel)));
          const r = el('div', 'simwahl');
          for (const o of e.optionen) {
            const b = el('button', 'option', `<b>${esc(o.text)}</b>${o.detail ? `<small>${esc(o.detail)}</small>` : ''}`);
            b.addEventListener('click', () => { gew[e.id] = o.id; [...r.children].forEach((x) => x.classList.toggle('gewaehlt', x === b)); weiter.disabled = Object.keys(gew).length < def.entscheidungen.length; });
            r.append(b);
          }
          f.inhalt.append(r);
        }
        weiter.addEventListener('click', () => { const key = def.entscheidungen.map((e) => gew[e.id]).join('+'); zeigeFolgen([key], def.kombis[key]); });
      } else {
        if (max > 1) f.inhalt.append(el('p', 'klein', `Ihr könnt höchstens ${max} Maßnahmen wählen.`));
        const r = el('div', 'simwahl');
        for (const o of def.optionen) {
          const b = el('button', 'option', `<b>${esc(o.text)}</b>${o.detail ? `<small>${esc(o.detail)}</small>` : ''}`);
          b.addEventListener('click', () => {
            if (max === 1) { wahl.clear(); wahl.add(o.id); }
            else if (wahl.has(o.id)) wahl.delete(o.id);
            else if (wahl.size < max) wahl.add(o.id);
            [...r.children].forEach((x, i) => x.classList.toggle('gewaehlt', wahl.has(def.optionen[i].id)));
            weiter.disabled = wahl.size === 0;
          });
          r.append(b);
        }
        f.inhalt.append(r);
        weiter.addEventListener('click', () => {
          const gew = def.optionen.filter((o) => wahl.has(o.id));
          if (gew.length === 1) return zeigeFolgen([gew[0].id], gew[0]);
          // mehrere Maßnahmen: Wirkungen addieren, Texte untereinander
          const summe = { wirkung: {}, folge: gew.map((o) => `${o.text}: ${o.folge}`).join('\n'), trifft: {}, kosten: gew.map((o) => o.kosten).filter(Boolean).join(' · ') };
          for (const o of gew) { for (const [k, v] of Object.entries(o.wirkung || {})) summe.wirkung[k] = (summe.wirkung[k] || 0) + v; for (const [g, s] of Object.entries(o.trifft || {})) summe.trifft[g] = (summe.trifft[g] ? summe.trifft[g] + ' ' : '') + s; }
          zeigeFolgen(gew.map((o) => o.id), summe);
        });
      }
      f.fuss.append(weiter);
    };
    const zeigeFolgen = (ids, o) => {
      const werte = {};
      for (const k of def.kennzahlen) {
        let v = o.werte?.[k.id] ?? (k.start + (o.wirkung?.[k.id] || 0));
        if (k.max) v = Math.min(k.max, v);
        werte[k.id] = Math.max(k.min ?? -1e9, v);
      }
      beiErgebnis?.({ wahl: ids, werte });
      f.inhalt.innerHTML = `<h3 class="zw">Folgen eurer Entscheidung</h3>${balken(def, werte)}
        ${(o.folge || '').split('\n').map((t) => `<p>${esc(t)}</p>`).join('')}
        ${o.kosten ? `<p class="klein"><b>Kosten:</b> ${esc(o.kosten)}</p>` : ''}${o.risiko ? `<p class="klein"><b>Risiko:</b> ${esc(o.risiko)}</p>` : ''}
        ${trifftHtml(def, o, werte)}`;
      f.inhalt.scrollTop = 0;
      f.fuss.innerHTML = '';
      const neu = el('button', 'knopf still', 'Andere Wahl ansehen');
      neu.addEventListener('click', () => { wahl.clear(); zeigeWahl(); });
      const weiter = el('button', 'knopf', 'Dabei bleiben');
      weiter.addEventListener('click', () => f.schliessen({ wahl: ids, werte }));
      const links = el('div', 'links'); links.append(neu);
      f.fuss.append(links, weiter);
    };
    zeigeWahl();
  });
}

// Mehrere Runden. Jede Runde: Lage, Wahl, Folge. Regeln mit Zahlen stehen in den Daten (regel: 'markt').
// Ergebnis: { runden: [{ wahl, ... }] } oder null.
export function rundenSimulation(ui, def, beiErgebnis = null) {
  return new Promise((fertig) => {
    const punkte = el('div', 'schritte', def.runden.map(() => '<i></i>').join(''));
    const k = el('div', 'simkopf'); k.innerHTML = ui.markeHtml(def.marke || 'modell'); k.append(punkte);
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: k, beiSchliessen: (w) => fertig(w || null) });
    const verlauf = [];
    let i = 0;
    const zeige = () => {
      const r = def.runden[i];
      [...punkte.children].forEach((p, n) => { p.className = n < i ? 'fertig' : n === i ? 'jetzt' : ''; });
      let bestand = null;
      if (def.regel === 'markt') {
        bestand = typeof r.bestand === 'number' ? r.bestand : (verlauf[0].preis >= r.bestand.schwelle ? r.bestand.hoch : r.bestand.niedrig);
      }
      f.inhalt.innerHTML = `<h3 class="zw">${esc(r.titel)}</h3><p class="auftrag">${esc(r.lage)}</p>` +
        (bestand !== null ? `<p><b>Im Lager:</b> ${bestand} Paar Schuhe.${i > 0 ? ' ' + esc(verlauf[0].preis >= r.bestand.schwelle ? r.bestand.textHoch : r.bestand.textNiedrig) : ''}</p>` : '') +
        (i === 0 ? `<details class="annahmen"><summary>Annahmen des Modells zeigen</summary><p>${esc(def.annahmen)}</p></details>` : '');
      const reihe = el('div', 'simwahl');
      const folge = el('div');
      f.inhalt.append(reihe, folge);
      f.fuss.innerHTML = '';
      const weiter = el('button', 'knopf', i < def.runden.length - 1 ? 'Nächste Runde' : 'Weiter'); weiter.hidden = true;
      f.fuss.append(weiter);
      for (const o of r.optionen) {
        const b = el('button', 'option', `<b>${esc(o.text)}</b>${o.detail ? `<small>${esc(o.detail)}</small>` : ''}`);
        b.addEventListener('click', () => {
          if (!weiter.hidden) return;
          b.classList.add('gewaehlt');
          const e = { wahl: o.id, runde: i };
          let html = `<p>${esc(o.folge || '')}</p>`;
          if (def.regel === 'markt') {
            const nach = r.nachfrage[String(o.preis)];
            const verkauft = Math.min(bestand, nach);
            Object.assign(e, { preis: o.preis, bestand, verkauft, umsatz: verkauft * o.preis, leer: nach - verkauft, rest: bestand - verkauft, weber: o.preis <= def.weberMax });
            html = `<div class="simbalken">
              <div class="zeile"><span class="name">Kaufwillige</span><span class="spur"><i class="nach" style="width:${nach / 1.3}%"></i></span><span class="wert"><b>${nach}</b></span></div>
              <div class="zeile"><span class="name">Verkauft</span><span class="spur"><i class="nach" style="width:${verkauft / 1.3}%"></i></span><span class="wert"><b>${verkauft}</b> Paar</span></div>
              <div class="zeile"><span class="name">Leer ausgegangen</span><span class="spur"><i class="nach" style="width:${e.leer / 1.3}%"></i></span><span class="wert"><b>${e.leer}</b></span></div></div>
              <p>Umsatz: <b>${e.umsatz} DM</b>. Im Regal bleiben ${e.rest} Paar.</p>
              <p>${esc(o.folge || '')}</p><p>${esc(e.weber ? def.weberJa : def.weberNein)}</p>`;
          }
          folge.innerHTML = html;
          verlauf.push(e);
          beiErgebnis?.(e, verlauf);
          weiter.hidden = false;
          folge.scrollIntoView({ block: 'nearest' });
        });
        reihe.append(b);
      }
      weiter.addEventListener('click', () => { if (i < def.runden.length - 1) { i++; zeige(); } else f.schliessen({ runden: verlauf }); });
    };
    zeige();
  });
}

// Preisfreigabe (B2): je Warengruppe frei oder kontrolliert. Ergebnis: { frei: [ids], werte } oder null.
export function freigabe(ui, def, beiErgebnis = null) {
  return new Promise((fertig) => {
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: kopf(ui, def), beiSchliessen: (w) => fertig(w || null) });
    const frei = new Set();
    const rechne = () => {
      let angebot = 0, preis = 0, haerte = 0;
      for (const g of def.gruppen) {
        const st = def.stufen[g.knappheit];
        if (frei.has(g.id)) { angebot += 10; preis += st.preis; if (g.grundbedarf) haerte += st.haerte; }
        else angebot += 10 - st.mangel;
      }
      return { angebot, preis: 100 + preis / def.gruppen.length, haerte };
    };
    const wahlAnsicht = () => {
      f.inhalt.innerHTML = lageHtml(def);
      const liste = el('div', 'freigabe');
      for (const g of def.gruppen) {
        const z = el('button', 'option' + (frei.has(g.id) ? ' gewaehlt' : ''), `<b>${esc(g.name)}</b><small>Knappheit: ${esc(g.knappheit)}${g.grundbedarf ? ' · Grundbedarf' : ''}</small><em>${frei.has(g.id) ? 'frei' : 'kontrolliert'}</em>`);
        z.addEventListener('click', () => { frei.has(g.id) ? frei.delete(g.id) : frei.add(g.id); z.classList.toggle('gewaehlt', frei.has(g.id)); z.querySelector('em').textContent = frei.has(g.id) ? 'frei' : 'kontrolliert'; });
        liste.append(z);
      }
      f.inhalt.append(liste);
      f.fuss.innerHTML = '';
      const w = el('button', 'knopf', 'Entwurf vorlegen');
      w.addEventListener('click', folgen);
      f.fuss.append(w);
    };
    const folgen = () => {
      const w = rechne();
      beiErgebnis?.({ frei: [...frei], werte: w });
      const zeile = (name, v, max, txt) => `<div class="zeile"><span class="name">${name}</span><span class="spur"><i class="nach" style="width:${Math.min(100, v / max * 100)}%"></i></span><span class="wert"><b>${txt}</b></span></div>`;
      const treffer = def.gruppen.filter((g) => frei.has(g.id) === (g.historisch === 'frei')).length;
      f.inhalt.innerHTML = `<h3 class="zw">Folgen eures Entwurfs</h3><div class="simbalken">
        ${zeile('Warenangebot', w.angebot, 100, fmt(w.angebot) + ' von 100')}
        ${zeile('Preisniveau', w.preis - 80, 60, fmt(w.preis))}
        ${zeile('Härte für Haushalte mit wenig Geld', w.haerte, def.haerteMax, fmt(w.haerte) + ' von ' + def.haerteMax)}</div>
        <p>${esc(def.folge)}</p>
        <h3 class="zw">Was 1948 entschieden wurde ${ui.markeHtml('tatsache')}</h3>
        <div class="tabelle"><table><thead><tr><th>Warengruppe</th><th>euer Entwurf</th><th>1948</th></tr></thead><tbody>
        ${def.gruppen.map((g) => `<tr><td>${esc(g.name)}</td><td>${frei.has(g.id) ? 'frei' : 'kontrolliert'}</td><td>${esc(g.historisch)}${g.offen ? ' *' : ''}</td></tr>`).join('')}</tbody></table></div>
        <p class="klein">In ${treffer} von ${def.gruppen.length} Gruppen habt ihr wie die Verwaltung von 1948 entschieden. Das ist kein Maßstab für „richtig“. ${esc(def.historischHinweis || '')}</p>
        <p class="quelle">Quelle: ${esc(def.quelle || '')}</p>`;
      f.inhalt.scrollTop = 0;
      f.fuss.innerHTML = '';
      const neu = el('button', 'knopf still', 'Entwurf ändern'); neu.addEventListener('click', wahlAnsicht);
      const ok = el('button', 'knopf', 'Weiter'); ok.addEventListener('click', () => f.schliessen({ frei: [...frei], werte: w }));
      const links = el('div', 'links'); links.append(neu);
      f.fuss.append(links, ok);
    };
    wahlAnsicht();
  });
}

// Getrennte Karte: was historisch geschah. Die eigene Wahl wird nicht daran gemessen.
export function historisch(ui, def) {
  const h = def.historisch;
  return ui.karte({ titel: 'Was historisch geschah', marke: h.marke || 'tatsache', text: h.text + (h.sekundaer ? '\nHinweis: Diese Angabe stützt sich bisher auf Sekundärquellen und wird noch an der Fachliteratur geprüft.' : ''), quelle: h.quelle });
}

// Prüfregel der Bauvorlage: Keine Option darf in allen Kennzahlen mindestens so gut sein wie eine andere.
// „besser“ je Kennzahl steht in den Daten (gut: 'hoch' | 'niedrig'); Kennzahlen ohne Angabe zählen nicht.
export function pruefeDominanz(def) {
  const liste = def.kombis ? Object.entries(def.kombis).map(([id, o]) => ({ id, ...o })) : (def.optionen || []);
  const ks = (def.kennzahlen || []).filter((k) => k.gut);
  const wert = (o, k) => o.werte?.[k.id] ?? (k.start + (o.wirkung?.[k.id] || 0));
  const funde = [];
  for (const a of liste) for (const b of liste) {
    if (a === b || !ks.length) continue;
    const besserOderGleich = ks.every((k) => (k.gut === 'hoch' ? wert(a, k) >= wert(b, k) : wert(a, k) <= wert(b, k)));
    const echt = ks.some((k) => wert(a, k) !== wert(b, k));
    if (besserOderGleich && echt && !(a.kosten || a.risiko)) funde.push(`${def.id}: „${a.id}“ ist überall mindestens so gut wie „${b.id}“ und hat weder Kosten noch Risiko.`);
  }
  return funde;
}
