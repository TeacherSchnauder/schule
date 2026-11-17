// Eingabe: Tastatur und Maus am Rechner, virtueller Joystick und Wischen am Tablet.
export class Steuerung {
  constructor(flaeche, joystickEl) {
    this.flaeche = flaeche;
    this.tasten = new Set();
    this.joy = { id: null, x: 0, y: 0, ox: 0, oy: 0 };
    this.blick = { id: null, lx: 0, ly: 0, dx: 0, dy: 0 };
    this.joystickEl = joystickEl;
    this.knauf = joystickEl.querySelector('.knauf');
    this.touch = false;
    this.beiTaste = null;       // Rückruf (code) für Einzeltasten
    this.gesperrt = false;      // nach Wechsel zwischen Straße und Bereich, bis die Eingabe losgelassen wurde

    window.addEventListener('keydown', (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      // Standardwirkung unterdrücken: sonst landet z. B. das „e“ der Interaktionstaste im Eingabefeld, das sich gerade öffnet.
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'KeyE', 'KeyT', 'KeyM', 'Enter'].includes(e.code)) e.preventDefault();
      if (!e.repeat && this.beiTaste) this.beiTaste(e.code);
      this.tasten.add(e.code);
    });
    window.addEventListener('keyup', (e) => this.tasten.delete(e.code));
    window.addEventListener('blur', () => this.tasten.clear());

    flaeche.addEventListener('pointerdown', (e) => this._runter(e));
    flaeche.addEventListener('pointermove', (e) => this._bewegt(e));
    const hoch = (e) => this._hoch(e);
    flaeche.addEventListener('pointerup', hoch);
    flaeche.addEventListener('pointercancel', hoch);
    flaeche.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _runter(e) {
    if (e.pointerType === 'touch') this.touch = true;
    try { this.flaeche.setPointerCapture(e.pointerId); } catch (err) { /* ohne Belang */ }
    const links = e.clientX < window.innerWidth * 0.45 && e.clientY > window.innerHeight * 0.3;
    if (e.pointerType !== 'mouse' && links && this.joy.id === null) {
      this.joy.id = e.pointerId; this.joy.ox = e.clientX; this.joy.oy = e.clientY; this.joy.x = 0; this.joy.y = 0;
      this.joystickEl.style.left = e.clientX + 'px';
      this.joystickEl.style.top = e.clientY + 'px';
      this.joystickEl.classList.add('aktiv');
      this.knauf.style.transform = 'translate(-50%, -50%)';
    } else if (this.blick.id === null) {
      this.blick.id = e.pointerId; this.blick.lx = e.clientX; this.blick.ly = e.clientY;
    }
  }

  _bewegt(e) {
    if (e.pointerId === this.joy.id) {
      const r = 56;
      let dx = e.clientX - this.joy.ox, dy = e.clientY - this.joy.oy;
      const l = Math.hypot(dx, dy);
      if (l > r) { dx *= r / l; dy *= r / l; }
      this.joy.x = dx / r; this.joy.y = -dy / r;
      this.knauf.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    } else if (e.pointerId === this.blick.id) {
      this.blick.dx += e.clientX - this.blick.lx;
      this.blick.dy += e.clientY - this.blick.ly;
      this.blick.lx = e.clientX; this.blick.ly = e.clientY;
    }
  }

  _hoch(e) {
    if (e.pointerId === this.joy.id) {
      this.joy.id = null; this.joy.x = 0; this.joy.y = 0;
      this.joystickEl.classList.remove('aktiv');
    } else if (e.pointerId === this.blick.id) {
      this.blick.id = null;
    }
  }

  // Bewegungsachsen: x nach rechts, y nach vorn, jeweils -1 bis 1.
  achsen() {
    let x = this.joy.x, y = this.joy.y;
    const t = this.tasten;
    if (t.has('KeyW') || t.has('ArrowUp')) y += 1;
    if (t.has('KeyS') || t.has('ArrowDown')) y -= 1;
    if (t.has('KeyD') || t.has('ArrowRight')) x += 1;
    if (t.has('KeyA') || t.has('ArrowLeft')) x -= 1;
    const l = Math.hypot(x, y);
    if (l > 1) { x /= l; y /= l; }
    if (Math.abs(x) < 0.12) x = 0;
    if (Math.abs(y) < 0.12) y = 0;
    if (this.gesperrt) {
      if (x === 0 && y === 0) this.gesperrt = false;
      return { x: 0, y: 0 };
    }
    return { x, y };
  }

  zieht() { return this.blick.id !== null; }

  nimmBlick() {
    const d = { dx: this.blick.dx, dy: this.blick.dy };
    this.blick.dx = 0; this.blick.dy = 0;
    return d;
  }

  loslassen() {
    this.tasten.clear();
    this.joy.x = 0; this.joy.y = 0;
  }
}
