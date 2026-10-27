// Teclado, estado de las teclas lógicas y código Konami. Los mandos táctiles están en touch.js.
'use strict';

const held = {}, pressedQ = {};
const KEYMAP = { ArrowUp:'up', KeyW:'up', ArrowDown:'down', KeyS:'down', ArrowLeft:'left', KeyA:'left', ArrowRight:'right', KeyD:'right',
  KeyZ:'atk', KeyJ:'atk', Space:'atk', KeyX:'jump', KeyK:'jump', KeyC:'special', KeyL:'special', Enter:'start', NumpadEnter:'start', KeyM:'mute' };
/**
 * Código Konami: arriba, arriba, abajo, abajo, izquierda, derecha, izquierda, derecha, B, A.
 */
const KONAMI = ['up','up','down','down','left','right','left','right','jump','atk'];
let konamiSeq = [], konami = false;
/**
 * Registra una tecla lógica pulsada: la marca en held y, si es nueva, en pressedQ.
 * También alimenta la secuencia del código Konami.
 * @param {string} k up, down, left, right, atk, jump, special, start o mute.
 */
function press(k){
  if (!held[k]) { konamiSeq.push(k); if (konamiSeq.length > 10) konamiSeq.shift(); if (!konami && konamiSeq.join() === KONAMI.join() && (state === 'title' || state === 'select')) { konami = true; konamiT = 150; } }
  initAudio(); if (actx && actx.state === 'suspended') actx.resume(); if (!held[k]) pressedQ[k] = true; held[k] = true; }
/**
 * Registra que se ha soltado una tecla lógica.
 * @param {string} k
 */
function release(k){ held[k] = false; }
window.addEventListener('keydown', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); press(k); });
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); release(k); });
window.addEventListener('blur', () => { for (const k in held) held[k] = false; });
cv.addEventListener('pointerdown', () => { cv.focus(); initAudio(); if (state === 'title') pressedQ.start = true; });
/**
 * Consume una pulsación: devuelve true solo la primera vez tras pulsar la tecla.
 * @param {string} k
 * @returns {boolean}
 */
function pressed(k){ if (pressedQ[k]) { pressedQ[k] = false; return true; } return false; }
