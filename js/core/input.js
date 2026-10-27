// Teclado, mandos táctiles y código Konami.
'use strict';

const held = {}, pressedQ = {};
const KEYMAP = { ArrowUp:'up', KeyW:'up', ArrowDown:'down', KeyS:'down', ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
  KeyZ:'atk', KeyJ:'atk', Space:'atk', KeyX:'jump', KeyK:'jump', KeyC:'special', KeyL:'special', Enter:'start', NumpadEnter:'start', KeyM:'mute' };
const KONAMI = ['up','up','down','down','left','right','left','right','jump','atk'];
let konamiSeq = [], konami = false;
function press(k){
  if (!held[k]) { konamiSeq.push(k); if (konamiSeq.length > 10) konamiSeq.shift(); if (!konami && konamiSeq.join() === KONAMI.join() && (state === 'title' || state === 'select')) { konami = true; konamiT = 150; } }
  initAudio(); if (actx && actx.state === 'suspended') actx.resume(); if (!held[k]) pressedQ[k] = true; held[k] = true; }
function release(k){ held[k] = false; }
window.addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); press(k); });
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); release(k); });
window.addEventListener('blur', () => { for (const k in held) held[k] = false; });
cv.addEventListener('pointerdown', () => { cv.focus(); initAudio(); if (state === 'title') pressedQ.start = true; });
document.querySelectorAll('#touch button').forEach(b => {
  const k = b.dataset.k;
  b.addEventListener('pointerdown', e => { e.preventDefault(); if (b.setPointerCapture) b.setPointerCapture(e.pointerId); b.classList.add('on'); press(k); });
  const up = () => { b.classList.remove('on'); release(k); };
  b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('lostpointercapture', up);
  b.addEventListener('contextmenu', e => e.preventDefault());
});
function pressed(k){ if (pressedQ[k]) { pressedQ[k] = false; return true; } return false; }
