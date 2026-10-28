#!/usr/bin/env node
// Prueba de humo: abre el juego en Chromium sin ventana, comprueba que carga sin
// errores y deja que un bot juegue las tres etapas con cada héroe y en cooperativo.
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
const MAX_FRAMES = 60*60*60; // una hora de juego simulado como mucho (tres etapas)
const SEEDS = (process.env.SEEDS || '1,2').split(',').map(Number);
// Una partida por héroe y una en cooperativo.
const TEAMS = [['guerrero'], ['mago'], ['picara'], ['bardo'], ['guerrero', 'bardo']];
const CONCURRENCY = Number(process.env.CONCURRENCY || 4);

// El bot se ejecuta dentro de la página contra window.dnd (modo ?debug).
// heroes es un héroe (una partida de un jugador, elegido en la pantalla de
// selección) o dos (cooperativo: el bot maneja a los dos).
function playStage([heroes, god, maxFrames, mode]){
  const g = window.dnd;
  const ORDER = ['guerrero', 'mago', 'picara', 'bardo'];
  try { localStorage.removeItem('dnd-arcade-save'); } catch (e) { /* sin almacenamiento: no hay partida guardada */ }
  g.state = 'title'; g.update();
  g.titleSel = g.titleMenu().indexOf('JUGAR');                            // por si otra partida acaba de guardar
  g.pressedQ.start = true; g.update();
  if (mode === 'jefes') g.startBossRush(heroes);
  else if (heroes.length === 1) {
    for (let n = 0; n < ORDER.indexOf(heroes[0]); n++) { g.pressedQ.right = true; g.update(); }
    g.pressedQ.atk = true; g.update();
  } else g.startGame(heroes);
  let i, continues = 0;
  // Decide las teclas de un jugador: objetos visibles, el enemigo más cercano o cajas.
  const drive = (P, H, Q) => {
    for (const k of ['left', 'right', 'up', 'down']) H[k] = false;
    if (P.out) { if (i % 30 === 0) Q.start = true; return; }
    if (P.state === 'stuck') { if (i % 3 === 0) Q.atk = true; return; }
    if (god) P.inv = Math.max(P.inv, 2);
    const enemies = g.foes.filter(e => !e.dead && e.hp > 0 && (e.kind !== 'golem' || e.angry) && e.state !== 'rise' && !e.hidden && e.kind !== 'hidra' && !(e.kind === 'revisor' && e.guarded) && !(e.kind === 'lich' && e.shielded));
    let target = null, best = 1e9;
    for (const e of enemies) { const d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y)*2; if (d < best) { best = d; target = e; } }
    // Solo objetos visibles: la cámara nunca retrocede, lo que queda a la izquierda se pierde.
    const item = g.items.find(it => it.x > g.camX + 14 && it.x < g.camX + 306);
    if (item && Math.abs(item.x - P.x) < 200 && (!target || best > 120)) {
      if (Math.abs(item.x - P.x) > 8) H[item.x > P.x ? 'right' : 'left'] = true;
      if (Math.abs(item.y - P.y) > 4) H[item.y > P.y ? 'down' : 'up'] = true;
      if (Math.abs(item.x - P.x) < 12 && Math.abs(item.y - P.y) < 6 && i % 6 === 0) Q.atk = true;
    } else if (target) {
      const off = target.kind === 'dragon' ? 60 : target.kind === 'golem' ? 34 : 20;
      const wx = target.x + (P.x < target.x ? -off : off);
      if (Math.abs(wx - P.x) > 4) H[wx > P.x ? 'right' : 'left'] = true;
      if (Math.abs(target.y - P.y) > 3) H[target.y > P.y ? 'down' : 'up'] = true;
      if (Math.abs(wx - P.x) < 10 && Math.abs(target.y - P.y) < 6) { P.face = target.x > P.x ? 1 : -1; if (i % 5 === 0) Q.atk = true; }
      if (i % 400 === 0 && P.hp > 40) Q.special = true;
    } else {
      const c = g.crates.find(c => c.x > P.x - 20 && c.x < g.camX + 320);
      if (c) {
        // Se coloca a la izquierda de la caja; si pegado al borde no cabe, a la derecha.
        const side = c.x - 18 >= g.camX + 14 ? -1 : 1, wx = c.x + side*18;
        if (Math.abs(wx - P.x) > 4) H[wx > P.x ? 'right' : 'left'] = true;
        if (Math.abs(c.y - P.y) > 3) H[c.y > P.y ? 'down' : 'up'] = true;
        else if (Math.abs(wx - P.x) < 8 && i % 6 === 0) { P.face = -side; Q.atk = true; }
      } else H.right = true;
    }
  };
  for (i = 0; i < maxFrames; i++) {
    if (g.state === 'over') break;
    if (g.state === 'clear') {
      if (g.stageIdx >= 2 || mode === 'jefes') break;  // última etapa (o modo jefes): fin
      for (let k = 0; k < 160; k++) g.update();
      g.pressedQ.start = true; g.update(); continue;
    }
    if (g.state === 'continue') { continues++; g.pressedQ.start = true; }
    if (g.state === 'story') { if (i % 3 === 0) g.pressedQ.atk = true; g.update(); continue; }
    for (const p of g.PLAYERS) drive(p, g.INP[p.slot].held, g.INP[p.slot].q);
    g.update();
    if (i % 4 === 0) g.draw();
  }
  const r = { hero: heroes.join('+') + (mode === 'jefes' ? ' (jefes)' : ''), mode, god, state: g.state, stage: g.stageIdx + 1, frames: i, section: g.secIdx, score: g.score, continues, revisor: !!(g.RUN && g.RUN.revisor) };
  if (g.state !== 'clear' || (g.stageIdx < 2 && mode !== 'jefes')) {
    r.player = g.PLAYERS.map(p => ({ x: Math.round(p.x), y: Math.round(p.y), state: p.state, hp: p.hp, out: p.out }));
    r.camX = Math.round(g.camX);
    r.foes = g.foes.map(e => ({ kind: e.kind, state: e.state, x: Math.round(e.x), y: Math.round(e.y), hp: e.hp, dead: !!e.dead, guarded: e.guarded }));
  }
  return r;
}

async function run(browser, team, god, seed, mode){
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|ERR_NAME|ERR_FILE|favicon/.test(m.text())) errors.push(m.text()); });
  const url = `${BASE_URL}${BASE_URL.includes('?') ? '&' : '?'}debug&seed=${seed}`;
  await page.goto(url);
  await page.waitForFunction(() => !!window.dnd, null, { timeout: 10000 });
  const r = await page.evaluate(playStage, [team, god, MAX_FRAMES, mode]);
  await page.close();
  return Object.assign(r, { seed, url, errors });
}

(async () => {
  console.log(`Juego: ${BASE_URL}`);
  const browser = await chromium.launch();
  const queue = [];
  for (const seed of SEEDS) {
    for (const team of TEAMS) for (const god of [true, false]) queue.push([team, god, seed]);
    queue.push([['mago'], true, seed, 'jefes'], [['bardo', 'picara'], false, seed, 'jefes']);   // modo jefes
  }
  // Como mucho CONCURRENCY partidas a la vez para no agotar la memoria.
  const results = [];
  const worker = async () => { while (queue.length) { const [team, god, seed, mode] = queue.shift(); results.push(await run(browser, team, god, seed, mode)); } };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  results.sort((a, b) => a.seed - b.seed || a.hero.localeCompare(b.hero) || b.god - a.god);
  await browser.close();

  let failed = false;
  for (const r of results) {
    const ok = r.state === 'clear' && (r.mode === 'jefes' || r.stage === 3) && !r.errors.length;
    if (!ok) failed = true;
    console.log(`${ok ? 'OK ' : 'ERR'} semilla=${r.seed} ${r.hero.padEnd(22)} ${r.god ? 'invulnerable' : 'normal      '} estado=${r.state} etapa=${r.stage} sección=${r.section} fotogramas=${r.frames} oro=${r.score} continues=${r.continues}${r.revisor ? ' revisor=OK' : ''}`);
    if (!ok) {
      console.log(`    Reproducir: ${r.url}`);
      if (r.errors.length) console.log('    Errores: ' + r.errors.join(' | '));
      if (r.player) console.log('    Jugador: ' + JSON.stringify(r.player) + ' camX=' + r.camX + '\n    Enemigos: ' + JSON.stringify(r.foes));
    }
  }
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
