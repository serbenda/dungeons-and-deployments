// Estado global de la partida y creación de enemigos y oleadas.
'use strict';

let eshots = [], mbDone = {};
let state = 'title', t = 0, sel = 0, hitstop = 0, shake = 0, konamiT = 0, slowmo = 0, flashT = 0, rankFx = null;
let P, foes = [], items = [], crates = [], shots = [], fx = [], texts = [], camX = 0, secIdx, locked, waveIdx, goT, banner, lastFoe, boss = null, golem = null;
let score = 0, best = 0, credits = 0, contT = 0, stageT = 0, clearT = 0, clearBonus = null, overT = 0, mission = null;
try { best = parseInt(localStorage.getItem('dnd-arcade-best') || '0', 10) || 0; } catch(e) {}

/** Jugadores de la partida (1 o 2). P es el jugador «actual»: el que se está actualizando o, si no, el 1. */
let PLAYERS = [];
/** Etapa en curso: 0 Las Catacumbas, 1 Las Cuevas, 2 La Nube (índice de STAGES). */
let stageIdx = 0;
/** Estadísticas de la partida para la pantalla final y los logros. */
let RUN = null;
/**
 * Indica si un actor es un héroe (jugador).
 * @param {object} o
 * @returns {boolean}
 */
const isHero = o => !!o && o.kind === 'hero';
/**
 * Jugadores que siguen en la partida (los eliminados esperan a pulsar START).
 * @returns {object[]}
 */
const activePlayers = () => PLAYERS.filter(p => !p.out);
/**
 * Crea un jugador.
 * @param {string} heroKey Clave de HEROES.
 * @param {0|1} slot Jugador 1 o 2.
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
function mkPlayer(heroKey, slot, x, y){
  const h = HEROES[heroKey];
  return { kind:'hero', hero:heroKey, h, slot, out:false, x, y, z:0, vz:0, vx:0, face:1, hp:100, max:100, lives:(konami ? 8 : 2) + DIFF().lives, duck:0, chain:0, chainT:0, maxChain:0, state:'idle', t:0, inv:90,
           combo:0, buffer:false, hitSet:null, hitAny:false, comboGap:0, grabT:0, held:null, knees:0, weapon:null, ammo:0, kicked:false, lying:false, flash:0, hitsTaken:0, hitT:0 };
}
/**
 * Empieza una partida nueva con uno o dos héroes y lanza la viñeta de introducción.
 * @param {string|string[]} heroKeys Héroe del jugador 1, o [héroe 1, héroe 2] en cooperativo.
 */
function startGame(heroKeys){
  const keys = Array.isArray(heroKeys) ? heroKeys : [heroKeys];
  PLAYERS = keys.map((k, i) => mkPlayer(k, i, 60 - i*24, 150 + i*18));
  P = PLAYERS[0];
  RUN = { kills:0, throws:0, specials:0, food:0, hitsTaken:0, continues:0, coop:keys.length > 1, golemAngry:false, revisor:false, totalT:0 };
  score = 0; credits = 1;
  loadStage(0);
}
/**
 * Prepara una etapa: secciones, cajas, cámara y enemigos desde cero. Los
 * jugadores conservan vida, vidas y combo máximo, y vuelven a la entrada.
 * @param {number} i Índice de STAGES.
 */
function loadStage(i){
  const st = STAGES[i];
  stageIdx = i; SECTIONS = st.sections; CRATES = st.crates;
  foes = []; items = []; shots = []; fx = []; texts = []; eshots = []; mbDone = {};
  crates = CRATES.map(([k, x, y, item]) => ({ kind:'crate', k, x, y, z:0, hp:2, item, flash:0 }));
  camX = 0; secIdx = 0; locked = false; waveIdx = 0; goT = 0; boss = null; golem = null; lastFoe = null; clearBonus = null;
  stageT = 0; hitstop = 0; slowmo = 0; flashT = 0; rankFx = null; locks = []; drops = [];
  PLAYERS.forEach((p, n) => { p.x = 60 - n*24; p.y = 150 + n*18; p.z = 0; p.vz = 0; p.state = 'idle'; p.t = 0; p.inv = 90; p.held = null; p.chain = 0; });
  banner = { a:'NIVEL ' + (i + 1), b:st.sub, t:160 };
  mission = null;
  state = 'play';
  writeSave();
  startStory(st.story);
}
/**
 * Une al jugador 2 a una partida en curso con el primer héroe libre.
 * @param {string} dev Dispositivo con el que se une.
 * @returns {boolean} true si ha entrado.
 */
function joinPlayer(dev){
  if (PLAYERS.length >= 2 || !P) return false;
  const free = HERO_ORDER.find(k => k !== P.hero) || 'mago';
  const p2 = mkPlayer(free, 1, clamp(P.x - 30, camX + 20, camX + W - 20), clamp(P.y + 14, FY0, FY1));
  p2.inv = 160; p2.state = 'getup'; p2.lives = Math.max(0, p2.lives - 1);
  PLAYERS.push(p2); assignDevice(dev, 1); credits++; RUN.coop = true;
  addText('¡' + p2.h.name + ' SE UNE AL EQUIPO!', camX + 60, 70, '#5ec8f2', 100); sfx('coin');
  burst(p2.x, p2.y - 30, '#5ec8f2', 18, 2, 'rgb(94,200,242)');
  return true;
}
/**
 * Devuelve a la partida a un jugador eliminado (gasta un crédito).
 * @param {object} p
 */
function revivePlayer(p){
  p.out = false; p.lives = 2; p.hp = p.max; p.state = 'getup'; p.t = 0; p.inv = 160; p.weapon = null; p.held = null;
  const o = PLAYERS.find(q => q !== p && !q.out);
  if (o) { p.x = clamp(o.x - 24, camX + 20, camX + W - 20); p.y = o.y; }
  credits++; RUN.continues++; sfx('coin');
  addText('P' + (p.slot + 1) + ': ¡CRÉDITO INSERTADO!', camX + 70, 90, C.a, 90);
}
/**
 * Jugador al que persigue un enemigo: el más cercano que siga en pie. Se revisa
 * cada medio segundo para que no cambie de objetivo en cada fotograma.
 * @param {object} e
 * @returns {object}
 */
function targetFor(e){
  const act = activePlayers();
  if (!act.length) return PLAYERS[0];
  if (act.length === 1) return act[0];
  if (e.tgt && !e.tgt.out && (e.t + (e.seed || 0)) % 30 && !(e.tgt.state === 'down' && e.tgt.lying)) return e.tgt;
  let best = null, bd = 1e9;
  for (const p of act) { const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y)*2 + (p.state === 'down' ? 200 : 0); if (d < bd) { bd = d; best = p; } }
  return e.tgt = best;
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
  const d = FOES[kind], hp = Math.max(1, Math.round(d.hp*foeHpMul()));
  return { kind, d, x, y, z:0, vz:0, vx:0, face:-1, hp, max:hp, state:'walk', t:0, cool:60 + Math.random()*60, aggro:false,
           flash:0, role:role || null, hitsTaken:0, hitT:0, turnT:0, blocks:0, lying:false, dead:false, hover:(Math.random()*2 - 1), seed:(Math.random()*32) | 0 };
}
/**
 * Multiplicador de vida de los enemigos: dificultad y número de jugadores
 * (+50 % con dos).
 * @returns {number}
 */
const foeHpMul = () => DIFF().hp*(PLAYERS.length > 1 ? 1.5 : 1);
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
