// Pruebas del cooperativo, los mandos, las opciones, los logros, los héroes nuevos
// y El Revisor: node --test
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadGame } = require('./harness');

/** Empieza una partida (uno o dos héroes) y salta la viñeta inicial. */
function startPlaying(game, heroes){
  game.ev(`startGame(${JSON.stringify(heroes)})`);
  game.ev("story = null; state = 'play'");
}

test('en cooperativo hay dos jugadores y los enemigos tienen más vida', () => {
  const solo = loadGame(), duo = loadGame();
  startPlaying(solo, 'guerrero');
  startPlaying(duo, ['guerrero', 'mago']);
  assert.equal(duo.ev('PLAYERS.length'), 2);
  assert.deepEqual(duo.ev('PLAYERS.map(p => [p.hero, p.slot])'), [['guerrero', 0], ['mago', 1]]);
  const hpSolo = solo.ev("mkFoe('orco', 100, 150).hp"), hpDuo = duo.ev("mkFoe('orco', 100, 150).hp");
  assert.equal(hpDuo, Math.round(hpSolo*1.5), 'con dos jugadores, +50 % de vida');
});

test('cada jugador se mueve solo con sus teclas', () => {
  const game = loadGame();
  startPlaying(game, ['guerrero', 'mago']);
  game.ev('PLAYERS[0].inv = PLAYERS[1].inv = 0');
  const x0 = game.ev('[PLAYERS[0].x, PLAYERS[1].x]');
  game.ev('INP[1].held.right = true');
  game.step(20);
  const x1 = game.ev('[PLAYERS[0].x, PLAYERS[1].x]');
  assert.equal(x1[0], x0[0], 'el jugador 1 no se mueve');
  assert.ok(x1[1] > x0[1] + 10, 'el jugador 2 avanza');
});

test('START en otro mando une al jugador 2 a una partida en curso', () => {
  const game = loadGame();
  game.ev("lastDev = 'kb'; state = 'title'");
  game.press('start');                       // título → selección (teclado = jugador 1)
  assert.equal(game.ev('state'), 'select');
  assert.equal(game.ev('owner0'), 'kb');
  game.press('atk');                         // confirma al guerrero
  game.ev("story = null; state = 'play'");
  assert.equal(game.ev('PLAYERS.length'), 1);
  game.ev("press('start', 'pad0')");
  game.step(1);
  assert.equal(game.ev('PLAYERS.length'), 2, 'el mando entra como jugador 2');
  assert.equal(game.ev('DEV_SLOT.pad0'), 1);
  assert.notEqual(game.ev('PLAYERS[1].hero'), game.ev('PLAYERS[0].hero'), 'con un héroe distinto');
  assert.equal(game.ev('state'), 'play', 'unirse no pausa la partida');
});

test('un mando (Gamepad API) maneja los menús', () => {
  const game = loadGame();
  game.ev(`navigator.getGamepads = () => [{ index:0, connected:true, axes:[0, 0], buttons:[{ pressed:true }] }]`);
  game.step(1);
  assert.equal(game.ev('state'), 'select', 'el botón A del mando entra en la selección');
  assert.equal(game.ev('owner0'), 'pad0', 'y el mando pasa a ser el del jugador 1');
});

test('un jugador sin vidas queda fuera y vuelve con START sin cortar la partida', () => {
  const game = loadGame();
  startPlaying(game, ['guerrero', 'mago']);
  game.ev('P = PLAYERS[1]; P.lives = 0; loseLife(); P = PLAYERS[0]');
  assert.equal(game.ev('PLAYERS[1].out'), true);
  assert.equal(game.ev('state'), 'play', 'el jugador 1 sigue jugando');
  game.ev('INP[1].q.start = true');
  game.step(1);
  assert.equal(game.ev('PLAYERS[1].out'), false, 'START lo devuelve a la partida');
  assert.equal(game.ev('RUN.continues'), 1, 'cuenta como continuación');
});

test('la dificultad cambia la vida y el daño de los enemigos', () => {
  const game = loadGame();
  startPlaying(game, 'guerrero');
  const hp = d => game.ev(`OPTS.diff = ${d}; mkFoe('orco', 100, 150).hp`);
  assert.ok(hp(0) < hp(1) && hp(1) < hp(2));
  game.ev('OPTS.diff = 2; P.inv = 0; P.hp = 100');
  game.ev("damage(P, 10, { x: P.x + 10, y: P.y }, {})");
  assert.equal(game.ev('P.hp'), 100 - Math.round(10*1.35), 'en GUARDIA 24/7 los golpes duelen más');
});

test('las opciones se guardan en el navegador', () => {
  const game = loadGame();
  game.ev("state = 'options'; optSel = 0");
  game.press('left');
  assert.equal(game.ev('OPTS.music'), 7);
  assert.equal(game.ev("JSON.parse(localStorage.getItem('dnd-arcade-options')).music"), 7);
});

test('los logros se desbloquean una sola vez y se guardan', () => {
  const game = loadGame();
  assert.equal(game.ev("unlock('dns')"), true);
  assert.equal(game.ev("unlock('dns')"), false, 'la segunda vez no cuenta');
  assert.equal(game.ev('achCount()'), 1);
  assert.ok(game.ev("JSON.parse(localStorage.getItem('dnd-arcade-logros')).dns"));
  assert.equal(game.ev("unlock('no-existe')"), false);
});

test('el combo de 20 golpes desbloquea 10X DEVELOPER', () => {
  const game = loadGame();
  startPlaying(game, 'guerrero');
  game.ev("var o = mkFoe('orco', P.x + 20, P.y); o.hp = o.max = 9999; foes.push(o)");
  for (let i = 0; i < 20; i++) game.ev("o.state = 'walk'; damage(o, 1, P, {})");
  assert.ok(game.ev('unlocked.combo20'));
});

test('la daily del bardo cura a todo el equipo', () => {
  const game = loadGame();
  startPlaying(game, ['bardo', 'guerrero']);
  game.ev('PLAYERS[0].hp = 50; PLAYERS[1].hp = 40');
  game.ev('P = PLAYERS[0]; doSpecial(); specialBlast()');
  assert.equal(game.ev('PLAYERS[0].hp'), 60, '50 - 10 del especial + 20');
  assert.equal(game.ev('PLAYERS[1].hp'), 60, 'el compañero también se cura');
});

test('la pícara cruza la pantalla y golpea a todos a su paso', () => {
  const game = loadGame();
  startPlaying(game, 'picara');
  game.ev("P.x = 60; P.face = 1; var a = mkFoe('goblin', 100, P.y), b = mkFoe('goblin', 140, P.y); foes.push(a, b)");
  game.ev('doSpecial()');
  for (let i = 0; i < 24; i++) game.ev('P.t++; picaraDash()');
  assert.ok(game.ev('P.x') > 140, 'avanza');
  assert.ok(game.ev('a.hp < a.max && b.hp < b.max'), 'golpea a los dos goblins');
});

test('El Revisor no recibe daño mientras quedan tareas pendientes', () => {
  const game = loadGame();
  startPlaying(game, 'guerrero');
  game.ev('camX = LEVEL_END; secIdx = SECTIONS.length - 1; locked = true; foes = []; spawnRevisor()');
  game.ev("var rv = foes.find(f => f.kind === 'revisor'); rv.x = camX + 200; rv.state = 'roar'; rv.t = 100");
  game.step(1);
  assert.equal(game.ev('rv.guarded'), true);
  const pend = game.ev("foes.filter(f => f.kind === 'pendiente').map(f => f.role)");
  assert.ok(pend.length >= 2 && pend.includes('TESTS'), 'invoca tareas de la Definition of Done');
  assert.equal(game.ev('damage(rv, 30, P, { pierce:true })'), false, 'ni los especiales le hacen daño');
  game.ev("for (const f of foes) if (f.kind === 'pendiente') f.dead = true; rv.state = 'walk'");
  game.ev('P = targetFor(rv); updateRevisor(rv); P = PLAYERS[0]');
  assert.equal(game.ev('rv.guarded'), false, 'sin pendientes queda expuesto');
  assert.equal(game.ev('damage(rv, 30, P, {})'), true);
});

test('El Revisor solo aparece si se llega sin continuar', () => {
  const game = loadGame();
  startPlaying(game, 'guerrero');
  assert.equal(game.ev('revisorUnlocked()'), true);
  game.ev('RUN.continues = 1');
  assert.equal(game.ev('revisorUnlocked()'), false);
});

test('cada héroe tiene esqueleto, frases, descripción y está en la selección', () => {
  const game = loadGame();
  const heroes = game.ev('Object.keys(HEROES)');
  assert.deepEqual([...game.ev('HERO_ORDER')].sort(), [...heroes].sort());
  for (const k of heroes) {
    assert.ok(game.ev(`!!RIGS[HEROES.${k}.rig]`), `${k}: falta su esqueleto`);
    for (const line of ['intro', 'mino', 'dragon', 'outro', 'cuevas', 'lich', 'nube', 'factura']) assert.ok(game.ev(`HERO_LINES.${k}.${line}`), `${k}: falta la frase ${line}`);
    assert.equal(game.ev(`HERO_INFO.${k}.length`), 3, `${k}: la descripción tiene 3 líneas`);
    for (const ln of game.ev(`HERO_INFO.${k}`)) assert.ok(ln.length <= 32, `${k}: «${ln}» no cabe en la ficha`);
  }
});

test('AVISOS GRANDES se activa en Opciones y se guarda', () => {
  const game = loadGame();
  assert.equal(game.ev('OPTS.bigCues'), false);
  game.ev("state = 'options'; optSel = OPT_ROWS.findIndex(r => r.label === 'AVISOS GRANDES')");
  game.press('atk');
  assert.equal(game.ev('OPTS.bigCues'), true);
  assert.equal(game.ev("JSON.parse(localStorage.getItem('dnd-arcade-options')).bigCues"), true);
  assert.equal(game.ev('typeof windupCue'), 'function');
});
