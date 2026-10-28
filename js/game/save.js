// Partida guardada: al empezar cada etapa se guarda un punto de control en el
// navegador para poder seguir desde el título (CONTINUAR).
'use strict';

const SAVE_KEY = 'dnd-arcade-save';

/**
 * Lee la partida guardada, si la hay y es válida.
 * @returns {object|null}
 */
function readSave(){
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
    return s && s.v === 1 && s.stage > 0 && STAGES[s.stage] && HEROES[s.hero] ? s : null;
  } catch(e) { return null; }
}
/**
 * Guarda el punto de control de la etapa que empieza: héroe, vida, vidas,
 * puntuación, créditos y estadísticas. Solo en la partida normal y a partir de
 * la etapa 2.
 */
function writeSave(){
  if (playMode !== 'arcade' || !RUN || stageIdx < 1 || !PLAYERS[0]) return;
  const p = PLAYERS[0];
  const s = { v:1, stage:stageIdx, hero:p.hero, hp:p.hp, lives:p.lives, maxChain:p.maxChain, score, credits,
              run:{ kills:RUN.kills, throws:RUN.throws, specials:RUN.specials, food:RUN.food, hitsTaken:RUN.hitsTaken, continues:RUN.continues, revisor:RUN.revisor },
              dead:false, when:Date.now() };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch(e) {}
}
/** Marca la partida guardada como perdida: al seguir, contará como continuación. */
function markSaveDead(){
  const s = readSave(); if (!s) return;
  s.dead = true;
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(s)); } catch(e) {}
}
/** Borra la partida guardada (al terminar el juego). */
function clearSave(){ try { localStorage.removeItem(SAVE_KEY); } catch(e) {} }
/**
 * Sigue la partida guardada desde el principio de su etapa. En cooperativo se
 * sigue con el jugador 1; el 2 puede volver a unirse con START.
 * @returns {boolean} true si había partida que seguir.
 */
function continueGame(){
  const s = readSave(); if (!s) return false;
  playMode = 'arcade';
  startGame(s.hero);
  Object.assign(RUN, s.run);
  if (s.dead) { RUN.continues++; credits = s.credits + 1; } else credits = s.credits;
  const p = PLAYERS[0];
  p.hp = s.dead ? p.max : s.hp; p.lives = s.dead ? 2 : s.lives; p.maxChain = s.maxChain;
  score = s.score;
  loadStage(s.stage);
  return true;
}
