// Zeitreise-Überblendung: Sepia, hochzählende Jahreszahl, Umschalten der Szene im Dunkeln, Ortskarte.
import { el, esc, warte } from './oberflaeche.js';

export async function zeitreise(ui, { von, bis, ort }, umschalten) {
  const ruhig = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  ui.spiel.sperre();
  const z = el('div', '', `<div class="korn"></div><div class="jahr">${von}</div><div class="ort"></div>`); z.id = 'zeitreise';
  ui.wurzel.append(z);
  let schnell = false;
  z.addEventListener('click', () => { schnell = true; });
  ui.canvas.classList.add('sepia');
  await warte(30); z.classList.add('an');
  const jahr = z.querySelector('.jahr');
  if (!ruhig) {
    const dauer = 1500, t0 = performance.now();
    while (!schnell) {
      const u = Math.min(1, (performance.now() - t0) / dauer);
      const w = u * u * (3 - 2 * u);
      jahr.textContent = Math.round(von + (bis - von) * w);
      if (u >= 1) break;
      await warte(30);
    }
  } else await warte(350);
  jahr.textContent = bis;
  z.classList.add('dunkel');
  await warte(schnell ? 120 : 420);
  await umschalten();
  ui.spiel.kam.sprung = true;
  z.querySelector('.ort').textContent = ort;
  z.classList.add('zeigtOrt');
  ui.canvas.classList.remove('sepia');
  z.classList.remove('dunkel');
  await warte(schnell ? 500 : 1500);
  z.classList.remove('an');
  await warte(450);
  z.remove();
  ui.spiel.entsperre();
}
