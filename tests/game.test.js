// Pruebas unitarias de la lógica del juego, sin navegador: node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

/** Empieza una partida con el héroe indicado y salta la viñeta inicial. */
function startPlaying(game, hero = 'guerrero'){
  game.ev(`startGame(${JSON.stringify(hero)})`);
  assert.equal(game.ev('state'), 'story', 'la partida empieza con la viñeta de introducción');
  game.ev("story = null; state = 'play'");
}

test('todos los scripts cargan en orden sin errores', () => {
  const game = loadGame();
  assert.equal(game.ev('state'), 'title');
  for (const fn of ['update', 'draw', 'startGame', 'damage', 'rigSprite', 'buildLevel', 'musicFor']) {
    assert.equal(game.ev(`typeof ${fn}`), 'function', `${fn} debería existir`);
  }
});

test('los datos del juego son coherentes', () => {
  const game = loadGame();
  const foes = game.ev('Object.keys(FOES)');
  const rigs = game.ev('Object.keys(RIGS)');
  for (const [kind, rig] of game.ev('Object.entries(FOES).map(([k, d]) => [k, d.rig || null])')) {
    if (rig) assert.ok(rigs.includes(rig), `el enemigo ${kind} usa el esqueleto ${rig}, que no existe`);
  }
  const sections = game.ev('SECTIONS');
  let lastCam = -1;
  for (const s of sections) {
    assert.ok(s.cam > lastCam, 'las secciones deben ir en orden de cámara');
    lastCam = s.cam;
    assert.match(s.mission, /^[A-Z0-9]+-\d+ /, `ticket mal formado: ${s.mission}`);
    for (const wave of s.waves || []) for (const [kind, side] of wave) {
      assert.ok(foes.includes(kind), `la oleada usa ${kind}, que no está en FOES`);
      assert.ok([-1, 0, 1].includes(side), `lado de aparición no válido: ${side}`);
    }
  }
  assert.equal(sections[sections.length - 1].boss, true, 'la última sección es la del Dragón Negro');
  const validItems = new Set([...game.ev('Object.keys(FOOD)'), 'baculo', 'martillo', 'patito', 'stack']);
  for (const [, , , item] of game.ev('CRATES')) assert.ok(validItems.has(item), `objeto desconocido en una caja: ${item}`);
  for (const kind of game.ev('Object.keys(GRUNTS)')) assert.ok(foes.includes(kind), `GRUNTS cita ${kind}, que no está en FOES`);
});

test('las poses mezcladas interpolan entre dos poses', () => {
  const game = loadGame();
  const a = game.ev("POSES.walk0"), b = game.ev("POSES.walk1");
  const mid = game.ev("getPose('walk0~walk1~0.5')");
  assert.equal(mid.lean, (a.lean + b.lean)/2);
  assert.deepEqual(mid.bl, [(a.bl[0] + b.bl[0])/2, (a.bl[1] + b.bl[1])/2]);
  assert.equal(game.ev("getPose('walk0~walk1~0.5') === getPose('walk0~walk1~0.5')"), true, 'la mezcla se guarda en caché');
  assert.equal(game.ev("getPose('walk0~walk1~0')").lean, a.lean, 'con k=0 es la primera pose');
});

test('cada golpe suma al combo y un golpe recibido lo rompe', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev("var g1 = mkFoe('orco', P.x + 20, P.y); g1.hp = g1.max = 999; foes.push(g1)");
  for (let i = 0; i < 5; i++) {
    game.ev("g1.state = 'walk'; g1.inv = 0");
    assert.equal(game.ev('damage(g1, 5, P, {})'), true);
  }
  assert.equal(game.ev('P.chain'), 5);
  assert.equal(game.ev('rankFx && rankFx.text'), 'NICE!', 'a los 5 golpes aparece el rango NICE!');
  game.ev('P.inv = 0');
  game.ev('damage(P, 1, g1, {})');
  assert.equal(game.ev('P.chain'), 0, 'recibir un golpe rompe el combo');
  assert.equal(game.ev('P.maxChain'), 5, 'el combo máximo se conserva');
});

test('el Caballero Firewall bloquea de frente y cae por la espalda', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev("var fw = mkFoe('firewall', P.x + 20, P.y); fw.face = -1; foes.push(fw)");
  assert.equal(game.ev('damage(fw, 10, P, {})'), false, 'golpe de frente bloqueado (ACL: DENY)');
  game.ev('fw.face = 1');
  assert.equal(game.ev('damage(fw, 10, P, {})'), true, 'por la espalda sí entra');
});

test('la Hidra RAID reconstruye discos mientras viva la paridad', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev('var body = spawnHydra(camX + 262); var heads = foes.filter(f => f.kind === "cabeza"); for (const h of heads) h.cool = 99999');
  game.ev('var d1 = heads.find(h => !h.d.parity), par = heads.find(h => h.d.parity)');
  game.ev('damage(d1, 999, P, {})');
  assert.equal(game.ev('d1.state'), 'broken');
  assert.equal(game.ev('d1.dead'), false, 'con la paridad viva, el disco no muere');
  for (let i = 0; i < 430; i++) game.ev('updateHead(d1)');
  assert.equal(game.ev('d1.state'), 'idle', 'RAID REBUILD 100%: el disco vuelve');
  assert.ok(game.ev('d1.hp') > 0);
  game.ev('damage(d1, 999, P, {}); damage(par, 999, P, {})');
  assert.equal(game.ev('par.dead && d1.dead'), true, 'sin paridad no hay reconstrucción');
});

test('el ranking guarda las iniciales en orden', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev('score = 123456');
  game.ev('afterRun()');
  assert.equal(game.ev('state'), 'initials', 'una puntuación alta pide iniciales');
  game.press('up');            // A -> B
  game.press('atk');           // confirma la B
  game.press('atk');           // A
  game.press('atk');           // A
  assert.equal(game.ev('state'), 'ranking');
  const ranking = game.ev('ranking');
  assert.equal(ranking.length, 5);
  assert.deepEqual(ranking[0], { n: 'BAA', s: 123456 });
  for (let i = 1; i < ranking.length; i++) assert.ok(ranking[i - 1].s >= ranking[i].s, 'ordenado de mayor a menor');
  assert.ok(game.ev("localStorage.getItem('dnd-arcade-ranking')").includes('BAA'), 'se guarda en el navegador');
});

test('una puntuación baja va directa al ranking', () => {
  const game = loadGame();
  startPlaying(game);
  game.ev('score = 10; afterRun()');
  assert.equal(game.ev('state'), 'ranking');
});

test('la semilla hace las partidas reproducibles', () => {
  const a = loadGame({ search: '?debug&seed=7' }), b = loadGame({ search: '?debug&seed=7' }), c = loadGame({ search: '?debug&seed=8' });
  const seq = g => g.ev('[Math.random(), Math.random(), Math.random()]');
  const sa = seq(a);
  assert.deepEqual(sa, seq(b), 'misma semilla, misma secuencia');
  assert.notDeepEqual(sa, seq(c), 'otra semilla, otra secuencia');
});

test('la música elige tema según la zona y el estado', () => {
  const game = loadGame();
  assert.equal(game.ev('musicFor()'), 'title');
  startPlaying(game);
  const zones = { 100: 'sistemas', 800: 'network', 1450: 'storage', 2100: 'virtual', 2700: 'caas', 3400: 'boss' };
  for (const [cam, track] of Object.entries(zones)) {
    game.ev(`camX = ${cam}`);
    assert.equal(game.ev('musicFor()'), track, `cámara en ${cam}`);
  }
});
