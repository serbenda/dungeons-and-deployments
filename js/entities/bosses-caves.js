// Jefes de la etapa 2, Las Cuevas: Troll DBA (y sus LOCK TABLE) y el Lich COBOL.
'use strict';

/* --- Etapa 2: Troll DBA (jefe de Bases de datos) */
/** Zonas de LOCK TABLE en el suelo: { x, y, r, t, arm, life }. */
let locks = [];
/**
 * IA del Troll DBA: martillazos, onda expansiva al tercer golpe, LOCK TABLE (una
 * zona que atrapa a quien la pisa) y consultas N+1 de refuerzo al 50 %.
 * @param {object} e
 */
function updateDba(e){
  e.y = clamp(e.y, FY0, FY1);
  const dx = P.x - e.x, dy = P.y - e.y;
  switch (e.state) {
    case 'enter': e.x -= 1; e.face = -1; e.moving = true; if (e.x <= camX + 240) { e.state = 'roar'; e.t = 0; sfx('roar'); shake = 6; addText('¡TABLA BLOQUEADA!', e.x - 70, e.y - 100, '#ffd23f', 70); } break;
    case 'roar': e.moving = false; if (e.t > 50) { e.state = 'walk'; e.t = 0; e.cool = 40; e.lockCd = 120; } break;
    case 'walk': {
      if (e.cool > 0) e.cool--;
      if (e.lockCd > 0) e.lockCd--;
      e.face = dx > 0 ? 1 : -1;
      if (!e.summoned && e.hp < e.max*.5) { e.summoned = true; e.state = 'summon'; e.t = 0; break; }
      if ((P.state === 'down' && P.lying) || state !== 'play') { e.moving = false; break; }
      if (e.lockCd <= 0 && P.state !== 'stuck') { e.state = 'lockCast'; e.t = 0; e.lockCd = 300 + Math.random()*120; addText('LOCK TABLE', e.x - 40, e.y - 104, '#ffd23f', 50); sfx('clink'); break; }
      const tx = P.x - Math.sign(dx || 1)*32;
      e.x += clamp(tx - e.x, -e.d.spd, e.d.spd); e.y += clamp(dy, -e.d.spd*.6, e.d.spd*.6);
      e.moving = Math.abs(tx - e.x) > 1 || Math.abs(dy) > 1;
      if (e.cool <= 0 && Math.abs(dx) < 46 && Math.abs(dy) < 5 && P.z < 10) { e.state = 'windup'; e.t = 0; e.combo = (e.combo || 0) % 3 + 1; }
      break; }
    case 'lockCast': {
      e.moving = false;
      if (e.t === 24) { locks.push({ x:P.x, y:P.y, r:34, t:0, arm:40, life:170 }); shake = 3; sfx('heavy'); }
      if (e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
    case 'windup': e.moving = false; if (e.t >= e.d.wind) { e.state = 'attack'; e.t = 0; e.hitDone = false; sfx('heavy'); } break;
    case 'attack': {
      if (e.t < 6) e.x += e.face*1.3;
      if (e.t <= 8 && !e.hitDone) for (const q of activePlayers()) if (inFront(e, q, 36, 11)) { e.hitDone = true; damage(q, e.d.dmg, e, { knock:e.combo === 3 }); }
      if (e.combo === 3 && e.t === 8) {
        shake = 6; sfx('boom'); fx.push({ ring:true, x:e.x + e.face*30, y:e.y, r:6, max:56, col:'#ffd23f', life:20 });
        addText('DROP TABLE', e.x - 40, e.y - 100, C.r, 40);
        for (const q of activePlayers()) if (Math.abs(q.x - (e.x + e.face*30)) < 56 && Math.abs(q.y - e.y) < 16 && q.z < 10) damage(q, 10, e, { knock:true });
      }
      if (e.t > 20) { e.state = 'walk'; e.cool = 40 + Math.random()*40; }
      break; }
    case 'summon': {
      e.moving = false;
      if (e.t === 10) { sfx('roar'); addText('¡CONSULTAS N+1!', e.x - 60, e.y - 100, '#9fd0ff', 60); for (const s of [-1, 1, 1]) { const b = mkFoe('consulta', e.x + s*40, clamp(e.y + s*20, FY0, FY1)); b.z = 22; b.cool = 70; foes.push(b); } }
      if (e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
    case 'down': {
      if (!e.lying) e.x += e.vx;
      else if (e.dead && e.t > 80) { foes.splice(foes.indexOf(e), 1); score += e.d.score; addText('TABLAS DESBLOQUEADAS +' + e.d.score, e.x - 90, e.y - 60, '#ffd23f', 90); if (lastFoe === e) lastFoe = null; locks = []; }
      else if (!e.dead && e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
  }
}
/**
 * Avanza las zonas de LOCK TABLE: al armarse atrapan a los jugadores que estén dentro.
 */
function updateLocks(){
  for (const L of locks.slice()) {
    L.t++;
    if (L.t === L.arm) for (const q of activePlayers()) {
      const nx = (q.x - L.x)/L.r, ny = (q.y - L.y)/(L.r*.4);
      if (nx*nx + ny*ny <= 1 && q.z < 8 && q.state !== 'down' && q.state !== 'special' && q.inv <= 0) { if (q.held) releaseGrab(false, q); q.state = 'stuck'; q.t = 0; q.mash = 0; sfx('clink'); }
    }
    if (L.t > L.life) locks.splice(locks.indexOf(L), 1);
  }
}

/* --- Etapa 2: El Lich COBOL (jefe final) */
/**
 * Crea al Lich COBOL, jefe final de Las Cuevas.
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
function mkLich(x, y){
  const e = mkFoe('lich', x, y);
  e.state = 'enter'; e.face = -1; e.cool = 60; e.phase = 0; e.shielded = false; e.z = 8;
  return e;
}
/**
 * IA del Lich COBOL: flota, lanza JCL en abanico, invoca procesos batch (esqueletos),
 * se teletransporta (IPL), golpea con el báculo de cerca y, al 60 % y al 25 %, se
 * protege con una COPIA EN CINTA que hay que destruir.
 * @param {object} e
 */
function updateLich(e){
  e.y = clamp(e.y, FY0 + 4, FY1);
  if (e.state !== 'dying' && e.state !== 'down') e.z = 10 + Math.sin(t/18)*4;
  const dx = P.x - e.x, dy = P.y - e.y;
  const tape = foes.find(f => f.kind === 'cinta' && !f.dead);
  if (e.shielded && !tape) { e.shielded = false; addText('SIN COPIA: ¡VULNERABLE!', e.x - 90, e.y - 110, C.g, 70); sfx('go'); }
  switch (e.state) {
    case 'enter': e.x -= .9; e.face = -1; e.moving = true; if (e.x <= camX + 236) { e.state = 'roar'; e.t = 0; sfx('roar'); shake = 8; addText('PERFORM FOREVER.', e.x - 64, e.y - 120, '#3ddc84', 80); } break;
    case 'roar': e.moving = false; if (e.t > 60) { e.state = 'idle'; e.t = 0; } break;
    case 'idle': {
      e.face = dx >= 0 ? 1 : -1;
      const next = [.6, .25][e.phase];
      if (next && e.hp < e.max*next) { e.phase++; e.state = 'phylactery'; e.t = 0; break; }
      const want = Math.abs(dx) - 100;
      if (Math.abs(want) > 10) e.x += Math.sign(dx)*Math.sign(want)*.6;
      e.y += clamp(dy, -.5, .5); e.x = clamp(e.x, camX + 30, camX + W - 30);
      e.moving = Math.abs(want) > 10;
      if (--e.cool > 0 || state !== 'play' || (P.state === 'down' && P.lying)) break;
      const grunts = foes.filter(f => f.kind === 'esqueleto' && !f.dead).length;
      const roll = Math.random();
      if (Math.abs(dx) < 46 && Math.abs(dy) < 8) { e.state = 'windup'; e.t = 0; }
      else if (roll < .2 && grunts < 2) { e.state = 'summon'; e.t = 0; }
      else if (roll < .38) { e.state = 'fadeOut'; e.t = 0; addText('IPL', e.x - 10, e.y - 110, '#9fd0ff', 30); }
      else { e.state = 'castWind'; e.t = 0; addText('//JCL JOB', e.x - 36, e.y - 112, '#3ddc84', 40); }
      break; }
    case 'castWind': e.moving = false; if (e.t > 30) {
      sfx('shoot');
      for (const s of [-1, 0, 1]) {
        const sx = e.x + e.face*24, d = Math.hypot(P.x - sx, P.y - e.y) || 1;
        eshots.push({ x:sx, y:e.y, z:44, vx:(P.x - sx)/d*2.3, vy:(P.y - e.y)/d*1.1 + s*.45, life:170 });
      }
      e.state = 'idle'; e.cool = 70 + Math.random()*40;
    } break;
    case 'summon': e.moving = false;
      if (e.t === 16) {
        addText('SUBMIT BATCH', e.x - 50, e.y - 112, C.r, 50); sfx('roar');
        for (const side of [-1, 1]) { const f = mkFoe('esqueleto', clamp(P.x + side*60, camX + 20, camX + W - 20), clamp(P.y + side*10, FY0, FY1)); f.state = 'rise'; f.t = 0; f.seen = true; foes.push(f); burst(f.x, f.y, '#3ddc84', 12, 1.4, 'rgb(61,220,132)'); }
      }
      if (e.t > 40) { e.state = 'idle'; e.cool = 60; }
      break;
    case 'fadeOut': e.moving = false; if (e.t > 22) { e.x = P.x < camX + W/2 ? camX + W - 50 : camX + 50; e.y = clamp(P.y + (Math.random() - .5)*30, FY0 + 4, FY1); e.state = 'fadeIn'; e.t = 0; burst(e.x, e.y - 50, '#3ddc84', 16, 1.8, 'rgb(61,220,132)'); } break;
    case 'fadeIn': e.moving = false; if (e.t > 22) { e.state = 'idle'; e.cool = 30; } break;
    case 'windup': e.moving = false; if (e.t >= e.d.wind) { e.state = 'attack'; e.t = 0; e.hitDone = false; sfx('heavy'); } break;
    case 'attack': {
      if (e.t <= 8 && !e.hitDone) for (const q of activePlayers()) if (inFront(e, q, 38, 12)) { e.hitDone = true; damage(q, e.d.dmg, e, { knock:true }); }
      if (e.t > 18) { e.state = 'idle'; e.cool = 40; }
      break; }
    case 'phylactery': {
      e.moving = false;
      if (e.t === 20) {
        const cxp = e.x < camX + W/2 ? camX + W - 60 : camX + 60, c = mkFoe('cinta', cxp, 150);
        c.state = 'idle'; foes.push(c); e.shielded = true; shake = 6; sfx('special');
        addText('BACKUP EN CINTA: ¡INMORTAL!', e.x - 100, e.y - 116, '#3ddc84', 90);
        burst(cxp, 120, '#3ddc84', 24, 2, 'rgb(61,220,132)');
      }
      if (e.t > 50) { e.state = 'idle'; e.cool = 40; }
      break; }
    case 'down': {
      if (e.dead) { e.state = 'dying'; e.t = 0; slowmo = 120; flashT = 10; sfx('roar'); score += e.d.score; addText('STOP RUN. LICH COBOL APAGADO', e.x - 110, e.y - 120, '#ffd23f', 120); for (const f of foes) if (f !== e && f.kind === 'esqueleto') f.dead = true; break; }
      if (!e.lying) e.x += e.vx; else if (e.t > 30) { e.state = 'idle'; e.t = 0; e.cool = 20; }
      break; }
    case 'dying': {
      e.z = Math.max(0, e.z - 1);
      if (e.t % 6 === 0) { burst(e.x + (Math.random() - .5)*50, e.y - Math.random()*90, Math.random() < .5 ? '#3ddc84' : C.a, 10, 2.2, 'rgb(61,220,132)'); sfx('boom'); }
      shake = 3;
      if (e.t > 150) { foes.splice(foes.indexOf(e), 1); boss = null; unlock('cobol'); if (playMode === 'jefes') rushNext(); else startStory('final', stageClear); }
      break; }
  }
}
/**
 * Bloqueo del Lich mientras existe su copia en cinta.
 * @param {object} tg
 * @returns {boolean} true si bloquea el golpe.
 */
function lichBlocks(tg){
  if (!tg.shielded) return false;
  tg.flash = 4; sfx('clink'); spark(tg.x, tg.y - 60);
  if (t - (tg.msgT || 0) > 40) { tg.msgT = t; addText('RESTAURANDO DESDE CINTA...', tg.x - 96, tg.y - 112, '#3ddc84', 40); }
  return true;
}
