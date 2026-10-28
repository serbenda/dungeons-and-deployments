// Modo jefes: los seis jefes de las dos etapas seguidos, con su propio ranking.
'use strict';

/**
 * Combates del modo jefes. Cada uno indica la etapa (decorado y zona), la cámara
 * donde se libra y el jefe: un jefe de sección (miniboss) o el final de la etapa (boss).
 */
const RUSH = [
  { stage:0, cam:760, mission:'JEFE 1/6 MINOTAURO', miniboss:'minotauro', waves:[[]] },
  { stage:0, cam:1400, mission:'JEFE 2/6 HIDRA RAID', miniboss:'hidra', waves:[[]] },
  { stage:0, cam:LEVEL_END, mission:'JEFE 3/6 DRAGÓN NEGRO', boss:true },
  { stage:1, cam:760, mission:'JEFE 4/6 TROLL DBA', miniboss:'dba', waves:[[]] },
  { stage:1, cam:2040, mission:'JEFE 5/6 CANCERBERO', miniboss:'cancerbero', waves:[[]] },
  { stage:1, cam:LEVEL_END, mission:'JEFE 6/6 LICH COBOL', boss:true }
];
/** Modo de la partida en curso: 'arcade' (las dos etapas) o 'jefes'. */
let playMode = 'arcade';

/**
 * Empieza el modo jefes con uno o dos héroes.
 * @param {string|string[]} heroKeys
 */
function startBossRush(heroKeys){
  startGame(heroKeys);
  playMode = 'jefes'; RUN.rush = true;
  SECTIONS = RUSH; crates = [];
  secIdx = -1; rushNext();
  banner = { a:'MODO JEFES', b:'SEIS JEFES SEGUIDOS', t:160 };
  startStory('jefes');
}
/**
 * Pasa al siguiente combate del modo jefes (o termina si era el último): limpia
 * la pantalla, coloca la cámara y a los jugadores y les devuelve 30 de vida.
 */
function rushNext(){
  secIdx++;
  if (secIdx >= RUSH.length) { rushClear(); return; }
  const s = RUSH[secIdx];
  stageIdx = s.stage;
  foes = []; items = []; shots = []; eshots = []; locks = []; texts = [];
  boss = null; golem = null; lastFoe = null; mission = null; goT = 0;
  camX = s.cam; locked = false; waveIdx = 0;
  activePlayers().forEach((p, n) => {
    p.x = camX + 60 - n*24; p.y = 150 + n*18; p.z = 0; p.vz = 0; p.state = 'idle'; p.t = 0; p.inv = 90; p.held = null;
    if (secIdx > 0) { p.hp = Math.min(p.max, p.hp + 30); addText('+30', p.x - 10, p.y - 70, C.g, 50); }
  });
  if (secIdx > 0) { banner = { a:'JEFE ' + (secIdx + 1) + '/' + RUSH.length, b:'¡SIGUIENTE!', t:120 }; sfx('go'); }
}
/**
 * Fin del modo jefes: bonus por tiempo (cuanto antes, más) y por la vida que quede.
 */
function rushClear(){
  const secs = Math.floor(stageT/60), act = activePlayers();
  const maxChain = Math.max(0, ...PLAYERS.map(p => p.maxChain));
  const timeBonus = Math.max(0, 90000 - secs*100), lifeBonus = act.reduce((a, p) => a + p.hp*50 + p.lives*5000, 0), comboBonus = maxChain*100;
  clearBonus = { secs, timeBonus, lifeBonus, comboBonus, maxChain, rush:true };
  score += timeBonus + lifeBonus + comboBonus;
  unlock('jefes');
  if (RUN.continues === 0) unlock('rollback');
  state = 'clear'; clearT = 0; sfx('coin');
}
