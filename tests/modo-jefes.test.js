// Pruebas del modo jefes, su ranking y la reasignación de teclas: node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

test('el modo jefes encadena los nueve jefes de las tres etapas', () => {
  const game = loadGame();
  game.ev("startBossRush('guerrero'); story = null; state = 'play'");
  assert.equal(game.ev('playMode'), 'jefes');
  assert.equal(game.ev('crates.length'), 0, 'sin cajas');
  const seen = [];
  for (let n = 0; n < 9; n++) {
    seen.push([game.ev('stageIdx'), game.ev('RUSH[secIdx].miniboss || STAGES[stageIdx].boss')]);
    game.ev('P.hp = 50');
    game.ev('rushNext(); story = null; if (state === "story") state = "play"');
    if (n < 8) assert.equal(game.ev('P.hp'), 80, 'entre jefes se recuperan 30 de vida');
  }
  assert.deepEqual(seen, [[0, 'minotauro'], [0, 'hidra'], [0, 'dragon'], [1, 'dba'], [1, 'cancerbero'], [1, 'lich'], [2, 'kraken'], [2, 'autoscaler'], [2, 'factura']]);
  assert.equal(game.ev('state'), 'clear');
  assert.equal(game.ev('clearBonus.rush'), true);
  assert.ok(game.ev('unlocked.jefes'));
});

test('al entrar en un combate del modo jefes aparece su jefe sin oleadas', () => {
  const game = loadGame();
  game.ev("startBossRush('mago'); story = null; state = 'play'");
  game.step(3);
  assert.equal(game.ev('locked'), true);
  assert.equal(game.ev("foes.some(f => f.kind === 'minotauro')"), true);
  game.ev("foes = []; rushNext(); rushNext(); story = null; state = 'play'");
  game.step(3);
  assert.equal(game.ev('boss && boss.kind'), 'dragon', 'el tercero es el Dragón Negro');
  assert.equal(game.ev('state'), 'play', 'sin viñetas por medio');
});

test('el modo jefes tiene su propio ranking', () => {
  const game = loadGame();
  game.ev("loadRanking('jefes'); ranking = [{ n:'AAA', s:1 }]; saveRanking(); loadRanking('arcade')");
  assert.equal(game.ev("JSON.parse(localStorage.getItem('dnd-arcade-ranking-jefes'))[0].n"), 'AAA');
  assert.notEqual(game.ev('ranking[0].n'), 'AAA', 'el ranking normal no cambia');
  game.ev("state = 'title'; titleSel = 1");
  game.press('atk');
  assert.equal(game.ev('playMode'), 'jefes');
  assert.equal(game.ev('ranking[0].n'), 'AAA', 'al elegir MODO JEFES se carga su ranking');
});

test('se puede reasignar una tecla y se intercambia si estaba ocupada', () => {
  const game = loadGame();
  game.ev("assignKey('atk', 'KeyF')");
  assert.equal(game.ev('KEYMAP.KeyF'), 'atk');
  assert.equal(game.ev('KEYMAP.KeyZ'), undefined, 'la tecla anterior deja de atacar');
  assert.equal(game.ev('KEYMAP.Space'), 'atk', 'las teclas alternativas siguen');
  game.ev("assignKey('jump', 'KeyF')");
  assert.equal(game.ev('KEYMAP.KeyF'), 'jump');
  assert.equal(game.ev("keyOf('atk')"), 'KeyX', 'atacar se queda con la tecla que tenía saltar');
  assert.equal(game.ev("JSON.parse(localStorage.getItem('dnd-arcade-options')).keys.jump"), 'KeyF');
  game.ev("state = 'keys'; keySel = KEY_ACTIONS.length");
  game.press('atk');
  assert.equal(game.ev('KEYMAP.KeyZ'), 'atk', 'RESTABLECER vuelve a las de siempre');
});

test('la pantalla de teclas espera una tecla física', () => {
  const game = loadGame();
  game.ev("state = 'keys'; keySel = 6");
  game.press('atk');
  assert.equal(game.ev('keyWait'), true);
  game.ev("keyCapture('KeyQ')");
  assert.equal(game.ev("keyOf('special')"), 'KeyQ');
  assert.equal(game.ev('keyWait'), false);
});
