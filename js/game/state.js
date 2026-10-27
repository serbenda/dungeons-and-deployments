// Estado global de la partida y creación de enemigos y oleadas.
'use strict';

let eshots = [], mbDone = {};
let state = 'title', t = 0, sel = 0, hitstop = 0, shake = 0, konamiT = 0, slowmo = 0, flashT = 0, rankFx = null;
let P, foes = [], items = [], crates = [], shots = [], fx = [], texts = [], camX = 0, secIdx, locked, waveIdx, goT, banner, lastFoe, boss = null, golem = null;
let score = 0, best = 0, credits = 0, contT = 0, stageT = 0, clearT = 0, clearBonus = null, overT = 0, mission = null;
try { best = parseInt(localStorage.getItem('dnd-arcade-best') || '0', 10) || 0; } catch(e) {}

/**
 * Empieza una partida nueva con el héroe elegido y lanza la viñeta de introducción.
 * @param {'guerrero'|'mago'} heroKey
 */
function startGame(heroKey){
  const h = HEROES[heroKey];
  P = { kind:'hero', hero:heroKey, h, x:60, y:158, z:0, vz:0, vx:0, face:1, hp:100, max:100, lives:konami ? 8 : 2, duck:0, chain:0, chainT:0, maxChain:0, state:'idle', t:0, inv:90,
        combo:0, buffer:false, hitSet:null, hitAny:false, comboGap:0, grabT:0, held:null, knees:0, weapon:null, ammo:0, kicked:false, lying:false, flash:0, hitsTaken:0, hitT:0 };
  foes = []; items = []; shots = []; fx = []; texts = []; eshots = []; mbDone = {};
  crates = CRATES.map(([k, x, y, item]) => ({ kind:'crate', k, x, y, z:0, hp:2, item, flash:0 }));
  camX = 0; secIdx = 0; locked = false; waveIdx = 0; goT = 0; boss = null; golem = null; lastFoe = null;
  score = 0; stageT = 0; credits = 1;
  banner = { a:'NIVEL 1', b:'LAS CATACUMBAS DE SISTEMAS', t:160 };
  mission = null;
  state = 'play';
  startStory('intro');
}
/**
 * Crea un enemigo a partir de su entrada en FOES.
 * @param {string} kind Clave de FOES.
 * @param {number} x
 * @param {number} y
 * @param {string} [role] Papel especial, p. ej. 'patcher' (el goblin que parchea al gólem).
 * @returns {object}
 */
function mkFoe(kind, x, y, role){
  const d = FOES[kind];
  return { kind, d, x, y, z:0, vz:0, vx:0, face:-1, hp:d.hp, max:d.hp, state:'walk', t:0, cool:60 + Math.random()*60, aggro:false,
           flash:0, role:role || null, hitsTaken:0, hitT:0, turnT:0, blocks:0, lying:false, dead:false, hover:(Math.random()*2 - 1), seed:(Math.random()*32) | 0 };
}
/**
 * Hace aparecer la oleada actual (waveIdx) de la sección actual (secIdx).
 */
function spawnWave(){
  const sec = SECTIONS[secIdx];
  sec.waves[waveIdx].forEach(([kind, side, role], i) => {
    let x;
    if (side === 0) x = camX + 70 + Math.random()*180;
    else x = side > 0 ? camX + W + 20 + i*26 : camX - 20 - i*26;
    const f = mkFoe(kind, x, FY0 + 8 + Math.random()*(FY1 - FY0 - 16), role);
    f.face = side > 0 ? -1 : 1;
    if (side === 0) { f.state = 'rise'; f.t = 0; burst(x, f.y, '#4b4470', 12, 1.4); }
    foes.push(f);
  });
}
