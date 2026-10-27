// Daño, combos, derribos y bloqueos.
'use strict';

/**
 * Derriba a un actor: sale despedido y queda tumbado.
 * @param {object} tg
 * @param {number} dir -1 o 1.
 * @param {number} [power=1]
 */
function knockdown(tg, dir, power){
  power = power || 1;
  if (isHero(tg) && tg.held) releaseGrab(false, tg);
  tg.state = 'down'; tg.lying = false; tg.t = 0; tg.vz = 3.4*power; tg.vx = dir*2.1*power;
}
/**
 * Rangos del combo: golpes necesarios y texto.
 */
const RANKS = [[5, 'NICE!'], [10, 'CLEAN CODE'], [20, '10X DEVELOPER'], [35, 'SENIOR'], [50, 'ARQUITECTO']];
/**
 * Aplica daño y lleva la cuenta del combo: suma golpes del jugador, muestra el
 * número de daño y los rangos (NICE!, CLEAN CODE...) y rompe el combo si el
 * golpeado es el jugador.
 * @param {object} tg Objetivo.
 * @param {number} dmg
 * @param {object} src Origen del golpe (necesita x).
 * @param {{knock?: boolean, power?: number, pierce?: boolean}} [opt]
 * knock derriba, pierce atraviesa escudos y bloqueos.
 * @returns {boolean} true si el golpe ha entrado.
 */
function damage(tg, dmg, src, opt){
  if (isHero(tg)) dmg = Math.max(1, Math.round(dmg*DIFF().dmg));
  const hp0 = tg.hp, ok = damageRaw(tg, dmg, src, opt);
  if (!ok) return ok;
  if (isHero(tg)) {
    if (tg.slot === 0) haptic(opt && opt.knock ? 60 : 25);
    if (tg.chain >= 5) addText('COMBO ROTO', tg.x - 40, tg.y - 84, C.r, 40);
    tg.chain = 0; tg.chainT = 0;
    if (RUN) RUN.hitsTaken++;
  } else if (isHero(src) && tg.kind !== 'crate') {
    src.chain++; src.chainT = 120; if (src.chain > src.maxChain) src.maxChain = src.chain;
    const real = Math.max(0, Math.min(dmg, hp0));
    if (real > 0) addText(String(real), tg.x - 4 + (Math.random() - .5)*10, tg.y - (tg.kind === 'dragon' ? 104 : tg.kind === 'golem' ? 86 : 52) - tg.z, opt && opt.knock ? '#ffd23f' : '#ffffff', 26);
    for (const [n, label] of RANKS) if (src.chain === n) { rankFx = { text:(PLAYERS.length > 1 ? 'P' + (src.slot + 1) + ' ' : '') + label, t:70 }; sfx('coin'); }
    if (src.chain === 20) unlock('combo20');
    if (src.chain === 50) unlock('combo50');
  }
  return ok;
}
/**
 * Lógica de daño sin combo: invulnerabilidades, bloqueos (Firewall, ACL del
 * Minotauro, VMs apagadas), cabezas de la Hidra, tótem, dragón y derribos.
 * @param {object} tg
 * @param {number} dmg
 * @param {object} src
 * @param {object} [opt]
 * @returns {boolean}
 */
function damageRaw(tg, dmg, src, opt){
  opt = opt || {};
  if (tg.kind === 'crate') { tg.hp--; tg.flash = 8; sfx('break'); spark(tg.x, tg.y - 14); if (tg.hp <= 0) breakCrate(tg); return true; }
  if (tg.inv > 0 || tg.dead || tg.state === 'down' || tg.state === 'getup' || tg.state === 'dying' || tg.state === 'rise') return false;
  if (isHero(tg) && tg.state === 'special') return false;
  if (tg.hidden) { if (isHero(src) && t - (tg.msgT || 0) > 40) { tg.msgT = t; addText('VM APAGADA', tg.x - 40, tg.y - 60, '#d9b8ff', 30); } return false; }
  if (tg.kind === 'firewall' && !tg.broken && !opt.pierce && Math.sign(src.x - tg.x) === tg.face && tg.state !== 'down') {
    tg.flash = 4; sfx('clink'); spark(tg.x + tg.face*10, tg.y - 30);
    if (++tg.blocks >= 7) { tg.broken = true; tg.rig = 'firewallRoto'; shake = 4; burst(tg.x + tg.face*10, tg.y - 30, '#b8563a', 20, 2.2); addText('ACL SATURADA: ¡FIREWALL CAÍDO!', tg.x - 110, tg.y - 76, '#ffd23f', 70); unlock('firewall'); return false; }
    if (t - (tg.msgT || 0) > 30) { tg.msgT = t; addText('ACL: DENY', tg.x - 36, tg.y - 66, '#ff8a3d', 36); }
    return false;
  }
  if (tg.kind === 'hidra') { if (isHero(src) && t - (tg.msgT || 0) > 50) { tg.msgT = t; addText('¡ATACA LAS CABEZAS!', tg.x - 72, tg.y - 80, '#ffd27a', 40); } return false; }
  if (tg.kind === 'cabeza' && tg.state === 'broken') return false;
  if (tg.kind === 'minotauro' && tg.guard > 0 && !opt.pierce && Math.sign(src.x - tg.x) === tg.face && tg.state !== 'down') {
    tg.flash = 4; sfx('clink'); spark(tg.x + tg.face*14, tg.y - 40);
    if (t - (tg.msgT || 0) > 30) { tg.msgT = t; addText('DENY ALL', tg.x - 32, tg.y - 90, C.r, 36); }
    return false;
  }
  if (tg.kind === 'totem') {
    tg.hp -= dmg; tg.flash = 8; hitstop = 3; spark(tg.x, tg.y - 30); sfx('punch'); lastFoe = tg; if (isHero(src)) score += dmg*10;
    if (tg.hp <= 0) { tg.dead = true; foes.splice(foes.indexOf(tg), 1); score += tg.d.score; burst(tg.x, tg.y - 30, '#5ec8f2', 30, 2.6, 'rgb(94,200,242)'); shake = 6; sfx('boom'); addText('DEPLOYMENT ELIMINADO', tg.x - 80, tg.y - 74, '#9fd0ff', 80); }
    return true;
  }
  if (tg.kind === 'revisor' && revisorBlocks(tg, src, opt)) return false;
  tg.hp -= dmg; tg.flash = 10; hitstop = opt.knock ? 5 : 3;
  const hy = tg.kind === 'dragon' ? tg.y - 50 : tg.kind === 'golem' ? tg.y - 40 : tg.y - 30;
  spark(tg.x - (tg.x - src.x)*.3, hy - tg.z, opt.knock);
  burst(tg.x, hy - tg.z, isHero(tg) ? C.r : C.a, 5, 1.4);
  sfx(opt.knock ? 'heavy' : 'punch');
  if (!isHero(tg)) { if (isHero(src)) score += dmg*10; if (tg.kind !== 'dragon') lastFoe = tg; }
  else if (Math.random() < .4) addText(pickC(HURT_MSGS), tg.x - 36, tg.y - 70, C.r, 40);
  if (tg.kind === 'dragon') {
    tg.poise += dmg;
    if (tg.hp <= 0) { tg.hp = 0; tg.state = 'dying'; tg.t = 0; sfx('roar'); score += 5000; slowmo = 120; flashT = 10; addText('¡CRÍTICO! INCIDENTE CERRADO', tg.x - 108, tg.y - 124, '#ffd23f', 120); }
    else if (tg.poise >= 45 && /Wind$/.test(tg.state)) { tg.poise = 0; tg.state = 'stagger'; tg.t = 0; addText('STACK OVERFLOW', tg.x - 56, tg.y - 110, C.a, 50); }
    return true;
  }
  if (tg.kind === 'cabeza') {
    if (tg.hp <= 0) {
      tg.hp = 0; tg.state = 'broken'; tg.t = 0; tg.rebuild = 0; shake = 5; sfx('boom');
      burst(tg.x, tg.y - 24, tg.d.parity ? '#b98cff' : '#5ec8f2', 18, 2.2);
      if (tg.d.parity) { addText('¡PARIDAD PERDIDA! YA NO HAY REBUILD', tg.x - 140, tg.y - 70, '#ffd23f', 90); unlock('paridad'); for (const h of foes) if (h.kind === 'cabeza' && h.body === tg.body && h.state === 'broken') h.dead = true; tg.dead = true; }
      else addText('DISCO FALLIDO', tg.x - 52, tg.y - 64, '#ffd27a', 50);
    }
    return true;
  }
  if (tg.kind === 'golem' && !tg.angry) angerGolem('¡Has golpeado al legacy!');
  tg.hitsTaken = tg.hitT > 0 ? tg.hitsTaken + 1 : 1; tg.hitT = 45;
  const dir = Math.sign(tg.x - src.x) || 1;
  if (tg.hp <= 0) {
    tg.hp = 0; if (!isHero(tg)) { tg.dead = true; if (RUN) RUN.kills++; } knockdown(tg, dir, 1.2);
    if (tg.kind === 'slime') {
      for (const sgn of [-1, 1]) { const m = mkFoe('slimeS', tg.x + sgn*6, clamp(tg.y + sgn*6, FY0, FY1)); m.state = 'down'; m.lying = false; m.vz = 2.6; m.vx = sgn*1.6; m.z = 4; m.face = -sgn; foes.push(m); }
      addText('malloc() x2', tg.x - 44, tg.y - 50, C.g, 50); burst(tg.x, tg.y - 12, C.g, 14, 1.8, 'rgb(110,231,168)');
    }
    if (!isHero(tg) && tg.kind !== 'golem' && tg.kind !== 'slime') addText(tg.role && tg.kind === 'pendiente' ? tg.role + ' OK' : pickC(KILL_BY[tg.kind] || KILL_MSGS), tg.x - 40, tg.y - 62, '#ffd27a', 50);
  }
  else if (tg.d && tg.d.boss) { tg.x += dir; }
  else if (opt.knock || (!isHero(tg) && tg.kind !== 'golem' && tg.hitsTaken >= 4)) knockdown(tg, dir, opt.power || 1);
  else if (tg.kind === 'golem') tg.x += dir*2;
  else { tg.state = 'hurt'; tg.t = 0; tg.x += dir*3; if (isHero(tg)) { tg.combo = 0; if (tg.held) releaseGrab(false, tg); } }
  return true;
}
/**
 * Rompe una caja o barril y deja su objeto en el suelo.
 * @param {object} c
 */
function breakCrate(c){
  crates.splice(crates.indexOf(c), 1);
  burst(c.x, c.y - 10, c.k === 'cofre' ? C.a : '#8a5a2a', 16, 2.2);
  score += 50;
  items.push({ k:c.item, x:c.x, y:c.y });
}
