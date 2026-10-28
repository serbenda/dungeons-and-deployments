// Pruebas de la partida guardada (CONTINUAR): node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

test('al empezar la etapa 2 se guarda la partida y aparece CONTINUAR', () => {
  const game = loadGame();
  assert.deepEqual(game.ev('titleMenu()'), ['JUGAR', 'MODO JEFES', 'OPCIONES', 'LOGROS'], 'sin partida no hay CONTINUAR');
  game.ev("startGame('bardo'); story = null; state = 'play'; P.hp = 61; P.lives = 1; score = 12345; RUN.kills = 40");
  game.ev('loadStage(1)');
  const s = game.ev('readSave()');
  assert.equal(s.stage, 1);
  assert.deepEqual([s.hero, s.hp, s.lives, s.score, s.run.kills], ['bardo', 61, 1, 12345, 40]);
  assert.equal(game.ev('titleMenu()[0]'), 'CONTINUAR');
});

test('CONTINUAR sigue desde el principio de la etapa guardada', () => {
  const game = loadGame();
  game.ev("startGame('picara'); story = null; state = 'play'; P.hp = 70; score = 5000; loadStage(2)");
  game.ev("PLAYERS = []; P = null; score = 0; stageIdx = 0; state = 'title'; titleSel = 0");
  game.press('atk');
  assert.equal(game.ev('stageIdx'), 2);
  assert.deepEqual(game.ev('[P.hero, P.hp, score]'), ['picara', 70, 5000]);
  assert.equal(game.ev('story && story.key'), 'nube');
  assert.equal(game.ev('RUN.continues'), 0, 'seguir sin haber perdido no cuenta como continuación');
});

test('tras un GAME OVER, seguir cuenta como continuación y empieza con vida llena', () => {
  const game = loadGame();
  game.ev("startGame('mago'); story = null; state = 'play'; loadStage(1); story = null; state = 'continue'; contT = 1; P.hp = 0");
  game.step(1);
  assert.equal(game.ev('state'), 'over');
  assert.equal(game.ev('readSave().dead'), true);
  game.ev('continueGame()');
  assert.equal(game.ev('RUN.continues'), 1);
  assert.equal(game.ev('P.hp'), 100);
  assert.equal(game.ev('revisorUnlocked()'), false);
});

test('el modo jefes no guarda y terminar el juego borra la partida', () => {
  const game = loadGame();
  game.ev("startBossRush('guerrero'); for (let i = 0; i < 8; i++) rushNext()");
  assert.equal(game.ev('readSave()'), null, 'el modo jefes no deja partida guardada');
  game.ev("playMode = 'arcade'; startGame('guerrero'); loadStage(2); story = null; state = 'play'");
  assert.ok(game.ev('readSave()'));
  game.ev('stageClear()');
  game.step(160);
  game.press('start');
  assert.equal(game.ev('state'), 'credits');
  assert.equal(game.ev('readSave()'), null);
});
