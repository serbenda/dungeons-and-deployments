// Arranque del bucle y modo depuración (?debug).
'use strict';

// Bucle de paso fijo: la lógica avanza a 60 actualizaciones por segundo
// sea cual sea la frecuencia de refresco de la pantalla.
const STEP_MS = 1000/60;
let last = performance.now(), acc = 0;
function frame(now){
  acc += Math.min(100, now - last); last = now;
  while (acc >= STEP_MS) { update(); acc -= STEP_MS; }
  draw();
  requestAnimationFrame(frame);
}

// Modo depuración: abre index.html?debug para tener window.dnd en la consola.
// La prueba de humo (tools/smoke-test.js) lo usa para jugar sin mostrar nada.
if (/[?&]debug\b/.test(location.search)) {
  window.dnd = {
    get state(){ return state; }, set state(v){ state = v; },
    get P(){ return P; }, get foes(){ return foes; }, get items(){ return items; }, get crates(){ return crates; },
    get camX(){ return camX; }, get secIdx(){ return secIdx; }, get boss(){ return boss; }, get score(){ return score; },
    held, pressedQ, update, draw
  };
}

draw();
if (document.fonts && document.fonts.load) Promise.all([document.fonts.load(F8), document.fonts.load(F16)]).then(draw).catch(() => {});
requestAnimationFrame(frame);
