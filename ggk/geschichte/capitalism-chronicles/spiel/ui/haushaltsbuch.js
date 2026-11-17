// Haushaltsbuch der Arbeiterfamilie: eine Seite je Jahr mit denselben Zeilen.
// Schlüsselzahl ist die Arbeitszeit für den Warenkorb. Fehlen recherchierte Werte, zeigt die Seite „Werte folgen“.
import { el, esc } from './oberflaeche.js';
import { rechenblatt } from './raetsel.js';

const zahl = (x) => (Math.round(x * 10) / 10).toLocaleString('de-DE');
// Stunden Arbeit für den Warenkorb = Preis des Warenkorbs / Stundenlohn
export const korbStunden = (s) => (s.werte ? s.werte.korb / (s.werte.lohn / s.werte.stunden) : null);

export function haushaltsbuch(ui, def, { bis = 9999, knopf = 'Schließen' } = {}) {
  return new Promise((fertig) => {
    const seiten = def.seiten.filter((s) => s.jahr <= bis);
    const f = ui.fenster({ titel: def.titel, klasse: 'breit', kopf: el('div', '', ui.markeHtml(def.marke)), beiSchliessen: () => fertig(true) });
    const leiste = el('div', 'reiter'), blatt = el('div', 'hbuch');
    f.inhalt.append(leiste, blatt);
    const zeige = (s) => {
      [...leiste.children].forEach((b) => b.classList.toggle('an', b.dataset.j === String(s.jahr)));
      const w = s.werte;
      const zeilen = def.zeilen.map((z) => `<tr><td>${esc(z.name)}</td><td>${w ? esc(zahl(w[z.id]) + ' ' + z.einheit) : '<i>Werte folgen</i>'}</td></tr>`).join('');
      const std = korbStunden(s);
      blatt.innerHTML = `<h3 class="zw">${s.jahr}: ${esc(s.titel)}</h3><p>${esc(s.text)}</p>
        <div class="tabelle"><table><tbody>${zeilen}
        <tr class="schluessel"><td>Arbeitszeit für den Warenkorb</td><td>${std !== null ? '<b>' + zahl(std) + ' Stunden</b>' : '<i>Werte folgen</i>'}</td></tr></tbody></table></div>
        <p class="klein">${esc(w ? (s.quelle || def.hinweisWerte) : def.hinweisOffen)}</p>`;
    };
    for (const s of seiten) {
      const b = el('button', '', String(s.jahr)); b.dataset.j = String(s.jahr);
      b.addEventListener('click', () => zeige(s));
      leiste.append(b);
    }
    zeige(seiten[seiten.length - 1]);
    // Diagramm, sobald mindestens zwei Jahre Werte haben
    const mit = seiten.filter((s) => s.werte);
    if (mit.length >= 2) {
      const max = Math.max(...mit.map(korbStunden));
      f.inhalt.append(el('div', 'simbalken', `<h3 class="zw">Arbeitszeit für denselben Warenkorb</h3>` + mit.map((s) => `<div class="zeile"><span class="name">${s.jahr}</span><span class="spur"><i class="nach" style="width:${korbStunden(s) / max * 100}%"></i></span><span class="wert"><b>${zahl(korbStunden(s))}</b> Std.</span></div>`).join('')));
    }
    const b = el('button', 'knopf', esc(knopf));
    b.addEventListener('click', () => f.schliessen());
    f.fuss.append(b);
  });
}

// Die Spieler rechnen die Schlüsselzahl eines Jahres selbst aus. Ohne Werte entfällt die Rechnung (Ergebnis: true).
export function rechneKorb(ui, def, jahr) {
  const s = def.seiten.find((x) => x.jahr === jahr);
  if (!s || !s.werte) return Promise.resolve(true);
  const w = s.werte, lohnStd = w.lohn / w.stunden, std = w.korb / lohnStd;
  const r = (x) => Math.round(x * 10) / 10;
  return rechenblatt(ui, {
    titel: `Haushaltsbuch ${jahr}: Rechnet nach`,
    angaben: [`Wochenlohn der Familie: ${zahl(w.lohn)} ${def.einheitGeld}`, `Arbeitszeit in der Woche: ${zahl(w.stunden)} Stunden`, `Preis des Warenkorbs: ${zahl(w.korb)} ${def.einheitGeld}`],
    fragen: [
      { frage: `Wie viel verdient die Familie je Arbeitsstunde? (auf eine Nachkommastelle)`, einheit: def.einheitGeld, loesung: r(lohnStd), weg: `${zahl(w.lohn)} : ${zahl(w.stunden)} = ${zahl(r(lohnStd))}.`, sonst: 'Teilt den Wochenlohn durch die Wochenstunden.', hilfen: ['Stundenlohn = Wochenlohn : Wochenstunden.'] },
      { frage: `Wie viele Stunden muss die Familie für den Warenkorb arbeiten? (auf eine Nachkommastelle)`, einheit: 'Std.', loesung: r(w.korb / r(lohnStd)), weg: `${zahl(w.korb)} : ${zahl(r(lohnStd))} = ${zahl(r(w.korb / r(lohnStd)))} Stunden.`, sonst: 'Teilt den Preis des Warenkorbs durch den Stundenlohn.', hilfen: ['Arbeitszeit = Preis des Warenkorbs : Stundenlohn.'] },
    ],
  });
}
