// Benutzeroberfläche: Titelbildschirm, Spielanzeige, Dialog, Tagebuch, Inventar, Stadtplan, Einstellungen.
export const el = (tag, klasse, html) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (html !== undefined) e.innerHTML = html;
  return e;
};
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Seite je Kapitel (relativ zum Spielordner): Ein Link öffnet immer genau dieses Kapitel.
const SEITEN = { 1: 'index.html', 2: 'kapitel-2.html', 3: 'kapitel-3.html' };
export const tabelleHtml = (t) => `<div class="tabelle"><table><thead><tr>${t.kopf.map((k) => `<th>${esc(k)}</th>`).join('')}</tr></thead><tbody>${t.zeilen.map((z) => `<tr>${z.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
export const warte = (ms) => new Promise((r) => setTimeout(r, ms));

const ICON = {
  buch: '<svg viewBox="0 0 24 24"><path d="M4 5.5c3-1 6-.8 8 1 2-1.8 5-2 8-1v12.5c-3-1-6-.8-8 1-2-1.8-5-2-8-1z"/><path d="M12 6.5v12.5"/></svg>',
  tasche: '<svg viewBox="0 0 24 24"><path d="M4.5 9h15l-1.2 10.5H5.7z"/><path d="M9 9V7.2a3 3 0 0 1 6 0V9"/><path d="M9.5 13h5"/></svg>',
  karte: '<svg viewBox="0 0 24 24"><path d="M3.5 6.5l5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/></svg>',
  rad: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4"/><path d="M12 3v2.6M12 18.4V21M3 12h2.6M18.4 12H21M5.6 5.6l1.9 1.9M16.5 16.5l1.9 1.9M5.6 18.4l1.9-1.9M16.5 7.5l1.9-1.9"/></svg>',
};

export class Oberflaeche {
  constructor(wurzel, canvas) {
    this.wurzel = wurzel;
    this.canvas = canvas;
    this.offen = [];           // Stapel offener Fenster
    this.portraits = {};
    this.neu = new Set();
    this.touch = window.matchMedia('(pointer: coarse)').matches;

    wurzel.innerHTML = `
      <div id="hud" class="aus">
        <div class="siegel"></div>
        <div class="ziel" hidden></div>
        <div class="menue">
          <button class="rund" data-a="tagebuch" aria-label="Tagebuch" title="Tagebuch (T)">${ICON.buch}<span class="punkt" hidden></span></button>
          <button class="rund" data-a="inventar" aria-label="Funde und Belege" title="Funde und Belege">${ICON.tasche}<span class="punkt" hidden></span></button>
          <button class="rund" data-a="plan" aria-label="Stadtplan" title="Stadtplan (M)">${ICON.karte}</button>
          <button class="rund" data-a="einstellungen" aria-label="Einstellungen" title="Einstellungen">${ICON.rad}</button>
        </div>
      </div>
      <div id="joystick"><div class="knauf"></div></div>
      <button id="hinweis" hidden></button>
      <button id="tat" class="knopf" hidden></button>
      <div id="meldungen"></div>
      <div id="blende"></div>
      <div id="titel">
        <div class="foto"></div><div class="korn"></div><div class="vignette"></div><div class="rahmen"></div>
        <div class="inhalt">
          <div>
            <h1 class="reihe"><small>Eine Lernspielreihe zur Wirtschaftsgeschichte</small>The Capitalism<br>Chronicles</h1>
            <div class="linie"></div>
            <div class="kapitel"></div>
          </div>
          <div class="unten">
            <div class="lade">Die Stadt wird aufgebaut …</div>
            <div class="knoepfe" hidden></div>
            <p class="hinweis"></p>
          </div>
        </div>
      </div>`;
    const q = (s) => wurzel.querySelector(s);
    this.hud = q('#hud'); this.siegelEl = q('.siegel'); this.zielEl = q('.ziel');
    this.joystick = q('#joystick'); this.hinweisEl = q('#hinweis'); this.tat = q('#tat');
    this.meldungen = q('#meldungen'); this.blendeEl = q('#blende'); this.titel = q('#titel');

    q('.menue').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      b.blur();
      if (this.spiel.blockiert) return;
      ({ tagebuch: () => this.oeffneTagebuch(), inventar: () => this.oeffneInventar(), plan: () => this.oeffneStadtplan(), einstellungen: () => this.oeffneEinstellungen() })[b.dataset.a]();
    });
    const tu = (e) => { e.currentTarget.blur(); this.spiel.interagiere(); };
    this.hinweisEl.addEventListener('click', tu);
    this.tat.addEventListener('click', tu);
  }

  verbinde(spiel, daten) {
    this.spiel = spiel; this.daten = daten;
    this.titel.querySelector('.kapitel').textContent = `Kapitel ${daten.kapitel.nummer} – ${daten.kapitel.titel}`;
    this.titel.querySelector('.hinweis').textContent = daten.kapitel.hinweisFiktion;
    if (daten.kapitel.titelbild) this.titel.querySelector('.foto').style.backgroundImage = `url("${daten.kapitel.titelbild}")`;
    if (daten.kapitel.ladetext) this.titel.querySelector('.lade').textContent = daten.kapitel.ladetext;
    this.setzeSiegel();
  }

  // ---------------------------------------------------------------- Titel
  zeigeTitel(hatStand, kapitel = 1) {
    return new Promise((fertig) => {
      const k = this.titel.querySelector('.knoepfe');
      this.titel.querySelector('.lade').hidden = true;
      k.hidden = false;
      k.innerHTML = '';
      const neu = el('button', hatStand ? 'knopf hell' : 'knopf', hatStand ? 'Neu beginnen' : 'Spiel beginnen');
      if (hatStand) {
        const weiter = el('button', 'knopf', 'Weiterspielen');
        weiter.addEventListener('click', () => fertig('weiter'));
        k.append(weiter);
      }
      let sicher = !hatStand;
      neu.addEventListener('click', () => {
        if (!sicher) { sicher = true; neu.textContent = 'Spielstand wirklich löschen?'; return; }
        fertig('neu');
      });
      k.append(neu);
      // Wechsel zwischen den Kapiteln: Die Wahl gilt für diesen Tab.
      const reihe = el('div', 'kapitelreihe');
      for (const n of [1, 2, 3].filter((x) => x !== kapitel)) {
        const w = el('button', 'knopf hell kapitelwahl', `Zu Kapitel ${'I'.repeat(n)}`);
        w.addEventListener('click', () => { window.location.href = new URL(SEITEN[n], window.location.href).href; });
        reihe.append(w);
      }
      if (kapitel === 3) {
        const b = el('button', 'knopf hell kapitelwahl', 'Beamer-Ansicht (Lehrkraft)');
        b.addEventListener('click', () => window.open(new URL('kapitel-3.html?beamer', window.location.href).href, '_blank'));
        reihe.append(b);
      }
      k.append(reihe);
    });
  }

  async blendeTitel() {
    this.titel.classList.add('geht');
    await warte(650);
    this.titel.classList.add('blendet');
    await warte(1500);
    this.canvas.classList.remove('sepia');
    await warte(1300);
    this.titel.remove();
  }

  zeigeHud(an = true) { this.hud.classList.toggle('aus', !an); }

  ueberspringen(tu) {
    const b = el('button', 'knopf hell', 'Überspringen'); b.id = 'ueberspringen';
    b.addEventListener('click', () => { tu(); b.remove(); });
    this.wurzel.append(b);
    return () => b.remove();
  }

  // ---------------------------------------------------------------- Spielanzeige
  setzeSiegel() {
    const funde = this.spiel.stand.funde;
    this.siegelEl.innerHTML = this.daten.stationen.map((s) =>
      `<i class="${funde.includes(s.nr) ? 'voll' : ''}" title="${esc(s.name)}">${s.roemisch}</i>`).join('');
  }

  setzeZiel(text) {
    this.zielEl.hidden = !text;
    if (text) this.zielEl.innerHTML = `<b>Ziel</b>${esc(text)}`;
  }

  zeigeHinweis(text, x, y, sichtbar) {
    const h = this.hinweisEl;
    if (this._hinweisText !== text) {
      this._hinweisText = text;
      h.innerHTML = this.touch ? `<span style="padding-left:.5em">${esc(text)}</span>` : `<kbd>E</kbd><span>${esc(text)}</span>`;
      this.tat.textContent = text;
    }
    h.hidden = !sichtbar;
    h.style.left = Math.max(90, Math.min(window.innerWidth - 90, x)) + 'px';
    h.style.top = Math.max(70, Math.min(window.innerHeight - 40, y)) + 'px';
    this.tat.hidden = !this.touch;
  }

  versteckeHinweis() {
    if (!this.hinweisEl.hidden) this.hinweisEl.hidden = true;
    if (!this.tat.hidden) this.tat.hidden = true;
  }

  melde(html, dauer = 4200) {
    const m = el('div', 'meldung', html);
    this.meldungen.append(m);
    while (this.meldungen.children.length > 3) this.meldungen.firstChild.remove();
    setTimeout(() => m.remove(), dauer);
  }

  blende(an) {
    this.blendeEl.classList.toggle('an', an);
    return warte(380);
  }

  // Kurzer Kommentar am unteren Rand, der das Spiel nicht anhält.
  kommentar(zeile, dauer = 6500) {
    this._kommentar?.remove();
    clearTimeout(this._kommentarUhr);
    const p = this.daten.personen[zeile.wer];
    const k = el('div', '', `<img alt="" src="${this.portraits[zeile.wer] || ''}"><span><b>${esc(p.name.split(',')[0])}:</b> ${esc(zeile.text)}</span>`);
    k.id = 'kommentar';
    this.wurzel.append(k);
    this._kommentar = k;
    this._kommentarUhr = setTimeout(() => k.remove(), dauer);
  }

  // ---------------------------------------------------------------- Tasten
  taste(code) {
    if (this._dialogWeiter) {
      if (code === 'KeyE' || code === 'Space' || code === 'Enter') this._dialogWeiter();
      return true;
    }
    const f = this.offen[this.offen.length - 1];
    if (!f) return false;
    if (code === 'Escape' && f.schliessbar) f.schliessen(null);
    return true;
  }

  // ---------------------------------------------------------------- Fenster
  fenster({ titel, klasse = '', schliessbar = true, art = '', kopf = null, beiSchliessen = null }) {
    this._kommentar?.remove();
    const schleier = el('div', 'schleier ' + art);
    const f = el('div', 'fenster papier ' + klasse);
    const header = el('header');
    const h = el('h2', '', esc(titel));
    header.append(h);
    if (kopf) header.append(kopf);
    const zu = el('button', 'zu', '×'); zu.setAttribute('aria-label', 'Schließen');
    if (schliessbar) header.append(zu);
    const inhalt = el('div', 'inhalt');
    const fuss = el('footer');
    f.append(header, inhalt, fuss);
    schleier.append(f);
    this.wurzel.append(schleier);
    this.spiel.sperre();
    const obj = {
      el: f, inhalt, fuss, header, schliessbar,
      schliessen: (wert) => {
        if (obj.zu) return; obj.zu = true;
        schleier.remove();
        this.offen = this.offen.filter((x) => x !== obj);
        this.spiel.entsperre();
        beiSchliessen?.(wert);
      },
    };
    zu.addEventListener('click', () => obj.schliessen(null));
    this.offen.push(obj);
    return obj;
  }

  markeHtml(m) {
    const d = this.daten.marken[m];
    return d ? `<span class="marke ${m}" title="${esc(d.text)}">${esc(d.name)}</span>` : '';
  }

  // Informationskarte (Dokument, Erklärung, Fund).
  karte({ titel, marke = null, text = '', zitat = null, quelle = null, knopf = 'Weiter', klasse = '', tabelle = null }) {
    return new Promise((fertig) => {
      const kopf = marke ? el('div', '', this.markeHtml(marke)) : null;
      const f = this.fenster({ titel, schliessbar: false, kopf, klasse, beiSchliessen: () => fertig() });
      f.inhalt.innerHTML = (zitat ? `<blockquote>„${esc(zitat)}“</blockquote>` : '') +
        text.split('\n').map((t) => `<p>${esc(t)}</p>`).join('') + (tabelle ? tabelleHtml(tabelle) : '') +
        (quelle ? `<p class="quelle">Quelle: ${esc(quelle)}</p>` : '');
      const b = el('button', 'knopf', esc(knopf));
      b.addEventListener('click', () => f.schliessen());
      f.fuss.append(b);
      if (!this.touch) b.focus();
    });
  }

  // ---------------------------------------------------------------- Dialog
  dialog(zeilen, beiZeile = null) {
    if (!Array.isArray(zeilen)) zeilen = [zeilen];
    this._kommentar?.remove();
    return new Promise((fertig) => {
      this.spiel.sperre();
      const d = el('div', 'papier'); d.id = 'dialog';
      d.innerHTML = `<div class="bild"><img alt=""></div><div class="rede"><div class="name"></div><div class="text"></div><div class="weiter">${this.touch ? 'Antippen' : '<kbd>E</kbd> oder Klick'}</div></div>`;
      this.wurzel.append(d);
      let i = -1, bereit = 0;
      const zeige = () => {
        i++;
        if (i >= zeilen.length) {
          d.remove(); this._dialogWeiter = null; this.spiel.entsperre(); fertig(); return;
        }
        const z = zeilen[i], p = this.daten.personen[z.wer];
        d.querySelector('img').src = this.portraits[z.wer] || '';
        d.querySelector('.name').innerHTML = esc(p.name) + (p.fiktiv ? ' ' + this.markeHtml('erfunden') : '');
        d.querySelector('.text').textContent = z.text;
        bereit = performance.now() + 220;
        beiZeile?.(z);
      };
      const weiter = () => { if (performance.now() > bereit) zeige(); };
      d.addEventListener('click', weiter);
      this._dialogWeiter = weiter;
      zeige();
    });
  }

  // ---------------------------------------------------------------- Tagebuch und Inventar
  schalteFrei(...ids) {
    const st = this.spiel.stand;
    for (const id of ids) {
      if (st.tagebuch.includes(id)) continue;
      const e = this.daten.tagebuch.find((x) => x.id === id);
      if (!e) continue;
      st.tagebuch.push(id);
      this.neu.add(id);
      this.melde(`Neu im Tagebuch: <b>${esc(e.titel)}</b>`);
      this.hud.querySelector('[data-a="tagebuch"] .punkt').hidden = false;
    }
    this.spiel.sichere();
  }

  gibBeleg(id) {
    const st = this.spiel.stand;
    if (st.belege.includes(id)) return;
    const b = this.daten.belege.find((x) => x.id === id);
    if (!b) return;
    st.belege.push(id);
    this.melde(`Neuer Beleg: <b>${esc(b.titel)}</b>`);
    this.hud.querySelector('[data-a="inventar"] .punkt').hidden = false;
    this.spiel.sichere();
  }

  oeffneTagebuch(reiter = null) {
    if (this.spiel.blockiert) return;
    const st = this.spiel.stand;
    const f = this.fenster({ titel: 'Tagebuch', klasse: 'voll' });
    this.hud.querySelector('[data-a="tagebuch"] .punkt').hidden = true;
    const namen = { funde: 'Funde', stadt: this.daten.kapitel.reiterStadt || 'Stadt 1845', dokumente: 'Dokumente', personen: 'Personen', begriffe: 'Begriffe' };
    const leiste = el('div', 'reiter');
    const liste = el('div');
    f.inhalt.append(leiste, liste);
    const frei = this.daten.tagebuch.filter((e) => st.tagebuch.includes(e.id));
    const zeige = (r) => {
      [...leiste.children].forEach((b) => b.classList.toggle('an', b.dataset.r === r));
      const eintraege = frei.filter((e) => e.reiter === r);
      liste.innerHTML = eintraege.length ? eintraege.map((e) => `
        <div class="eintrag ${this.neu.has(e.id) ? 'neu' : ''}">
          <h3><span>${esc(e.titel)}</span>${this.markeHtml(e.marke)}</h3>
          ${e.zitat ? `<blockquote>„${esc(e.zitat)}“</blockquote>` : ''}
          <p>${esc(e.text)}</p>
          ${e.quelle ? `<p class="quelle">Quelle: ${esc(e.quelle)}</p>` : ''}
        </div>`).join('') : `<div class="leer">Hier steht noch nichts. Einträge kommen hinzu, während ihr die Stadt erkundet.</div>`;
      if (r === 'funde') {
        for (const [k, titel] of Object.entries(this.daten.notizTitel || {})) {
          const n = st.notizen[k];
          if (n) liste.insertAdjacentHTML('beforeend', `<div class="eintrag"><h3><span>${esc(titel)}</span></h3><p>${esc(n)}</p></div>`);
        }
      }
      eintraege.forEach((e) => this.neu.delete(e.id));
      f.inhalt.scrollTop = 0;
    };
    for (const r of Object.keys(namen)) {
      const anzahl = frei.filter((e) => e.reiter === r).length;
      const b = el('button', '', `${namen[r]} (${anzahl})`); b.dataset.r = r;
      b.addEventListener('click', () => zeige(r));
      leiste.append(b);
    }
    const start = reiter || (['funde', 'stadt', 'dokumente', 'personen', 'begriffe'].find((r) => frei.some((e) => e.reiter === r && this.neu.has(e.id))) || 'dokumente');
    zeige(start);
    const legende = el('div', 'links markenlegende', (this.daten.kapitel.legende || ['tatsache', 'theorie', 'vereinfachung', 'kontroverse']).map((m) => `<span>${this.markeHtml(m)} ${esc(this.daten.marken[m].text)}</span>`).join(''));
    const kopieren = el('button', 'knopf still', 'Notizen kopieren');
    kopieren.addEventListener('click', () => this.kopiere(this.notizenText(), kopieren));
    f.fuss.append(legende, kopieren);
  }

  notizenText() {
    const st = this.spiel.stand, d = this.daten;
    const z = [`THE CAPITALISM CHRONICLES – Kapitel ${d.kapitel.nummer}: ${d.kapitel.titel}`, ''];
    z.push('FUNDE');
    const funde = d.stationen.filter((s) => st.funde.includes(s.nr));
    z.push(...(funde.length ? funde.map((s) => `- Station ${s.roemisch} (${s.name}): ${s.fund}`) : ['- noch keine']));
    z.push('', 'BELEGE');
    const belege = d.belege.filter((b) => st.belege.includes(b.id));
    z.push(...(belege.length ? belege.map((b) => `- ${b.titel}: ${b.text}`) : ['- noch keine']));
    z.push('', (this.daten.kapitel.reiterStadt || 'Stadt 1845').toUpperCase() + ', BEGRIFFE UND DOKUMENTE');
    for (const e of d.tagebuch.filter((x) => st.tagebuch.includes(x.id) && (x.reiter === 'begriffe' || x.reiter === 'dokumente' || x.reiter === 'stadt')))
      z.push(`- ${e.titel} [${d.marken[e.marke].name}]: ${e.zitat ? '„' + e.zitat + '“ ' : ''}${e.text}${e.quelle ? ' (Quelle: ' + e.quelle + ')' : ''}`);
    for (const [k, titel] of Object.entries(d.notizTitel || {})) if (st.notizen[k]) z.push('', titel.toUpperCase(), st.notizen[k]);
    // Abschnitte mit festen Kopfzeilen: Kapitel III liest sie beim Einfügen auf einem anderen Gerät.
    const tipps = (x) => ['p1', 'p2', 'p3'].map((p) => `${p}: ${x[p]}`).join(', ');
    if (st.tippsKapitel1) z.push('', 'TIPPS 1845', tipps(st.tippsKapitel1));
    if (st.tippsNeu) z.push('', 'TIPPS NEU', tipps(st.tippsNeu));
    if (st.sim && Object.keys(st.sim).length) z.push('', 'ENTSCHEIDUNGEN', ...Object.entries(st.sim).map(([k, v]) => `${k}: ${[].concat(v).join(', ')}`));
    if (this.notizenZusatz) z.push(...this.notizenZusatz());
    return z.join('\n');
  }

  async kopiere(text, knopf) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch (e) { ok = false; }
    if (ok) { const alt = knopf.textContent; knopf.textContent = 'Kopiert'; setTimeout(() => (knopf.textContent = alt), 1800); return; }
    // Ersatz: Text zum Markieren anzeigen
    const f = this.fenster({ titel: 'Notizen kopieren' });
    f.inhalt.innerHTML = '<p class="klein">Automatisches Kopieren ist hier nicht möglich. Markiert den Text und kopiert ihn von Hand.</p>';
    const t = el('textarea'); t.value = text; t.readOnly = true; t.style.minHeight = '16em';
    f.inhalt.append(t);
    t.focus(); t.select();
  }

  oeffneInventar() {
    if (this.spiel.blockiert) return;
    const st = this.spiel.stand;
    this.hud.querySelector('[data-a="inventar"] .punkt').hidden = true;
    const f = this.fenster({ titel: 'Funde und Belege', klasse: 'seite', art: '' });
    f.el.parentElement.style.justifyContent = 'flex-end';
    f.el.parentElement.style.padding = '0';
    const funde = this.daten.stationen.filter((s) => st.funde.includes(s.nr));
    const belege = this.daten.belege.filter((b) => st.belege.includes(b.id));
    f.inhalt.innerHTML =
      `<p class="klein">${esc(this.daten.kapitel.inventarText || 'Funde sichert ihr am Ende jeder Station. Belege sind eure Beweisstücke: In Station V baut ihr daraus die Anklageschrift.')}</p>` +
      (funde.length ? funde.map((s) => `<div class="beleg"><b>Fund ${s.roemisch}: ${esc(s.fund)}</b>Station „${esc(s.name)}“</div>`).join('') : '') +
      (belege.length ? belege.map((b) => `<div class="beleg"><b>${esc(b.titel)}</b>${esc(b.text)}</div>`).join('') : '') +
      (!funde.length && !belege.length ? '<div class="leer">Noch keine Funde oder Belege.</div>' : '');
  }

  oeffneStadtplan() {
    if (this.spiel.blockiert || !this.planFn) return;
    const st = this.spiel.stand;
    const f = this.fenster({ titel: this.daten.kapitel.planTitel || 'Stadtplan', klasse: 'voll' });
    const liste = this.daten.stationen.map((s) => `
      <div class="zeile"><i>${s.roemisch}</i><div><b>${esc(s.name)}</b>
      <small>${st.funde.includes(s.nr) ? 'Fund gesichert: ' + esc(s.fund) : (s.gebaut ? 'offen' : 'folgt im nächsten Bauabschnitt')}</small></div></div>`).join('');
    f.inhalt.innerHTML = `<div class="planraster"><div style="height:100%;min-height:0">${this.planFn()}</div><div class="planliste">${liste}<p class="klein" style="margin-top:.8em">${esc(this.daten.kapitel.planHinweis || 'Der Plan ist stilisiert. Er zeigt kein maßstabsgetreues Manchester.')}</p></div></div>`;
    f.inhalt.style.overflow = 'hidden';
  }

  oeffneEinstellungen() {
    if (this.spiel.blockiert) return;
    const sp = this.spiel, d = this.daten;
    const f = this.fenster({ titel: 'Einstellungen' });
    f.inhalt.innerHTML = `
      <div class="gruppe"><h3>Grafik</h3><div class="wahl" data-g="q">
        <button data-q="hoch">Hoch</button><button data-q="mittel">Mittel</button><button data-q="niedrig">Niedrig</button></div>
        <p class="klein" style="margin-top:.4em">Bei ruckelndem Bild eine niedrigere Stufe wählen.</p></div>
      <div class="gruppe"><h3>Steuerung</h3><p>${esc(this.touch ? d.steuerung.touch : d.steuerung.tastatur)}</p></div>
      <div class="gruppe"><h3>Für die Lehrkraft</h3>
        <div class="wahl">${(this.lehrkraft?.spruenge || []).map((x, i) => `<button data-l="sprung" data-i="${i}">${esc(x.name)}</button>`).join('')}<button data-l="reset">Spielstand zurücksetzen</button></div>
        ${(this.lehrkraft?.schalter || []).length ? `<div class="wahl" style="margin-top:.5em">${this.lehrkraft.schalter.map((x, i) => `<button data-l="schalter" data-i="${i}" class="${x.an() ? 'an' : ''}">${esc(x.name)}</button>`).join('')}</div>` : ''}
        <p class="klein" style="margin-top:.5em">Ein Sprung zu einer Station schaltet die Funde und Belege der Stationen davor frei.</p>
        <p class="klein" style="margin-top:.5em">Der Spielstand liegt nur auf diesem Gerät. Es werden keine Daten übertragen und keine Dienste Dritter geladen. Quellen und Lizenzen stehen in der Datei LIZENZEN.md.</p></div>`;
    const setze = () => f.inhalt.querySelectorAll('[data-q]').forEach((b) => b.classList.toggle('an', b.dataset.q === sp.qualitaet));
    setze();
    f.inhalt.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.q) { sp.setzeQualitaet(b.dataset.q); setze(); }
      else if (b.dataset.l === 'sprung') { f.schliessen(); this.lehrkraft.spruenge[+b.dataset.i].tu(); }
      else if (b.dataset.l === 'schalter') { const x = this.lehrkraft.schalter[+b.dataset.i]; x.tu(); b.classList.toggle('an', x.an()); }
      else if (b.dataset.l === 'reset') {
        if (b.dataset.sicher) sp.setzeZurueck();
        else { b.dataset.sicher = '1'; b.textContent = 'Wirklich alles löschen?'; b.classList.add('an'); }
      }
    });
  }

  steuerungsHinweis() {
    return this.karte({
      titel: 'So bewegt ihr euch',
      text: (this.touch ? this.daten.steuerung.touch : this.daten.steuerung.tastatur) + '\nDie Messingraute zeigt euer nächstes Ziel. Tagebuch, Belege und Stadtplan findet ihr oben rechts.',
      knopf: 'Los',
    });
  }
}
