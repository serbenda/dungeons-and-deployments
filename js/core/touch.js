// Mandos táctiles para móvil y tableta: cruceta analógica, botones, toques en la
// pantalla, pantalla completa, vibración y pantalla siempre encendida.
'use strict';

/** true en móviles y tabletas (index.html añade la clase is-touch antes de pintar). */
const IS_TOUCH = document.documentElement.classList.contains('is-touch');

/**
 * Vibración corta al recibir golpes (solo en dispositivos táctiles que la admiten).
 * @param {number} ms Duración en milisegundos.
 */
function haptic(ms){
  if (IS_TOUCH && !muted && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) {} }
}

// ------------------------------------------------------------------ cruceta analógica
// Una sola zona táctil: la dirección sale del ángulo entre el dedo y el centro, en 8
// sectores, así que admite diagonales y deslizar el dedo sin levantarlo.
const pad = document.getElementById('pad');
const padKnob = document.getElementById('pad-knob');
const padDirs = { up: false, down: false, left: false, right: false };
let padPointer = null;

/**
 * Activa o desactiva una dirección de la cruceta y la refleja en el dibujo.
 * @param {'up'|'down'|'left'|'right'} k
 * @param {boolean} on
 */
function setPadDir(k, on){
  if (on === padDirs[k]) return;
  padDirs[k] = on;
  if (on) press(k); else release(k);
  if (pad) pad.classList.toggle('on-' + k, on);
}

/**
 * Calcula la dirección a partir de la posición del dedo sobre la cruceta.
 * @param {PointerEvent} e
 */
function padMove(e){
  const r = pad.getBoundingClientRect(), radius = r.width/2;
  let dx = (e.clientX - (r.left + radius))/radius, dy = (e.clientY - (r.top + radius))/radius;
  const len = Math.hypot(dx, dy);
  if (len > 1) { dx /= len; dy /= len; }
  if (padKnob) padKnob.style.transform = `translate(${dx*radius*.45}px, ${dy*radius*.45}px)`;
  if (len < .28) { for (const k in padDirs) setPadDir(k, false); return; }   // zona muerta central
  const a = Math.atan2(dy, dx), c = Math.cos(a), s = Math.sin(a);
  setPadDir('right', c > .38); setPadDir('left', c < -.38);                  // .38 = cos(67.5°): 8 sectores
  setPadDir('down', s > .38); setPadDir('up', s < -.38);
}

/** Suelta la cruceta y centra el mando. */
function padEnd(){
  padPointer = null;
  for (const k in padDirs) setPadDir(k, false);
  if (pad) pad.classList.remove('active');
  if (padKnob) padKnob.style.transform = '';
}

if (pad) {
  pad.addEventListener('pointerdown', e => {
    e.preventDefault();
    padPointer = e.pointerId;
    if (pad.setPointerCapture) pad.setPointerCapture(e.pointerId);
    pad.classList.add('active');
    padMove(e);
  });
  pad.addEventListener('pointermove', e => { if (e.pointerId === padPointer) padMove(e); });
  for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) pad.addEventListener(ev, e => { if (e.pointerId === padPointer) padEnd(); });
  pad.addEventListener('contextmenu', e => e.preventDefault());
}

// ------------------------------------------------------------------ botones
// Cada botón es una tecla lógica (data-k). Varios dedos a la vez: cada uno captura
// su propio puntero.
document.querySelectorAll('#touch button[data-k]').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => {
    e.preventDefault();
    if (b.setPointerCapture) b.setPointerCapture(e.pointerId);
    b.classList.add('on');
    press(k);
    haptic(8);
  });
  const up = () => { b.classList.remove('on'); release(k); };
  b.addEventListener('pointerup', up);
  b.addEventListener('pointercancel', up);
  b.addEventListener('lostpointercapture', up);
  b.addEventListener('contextmenu', e => e.preventDefault());
});

// ------------------------------------------------------------------ tocar la pantalla
// Fuera de la partida, tocar la pantalla hace de botón A: empieza, pasa diálogos,
// inserta crédito... En la selección, tocar una mitad elige ese héroe.
cv.addEventListener('pointerdown', e => {
  if (!IS_TOUCH) return;
  e.preventDefault();
  initAudio(); if (actx && actx.state === 'suspended') actx.resume();
  if (state === 'select') {
    const half = e.offsetX < cv.clientWidth/2 ? 0 : 1;
    if (half === sel) pressedQ.atk = true; else { sel = half; sfx('select'); }
  } else if (state !== 'play' && state !== 'pause' && state !== 'initials') {
    pressedQ.atk = true;
  }
});

// ------------------------------------------------------------------ pantalla completa
const fsButton = document.getElementById('btn-fullscreen');
if (fsButton && IS_TOUCH && document.fullscreenEnabled) {
  fsButton.hidden = false;
  fsButton.addEventListener('click', () => {
    if (document.fullscreenElement) { document.exitFullscreen().catch(() => {}); return; }
    document.documentElement.requestFullscreen({ navigationUI: 'hide' })
      .then(() => screen.orientation && screen.orientation.lock ? screen.orientation.lock('landscape') : null)
      .catch(() => {});
  });
}

// ------------------------------------------------------------------ pantalla siempre encendida
// Mientras se juega, pide al navegador que no apague la pantalla (Wake Lock API).
let wakeLock = null;
/** Pide el bloqueo de pantalla encendida si el navegador lo permite. */
function keepScreenOn(){
  if (!IS_TOUCH || wakeLock || !navigator.wakeLock || document.visibilityState !== 'visible') return;
  navigator.wakeLock.request('screen').then(l => { wakeLock = l; l.addEventListener('release', () => { wakeLock = null; }); }).catch(() => {});
}
if (IS_TOUCH) {
  window.addEventListener('pointerdown', keepScreenOn);
  document.addEventListener('visibilitychange', keepScreenOn);
  // Si la app pasa a segundo plano, pausa la partida.
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && state === 'play') state = 'pause'; });
}
