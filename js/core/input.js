// Entrada: teclado, mandos (Gamepad API), asignación de dispositivos a jugadores y
// código Konami. Los mandos táctiles están en touch.js y entran por press().
'use strict';

/**
 * Estado de las teclas lógicas de cada jugador: held (pulsada ahora) y q (pulsación
 * nueva pendiente de consumir). El jugador 1 es INP[0] y el 2, INP[1].
 */
const INP = [{ held:{}, q:{} }, { held:{}, q:{} }];
/** Teclas del jugador 1 (se mantienen por compatibilidad con la depuración y las pruebas). */
const held = INP[0].held, pressedQ = INP[0].q;
/** Jugador cuyas pulsaciones lee pressed(): -1 = cualquiera (menús), 0 o 1 durante su turno. */
let ctxSlot = -1;

/**
 * Teclado. Con un solo jugador todas las teclas manejan al jugador 1. Si alguien
 * pulsa 2, las teclas del grupo B (WASD, J, K, L) pasan a ser del jugador 2.
 */
const KEYMAP_BASE = { ArrowUp:'up', ArrowDown:'down', ArrowLeft:'left', ArrowRight:'right',
  KeyZ:'atk', Space:'atk', KeyX:'jump', KeyC:'special', Enter:'start', NumpadEnter:'start', KeyM:'mute', Escape:'start',
  KeyW:'up', KeyS:'down', KeyA:'left', KeyD:'right', KeyJ:'atk', KeyK:'jump', KeyL:'special', Digit2:'start', Numpad2:'start' };
/** Acciones que se pueden reasignar en Opciones › TECLAS, con su tecla principal por defecto. */
const KEY_ACTIONS = ['up', 'down', 'left', 'right', 'atk', 'jump', 'special', 'start'];
const KEYS_DEFAULT = { up:'ArrowUp', down:'ArrowDown', left:'ArrowLeft', right:'ArrowRight', atk:'KeyZ', jump:'KeyX', special:'KeyC', start:'Enter' };
/** Mapa en uso: el base con las teclas principales cambiadas por las de OPTS.keys. */
let KEYMAP = Object.assign({}, KEYMAP_BASE);
/**
 * Rehace KEYMAP a partir de las teclas personalizadas.
 * @param {Object<string, string>} [custom] Acción → KeyboardEvent.code.
 */
function rebuildKeymap(custom){
  KEYMAP = Object.assign({}, KEYMAP_BASE);
  for (const a in custom || {}) if (custom[a] !== KEYS_DEFAULT[a]) delete KEYMAP[KEYS_DEFAULT[a]];
  for (const a in custom || {}) KEYMAP[custom[a]] = a;
}
/** Si no es null, la siguiente tecla física se entrega a esta función (para reasignar). */
let keyCapture = null;
/** Teclas del grupo B: las que se lleva el jugador 2 cuando entra con el teclado. */
const KB_B = { KeyW:1, KeyS:1, KeyA:1, KeyD:1, KeyJ:1, KeyK:1, KeyL:1, Digit2:1, Numpad2:1 };

/**
 * Jugador asignado a cada dispositivo ('kb', 'kb2', 'touch', 'pad0'...). Un
 * dispositivo sin asignar maneja al jugador 1 y, si pulsa START durante la
 * partida, se une como jugador 2.
 */
const DEV_SLOT = {};
/** Dispositivo del jugador 1 (el que ha empezado la partida). */
let owner0 = null;
/** Último dispositivo usado y petición de unirse pendiente (se atiende en update()). */
let lastDev = 'kb', joinReq = null;

/**
 * Código Konami: arriba, arriba, abajo, abajo, izquierda, derecha, izquierda, derecha, B, A.
 */
const KONAMI = ['up','up','down','down','left','right','left','right','jump','atk'];
let konamiSeq = [], konami = false;

/**
 * Jugador al que va un dispositivo.
 * @param {string} dev
 * @returns {0|1}
 */
const slotOf = dev => DEV_SLOT[dev] === 1 ? 1 : 0;

/**
 * Registra una tecla lógica pulsada en un dispositivo: la marca en held y, si es
 * nueva, en la cola de pulsaciones de su jugador. START de un dispositivo nuevo
 * durante la partida es una petición de unirse como jugador 2.
 * @param {string} k up, down, left, right, atk, jump, special, start o mute.
 * @param {string} [dev='kb'] Dispositivo de origen.
 */
function press(k, dev){
  dev = dev || 'kb';
  initAudio(); if (actx && actx.state === 'suspended') actx.resume();
  if (k === 'start' && owner0 !== null && DEV_SLOT[dev] === undefined && dev !== owner0 && dev !== 'touch') { joinReq = dev; return; }
  const I = INP[slotOf(dev)];
  if (!I.held[k]) {
    konamiSeq.push(k); if (konamiSeq.length > 10) konamiSeq.shift();
    if (!konami && konamiSeq.join() === KONAMI.join() && (state === 'title' || state === 'select')) { konami = true; konamiT = 150; unlock('konami'); }
    I.q[k] = true;
  }
  I.held[k] = true; lastDev = dev;
}
/**
 * Registra que se ha soltado una tecla lógica.
 * @param {string} k
 * @param {string} [dev='kb']
 */
function release(k, dev){ INP[slotOf(dev || 'kb')].held[k] = false; }
/**
 * Consume una pulsación: devuelve true solo la primera vez tras pulsar la tecla.
 * En los menús (ctxSlot = -1) vale la de cualquier jugador.
 * @param {string} k
 * @returns {boolean}
 */
function pressed(k){
  for (let i = 0; i < 2; i++) {
    if (ctxSlot >= 0 && i !== ctxSlot) continue;
    if (INP[i].q[k]) { INP[i].q[k] = false; return true; }
  }
  return false;
}
/** Vacía las pulsaciones pendientes de los dos jugadores (al final de cada update). */
function clearPressed(){ for (const I of INP) for (const k in I.q) I.q[k] = false; }
/**
 * Asigna un dispositivo a un jugador (o lo libera con slot = null).
 * @param {string} dev
 * @param {0|1|null} slot
 */
function assignDevice(dev, slot){
  if (slot === null) delete DEV_SLOT[dev]; else DEV_SLOT[dev] = slot;
  for (const k in INP[1].held) INP[1].held[k] = false;
}
/** Olvida todas las asignaciones (al volver al título). */
function resetDevices(){ for (const d in DEV_SLOT) delete DEV_SLOT[d]; owner0 = null; joinReq = null; }

/**
 * Dispositivo de una tecla: las del grupo B son 'kb2' solo si el jugador 2 ha
 * entrado con el teclado (o es la tecla 2, que siempre pide unirse).
 * @param {string} code KeyboardEvent.code
 * @returns {string}
 */
const keyDev = code => (code === 'Digit2' || code === 'Numpad2' || (KB_B[code] && DEV_SLOT.kb2 !== undefined)) ? 'kb2' : 'kb';
window.addEventListener('keydown', e => {
  if (keyCapture && !e.repeat) { e.preventDefault(); const f = keyCapture; keyCapture = null; f(e.code); return; }
  const k = KEYMAP[e.code]; if (!k) return; e.preventDefault();
  const dev = keyDev(e.code);
  if (dev === 'kb2' && k === 'start' && owner0 === null) { press(k, 'kb'); return; }
  press(k, dev);
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); release(k, keyDev(e.code)); });
window.addEventListener('blur', () => { for (const I of INP) for (const k in I.held) I.held[k] = false; });
cv.addEventListener('pointerdown', () => { cv.focus(); initAudio(); if (state === 'title') { pressedQ.atk = true; lastDev = 'touch'; } });

// ------------------------------------------------------------------ mandos (Gamepad API)
/**
 * Botones del mando estándar (disposición de Xbox; en PlayStation, A = ✕, B = ○,
 * X = □, Y = △): A ataca, B salta, X e Y especial, START, SELECT silencia, y la
 * cruceta o el stick izquierdo mueven.
 */
const PAD_BUTTONS = { 0:'atk', 1:'jump', 2:'special', 3:'special', 9:'start', 8:'mute', 12:'up', 13:'down', 14:'left', 15:'right' };
const padState = {};
/**
 * Lee los mandos conectados y traduce sus cambios a press()/release(). Se llama en
 * cada update() porque la Gamepad API no tiene eventos de botones.
 */
function pollPads(){
  const list = navigator.getGamepads ? navigator.getGamepads() : [];
  for (let i = 0; i < (list ? list.length : 0); i++) {
    const g = list[i]; if (!g || !g.connected) continue;
    const dev = 'pad' + g.index, prev = padState[dev] || (padState[dev] = {});
    const now = {};
    for (const b in PAD_BUTTONS) { const btn = g.buttons[b]; if (btn && (btn.pressed || btn.value > .5)) now[PAD_BUTTONS[b]] = true; }
    const ax = g.axes[0] || 0, ay = g.axes[1] || 0;
    if (ax < -.45) now.left = true; if (ax > .45) now.right = true;
    if (ay < -.45) now.up = true; if (ay > .45) now.down = true;
    for (const k of ['up','down','left','right','atk','jump','special','start','mute']) {
      if (now[k] && !prev[k]) press(k, dev);
      else if (!now[k] && prev[k]) release(k, dev);
      prev[k] = !!now[k];
    }
  }
}
window.addEventListener('gamepadconnected', e => { padToast = { text:'MANDO ' + (e.gamepad.index + 1) + ' CONECTADO', t:120 }; });
window.addEventListener('gamepaddisconnected', e => { const dev = 'pad' + e.gamepad.index; delete padState[dev]; if (DEV_SLOT[dev] !== undefined) assignDevice(dev, null); });
/** Aviso breve al conectar un mando. */
let padToast = null;
