// Baustein A: Vorhersage vor dem Versuch.
// Phase 1 und 2: Frage und Festlegen (ohne Zurück). Phase 3 ist der bestehende Versuch.
// Phase 4: Abgleich (Vorhersage gestrichelt neben dem Ergebnis, Satz in Worten, nie grün oder rot) und Notiz.
import { el, esc } from './oberflaeche.js';

// Ergebnis: id der gewählten Karte oder null (abgebrochen, nichts festgelegt).
export function vorhersageFestlegen(ui, def) {
  return new Promise((fertig) => {
    const kopf = def.marke ? el('div', '', ui.markeHtml(def.marke)) : null;
    const f = ui.fenster({ titel: def.titel, klasse: 'vorhersage', kopf, beiSchliessen: (w) => fertig(typeof w === 'string' ? w : null) });
    f.inhalt.append(el('p', 'klein vorspann', 'Vorhersage: Legt euch fest, bevor ihr es ausprobiert.'));
    if (def.lage) f.inhalt.append(el('p', '', esc(def.lage)));
    f.inhalt.append(el('p', 'auftrag', esc(def.frage)));
    const reihe = el('div', 'optionen karten3');
    let wahl = null;
    const ok = el('button', 'knopf', 'Festlegen'); ok.disabled = true;
    for (const k of def.karten) {
      const b = el('button', 'option', esc(k.text)); b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        wahl = k.id;
        for (const x of reihe.children) { const an = x === b; x.classList.toggle('gewaehlt', an); x.setAttribute('aria-pressed', String(an)); }
        ok.disabled = false;
      });
      reihe.append(b);
    }
    f.inhalt.append(reihe);
    f.fuss.append(el('div', 'links', '<span class="klein">Nach dem Festlegen lässt sich die Vorhersage nicht mehr ändern.</span>'), ok);
    ok.addEventListener('click', () => { if (wahl) f.schliessen(wahl); });
  });
}

// Abgleich nach dem Versuch. ergebnis: { id, text, zusatz } (zusatz z. B. eure Läufe im Versuch).
// Das Fenster lässt sich nicht schließen, ohne die Notiz zu sichern. Ergebnis: Notiztext.
export function vorhersageAbgleich(ui, def, wert, ergebnis, vorgabe = '') {
  return new Promise((fertig) => {
    const kopf = def.marke ? el('div', '', ui.markeHtml(def.marke)) : null;
    const f = ui.fenster({ titel: def.abgleichTitel || 'Abgleich', klasse: 'vorhersage', kopf, schliessbar: false, beiSchliessen: (w) => fertig(w) });
    const karte = (id) => def.karten.find((k) => k.id === id)?.text || '';
    // Ohne Wertung (Kapitel II): Vorhersage neben dem Quellenbefund, kein Treffer-Satz
    if (def.ohneWertung) {
      const paar = el('div', 'vergleich2');
      paar.append(
        el('div', 'vh eigen', `<small>Eure Vorhersage</small><b>${esc(karte(wert))}</b>`),
        el('div', 'vh ergebnis', `<small>${esc(def.befundTitel || 'Was die Quellen berichten')}</small><b>${esc(def.befund)}</b>`),
      );
      f.inhalt.append(paar, el('p', 'klein', esc(def.ohneWertungText || 'Vorhersagen werden hier nicht bewertet. Wichtig ist, was ihr daraus lernt.')));
      f.inhalt.append(el('p', '', esc(ergebnis.text)));
      if (def.quelle) f.inhalt.append(el('p', 'quelle', 'Quelle: ' + esc(def.quelle)));
      f.inhalt.append(el('p', 'auftrag', esc(def.notiz.frage)));
      const t = el('textarea'); t.value = vorgabe; t.maxLength = 600; t.setAttribute('aria-label', def.notiz.frage);
      const rueck = el('div', 'rueck');
      f.inhalt.append(t, rueck);
      const ok = el('button', 'knopf', 'Notiz sichern');
      f.fuss.append(ok);
      ok.addEventListener('click', () => {
        const text = t.value.trim();
        if (text.length < (def.notiz.min || 8)) { rueck.className = 'rueck falsch'; rueck.textContent = def.notiz.zuKurz; return; }
        f.schliessen(text);
      });
      if (!ui.touch) t.focus();
      return;
    }
    const paar = el('div', 'vergleich2');
    paar.append(
      el('div', 'vh eigen', `<small>Eure Vorhersage</small><b>${esc(karte(wert))}</b>`),
      el('div', 'vh ergebnis', `<small>Ergebnis</small><b>${esc(karte(ergebnis.id))}</b>`),
    );
    f.inhalt.append(paar);
    const satz = wert === ergebnis.id ? def.abgleich.treffer : (def.abgleich[wert] || def.abgleich.anders);
    f.inhalt.append(el('p', 'auftrag', esc(satz)));
    f.inhalt.append(el('p', '', esc(ergebnis.text)));
    if (ergebnis.zusatz) f.inhalt.append(el('p', 'klein', esc(ergebnis.zusatz)));
    if (def.quelle) f.inhalt.append(el('p', 'quelle', 'Zahlen: ' + esc(def.quelle)));
    const frage = wert === ergebnis.id ? def.notiz.frageRichtig : def.notiz.frage;
    f.inhalt.append(el('p', 'auftrag', esc(frage)));
    const t = el('textarea'); t.value = vorgabe; t.maxLength = 600; t.setAttribute('aria-label', frage);
    const rueck = el('div', 'rueck');
    f.inhalt.append(t, rueck);
    const ok = el('button', 'knopf', 'Notiz sichern');
    f.fuss.append(ok);
    ok.addEventListener('click', () => {
      const text = t.value.trim();
      if (text.length < (def.notiz.min || 8)) { rueck.className = 'rueck falsch'; rueck.textContent = def.notiz.zuKurz; return; }
      f.schliessen(text);
    });
    if (!ui.touch) t.focus();
  });
}

// Hält Vorhersage und Notiz im Spielstand fest: stand.vorhersagen[id] = { wert, ergebnis, notiz }
export function vorhersageText(def, eintrag) {
  const karte = (id) => def.karten.find((k) => k.id === id)?.text || '–';
  if (def.ohneWertung) return `${def.frage} Vorhersage: ${karte(eintrag.wert)} Quellenbefund: ${def.befund}${eintrag.notiz ? ' Notiz: ' + eintrag.notiz : ''}`;
  return `${def.frage} Vorhersage: ${karte(eintrag.wert)} Ergebnis: ${eintrag.ergebnis ? karte(eintrag.ergebnis) : 'noch offen'}${eintrag.notiz ? ' Notiz: ' + eintrag.notiz : ''}`;
}
