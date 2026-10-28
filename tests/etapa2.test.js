// Pruebas de la etapa 2, Las Cuevas: datos, paso entre etapas, jefes y mecánicas
// nuevas: node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

/** Empieza una partida y salta la viñeta inicial. */
function startPlaying(game, heroes = 'guerrero'){
  game.ev(`startGame(${JSON.stringify(heroes)})`);
  game.ev("story = null; state = 'play'");
}
/** Pasa directamente a la etapa 2 y salta su viñeta. */
function startStage2(game, heroes){
  startPlaying(game, heroes);
  game.ev("loadStage(1); story = null; state = 'play'");
}

test('las dos etapas tienen datos coherentes', () => {
  const game = loadGame();
  const foes = game.ev('Object.keys(FOES)'), rigs = game.ev('Object.keys(RIGS)');
  const items = new Set([...game.ev('Object.keys(FOOD)'), 'baculo', 'martillo', 'patito', 'stack']);
  for (const [kind, rig] of game.ev('Object.entries(FOES).map(([k, d]) => [k, d.rig || null])')) {
    if (rig) assert.ok(rigs.includes(rig), `el enemigo ${kind} usa el esqueleto ${rig}, que no existe`);
  }
  for (const st of game.ev('STAGES')) {
    let last = -1;
    for (const s of st.sections) {
      assert.ok(s.cam > last, `${st.name}: secciones fuera de orden`); last = s.cam;
      assert.match(s.mission, /^[A-Z0-9]+-\d+ /, `${st.name}: ticket mal formado ${s.mission}`);
      for (const wave of s.waves || []) for (const [kind] of wave) assert.ok(foes.includes(kind), `${st.name}: ${kind} no está en FOES`);
      for (const [, , kind] of s.mimics || []) if (kind) assert.ok(foes.includes(kind), `${st.name}: mímico ${kind} no está en FOES`);
      if (s.miniboss) assert.ok(['minotauro', 'hidra', 'dba', 'cancerbero', 'kraken', 'autoscaler'].includes(s.miniboss), `jefe de sección desconocido: ${s.miniboss}`);
    }
    assert.equal(st.sections[st.sections.length - 1].boss, true, `${st.name}: la última sección es la del jefe`);
    for (const [, , , item] of st.crates) assert.ok(items.has(item), `${st.name}: objeto desconocido ${item}`);
    assert.equal(game.ev(`typeof STORIES[${JSON.stringify(st.story)}]`), 'function', `${st.name}: falta su viñeta`);
  }
});

test('loadStage cambia de etapa y conserva a los jugadores', () => {
  const game = loadGame();
  startPlaying(game, ['guerrero', 'mago']);
  game.ev('PLAYERS[0].hp = 42; PLAYERS[1].lives = 1; camX = 900; foes.push(mkFoe("goblin", 1000, 150))');
  game.ev('loadStage(1)');
  assert.equal(game.ev('stageIdx'), 1);
  assert.equal(game.ev('SECTIONS === SECTIONS_2'), true);
  assert.equal(game.ev('camX'), 0);
  assert.equal(game.ev('foes.length'), 0, 'empieza sin enemigos');
  assert.equal(game.ev('crates.length'), game.ev('CRATES_2.length'));
  assert.deepEqual(game.ev('[PLAYERS[0].hp, PLAYERS[1].lives]'), [42, 1], 'vida y vidas se conservan');
  assert.equal(game.ev('state'), 'story');
  assert.equal(game.ev('story.key'), 'cuevas');
});

test('al terminar la etapa 1, START lleva a Las Cuevas', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev('stageClear()');
  assert.equal(game.ev('state'), 'clear');
  assert.ok(game.ev('unlocked.viernes'));
  game.step(160);
  game.press('start');
  assert.equal(game.ev('stageIdx'), 1);
  assert.equal(game.ev('story && story.key'), 'cuevas');
});

test('al terminar la etapa 2 se sube a La Nube, y tras la 3 llegan los créditos', () => {
  const game = loadGame();
  startStage2(game);
  game.ev('stageClear()');
  assert.ok(game.ev('unlocked.cuevas'));
  game.step(160);
  game.press('start');
  assert.equal(game.ev('stageIdx'), 2);
  assert.equal(game.ev('story && story.key'), 'nube');
  game.ev("story = null; state = 'play'; stageClear()");
  assert.ok(game.ev('unlocked.nube'));
  game.step(160);
  game.press('start');
  assert.equal(game.ev('state'), 'credits');
});

test('las zonas y la música de Las Cuevas', () => {
  const game = loadGame();
  startStage2(game);
  const zones = { 100: 'datos', 1450: 'seguridad', 2700: 'monitor', 3400: 'boss' };
  for (const [cam, track] of Object.entries(zones)) {
    game.ev(`camX = ${cam}`);
    assert.equal(game.ev('musicFor()'), track, `cámara en ${cam}`);
  }
  game.ev('stageIdx = 0');
  assert.equal(game.ev('ZONE(100)'), 'sistemas', 'la etapa 1 conserva sus zonas');
});

test('LOCK TABLE atrapa y cinco pulsaciones de A liberan', () => {
  const game = loadGame();
  startStage2(game);
  game.ev('P.inv = 0; locks.push({ x:P.x, y:P.y, r:34, t:0, arm:2, life:100 })');
  game.step(3);
  assert.equal(game.ev('P.state'), 'stuck', 'el jugador queda atrapado');
  for (let i = 0; i < 5; i++) game.press('atk');
  assert.notEqual(game.ev('P.state'), 'stuck', 'se libera');
  assert.ok(game.ev('unlocked.unlock'), 'logro UNLOCK TABLES');
});

test('el Lich COBOL no recibe daño mientras exista su copia en cinta', () => {
  const game = loadGame();
  startStage2(game);
  game.ev('camX = LEVEL_END; secIdx = SECTIONS.length - 1; locked = true; boss = mkLich(camX + 200, 156); foes.push(boss); boss.state = "idle"');
  game.ev('boss.hp = Math.floor(boss.max*.55)');
  game.ev('P = targetFor(boss); updateLich(boss); P = PLAYERS[0]');
  assert.equal(game.ev('boss.state'), 'phylactery');
  for (let i = 0; i < 25; i++) game.ev('P = targetFor(boss); boss.t++; updateLich(boss); P = PLAYERS[0]');
  assert.equal(game.ev('boss.shielded'), true);
  assert.equal(game.ev("foes.some(f => f.kind === 'cinta')"), true, 'aparece la copia en cinta');
  assert.equal(game.ev('damage(boss, 20, P, { pierce:true })'), false, 'protegido');
  game.ev("var tape = foes.find(f => f.kind === 'cinta'); damage(tape, 9999, P, {})");
  game.ev('P = targetFor(boss); updateLich(boss); P = PLAYERS[0]');
  assert.equal(game.ev('boss.shielded'), false, 'sin cinta queda expuesto');
  assert.equal(game.ev('damage(boss, 20, P, {})'), true);
});

test('el Cancerbero es una Hidra con MFA en vez de paridad', () => {
  const game = loadGame();
  startStage2(game);
  game.ev('camX = 2040; spawnMiniboss("cancerbero"); story = null; state = "play"');
  const heads = game.ev("foes.filter(f => f.kind === 'cabeza').map(f => [f.d.name, !!f.d.parity])");
  assert.deepEqual(heads.find(h => h[1])[0], 'MFA');
  game.ev("var mfa = foes.find(f => f.kind === 'cabeza' && f.d.parity); mfa.state = 'idle'; damage(mfa, 9999, P, {})");
  assert.ok(game.ev('unlocked.mfa'), 'romper el MFA desbloquea el logro');
  assert.equal(game.ev('unlocked.paridad'), undefined, 'y no el de la Hidra');
});

test('el ransomware cifra el arma del jugador', () => {
  const game = loadGame();
  startStage2(game);
  game.ev("P.inv = 0; P.weapon = 'martillo'; P.ammo = 5; var rw = mkFoe('ransom', P.x + 10, P.y)");
  game.ev('damage(P, 5, rw, {})');
  assert.equal(game.ev('P.weapon'), null);
});

test('el HOTFIX no tumba la copia en cinta (se quedaría invulnerable)', () => {
  const game = loadGame();
  startStage2(game);
  game.ev("var tp = mkFoe('cinta', P.x + 40, P.y); tp.state = 'idle'; foes.push(tp); P.lives = 1; loseLife()");
  game.step(5);
  assert.equal(game.ev('tp.state'), 'idle');
  game.ev('P.inv = 0');
  assert.equal(game.ev('damage(tp, 10, P, {})'), true, 'sigue recibiendo golpes');
});
