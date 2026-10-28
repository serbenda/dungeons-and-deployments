// Pruebas de la etapa 3, La Nube: zonas, jefes y mecánicas nuevas: node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

/** Empieza una partida directamente en La Nube y salta la viñeta. */
function startStage3(game, heroes = 'guerrero'){
  game.ev(`startGame(${JSON.stringify(heroes)}); loadStage(2); story = null; state = 'play'`);
}

test('La Nube tiene sus zonas y su música', () => {
  const game = loadGame();
  startStage3(game);
  assert.equal(game.ev('STAGES[2].name'), 'LA NUBE');
  const zones = { 100: 'k8s', 1450: 'serverless', 2700: 'facturas', 3400: 'boss' };
  for (const [cam, track] of Object.entries(zones)) {
    game.ev(`camX = ${cam}`);
    assert.equal(game.ev('musicFor()'), track, `cámara en ${cam}`);
  }
});

test('el CONTROL PLANE del Kraken solo cae con los dos nodos drenados', () => {
  const game = loadGame();
  startStage3(game);
  game.ev('camX = 760; spawnMiniboss("kraken"); story = null; state = "play"');
  game.ev("var cp = foes.find(f => f.kind === 'cabeza' && f.d.parity), nodes = foes.filter(f => f.kind === 'cabeza' && !f.d.parity)");
  assert.equal(game.ev('cp.d.name'), 'CONTROL PLANE');
  assert.equal(game.ev('damage(cp, 10, P, { pierce:true })'), false, 'con los nodos en pie, taint: no recibe daño');
  game.ev("damage(nodes[0], 9999, P, {})");
  assert.equal(game.ev('damage(cp, 10, P, {})'), false, 'con un solo nodo caído sigue protegido');
  game.ev("nodes[1].state = 'idle'; damage(nodes[1], 9999, P, {})");
  assert.equal(game.ev("cp.state = 'idle'; damage(cp, 9999, P, {})"), true, 'con los dos nodos caídos, cae');
  assert.ok(game.ev('unlocked.kraken'));
});

test('el Autoescalador saca dos réplicas cada 25 % y reparte la carga', () => {
  const game = loadGame();
  startStage3(game);
  game.ev("camX = 2040; var au = mkFoe('autoscaler', P.x + 30, P.y); au.state = 'walk'; au.step = 0; au.cool = 999; foes.push(au)");
  game.ev('au.hp = Math.floor(au.max*.7)');
  game.ev('P = targetFor(au); updateAutoscaler(au); P = PLAYERS[0]');
  assert.equal(game.ev('au.state'), 'scale');
  for (let i = 0; i < 14; i++) game.ev('P = targetFor(au); au.t++; updateAutoscaler(au); P = PLAYERS[0]');
  assert.equal(game.ev("foes.filter(f => f.kind === 'replica').length"), 2, 'SCALE OUT: +2 réplicas');
  game.ev('P = targetFor(au); updateAutoscaler(au); P = PLAYERS[0]');
  assert.equal(game.ev('au.shared'), true, 'con réplicas vivas la carga está repartida');
});

test('las monedas de la Factura dañan a quien esté debajo al caer', () => {
  const game = loadGame();
  startStage3(game);
  game.ev('P.inv = 0; P.hp = 100; drops.push({ x:P.x, y:P.y, z:6, vz:0 }, { x:P.x + 100, y:P.y, z:6, vz:0 })');
  for (let i = 0; i < 10; i++) game.ev('updateDrops()');
  assert.equal(game.ev('drops.length'), 0);
  assert.equal(game.ev('P.hp'), 92, 'solo la que cae encima hace daño');
});

test('la Factura hace llover monedas y al pagarla termina la etapa', () => {
  const game = loadGame();
  startStage3(game);
  game.ev('camX = LEVEL_END; secIdx = SECTIONS.length - 1; locked = true; boss = mkFactura(camX + 200, 156); foes.push(boss); boss.state = "rain"; boss.t = 0');
  for (let i = 0; i < 9; i++) game.ev('P = targetFor(boss); boss.t++; updateFactura(boss); P = PLAYERS[0]');
  assert.ok(game.ev('drops.length') > 0, 'caen monedas');
  game.ev('boss.state = "idle"; boss.inv = 0; damage(boss, 99999, P, {})');
  game.ev('P = targetFor(boss); updateFactura(boss); P = PLAYERS[0]');
  assert.equal(game.ev('boss.state'), 'dying');
  game.ev('var fb = boss');
  for (let i = 0; i < 152 && game.ev('!!boss'); i++) game.ev('P = targetFor(fb); fb.t++; updateFactura(fb); P = PLAYERS[0]');
  assert.ok(game.ev('unlocked.finops'));
  assert.equal(game.ev('story && story.key'), 'epilogo');
});

test('los elementales YAML se dividen en tabuladores', () => {
  const game = loadGame();
  startStage3(game);
  game.ev("var y = mkFoe('yaml', P.x + 20, P.y); foes.push(y); damage(y, 999, P, {})");
  assert.equal(game.ev("foes.filter(f => f.kind === 'yamlS').length"), 2);
});
