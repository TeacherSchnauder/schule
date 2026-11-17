// Musik: Einstieg je Kapitel und Raummusik, die beim Raumwechsel überblendet und nicht in Dauerschleife läuft.
// Startet beim ersten Besuch AUSGESCHALTET. Die Wahl (an/aus, Lautstärke) gilt auf diesem Gerät für alle Kapitel.
// Es werden nur eigene Dateien aus assets/musik/ geladen, und nur dann, wenn die Musik eingeschaltet ist.
//
// Technik: Zwei feste Abspielkanäle (A/B) für Überblendungen und ein Kanal für Signale. Sie werden beim ersten
// Tippen freigeschaltet; danach dürfen auch iPads neue Stücke ohne erneute Berührung starten.

const SCHLUESSEL = 'capitalism-chronicles-musik-v1';
const ORDNER = new URL('../assets/musik/', import.meta.url);
const STILLE = new URL('stille.mp3', ORDNER).href;
const BLENDE = 2.5;                 // Sekunden für Ein- und Ausblenden
const PAUSE = [20, 40];             // Stille zwischen zwei Stücken (Sekunden)
const GEDUCKT = 0.4;                // Anteil der Lautstärke, solange ein Text- oder Dialogfenster offen ist

function ladeWahl() {
  try {
    const d = JSON.parse(window.localStorage.getItem(SCHLUESSEL) || 'null');
    if (d && typeof d === 'object') return { an: !!d.an, lautst: typeof d.lautst === 'number' ? d.lautst : 0.7, signale: d.signale !== false };
  } catch (e) { /* gesperrter Speicher: Standard */ }
  return { an: false, lautst: 0.7, signale: true };
}

class Musik {
  constructor() {
    this.wahl = ladeWahl();
    this.ctx = null; this.haupt = null; this.duck = null;
    this.kanaele = [];              // [{ audio, gain, belegt, token }]
    this.signalKanal = null;
    this.einstiegName = null; this.raeume = {};
    this.wunsch = null;             // Raum, in dem die Spielfigur gerade ist
    this.laeuft = null;             // { name, raum, einstieg, kanal }
    this.zuletzt = {};              // zuletzt gespielter Titel je Raum
    this.uhr = null;                // Pause bis zum nächsten Stück
    this.einstiegGespielt = false;
    this.imTitel = false;
    this.geduckt = false;
    this.entsperrt = false;
    this.beiAenderung = new Set();
    const entsperre = () => this.entsperre();
    for (const ev of ['pointerdown', 'keydown', 'touchend', 'click']) window.addEventListener(ev, entsperre, { capture: true, passive: true });
    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.hidden) this.ctx.suspend().catch(() => {});
      else this.ctx.resume().catch(() => {});
    });
  }

  get an() { return this.wahl.an; }
  get lautst() { return this.wahl.lautst; }

  _sichere() {
    try { window.localStorage.setItem(SCHLUESSEL, JSON.stringify(this.wahl)); } catch (e) { /* nichts */ }
    this.beiAenderung.forEach((f) => { try { f(this.wahl); } catch (e) { /* nichts */ } });
  }

  // Muss in einer Berührung oder einem Klick laufen: schaltet Tonausgabe und Abspielkanäle frei.
  entsperre() {
    if (!this.kanaele.length) {
      const AC = window.AudioContext || window.webkitAudioContext;
      try {
        if (AC) {
          this.ctx = new AC();
          this.haupt = this.ctx.createGain(); this.duck = this.ctx.createGain();
          this.haupt.gain.value = this.wahl.lautst; this.duck.gain.value = this.geduckt ? GEDUCKT : 1;
          this.haupt.connect(this.duck); this.duck.connect(this.ctx.destination);
        }
      } catch (e) { this.ctx = null; }
      const neu = (anHaupt) => {
        const audio = new Audio(); audio.preload = 'none';
        const k = { audio, gain: null, belegt: false, token: 0 };
        if (this.ctx) {
          try {
            const q = this.ctx.createMediaElementSource(audio);
            k.gain = this.ctx.createGain(); k.gain.gain.value = 0.0001;
            q.connect(k.gain); k.gain.connect(anHaupt ? this.haupt : this.ctx.destination);
          } catch (e) { k.gain = null; }
        }
        // Freischalten: einmal still abspielen
        audio.src = STILLE; audio.muted = true;
        const p = audio.play(); if (p && p.then) p.then(() => { audio.pause(); audio.muted = false; }).catch(() => { audio.muted = false; });
        else audio.muted = false;
        return k;
      };
      this.kanaele = [neu(true), neu(true)];
      this.signalKanal = neu(false);
    }
    if (this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
    this.entsperrt = true;
    if (this._wartet && this.wahl.an && !this.laeuft) { this._wartet = false; this._weiter(true); }
  }

  // Kapitel meldet seine Stücke: { einstieg: 'k1-einstieg', raeume: { aussen: ['k1-aussen-1', 'k1-aussen-2'], … } }
  konfiguriere(cfg = {}) {
    this.einstiegName = cfg.einstieg || null;
    this.raeume = cfg.raeume || {};
  }

  setzeAn(an) {
    this.wahl.an = !!an; this._sichere();
    if (an) {
      this.entsperre();
      // Auf dem Titelbildschirm beginnt die Musik mit dem Einstieg des Kapitels, im Spiel mit der Raummusik.
      if (this.imTitel && !this.einstiegGespielt && this.einstiegName) this.einstieg();
      else this._weiter(true);
    } else {
      clearTimeout(this.uhr); this.uhr = null;
      this._stoppe(this.laeuft, 0.8); this.laeuft = null;
    }
  }

  umschalten() { this.setzeAn(!this.wahl.an); return this.wahl.an; }

  setzeLautstaerke(x) {
    this.wahl.lautst = Math.max(0, Math.min(1, x)); this._sichere();
    if (this.haupt) this.haupt.gain.setTargetAtTime(this.wahl.lautst, this.ctx.currentTime, 0.05);
    else this.kanaele.forEach((k) => { if (k.belegt) k.audio.volume = this._direkt(); });
  }

  setzeSignale(an) { this.wahl.signale = !!an; this._sichere(); }

  _direkt() { return this.wahl.lautst * (this.geduckt ? GEDUCKT : 1); }

  // Leiser, solange ein Dialog oder ein Fenster mit Text offen ist.
  ducken(ja) {
    if (this.geduckt === !!ja) return;
    this.geduckt = !!ja;
    if (this.duck) this.duck.gain.setTargetAtTime(ja ? GEDUCKT : 1, this.ctx.currentTime, 0.25);
    else this.kanaele.forEach((k) => { if (k.belegt) k.audio.volume = this._direkt(); });
  }

  // Einstiegsmusik: einmal je Seitenaufruf. Wird aus dem Klick auf „Spiel beginnen“ aufgerufen.
  einstieg() {
    if (!this.wahl.an || this.einstiegGespielt || !this.einstiegName) return;
    this.entsperre();
    this.einstiegGespielt = true;
    clearTimeout(this.uhr); this.uhr = null;
    this._stoppe(this.laeuft, 1);
    this.laeuft = this._spiele(this.einstiegName, { einstieg: true, blende: 0.3 });
  }

  // Raumwechsel: Das Spiel meldet den Schlüssel des neuen Raums (z. B. 'saal', 'strasse-1910').
  raum(schluessel) {
    if (schluessel === this.wunsch) return;
    this.wunsch = schluessel;
    if (!this.wahl.an) return;
    const l = this.laeuft;
    if (l && l.einstieg) return;                // Einstieg läuft zu Ende, danach folgt die Raummusik
    if (l && l.raum === schluessel) return;
    clearTimeout(this.uhr); this.uhr = null;
    this._stoppe(l, BLENDE);
    this.laeuft = null;
    this.uhr = setTimeout(() => { this.uhr = null; this._weiter(); }, l ? 900 : 0);
  }

  // Nächstes Stück im aktuellen Raum, nie zweimal dasselbe hintereinander.
  _weiter(sofort = false) {
    if (!this.wahl.an || this.laeuft) return;
    if (!this.entsperrt) { this._wartet = true; return; }
    const liste = this.raeume[this.wunsch] || [];
    if (!liste.length) return;                  // Raum ohne Musik: Stille
    let wahl = liste[Math.floor(Math.random() * liste.length)];
    if (liste.length > 1) while (wahl === this.zuletzt[this.wunsch]) wahl = liste[Math.floor(Math.random() * liste.length)];
    this.zuletzt[this.wunsch] = wahl;
    this.laeuft = this._spiele(wahl, { raum: this.wunsch, blende: sofort ? 1.2 : BLENDE });
  }

  _kanal() {
    let k = this.kanaele.find((x) => !x.belegt);
    if (!k) { k = this.kanaele[0]; this._halte(k); }
    return k;
  }

  _halte(k) {
    k.token++; k.belegt = false;
    try { k.audio.pause(); } catch (e) { /* nichts */ }
    if (k.gain) { k.gain.gain.cancelScheduledValues(this.ctx.currentTime); k.gain.gain.value = 0.0001; }
  }

  _spiele(name, { raum = null, einstieg = false, blende = BLENDE } = {}) {
    const k = this._kanal();
    const token = ++k.token;
    k.belegt = true;
    const eintrag = { name, raum, einstieg, kanal: k, token };
    const a = k.audio;
    a.onended = () => {
      if (k.token !== token) return;
      k.belegt = false;
      if (this.laeuft !== eintrag) return;
      this.laeuft = null;
      const p = eintrag.einstieg ? 2500 : (PAUSE[0] + Math.random() * (PAUSE[1] - PAUSE[0])) * 1000;
      this.uhr = setTimeout(() => { this.uhr = null; this._weiter(); }, p);
    };
    a.onerror = () => { if (k.token === token) { k.belegt = false; if (this.laeuft === eintrag) this.laeuft = null; } };
    a.preload = 'auto';
    a.src = new URL(name + '.mp3', ORDNER).href;
    if (k.gain) {
      const t = this.ctx.currentTime;
      k.gain.gain.cancelScheduledValues(t);
      k.gain.gain.setValueAtTime(0.0001, t);
      k.gain.gain.linearRampToValueAtTime(1, t + blende);
    } else a.volume = this._direkt();
    const p = a.play();
    if (p && p.catch) p.catch(() => { if (k.token === token) { k.belegt = false; if (this.laeuft === eintrag) { this.laeuft = null; this._wartet = true; } } });
    return eintrag;
  }

  _stoppe(e, dauer) {
    if (!e) return;
    const k = e.kanal, token = e.token;
    if (k.token !== token) return;
    if (k.gain && this.ctx) {
      const t = this.ctx.currentTime;
      k.gain.gain.cancelScheduledValues(t);
      k.gain.gain.setValueAtTime(Math.max(0.0001, k.gain.gain.value), t);
      k.gain.gain.linearRampToValueAtTime(0.0001, t + dauer);
      setTimeout(() => { if (k.token === token) this._halte(k); }, dauer * 1000 + 120);
    } else this._halte(k);
  }

  // Kurzes Signal (Beamer-Ansicht): eigener Schalter, unabhängig von der Musik.
  signal(name) {
    if (!this.wahl.signale) return;
    this.entsperre();
    const k = this.signalKanal; if (!k) return;
    k.audio.src = new URL(`signal-${name}.mp3`, ORDNER).href;
    if (k.gain) k.gain.gain.value = 0.9; else k.audio.volume = 0.9;
    k.audio.play().catch(() => {});
  }

  // Zustand für Tests und Fehlersuche
  zustand() {
    return { an: this.wahl.an, lautst: this.wahl.lautst, signale: this.wahl.signale, raum: this.wunsch, titel: this.laeuft?.name || null,
      einstieg: !!this.laeuft?.einstieg, geduckt: this.geduckt, pause: !!this.uhr, entsperrt: this.entsperrt,
      kanaele: this.kanaele.map((k) => ({ belegt: k.belegt, src: (k.audio.src || '').split('/').pop(), spielt: !k.audio.paused })) };
  }
}

export const musik = new Musik();
window.__musik = musik;
