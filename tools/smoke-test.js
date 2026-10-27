#!/usr/bin/env node
// Prueba de humo: abre el juego en Chromium sin ventana, comprueba que carga sin
// errores y deja que un bot juegue la etapa completa con cada héroe.
//
//   npm test                      # usa file:// sobre index.html
//   BASE_URL=http://localhost:8000/ npm test
'use strict';

const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('playwright');

const BASE_URL = process.env.BASE_URL || pathToFileURL(path.join(__dirname, '..', 'index.html')).href;
const MAX_FRAMES = 60*60*20; // 20 minutos de juego simulado como mucho

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
    const item = g.items[0];
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
        const wx = c.x - 18;
        if (Math.abs(wx - P.x) > 4) g.held[wx > P.x ? 'right' : 'left'] = true;
        if (Math.abs(c.y - P.y) > 3) g.held[c.y > P.y ? 'down' : 'up'] = true;
        else if (Math.abs(wx - P.x) < 8 && i % 6 === 0) { P.face = 1; g.pressedQ.atk = true; }
      } else g.held.right = true;
    }
    g.update();
    if (i % 4 === 0) g.draw();
  }
  return { hero, god, state: g.state, frames: i, section: g.secIdx, score: g.score, continues };
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_TUNNEL|ERR_NAME/.test(m.text())) errors.push(m.text()); });
  const url = BASE_URL + (BASE_URL.includes('?') ? '&' : '?') + 'debug';
  console.log('Abriendo', url);
  await page.goto(url);
  await page.waitForFunction(() => !!window.dnd, null, { timeout: 10000 });

  let failed = false;
  for (const [hero, god] of [['guerrero', true], ['mago', true], ['guerrero', false], ['mago', false]]) {
    const r = await page.evaluate(playStage, [hero, god, MAX_FRAMES]);
    const ok = r.state === 'clear';
    if (!ok) failed = true;
    console.log(`${ok ? 'OK ' : 'ERR'} ${hero.padEnd(8)} ${god ? 'invulnerable' : 'normal      '} estado=${r.state} sección=${r.section} fotogramas=${r.frames} oro=${r.score} continues=${r.continues}`);
  }
  await browser.close();
  if (errors.length) { console.error('Errores en la página:\n  ' + errors.join('\n  ')); failed = true; }
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
