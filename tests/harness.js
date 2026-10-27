// Carga el juego completo en un contexto aislado de Node (sin navegador) para
// probar su lógica. Simula lo mínimo del navegador: canvas, eventos y
// localStorage. Los scripts se cargan en el mismo orden que en index.html y
// comparten ámbito global, igual que en la página.
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');

/** Contexto 2D falso: acepta cualquier llamada y devuelve valores plausibles. */
function fakeContext2D(){
  const store = {};
  return new Proxy(store, {
    get(target, key){
      if (key in target) return target[key];
      if (key === 'createImageData') return (w, h) => ({ width: w, height: h, data: new Uint8ClampedArray(w*h*4) });
      if (key === 'measureText') return s => ({ width: String(s).length*8 });
      if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => ({ addColorStop(){} });
      return () => {};
    },
    set(target, key, value){ target[key] = value; return true; }
  });
}

function fakeCanvas(){
  return { width: 0, height: 0, style: {}, getContext: () => fakeContext2D(), addEventListener(){}, focus(){}, toDataURL: () => '' };
}

function fakeStorage(){
  const data = new Map();
  return {
    getItem: k => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: k => { data.delete(k); },
    clear: () => data.clear()
  };
}

/** Lista de scripts del juego en el orden de index.html. */
function scriptOrder(){
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  return [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
}

/**
 * Crea un juego nuevo y devuelve utilidades para inspeccionarlo.
 * @param {{search?: string}} [opts] search simula location.search (p. ej. '?seed=3').
 * `ev` evalúa código dentro del juego; los objetos vuelven como copia JSON.
 * @returns {{ctx: object, ev: (code: string) => any, step: (n?: number) => void, press: (key: string) => void}}
 */
function loadGame(opts = {}){
  const canvas = fakeCanvas();
  const sandbox = {
    // Math, JSON, Map... los pone el propio contexto: así cada juego tiene su
    // Math.random y la semilla de una partida no afecta a las demás.
    console, setTimeout, clearTimeout,
    location: { search: opts.search || '', protocol: 'file:' },
    navigator: {},
    localStorage: fakeStorage(),
    performance: { now: () => 0 },
    requestAnimationFrame: () => 0,
    addEventListener(){},
    document: {
      // Solo existe el canvas; los mandos táctiles (#pad, #touch...) no están en las pruebas.
      getElementById: id => (id === 'game' ? canvas : null),
      documentElement: { classList: { contains: () => false, add(){}, toggle(){} } },
      visibilityState: 'visible',
      addEventListener(){},
      createElement: () => fakeCanvas(),
      querySelectorAll: () => []
    }
  };
  sandbox.window = sandbox;
  const ctx = vm.createContext(sandbox);
  for (const file of scriptOrder()) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), ctx, { filename: file });
  }
  // Los objetos del juego viven en otro «realm»: se devuelven como copia JSON
  // para poder compararlos con assert.deepStrictEqual.
  const ev = code => {
    const v = vm.runInContext(code, ctx);
    return v !== null && typeof v === 'object' ? JSON.parse(JSON.stringify(v)) : v;
  };
  return {
    ctx,
    ev,
    /** Avanza n actualizaciones del juego (60 por segundo). */
    step(n = 1){ for (let i = 0; i < n; i++) ev('update()'); },
    /** Simula una pulsación de tecla lógica ('atk', 'start', 'up'...). */
    press(key){ ev(`pressedQ[${JSON.stringify(key)}] = true; held[${JSON.stringify(key)}] = true;`); ev('update()'); ev(`held[${JSON.stringify(key)}] = false;`); }
  };
}

module.exports = { loadGame, scriptOrder, ROOT };
