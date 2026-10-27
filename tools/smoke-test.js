#!/usr/bin/env node
// Prueba de humo: abre el juego en Chromium sin ventana, comprueba que carga sin
// errores y deja que un bot juegue la etapa completa con cada héroe.
//
//   npm run test:e2e                         # usa file:// sobre index.html
//   BASE_URL=http://localhost:8000/ npm run test:e2e
//   SEEDS=1,2,3 npm run test:e2e             # semillas de las partidas
//   CONCURRENCY=2 npm run test:e2e           # partidas en paralelo (4 por defecto)
//
// Cada partida usa una semilla fija (index.html?debug&seed=N), así que un
// fallo se reproduce siempre igual abriendo esa misma URL.
'use strict';

const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const MAX_FRAMES = 60*60*20; // 20 minutos de juego simulado como mucho
const SEEDS = (process.env.SEEDS || '1,2').split(',').map(Number);
const HEROES = ['guerrero', 'mago'];
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);

// El bot se ejecuta dentro de la página contra window.dnd (modo ?debug).
function playStage([hero, god, maxFrames]){
  const g = window.dnd;
  g.state = 'title'; g.pressedQ.start = true; g.update();
  if (hero === 'mago') { g.pressedQ.right = true; g.update(); }
  g.pressedQ.atk = true; g.update();
  let i, continues = 0;
  for (i = 0; i < maxFrames; i++) {
    const P = g.P;
    for (const k of ['left', 'right', 'up', 'down']) g.held[k] = false;
    if (god) P.inv = Math.max(P.inv, 2);
    if (g.state === 'clear' || g.state === 'over') break;
    if (g.state === 'continue') { continues++; g.pressedQ.start = true; }
    if (g.state === 'story') { if (i % 3 === 0) g.pressedQ.atk = true; g.update(); continue; }
    const enemies = g.foes.filter(e => !e.dead && e.hp > 0 && (e.kind !== 'golem' || e.angry) && e.state !== 'rise' && !e.hidden && e.kind !== 'hidra');
    let target = null, best = 1e9;
    for (const e of enemies) { const d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y)*2; if (d < best) { best = d; target = e; } }
    // Solo objetos visibles: la cámara nunca retrocede, lo que queda a la izquierda se pierde.
    const item = g.items.find(it => it.x > g.camX + 14 && it.x < g.camX + 306);
    if (item && Math.abs(item.x - P.x) < 200 && (!target || best > 120)) {
      if (Math.abs(item.x - P.x) > 8) g.held[item.x > P.x ? 'right' : 'left'] = true;
      if (Math.abs(item.y - P.y) > 4) g.held[item.y > P.y ? 'down' : 'up'] = true;
      if (Math.abs(item.x - P.x) < 12 && Math.abs(item.y - P.y) < 6 && i % 6 === 0) g.pressedQ.atk = true;
    } else if (target) {
      const off = target.kind === 'dragon' ? 60 : target.kind === 'golem' ? 34 : 20;
      const wx = target.x + (P.x < target.x ? -off : off);
      if (Math.abs(wx - P.x) > 4) g.held[wx > P.x ? 'right' : 'left'] = true;
      if (Math.abs(target.y - P.y) > 3) g.held[target.y > P.y ? 'down' : 'up'] = true;
      if (Math.abs(wx - P.x) < 10 && Math.abs(target.y - P.y) < 6) { P.face = target.x > P.x ? 1 : -1; if (i % 5 === 0) g.pressedQ.atk = true; }
      if (i % 400 === 0 && P.hp > 40) g.pressedQ.special = true;
    } else {
      const c = g.crates.find(c => c.x > P.x - 20 && c.x < g.camX + 320);
      if (c) {
        // Se coloca a la izquierda de la caja; si pegado al borde no cabe, a la derecha.
        const side = c.x - 18 >= g.camX + 14 ? -1 : 1, wx = c.x + side*18;
        if (Math.abs(wx - P.x) > 4) g.held[wx > P.x ? 'right' : 'left'] = true;
        if (Math.abs(c.y - P.y) > 3) g.held[c.y > P.y ? 'down' : 'up'] = true;
        else if (Math.abs(wx - P.x) < 8 && i % 6 === 0) { P.face = -side; g.pressedQ.atk = true; }
      } else g.held.right = true;
    }
    g.update();
    if (i % 4 === 0) g.draw();
  }
  const r = { hero, god, state: g.state, frames: i, section: g.secIdx, score: g.score, continues };
  if (g.state !== 'clear') {
    r.player = { x: Math.round(g.P.x), y: Math.round(g.P.y), state: g.P.state, hp: g.P.hp };
    r.camX = Math.round(g.camX);
    r.foes = g.foes.map(e => ({ kind: e.kind, state: e.state, x: Math.round(e.x), y: Math.round(e.y), hp: e.hp, dead: !!e.dead }));
  }
  return r;
}

async function run(browser, hero, god, seed){
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|ERR_NAME|ERR_FILE|favicon/.test(m.text())) errors.push(m.text()); });
  const url = `${BASE_URL}${BASE_URL.includes('?') ? '&' : '?'}debug&seed=${seed}`;
  await page.goto(url);
  await page.waitForFunction(() => !!window.dnd, null, { timeout: 10000 });
  const r = await page.evaluate(playStage, [hero, god, MAX_FRAMES]);
  await page.close();
  return Object.assign(r, { seed, url, errors });
}

(async () => {
  console.log(`Juego: ${BASE_URL}`);
  const browser = await chromium.launch();
  const queue = [];
  for (const seed of SEEDS) for (const hero of HEROES) for (const god of [true, false]) queue.push([hero, god, seed]);
  // Como mucho CONCURRENCY partidas a la vez para no agotar la memoria.
  const results = [];
  const worker = async () => { while (queue.length) { const [hero, god, seed] = queue.shift(); results.push(await run(browser, hero, god, seed)); } };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  results.sort((a, b) => a.seed - b.seed || a.hero.localeCompare(b.hero) || b.god - a.god);
  await browser.close();

  let failed = false;
  for (const r of results) {
    const ok = r.state === 'clear' && !r.errors.length;
    if (!ok) failed = true;
    console.log(`${ok ? 'OK ' : 'ERR'} semilla=${r.seed} ${r.hero.padEnd(8)} ${r.god ? 'invulnerable' : 'normal      '} estado=${r.state} sección=${r.section} fotogramas=${r.frames} oro=${r.score} continues=${r.continues}`);
    if (!ok) {
      console.log(`    Reproducir: ${r.url}`);
      if (r.errors.length) console.log('    Errores: ' + r.errors.join(' | '));
      if (r.player) console.log('    Jugador: ' + JSON.stringify(r.player) + ' camX=' + r.camX + '\n    Enemigos: ' + JSON.stringify(r.foes));
    }
  }
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
