// Jefes de Network (Minotauro del Firewall) y Storage (Hidra RAID).
'use strict';

/**
 * IA del Minotauro del Firewall: hachazo, embestida (SYN FLOOD), tormenta de
 * broadcast al 70 % y ACL: DENY ALL por debajo del 50 % (solo vulnerable por la espalda).
 * @param {object} e
 */
function updateMinotaur(e){
  e.y = clamp(e.y, FY0, FY1);
  if (e.guard > 0) { e.guard--; if (e.guard === 0) addText('ACL: ALLOW', e.x - 40, e.y - 86, '#3ddc84', 40); }
  if (e.guardCd > 0) e.guardCd--;
  const dx = P.x - e.x, dy = P.y - e.y;
  switch (e.state) {
    case 'enter': e.x -= 1; e.face = -1; e.moving = true; if (e.x <= camX + 240) { e.state = 'roar'; e.t = 0; sfx('roar'); shake = 6; } break;
    case 'roar': e.moving = false; if (e.t > 50) { e.state = 'walk'; e.t = 0; e.cool = 40; } break;
    case 'walk': {
      if (e.cool > 0) e.cool--;
      if (!e.summoned && e.hp < e.max*.7) { e.summoned = true; e.state = 'summon'; e.t = 0; break; }
      if (e.hp < e.max*.5 && e.guardCd <= 0 && !e.guard) { e.guard = 170; e.guardCd = 420; sfx('clink'); addText('ACL: DENY ALL', e.x - 52, e.y - 86, C.r, 70); }
      if (e.guard > 0) { if (++e.turnT > 55) { e.turnT = 0; e.face = dx > 0 ? 1 : -1; } }
      else e.face = dx > 0 ? 1 : -1;
      if ((P.state === 'down' && P.lying) || state !== 'play') { e.moving = false; break; }
      const tx = P.x - Math.sign(dx || 1)*30;
      e.x += clamp(tx - e.x, -e.d.spd, e.d.spd); e.y += clamp(dy, -e.d.spd*.6, e.d.spd*.6);
      e.moving = Math.abs(tx - e.x) > 1 || Math.abs(dy) > 1;
      if (e.cool <= 0 && P.z < 10) {
        if (Math.abs(dy) < 4 && Math.abs(dx) > 90 && Math.random() < .5 && !e.guard) { e.state = 'chargeWind'; e.t = 0; e.face = dx > 0 ? 1 : -1; addText('SYN FLOOD', e.x - 36, e.y - 86, '#ff8a3d', 40); }
        else if (Math.abs(dx) < 42 && Math.abs(dy) < 5) { e.state = 'windup'; e.t = 0; }
      }
      break; }
    case 'windup': e.moving = false; if (e.t >= e.d.wind) { e.state = 'attack'; e.t = 0; e.hitDone = false; sfx('heavy'); } break;
    case 'attack': {
      if (e.t < 6) e.x += e.face*1.5;
      if (e.t <= 8 && !e.hitDone && inFront(e, P, 34, 11)) { e.hitDone = true; damage(P, e.d.dmg, e, { knock:true, power:1.2 }); }
      if (e.t > 18) { e.state = 'walk'; e.cool = 45 + Math.random()*40; }
      break; }
    case 'chargeWind': e.moving = false; if (e.t > 32) { e.state = 'charge'; e.t = 0; e.hitSet = new Set(); sfx('roar'); } break;
    case 'charge': {
      e.x += e.face*3.6; e.moving = true;
      if (e.t % 5 === 0) burst(e.x - e.face*14, e.y, '#6b5850', 3, 1);
      for (const o of [P].concat(foes)) {
        if (o === e || e.hitSet.has(o) || (o !== P && !alive(o)) || o.d && o.d.boss) continue;
        const ox = (o.x - e.x)*e.face;
        if (ox > -4 && ox < 30 && Math.abs(o.y - e.y) < 12 && (o.z || 0) < 20) { e.hitSet.add(o); damage(o, 16, e, { knock:true, power:1.4, pierce:true }); }
      }
      if (e.t > 60 || e.x < camX + 20 || e.x > camX + W - 20) { e.x = clamp(e.x, camX + 20, camX + W - 20); e.state = 'rest'; e.t = 0; shake = 4; }
      break; }
    case 'rest': e.moving = false; if (e.t > 45) { e.state = 'walk'; e.t = 0; e.cool = 30; } break;
    case 'summon': {
      e.moving = false;
      if (e.t === 10) { sfx('roar'); addText('¡BROADCAST STORM!', e.x - 70, e.y - 86, '#9fd0ff', 60); for (const s of [-1, 1]) { const b = mkFoe('murcielago', e.x + s*30, clamp(e.y + s*18, FY0, FY1)); b.z = 22; b.cool = 60; foes.push(b); } }
      if (e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
    case 'down': {
      if (!e.lying) e.x += e.vx;
      else if (e.dead && e.t > 80) { foes.splice(foes.indexOf(e), 1); score += e.d.score; addText('FIREWALL DESACTIVADO +' + e.d.score, e.x - 90, e.y - 60, '#ffd23f', 90); if (lastFoe === e) lastFoe = null; }
      else if (!e.dead && e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
  }
}

/**
 * Cabezas de la Hidra RAID: nombre, etiqueta, color y carril.
 */
const HEADS = [
  { name:'DISCO 1', short:'DISCO 1', tag:'D1', col:'#3d6a9a', lane:0 },
  { name:'DISCO DE PARIDAD', short:'PARIDAD', tag:'P', col:'#7a4a9a', lane:1, parity:true },
  { name:'DISCO 2', short:'DISCO 2', tag:'D2', col:'#3d6a9a', lane:2 }
];
/**
 * Crea la Hidra RAID: el cuerpo (invulnerable) y sus tres cabezas en carriles.
 * @param {number} x
 * @returns {object} El cuerpo.
 */
function spawnHydra(x){
  const body = mkFoe('hidra', x, 156); body.state = 'idle'; body.face = -1;
  foes.push(body);
  HEADS.forEach((h, i) => {
    const e = mkFoe('cabeza', x - 52 + i*4, [138, 158, 180][i]);
    e.d = Object.assign({}, FOES.cabeza, { name:h.name, short:h.short, parity:!!h.parity });
    e.tag = h.tag; e.col = h.col; e.body = body; e.ax = e.x; e.state = 'idle'; e.cool = 60 + i*50; e.face = -1;
    foes.push(e);
  });
  return body;
}
/**
 * IA de una cabeza de la Hidra: muerde en su carril (los discos) o escupe sectores
 * defectuosos (la paridad). Rota, se reconstruye si la paridad sigue viva.
 * @param {object} e
 */
function updateHead(e){
  const parity = foes.find(f => f.kind === 'cabeza' && f.d.parity && f.body === e.body);
  const parityAlive = parity && parity.state !== 'broken' && !parity.dead;
  e.x = e.ax + (e.state === 'bite' ? 0 : Math.sin((t + e.seed*9)/22)*3);
  if (e.state === 'down' || e.state === 'hurt') { e.state = 'idle'; e.z = 0; e.vz = 0; e.lying = false; }
  switch (e.state) {
    case 'idle': {
      e.ox = 0;
      if (--e.cool > 0 || state !== 'play') break;
      if (e.d.parity) { e.state = 'spitWind'; e.t = 0; }
      else if (Math.abs(P.y - e.y) < 14) { e.state = 'windup'; e.t = 0; }
      else e.cool = 30;
      break; }
    case 'windup': e.ox = Math.min(10, e.t*.5); if (e.t > 24) { e.state = 'bite'; e.t = 0; e.hitDone = false; sfx('heavy'); } break;
    case 'bite': {
      e.ox = -Math.min(78, e.t*9);
      const hx = e.x + e.ox;
      if (!e.hitDone && Math.abs(P.x - hx) < 16 && Math.abs(P.y - e.y) < 10 && P.z < 20) { e.hitDone = true; damage(P, 12, { x:hx + 20, y:e.y }, { knock:true }); }
      if (e.t > 16) { e.state = 'back'; e.t = 0; }
      break; }
    case 'back': e.ox = Math.min(0, e.ox + 6); if (e.ox >= 0) { e.state = 'idle'; e.cool = 90 + Math.random()*60; } break;
    case 'spitWind': e.ox = Math.min(6, e.t*.4); if (e.t > 20) {
      e.state = 'idle'; e.cool = 110 + Math.random()*50; sfx('shoot');
      const sx = e.x - 20, sy = e.y - 26, d = Math.hypot(P.x - sx, P.y - 20 - sy) || 1;
      eshots.push({ x:sx, y:e.y, z:26, vx:(P.x - sx)/d*2.4, vy:(P.y - e.y)/d*1.2, life:160 });
      addText('BAD SECTOR', e.x - 60, e.y - 54, '#ff8a3d', 30);
    } break;
    case 'broken': {
      e.ox = 0;
      if (!parityAlive && !e.d.parity) { e.dead = true; }
      if (e.dead) { if (++e.t > 90) { foes.splice(foes.indexOf(e), 1); } break; }
      if (e.d.parity) { e.dead = true; break; }
      e.rebuild = (e.rebuild || 0) + 1;
      if (e.rebuild % 60 === 0) addText('REBUILD ' + Math.min(99, Math.round(e.rebuild/4.2)) + '%', e.x - 48, e.y - 56, '#9fd0ff', 40);
      if (e.rebuild >= 420) { e.rebuild = 0; e.hp = Math.round(e.max*.6); e.state = 'idle'; e.cool = 40; e.flash = 12; sfx('special'); addText('RAID REBUILD 100%', e.x - 70, e.y - 56, C.r, 60); burst(e.x, e.y - 24, '#5ec8f2', 14, 1.6, 'rgb(94,200,242)'); }
      break; }
  }
}
/**
 * El cuerpo de la Hidra muere cuando todas sus cabezas están muertas.
 * @param {object} b
 */
function updateHydra(b){
  const heads = foes.filter(f => f.kind === 'cabeza' && f.body === b);
  if (b.state === 'idle' && heads.every(h => h.dead)) { b.state = 'dying'; b.t = 0; sfx('roar'); shake = 8; addText('ARRAY DEGRADADO: HIDRA ELIMINADA', b.x - 140, b.y - 92, '#ffd23f', 100); score += b.d.score; }
  if (b.state === 'dying') {
    if (b.t % 6 === 0) { burst(b.x + (Math.random() - .5)*70, b.y - Math.random()*50, Math.random() < .5 ? '#5ec8f2' : '#ffd27a', 8, 2); sfx('boom'); }
    if (b.t > 90) { foes.splice(foes.indexOf(b), 1); if (lastFoe === b) lastFoe = null; }
  }
}
/**
 * Sprite del cuerpo de la Hidra, con sus platos de disco.
 * @returns {object}
 */
function hydraBodySprite(){
  return sprite('hidraBody', 110, 74, S => {
    const rnd = prng(77);
    S.ell(58, 50, 50, 24, '#24364a'); S.ell(60, 46, 46, 21, '#2f4a66'); S.ell(64, 38, 26, 9, '#46668a');
    for (let i = 0; i < 40; i++) { const x = 18 + rnd()*80, y = 32 + rnd()*30; S.poly([[x - 3, y + 2], [x, y - 2], [x + 3, y + 2]], '#3d5a7a'); }
    for (const [x, y] of [[40, 46], [62, 52], [84, 44]]) { S.disc(x, y, 7, '#1a1626'); S.disc(x, y, 5.5, '#a9b2cf'); S.disc(x, y, 3, '#e2e7f5'); S.disc(x, y, 1.2, '#1a1626'); S.line(x, y, x + 5, y - 4, 1, '#5d6274'); }
    for (let i = 0; i < 5; i++) S.poly([[24 + i*16, 30], [30 + i*16, 18 - (i % 2)*5], [36 + i*16, 30]], '#d8cfb4');
    S.ell(20, 64, 12, 6, '#24364a'); S.ell(96, 64, 12, 6, '#24364a');
    for (const x of [12, 18, 24, 90, 96, 102]) S.px(x, 69, '#d8cfb4');
  });
}
/**
 * Sprite de una cabeza de la Hidra.
 * @param {string} col
 * @param {number} open
 * @param {number} broken
 * @returns {object}
 */
function headSprite(col, open, broken){
  return sprite('head|' + col + '|' + open + '|' + broken, 50, 34, S => {
    const c = broken ? '#5d6274' : col, cS = broken ? '#3a3e4c' : mix(col, -.35), cL = broken ? '#7a8098' : mix(col, .3);
    S.ell(20, 17, 14, 10, cS); S.ell(21, 15, 13, 9, c); S.ell(22, 11, 8, 3, cL);
    S.poly([[28, 10], [46, 14], [46, 19], [28, 21]], c); S.line(30, 11, 45, 14, 1, cL);
    if (open) { S.poly([[26, 21], [46, 20], [42, 31], [24, 26]], cS); S.poly([[28, 21], [44, 20], [40, 27], [27, 24]], '#5a0f1c'); for (let i = 0; i < 4; i++) { S.px(30 + i*4, 21, '#f2ecdc'); S.px(31 + i*3, 26, '#f2ecdc'); } }
    else S.line(28, 21, 46, 19, 1, cS);
    S.poly([[12, 8], [4, 0], [10, 10]], '#d8cfb4'); S.poly([[18, 6], [14, -2 + 3], [20, 8]], '#d8cfb4');
    if (broken) { S.line(28, 12, 32, 16, 1, OUTLINE); S.line(32, 12, 28, 16, 1, OUTLINE); }
    else { S.rect(28, 12, 4, 3, '#ffd23f'); S.px(31, 12, OUTLINE); }
    S.px(44, 15, OUTLINE);
  });
}
/**
 * Dibuja una cabeza de la Hidra con su cuello hasta el cuerpo y su etiqueta (D1, D2, P).
 * @param {object} a
 * @param {number} sx
 * @param {number} sy
 * @param {boolean} fl Destello de golpe.
 */
function drawHead(a, sx, sy, fl){
  const b = a.body, bx = b.x - Math.round(camX), by = b.y - 46;
  const hx = sx + (a.ox || 0), hy = sy - 22 + (a.state === 'broken' ? 14 : 0);
  const steps = 10;
  for (const [rad, col] of [[6, OUTLINE], [5, a.state === 'broken' ? '#3a3e4c' : mix(a.col, -.2)]]) {
    ctx.fillStyle = col;
    for (let i = 0; i <= steps; i++) {
      const k = i/steps, cx2 = bx - 20 + (hx + 18 - (bx - 20))*k, cy2 = by + (hy - by)*k - Math.sin(k*Math.PI)*18;
      ctx.beginPath(); ctx.arc(Math.round(cx2), Math.round(cy2), rad, 0, Math.PI*2); ctx.fill();
    }
  }
  if (a.dead && (t >> 2) % 2) return;
  const open = a.state === 'windup' || a.state === 'bite' || a.state === 'spitWind';
  blit(headSprite(a.col, open ? 1 : 0, a.state === 'broken' ? 1 : 0), hx, hy + 16, -1, 25, 32, fl);
  txt(a.tag, hx - 8, hy - 2, a.d.parity ? '#ffd23f' : '#e9eefc', { outline:true });
  if (a.state === 'windup' && (t >> 2) % 2) { r(hx - 2, hy - 18, 3, 6, C.r); r(hx - 2, hy - 10, 3, 2, C.r); }
}
