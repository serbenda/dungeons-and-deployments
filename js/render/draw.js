// Dibujo de actores, HUD y pantallas.
'use strict';

/**
 * Rectángulo relleno con coordenadas redondeadas.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} c
 */
function r(x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
/**
 * Texto con la fuente pixelada.
 * @param {string} s
 * @param {number} x
 * @param {number} y
 * @param {string} col
 * @param {{center?: boolean, right?: boolean, big?: boolean, outline?: boolean}} [opt]
 */
function txt(s, x, y, col, opt){
  opt = opt || {};
  ctx.font = opt.big ? F16 : F8; ctx.textBaseline = 'top';
  let tx = x;
  if (opt.center) tx = x - ctx.measureText(s).width/2;
  if (opt.right) tx = x - ctx.measureText(s).width;
  tx = Math.round(tx); y = Math.round(y);
  if (opt.outline) { ctx.fillStyle = OUTLINE; for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1],[1,1],[2,2]]) ctx.fillText(s, tx + ox, y + oy); }
  ctx.fillStyle = col; ctx.fillText(s, tx, y);
}
/**
 * Texto dorado con degradado y sombra, para títulos.
 * @param {string} s
 * @param {number} x Centro.
 * @param {number} y
 * @param {boolean} [big]
 */
function goldText(s, x, y, big){
  ctx.font = big ? F16 : F8; ctx.textBaseline = 'top';
  const w = ctx.measureText(s).width, tx = Math.round(x - w/2);
  ctx.fillStyle = '#3a1c08'; for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1],[2,2],[1,2],[2,1]]) ctx.fillText(s, tx + ox, y + oy);
  const g = ctx.createLinearGradient(0, y, 0, y + (big ? 16 : 8));
  g.addColorStop(0, '#fff3c4'); g.addColorStop(.45, '#f4b860'); g.addColorStop(1, '#a8561f');
  ctx.fillStyle = g; ctx.fillText(s, tx, y);
}
/**
 * Dibuja un sprite apoyado en el suelo, volteado si mira a la izquierda.
 * @param {object} spr Sprite.
 * @param {number} sx
 * @param {number} sy
 * @param {number} face -1 o 1.
 * @param {number} ox Ancla horizontal dentro del sprite.
 * @param {number} base Ancla vertical (los pies).
 * @param {boolean} flash Usa la versión blanca.
 * @param {number} [alpha]
 */
function blit(spr, sx, sy, face, ox, base, flash, alpha){
  const img = flash ? spr.f : spr.c;
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (face < 0) { ctx.save(); ctx.translate(Math.round(sx), 0); ctx.scale(-1, 1); ctx.drawImage(img, -ox, Math.round(sy - base)); ctx.restore(); }
  else ctx.drawImage(img, Math.round(sx - ox), Math.round(sy - base));
  ctx.globalAlpha = 1;
}
/**
 * Pose de reposo con respiración (mezcla idle0 e idle1).
 * @param {object} a
 * @returns {string}
 */
function breathe(a){
  const ph = ((t + (a.seed || 0)*7) >> 4) % 4;
  return ph === 0 ? 'idle0' : ph === 2 ? 'idle1' : 'idle0~idle1~0.5';
}
/**
 * Nombre de la pose de un humanoide según su estado y su tiempo en él.
 * @param {object} a
 * @returns {string}
 */
function rigPose(a){
  const hero = isHero(a), tt = hero ? a.t : t + (a.seed || 0)*4;
  switch (a.state) {
    case 'walk': {
      if (!(hero || a.moving !== false)) return breathe(a);
      const ph = (tt >> 2) % 8, w0 = 'walk' + (ph >> 1);
      return ph % 2 ? w0 + '~walk' + (((ph >> 1) + 1) % 4) + '~0.5' : w0; }
    case 'idle': return breathe(a);
    case 'punch': {
      const fin = a.combo === 3, len = fin ? 18 : 12, b = fin ? 'atk3b' : a.combo === 2 ? 'atk2b' : 'atk1b';
      const a0 = fin ? 'atk3a' : 'atk1a', sw = fin ? 7 : 3;
      if (a.t < sw - 1) return a0;
      if (a.t === sw - 1) return a0 + '~' + b + '~0.5';
      if (a.t >= len - 2) return b + '~idle0~0.5';
      return b; }
    case 'windup': case 'chargeWind': return 'windup';
    case 'enter': case 'charge': { const ph = (t >> 2) % 4; return 'walk' + ph; }
    case 'rest': case 'roar': return breathe(a);
    case 'summon': return 'special';
    case 'attack': return a.t <= 8 ? 'strike' : 'idle0';
    case 'jump': return a.kicked ? 'kick' : 'jump';
    case 'land': case 'pick': case 'getup': case 'rise': return 'crouch';
    case 'grab': return 'grab';
    case 'knee': return 'knee';
    case 'throw': return 'throw';
    case 'special': return 'special';
    case 'shoot': return 'shoot';
    case 'hurt': case 'grabbed': return 'hurt';
    case 'patch': return (t >> 3) % 2 ? 'strike' : 'windup';
    case 'down': case 'thrown': return a.lying ? 'down' : 'hurt';
    default: return 'idle0';
  }
}
/**
 * Aviso de que un enemigo va a golpear: una marca roja que parpadea o, con AVISOS
 * GRANDES, un triángulo amarillo con «!» fijo y bien contorneado (no depende del color).
 * @param {number} x
 * @param {number} y Parte superior del aviso.
 */
function windupCue(x, y){
  if (!OPTS.bigCues) { if ((t >> 2) % 2) { r(x - 1, y, 3, 6, C.r); r(x - 1, y + 8, 3, 2, C.r); } return; }
  ctx.fillStyle = OUTLINE; ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x - 9, y + 11); ctx.lineTo(x + 9, y + 11); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x - 6.5, y + 9); ctx.lineTo(x + 6.5, y + 9); ctx.closePath(); ctx.fill();
  r(x - 1, y + 1, 2, 4, OUTLINE); r(x - 1, y + 6, 2, 2, OUTLINE);
}
/**
 * Sombra elíptica en el suelo.
 * @param {number} sx
 * @param {number} y
 * @param {number} w
 */
function shadow(sx, y, w){ ctx.fillStyle = 'rgba(4,2,8,.5)'; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(y), w/2, Math.max(2, w/8), 0, 0, Math.PI*2); ctx.fill(); }
/**
 * Estela del arma durante el golpe del jugador.
 * @param {object} a
 * @param {number} sx
 * @param {number} sy
 */
function slashArc(a, sx, sy){
  if (a.state !== 'punch') return;
  const fin = a.combo === 3, t0 = fin ? 7 : 3, t1 = fin ? 11 : 7;
  if (a.t < t0 || a.t > t1) return;
  const k = (a.t - t0)/(t1 - t0);
  const rad = fin ? 26 : 22;
  const [s0, s1] = a.combo === 1 ? [-1.3, .5] : a.combo === 2 ? [.9, -1.1] : [-1.9, .9];
  const lo = Math.min(s0, s1), hi = Math.max(s0, s1);
  ctx.save(); ctx.translate(Math.round(sx + a.face*6), Math.round(sy - 30)); if (a.face < 0) ctx.scale(-1, 1);
  ctx.strokeStyle = 'rgba(255,255,255,' + (.75*(1 - k)) + ')'; ctx.lineWidth = fin ? 4 : 3;
  ctx.beginPath(); ctx.arc(0, 0, rad, lo, hi); ctx.stroke();
  ctx.strokeStyle = 'rgba(244,184,96,' + (.6*(1 - k)) + ')'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0, 0, rad + 3, lo, hi); ctx.stroke();
  ctx.restore();
}
/**
 * Dibuja cualquier actor: cajas, objetos, proyectiles, dragón, gólem, jefes,
 * enemigos especiales y humanoides (con poses mezcladas en las transiciones).
 * @param {object} a
 * @param {number} cx Posición de la cámara.
 */
function drawActor(a, cx){
  const sx = a.x - cx, sy = a.y - a.z;
  if (a.kind === 'crate') { shadow(sx, a.y, 24); blit(itemSprite(a.k), sx + (a.flash > 0 && (a.flash >> 1) % 2 ? 1 : 0), a.y, 1, 14, 25, false); return; }
  if (a.kind === 'item') { shadow(sx, a.y, 16); blit(itemSprite(a.it.k), sx, a.y - 3 + Math.sin(t/8)*1.5, 1, 14, 24, (t >> 4) % 6 === 0); return; }
  if (a.kind === 'shot') {
    const y = a.y - a.z;
    ctx.globalAlpha = .35; ctx.fillStyle = a.col; ctx.fillRect(Math.round(sx - 6), Math.round(y - 4), 12, 8); ctx.globalAlpha = 1;
    r(sx - 3, y - 3, 6, 6, a.col); r(sx - 1, y - 1, 2, 2, '#e9f8ff'); shadow(sx, a.y, 8); return;
  }
  if (a.dead && a.lying && (t >> 2) % 2) return;
  const fl = a.flash > 0 && (a.flash >> 1) % 2;
  if (a.kind === 'dragon') {
    shadow(sx, a.y, a.z > 0 ? 90 - Math.min(50, a.z/3) : 110);
    if (a.state === 'hover') { ctx.fillStyle = 'rgba(255,93,115,' + (.25 + .2*Math.sin(t/4)) + ')'; ctx.beginPath(); ctx.ellipse(Math.round(sx), a.y, 50, 8, 0, 0, Math.PI*2); ctx.fill(); }
    if (a.state === 'dying' && (t >> 2) % 2) return;
    const fly = a.state === 'flyUp' || a.state === 'hover' || a.state === 'slam';
    const f = {
      wing: fly ? ((t >> 2) % 2 ? 0 : 2) : ((t >> 5) % 2 ? 1 : 2),
      mouth: (a.state === 'breathWind' || a.state === 'breath') ? 2 : (a.state === 'biteWind' || a.state === 'bite' || a.state === 'roar' || a.state === 'enter') ? 1 : 0,
      lunge: a.state === 'bite' && a.t < 12 ? 1 : 0, tail: (a.state === 'tail' || a.state === 'tailWind') ? 1 : 0, fly: fly ? 1 : 0, dizzy: (a.state === 'stagger' || a.state === 'dying') ? 1 : 0
    };
    blit(dragonSprite(f), sx, sy, a.face, 72, 120, fl);
    return;
  }
  if (a.kind === 'golem') {
    shadow(sx, a.y, 52);
    const pose = a.state === 'down' && a.lying ? 'down' : a.state === 'charge' || a.state === 'chargeWind' ? 'charge' : a.state === 'roar' ? 'roar' : a.state === 'rest' ? 'rest' : (a.moving && (t >> 4) % 2 ? 'walk1' : 'walk0');
    blit(golemSprite(pose, a.angry), sx, sy, a.face, 42, 78, fl);
    if (a.state === 'rest' && (t >> 4) % 2) txt('uff', sx + a.face*22 - 12, sy - 82, C.l, { outline:true });
    return;
  }
  if (a.kind === 'totem') {
    shadow(sx, a.y, 30); blit(totemSprite(), sx, sy, 1, 18, 68, fl);
    const n = foes.filter(f => f.kind === 'pod' && !f.dead).length;
    txt('replicas ' + n + '/3', sx - 44, sy - 82, '#9fd0ff', { outline:true });
    return;
  }
  if (a.d && a.d.fly) {
    shadow(sx, a.y, 14);
    const down = a.state === 'down' && a.lying;
    const fr = down ? 1 : ((t + a.seed*3) >> 2) % 2;
    if (a.d.look === 'eye') blit(eyeSprite(fr), sx, sy, a.face, 18, 28, fl);
    else if (a.d.look === 'lambda') blit(lambdaSprite(fr), sx, sy, a.face, 18, 30, fl);
    else if (a.d.look === 'bell') blit(bellSprite(fr), sx, sy, a.face, 18, 30, fl);
    else blit(batSprite(fr), sx, sy, a.face, 20, 28, fl);
    return;
  }
  if (a.d && a.d.ghost) {
    shadow(sx, a.y, 18);
    const bob = Math.sin((t + a.seed*9)/10)*3;
    const alpha = a.hidden ? .18 : (a.state === 'down' && a.lying ? .5 : .88);
    if (a.d.look === 'horse') blit(trojanSprite((t >> 4) % 2), sx, sy - 6 + bob, a.face, 20, 44, fl, alpha);
    else if (a.d.look === 'coin') blit(coinGhostSprite((t >> 4) % 2), sx, sy - 10 + bob, a.face, 18, 42, fl, alpha);
    else blit(ghostSprite((t >> 4) % 2), sx, sy - 10 + bob, a.face, 18, 40, fl, alpha);
    if (a.state === 'windup') windupCue(sx, sy - 62);
    return;
  }
  if (a.kind === 'mimico' || a.kind === 'phishing') {
    shadow(sx, a.y, 26);
    const open = a.state !== 'sleep' && (a.state === 'windup' || a.state === 'attack' || ((t + a.seed*5) >> 3) % 2);
    const hop = a.state === 'attack' ? Math.sin(Math.min(1, a.t/10)*Math.PI)*8 : 0;
    if (a.kind === 'phishing') { blit(phishSprite(open ? 1 : 0), sx, sy - hop, a.face, 18, 33, fl); if (a.state === 'sleep' && (t >> 5) % 2) txt('¡PREMIO!', sx, sy - 44, '#ffd23f', { center:true, outline:true }); }
    else blit(mimicSprite(open ? 1 : 0), sx, sy - hop, a.face, 17, 32, fl);
    return;
  }
  if (a.kind === 'factura') {
    shadow(sx, a.y, a.z > 0 ? 80 : 90);
    if (a.state === 'dying' && (t >> 2) % 2) return;
    const f = a.state === 'beamWind' || a.state === 'beam' ? 2 : a.state === 'rain' || a.state === 'roar' || a.state === 'charge' || a.state === 'chargeWind' ? 1 : 0;
    blit(invoiceSprite(f), sx, sy, a.face, 60, 114, fl);
    return;
  }
  if (a.kind === 'cinta') {
    shadow(sx, a.y, 30); blit(tapeSprite((t >> 3) % 4), sx, sy, 1, 18, 64, fl);
    txt('COPIA EN CINTA', sx, sy - 76, '#3ddc84', { center:true, outline:true });
    return;
  }
  if (a.kind === 'pod') {
    shadow(sx, a.y, 16);
    if (a.state === 'rise') { ctx.globalAlpha = Math.min(1, a.t/45); }
    blit(podSprite(((t + a.seed*3) >> 3) % 2), sx, sy, a.face, 13, 22, fl);
    ctx.globalAlpha = 1;
    if (a.state === 'windup') windupCue(sx, sy - 32);
    return;
  }
  if (a.d && a.d.slime) {
    shadow(sx, a.y, a.d.small ? 16 : 26);
    const pose = (a.state === 'down' && a.lying) ? 'flat' : a.state === 'windup' ? 'wind' : (a.state === 'attack' || a.state === 'down' || a.state === 'thrown') ? 'jump' : ((t + (a.seed || 0)*5) >> 3) % 2 ? 'n' : 'wind';
    const hop = a.state === 'attack' ? Math.sin(Math.min(1, a.t/10)*Math.PI)*8 : 0;
    blit(slimeSprite(!!a.d.small, pose, a.d.look), sx, sy - hop, a.face, 20, 34, fl);
    if (a.state === 'windup') windupCue(sx, sy - 34);
    return;
  }
  if (a.kind === 'hidra') {
    shadow(sx, a.y, 100);
    if (!(a.state === 'dying' && (t >> 2) % 2)) blit(hydraBodySprite(), sx, sy + Math.sin(t/30)*1.5, 1, 55, 72, fl);
    return;
  }
  if (a.kind === 'cabeza') {
    shadow(sx + (a.ox || 0), a.y, 22); drawHead(a, sx, sy, fl);
    if (krakenGuarded(a)) { ctx.strokeStyle = 'rgba(94,200,242,' + (.45 + .25*Math.sin(t/5)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(Math.round(sx + (a.ox || 0) - 14), Math.round(sy - 22), 22, 16, 0, 0, Math.PI*2); ctx.stroke(); }
    return;
  }
  const isP = isHero(a);
  if (isP && a.out) return;
  if (isP && a.duck > 0) { a.duck--; if ((t >> 2) % 2) { ctx.globalAlpha = .35; shadow(sx, a.y, 40); ctx.globalAlpha = 1; } const ds = itemSprite('patito'); ctx.drawImage(ds.c, Math.round(sx - 30), Math.round(sy - 66 + Math.sin(t/6)*2)); }
  else if (isP && a.inv > 0 && a.state !== 'down' && (a.inv >> 2) % 2) return;
  const rigKey = isP ? a.h.rig : (a.rig || a.d.rig);
  let pose = rigPose(a);
  const base = pose.split('~')[0];
  if (a._lp && a._lp !== base && !a._lp.includes('down') && base !== 'down' && pose === base && a.state !== 'punch') { a._from = a._lp; a._bt = 3; }
  a._lp = base;
  if (a._bt > 0) { a._bt--; if (a._from !== pose) pose = a._from + '~' + pose + '~0.5'; }
  const spr = rigSprite(rigKey, pose, isP ? a.weapon : null);
  shadow(sx, a.y, pose === 'down' ? 34 : a.d && a.d.boss ? 40 : 24);
  if (a.state === 'rise') {
    const k = Math.min(1, a.t/40);
    ctx.save(); ctx.beginPath(); ctx.rect(sx - 40, sy - 90, 80, 90); ctx.clip();
    blit(spr, sx, sy + (1 - k)*56, a.face, 40, 80, false);
    ctx.restore();
    return;
  }
  if (isP && a.hero === 'picara' && a.state === 'special' && a.t > 3 && a.t < 24) {
    // Estela de la pícara: copias translúcidas detrás.
    for (let i = 3; i >= 1; i--) blit(spr, sx - a.face*i*9, sy, a.face, 40, 80, false, .12*(4 - i));
  }
  if (a.kind === 'revisor' && a.guarded) {
    const pulse = .35 + .2*Math.sin(t/5);
    ctx.strokeStyle = 'rgba(61,220,132,' + pulse + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(sy - 44), 30, 50, 0, 0, Math.PI*2); ctx.stroke();
  }
  blit(spr, sx, sy, a.face, 40, 80, fl);
  slashArc(a, sx, sy);
  if (a.kind === 'pendiente' && a.role && !a.dead) txt(a.role, sx, sy - 66, '#ffd23f', { center:true, outline:true });
  if (isP && PLAYERS.length > 1 && a.state !== 'down') {
    const col = a.slot ? '#5ec8f2' : NEON;
    txt((a.slot + 1) + 'P', sx, sy - 70 - (a.h.rig === 'mago' ? 8 : a.h.rig === 'bardo' ? 4 : 0) - a.z, col, { center:true, outline:true });
  }
  if (a.guard > 0) {
    const gx = Math.round(sx + a.face*24), pulse = .25 + .15*Math.sin(t/4);
    ctx.fillStyle = 'rgba(255,93,115,' + pulse + ')'; ctx.fillRect(gx - 4, Math.round(sy - 74), 8, 72);
    ctx.fillStyle = 'rgba(255,210,63,' + (pulse + .2) + ')';
    for (let yy = 0; yy < 8; yy++) ctx.fillRect(gx - 4 + (yy % 2)*4, Math.round(sy - 72 + yy*9), 4, 1);
  }
  if (!isP && a.state === 'windup') windupCue(sx + a.face*4, sy - 64);
  if (isP && a.state === 'stuck') {
    const k = a.mash || 0;
    r(sx - 7, sy - 92, 14, 11, '#ffd23f'); r(sx - 5, sy - 98, 10, 7, '#ffd23f'); r(sx - 3, sy - 96, 6, 5, '#0b0912'); r(sx - 1, sy - 88, 2, 4, '#3a2a10');
    txt('LOCKED · A x' + Math.max(0, 5 - k), sx, sy - 80, '#ffd23f', { center:true, outline:true });
  }
  if (a.kind === 'lich' && a.shielded) {
    const pulse = .3 + .2*Math.sin(t/4);
    ctx.strokeStyle = 'rgba(61,220,132,' + pulse + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(sy - 56), 36, 62, 0, 0, Math.PI*2); ctx.stroke();
  }
  if (isP && a.state === 'special' && a.hero === 'mago') {
    ctx.strokeStyle = 'rgba(185,140,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(a.y), 20 + a.t, 6 + a.t*.3, 0, 0, Math.PI*2); ctx.stroke();
  }
}

const NEON = '#3ddc84', NEOND = '#0c1510', NEONT = '#8dffbf';
/**
 * Panel con borde verde neón, el estilo de toda la interfaz.
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {string} [fill]
 */
function panel(x, y, w, h, fill){ r(x, y, w, h, NEON); r(x + 1, y + 1, w - 2, h - 2, fill || NEOND); r(x + 1, y + h - 1, w - 2, 1, '#1f7a46'); }
/**
 * Retrato de un personaje: recorta su cabeza del sprite.
 * @param {string} rig
 * @param {number} x
 * @param {number} y
 * @param {number} s Tamaño.
 */
function portrait(rig, x, y, s){
  const ps = rigSprite(rig, 'idle0'), m = ps.meta, half = Math.round(m.hr*1.7);
  ctx.drawImage(ps.c, Math.round(m.hx - half), Math.round(m.hy - half), half*2, half*2, x, y, s, s);
}
/**
 * Corazones de vidas restantes (o «xN» si son más de tres).
 * @param {object} p
 * @param {number} x0
 * @param {number} y
 */
function drawLives(p, x0, y){
  if (p.lives > 2) { txt('x' + (p.lives + 1), x0, y - 1, '#ff5d73'); return; }
  for (let i = 0; i < 3; i++) {
    const x = x0 + i*9, on = i <= p.lives, c = on ? '#ff5d73' : '#2c3a30';
    r(x + 1, y, 2, 2, c); r(x + 4, y, 2, 2, c); r(x, y + 1, 7, 3, c); r(x + 1, y + 4, 5, 1, c); r(x + 2, y + 5, 3, 1, c);
    if (on) r(x + 1, y + 1, 1, 1, '#ffc0c8');
  }
}
/**
 * Barra de vida.
 * @param {object} p
 * @param {number} x
 * @param {number} y
 * @param {number} w Ancho interior.
 */
function hpBar(p, x, y, w){
  r(x - 1, y - 1, w + 2, 8, '#16241b'); r(x, y, w, 6, '#2a0f16');
  const hw = Math.round(w*p.hp/p.max), hc = p.hp > 30 ? [NEON, '#1f7a46'] : ['#ff5d73', '#8a2c3c'];
  r(x, y, hw, 6, hc[0]); r(x, y + 4, hw, 2, hc[1]); r(x, y, hw, 1, '#e9fff4');
  if (OPTS.bigCues) {
    // Vida en número y, si es baja, rayas: no depende de distinguir verde y rojo.
    if (p.hp <= 30) for (let i = 0; i < hw; i += 4) r(x + i, y, 2, 6, '#ffffff');
    txt(String(Math.ceil(p.hp)), x + w - 1, y - 1, '#ffffff', { right:true, outline:true });
  }
}
/**
 * Panel compacto de un jugador para el cooperativo.
 * @param {object} p
 * @param {number} x
 */
function playerPanel(p, x){
  const col = p.slot ? '#5ec8f2' : NEON;
  r(x, 2, 106, 27, col); r(x + 1, 3, 104, 25, NEOND);
  r(x + 2, 4, 23, 23, '#16241b'); portrait(p.h.rig, x + 2, 4, 23);
  if (p.out) {
    r(x + 2, 4, 23, 23, 'rgba(6,8,7,.7)');
    txt((p.slot + 1) + 'P', x + 28, 5, col);
    if ((t >> 4) % 2) txt('START', x + 28, 17, C.w);
    return;
  }
  txt((p.slot + 1) + 'P', x + 28, 5, col);
  drawLives(p, x + 48, 6);
  if (p.weapon) { ctx.drawImage(itemSprite(p.weapon).c, 0, 0, 28, 28, x + 78, 3, 11, 11); txt(String(p.ammo), x + 90, 5, '#9fd0ff'); }
  hpBar(p, x + 28, 18, 74);
}
/**
 * Dibuja el marcador: retrato, vida, vidas, arma, oro, nivel, enemigo actual y
 * ticket. Con dos jugadores, un panel compacto a cada lado.
 */
function drawHUD(){
  ctx.fillStyle = 'rgba(6,8,7,.72)'; ctx.fillRect(0, 0, W, 31);
  const f = lastFoe && foes.includes(lastFoe) ? lastFoe : null;
  if (PLAYERS.length > 1) {
    playerPanel(PLAYERS[0], 2); playerPanel(PLAYERS[1], 212);
    panel(111, 2, 98, 13);
    r(114, 5, 7, 7, '#a8722e'); r(114, 5, 6, 6, '#ffd23f'); r(115, 6, 2, 2, '#fff3c4');
    txt(String(score).padStart(7, '0'), 124, 5, C.w);
    panel(111, 17, 98, 12);
    if (f) { txt((f.d.short || f.d.name).slice(0, 7), 114, 19, '#ffd27a'); r(172, 20, 34, 6, '#16241b'); r(173, 21, Math.round(32*f.hp/f.max), 4, '#f4b860'); }
    else txt('CRÉDITOS ' + credits, 160, 19, '#4f8a66', { center:true });
  } else {
    const p = PLAYERS[0];
    panel(2, 2, 142, 27);
    r(4, 4, 23, 23, '#16241b'); portrait(p.h.rig, 4, 4, 23);
    txt(p.h.name, 31, 5, NEONT);
    hpBar(p, 32, 17, 106);
    panel(147, 2, 32, 27);
    drawLives(p, 151, 6);
    if (p.weapon) { ctx.drawImage(itemSprite(p.weapon).c, 0, 0, 28, 28, 149, 15, 12, 12); txt(String(p.ammo), 162, 18, '#9fd0ff'); }
    panel(182, 2, 76, 13);
    r(186, 5, 7, 7, '#a8722e'); r(186, 5, 6, 6, '#ffd23f'); r(187, 6, 2, 2, '#fff3c4');
    txt(String(score).padStart(7, '0'), 196, 5, C.w);
    panel(261, 2, 57, 13, '#123a24'); txt('NIVEL ' + (stageIdx + 1), 264, 5, NEONT);
    panel(182, 17, 136, 12);
    if (f) {
      txt(f.d.short || f.d.name, 186, 19, '#ffd27a');
      r(266, 20, 49, 6, '#16241b'); r(267, 21, Math.round(47*f.hp/f.max), 4, '#f4b860');
    } else txt('CRÉDITOS ' + credits, 186, 19, '#4f8a66');
  }
  if (muted) r(316, 0, 4, 2, C.r);
  if (mission && mission.t > 0) {
    const a = Math.min(1, mission.t/20);
    ctx.globalAlpha = a;
    const w = 72 + 8*mission.text.length + 8, x = Math.round((W - w)/2);
    panel(x, 36, w, 13, '#0a120d'); r(x + 1, 37, 70, 11, mission.closed ? '#ffd23f' : NEON); txt(mission.closed ? 'CERRADO' : '! TICKET', x + 4, 39, '#06200f'); txt(mission.text, x + 76, 39, C.w);
    ctx.globalAlpha = 1;
  }
}

/**
 * Dibuja la pantalla de título con su marquesina.
 */
function drawTitle(){
  const cx = 2150 + Math.sin(t/400)*120;
  drawLevel(cx);
  ctx.fillStyle = 'rgba(8,6,14,.45)'; ctx.fillRect(0, 0, W, H);
  const ds = dragonSprite({ wing:(t >> 5) % 2 ? 1 : 2, mouth:(t % 300) > 230 ? 2 : 0, lunge:0, tail:0, fly:0, dizzy:0 });
  ctx.globalAlpha = .9; ctx.drawImage(ds.c, 140, 52); ctx.globalAlpha = 1;
  drawLights(cx);
  ctx.fillStyle = 'rgba(8,6,14,.82)'; ctx.fillRect(0, 12, W, 70);
  goldText('DUNGEONS &', 160, 18, true);
  goldText('DEPLOYMENTS', 160, 38, true);
  panel(84, 60, 152, 13, '#123a24'); txt('EDICIÓN RECREATIVA', 160, 63, NEONT, { center:true });
  blit(rigSprite('bardo', (t >> 5) % 2 ? 'idle1' : 'idle0'), 26, 186, 1, 40, 80, false);
  blit(rigSprite('guerrero', (t >> 5) % 2 ? 'idle0' : 'atk1b'), 58, 192, 1, 40, 80, false);
  blit(rigSprite('mago', (t >> 5) % 2 ? 'special' : 'idle1'), 104, 194, 1, 40, 80, false);
  blit(rigSprite('picara', (t >> 5) % 2 ? 'atk1b' : 'idle0'), 136, 188, 1, 40, 80, false);
  const menu = titleMenu(), save = readSave(), y0 = 158 - menu.length*12 - 4;
  panel(206, y0, 110, menu.length*12 + 8, '#0a120d');
  menu.forEach((m, i) => {
    const on = i === titleSel, y = y0 + 5 + i*12;
    if (on) r(208, y - 2, 106, 11, '#123a24');
    txt((on && (t >> 4) % 2 ? '> ' : '  ') + (m === 'CONTINUAR' ? 'CONTINUAR · ET.' + (save.stage + 1) : m) + (m === 'LOGROS' ? ' ' + achCount() + '/' + ACHIEVEMENTS.length : ''), 212, y, on ? NEONT : C.w);
  });
  txt('RÉCORD ' + ranking[0].n + ' ' + String(ranking[0].s).padStart(7, '0'), 261, 164, '#ffd27a', { center:true, outline:true });
  const mq = "THERE'S NO PLACE LIKE 127.0.0.1  ·  SUDO MAKE ME A SANDWICH  ·  LA RESPUESTA ES 42  ·  ¿HAS PROBADO A APAGAR Y ENCENDER?  ·  RTFM  ·  PEBKAC  ·  ^^vv<><>BA  ·  ";
  ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(0, 186, W, 12); r(0, 186, W, 1, NEON);
  const off = (t*.6) % (mq.length*8);
  txt(mq + mq, -off, 188, NEONT);
  if (konamiT > 0 || konami) { panel(60, 104, 200, 14, '#3a1028'); txt(konami ? '¡CÓDIGO KONAMI! 9 VIDAS' : '', 160, 107, '#ffd23f', { center:true }); if (konamiT > 0) konamiT--; }
}
/**
 * Dibuja la selección de personaje: cuatro tarjetas arriba y, abajo, la ficha del
 * héroe que señala cada jugador.
 */
function drawSelect(){
  const cx = LEVEL_END + 60;
  drawLevel(cx);
  ctx.fillStyle = 'rgba(8,6,14,.55)'; ctx.fillRect(0, 0, W, H);
  panel(70, 3, 180, 13, playMode === 'jefes' ? '#3a1028' : '#123a24'); txt(playMode === 'jefes' ? 'MODO JEFES · ELIGE HÉROE' : 'ELIGE TU AVENTURERO', 160, 6, playMode === 'jefes' ? '#ffd23f' : NEONT, { center:true });
  const cols = [NEON, '#5ec8f2'];
  HERO_ORDER.forEach((k, i) => {
    const h = HEROES[k], x0 = 4 + i*79, who = selP.map((c, s) => c && c.i === i ? s : -1).filter(s => s >= 0);
    const on = who.length > 0;
    r(x0, 19, 75, 92, on ? cols[who[0]] : '#1f3a2a');
    if (who.length > 1) { r(x0 + 37, 19, 38, 3, cols[1]); r(x0 + 72, 19, 3, 92, cols[1]); r(x0 + 37, 108, 38, 3, cols[1]); }
    r(x0 + 2, 21, 71, 88, '#0c1510');
    const g = ctx.createRadialGradient(x0 + 37, 66, 4, x0 + 37, 66, 44);
    g.addColorStop(0, on ? 'rgba(255,150,70,.35)' : 'rgba(120,110,170,.15)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x0 + 2, 21, 71, 74);
    r(x0 + 14, 88, 47, 5, '#6b5850'); r(x0 + 14, 88, 47, 1, '#86705f');
    const ready = selP.some(c => c && c.i === i && c.ok);
    const sp = rigSprite(h.rig, ready ? 'special' : on ? (['idle0', 'idle1', 'atk1b', 'idle0'][(t >> 4) % 4]) : 'idle0');
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 2, 21, 71, 72); ctx.clip();
    ctx.drawImage(sp.c, 0, 0, 80, 84, x0 + 37 - 52, 92 - 104, 104, 109);
    ctx.restore();
    txt(h.name, x0 + 37, 97, on ? NEONT : C.w, { center:true });
    who.forEach((s, j) => { panel(x0 + 4 + j*36, 23, 30, 11, s ? '#0f2a3a' : '#123a24'); txt((s + 1) + 'P', x0 + 19 + j*36, 25, cols[s], { center:true }); });
    if (ready) { panel(x0 + 8, 60, 59, 12, '#3a2a10'); txt('¡LISTO!', x0 + 37, 62, '#ffd23f', { center:true }); }
  });
  const shown = selP.filter(Boolean), half = shown.length > 1;
  shown.forEach((c, s) => {
    const h = HEROES[HERO_ORDER[c.i]], x0 = half ? 4 + s*158 : 4, w = half ? 154 : 312;
    r(x0, 114, w, 82, cols[s]); r(x0 + 1, 115, w - 2, 80, '#0c1510');
    txt(h.name + ' ' + h.sub, x0 + 6, 119, '#ffd27a');
    txt('FUERZA', x0 + 6, 132, '#857bb5'); for (let j = 0; j < 5; j++) r(x0 + 60 + j*9, 132, 7, 7, j < h.fuerza ? '#ff5d73' : '#2c2440');
    txt('VELOC.', x0 + 6, 143, '#857bb5'); for (let j = 0; j < 5; j++) r(x0 + 60 + j*9, 143, 7, 7, j < h.vel ? '#5ec8f2' : '#2c2440');
    if (!half) { txt('ESPECIAL', x0 + 120, 132, '#857bb5'); txt(h.special, x0 + 192, 132, C.g); }
    else txt(h.special, x0 + 6, 154, C.g);
    if (!half) HERO_INFO[HERO_ORDER[c.i]].forEach((ln, j) => txt(ln, x0 + 120, 143 + j*11, C.w));
    if (half) txt(c.ok ? '¡LISTO! B: CAMBIAR' : 'A: CONFIRMAR', x0 + 6, 178, c.ok ? '#ffd23f' : '#4f8a66');
  });
  if (!selP[1] && (t >> 5) % 2) txt('2P: PULSA 2 O START EN UN MANDO', 160, 186, '#9fd0ff', { center:true });
  if (konamiT > 0) { konamiT--; panel(60, 92, 200, 16, '#3a1028'); txt('¡CÓDIGO KONAMI! 9 VIDAS', 160, 96, '#ffd23f', { center:true }); }
}

/**
 * Datos de la barra del jefe activo (jefe final, jefe de sección o Hidra y
 * variantes), o null.
 * @returns {{name: string, frac: number, hl: boolean}|null}
 */
function bossBar(){
  if (boss && boss.state !== 'enter') return { name:boss.d.name, frac:boss.hp/boss.max, hl:boss.state === 'stagger' || !!boss.shielded };
  const m = foes.find(f => (f.kind === 'minotauro' || f.kind === 'dba' || f.kind === 'revisor') && !f.dead && f.state !== 'enter');
  if (m) return { name:m.d.short, frac:m.hp/m.max, hl:m.guard > 0 || !!m.guarded };
  const heads = foes.filter(f => f.kind === 'cabeza');
  if (heads.length && heads.some(h => !h.dead)) return { name:heads[0].body.variant ? heads[0].body.d.short : 'HIDRA RAID', frac:heads.reduce((a, h) => a + (h.dead ? 0 : h.hp), 0)/heads.reduce((a, h) => a + h.max, 0), hl:false };
  return null;
}
/**
 * Dibuja la escena según el estado.
 */
function drawScene(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!LEVEL) buildLevel();
  r(0, 0, W, H, C.k);
  if (state === 'title') return drawTitle();
  if (state === 'ranking') return drawRanking();
  if (state === 'select') return drawSelect();
  if (state === 'options') return drawOptions();
  if (state === 'keys') return drawKeys();
  if (state === 'logros') return drawAchievements();
  if (state === 'credits') return drawCredits();
  const shk = OPTS.flashes ? shake : 0;
  const sx = shk ? Math.round((Math.random()*2 - 1)*shk) : 0, sy = shk ? Math.round((Math.random()*2 - 1)*shk) : 0;
  ctx.save(); ctx.translate(sx, sy);
  const cx = Math.round(camX);
  drawLevel(cx);
  for (const f of fx) if (f.ring) {
    ctx.strokeStyle = f.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x - cx, f.y - 2, f.r, f.r*.3, 0, 0, Math.PI*2); ctx.stroke();
    if (f.runes) { ctx.fillStyle = f.col; for (let i = 0; i < 8; i++) { const a = i/8*Math.PI*2 + t/10; ctx.fillRect(Math.round(f.x - cx + Math.cos(a)*f.r) - 1, Math.round(f.y - 2 + Math.sin(a)*f.r*.3) - 1, 3, 3); } }
  }
  for (const L of locks) {
    const k = Math.min(1, L.t/20), sxL = L.x - cx;
    ctx.strokeStyle = 'rgba(255,210,63,' + (.5 + .3*Math.sin(t/3)) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(Math.round(sxL), Math.round(L.y), L.r*k, L.r*.3*k, 0, 0, Math.PI*2); ctx.stroke();
    if (L.t < L.arm) { ctx.fillStyle = 'rgba(255,210,63,.15)'; ctx.beginPath(); ctx.ellipse(Math.round(sxL), Math.round(L.y), L.r*k, L.r*.3*k, 0, 0, Math.PI*2); ctx.fill(); }
    else txt('LOCK TABLE', sxL, L.y - 10, '#ffd23f', { center:true, outline:true });
  }
  if (boss && boss.state === 'breath') {
    const mx = boss.x + boss.face*80 - cx;
    ctx.fillStyle = 'rgba(110,231,168,.18)'; ctx.fillRect(Math.round(boss.face > 0 ? mx : mx - 190), boss.y - 70, 190, 14);
  }
  const list = activePlayers().concat(foes, crates, items.map(it => ({ kind:'item', it, x:it.x, y:it.y, z:0 })), shots.map(s => ({ kind:'shot', x:s.x, y:s.y, z:s.z, col:s.col })));
  list.sort((a, b) => a.y - b.y);
  for (const a of list) drawActor(a, cx);
  for (const f of fx) {
    if (f.ring) continue;
    if (f.spark) {
      const k = f.life/f.max, s = (f.big ? 14 : 9)*(1.2 - k), x = Math.round(f.x - cx), y = Math.round(f.y);
      ctx.fillStyle = 'rgba(255,255,255,' + k + ')';
      ctx.fillRect(x - s, y, s*2, 1); ctx.fillRect(x, y - s, 1, s*2);
      ctx.fillStyle = 'rgba(244,184,96,' + k + ')';
      ctx.fillRect(x - s*.6, y - s*.6, 2, 2); ctx.fillRect(x + s*.6, y + s*.6, 2, 2); ctx.fillRect(x + s*.6, y - s*.6, 2, 2); ctx.fillRect(x - s*.6, y + s*.6, 2, 2);
      continue;
    }
    r(f.x - cx, f.y, f.big ? 3 : 2, f.big ? 3 : 2, f.col);
  }
  for (const d of drops) {
    const x = Math.round(d.x - cx); shadow(x, d.y, 6 + Math.max(0, 14 - d.z/12));
    if (OPTS.bigCues) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, Math.round(d.y), 12, 4, 0, 0, Math.PI*2); ctx.stroke(); }
    ctx.drawImage(coinSprite().c, x - 6, Math.round(d.y - d.z - 6));
  }
  drawLights(cx);
  for (const s of eshots) { const x = Math.round(s.x - cx), y = Math.round(s.y - s.z); r(x - 4, y - 4, 8, 8, OUTLINE); r(x - 3, y - 3, 6, 6, '#ff8a3d'); r(x - 1, y - 2, 2, 3, '#ffffff'); r(x - 1, y + 2, 2, 1, '#ffffff'); }
  for (const s of texts) { if (s.life < 12 && (s.life >> 1) % 2) continue; const x = clamp(s.x - cx, 2, W - 2 - 8*s.s.length); txt(s.s, x, s.y, s.col, { outline:true }); }
  ctx.restore();

  if (flashT > 0 && OPTS.flashes) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.5, flashT*.08) + ')'; ctx.fillRect(0, 0, W, H); }
  if (slowmo > 0) { ctx.fillStyle = 'rgba(255,210,63,.06)'; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  for (const p of PLAYERS) {
    if (p.chain < 2 || state !== 'play' || story) continue;
    const col = p.chain >= 20 ? '#ff5d73' : p.chain >= 10 ? '#ffd23f' : '#ffffff', left = p.slot === 1 ? false : PLAYERS.length > 1;
    const x = left ? 4 : 316, o = left ? {} : { right:true }, x0 = left ? 4 : 256;
    txt(PLAYERS.length > 1 ? (p.slot + 1) + 'P COMBO' : 'COMBO', x, 54, NEONT, Object.assign({ outline:true }, o));
    txt('x' + p.chain, x, 64, col, Object.assign({ big:true, outline:true }, o));
    r(x0, 83, 60, 3, '#16241b'); r(x0, 83, Math.round(60*p.chainT/120), 3, col);
  }
  if (rankFx) {
    ctx.globalAlpha = Math.min(1, rankFx.t/15);
    goldText(rankFx.text, 160, 132 - Math.max(0, rankFx.t - 55), true);
    ctx.globalAlpha = 1;
  }
  const bb = bossBar();
  if (bb) {
    panel(2, 186, 316, 13);
    txt(bb.name, 6, 189, NEONT);
    const bw = 316 - 12 - bb.name.length*8 - 6, bx0 = 314 - bw;
    r(bx0 - 1, 189, bw + 1, 7, '#16241b'); r(bx0, 190, Math.round(bw*bb.frac), 5, bb.hl ? C.a : '#ff5d73'); r(bx0, 190, Math.round(bw*bb.frac), 1, '#ffd0d6');
  }
  if (banner && banner.t < 150) {
    panel(40, 70, 240, 44);
    txt(banner.a, 160, 78, NEONT, { center:true, big:true });
    txt(banner.b, 160, 100, C.w, { center:true });
  }
  if (goT > 0 && (t >> 4) % 2 && !locked) { goldText('GO!', 286, 58, true); r(272, 84, 26, 6, OUTLINE); r(273, 85, 20, 4, '#f4b860'); r(290, 80, 3, 14, '#f4b860'); r(293, 82, 3, 10, '#f4b860'); r(296, 85, 3, 4, '#f4b860'); }
  if (state === 'pause') { r(0, 84, W, 30, 'rgba(11,9,18,.9)'); goldText('PAUSA', 160, 92, true); }
  if (state === 'story') drawStory();
  if (state === 'initials') drawInitials();
  if (state === 'continue') {
    ctx.fillStyle = 'rgba(11,9,18,.82)'; ctx.fillRect(0, 31, W, H - 31);
    goldText('¿ROLLBACK?', 160, 62, true);
    txt(String(Math.max(0, Math.ceil(contT/60) - 1)), 160, 92, C.r, { center:true, big:true, outline:true });
    if ((t >> 4) % 2) txt('INSERTA CRÉDITO · START', 160, 130, C.w, { center:true });
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(11,9,18,.9)'; ctx.fillRect(0, 31, W, H - 31);
    txt('GAME OVER', 160, 70, C.r, { center:true, big:true, outline:true });
    txt('El despliegue se queda para el lunes.', 160, 100, C.w, { center:true });
    txt('ORO ' + String(score).padStart(7, '0'), 160, 120, C.a, { center:true });
    if (overT > 120 && (t >> 4) % 2) txt('PULSA START', 160, 160, C.w, { center:true });
  }
  if (state === 'clear' && clearBonus) {
    ctx.fillStyle = 'rgba(11,9,18,.9)'; ctx.fillRect(0, 31, W, H - 31);
    goldText(clearBonus.rush ? 'JEFES SUPERADOS' : 'DEPLOY OK', 160, 38, true);
    txt('pipeline en verde', 160, 56, NEONT, { center:true });
    const rows = [
      ['SPRINT ' + String(Math.floor(clearBonus.secs/60)).padStart(2,'0') + ':' + String(clearBonus.secs % 60).padStart(2,'0'), clearBonus.timeBonus],
      ['VIDA Y VIDAS', clearBonus.lifeBonus], ['COMBO MÁX x' + clearBonus.maxChain, clearBonus.comboBonus], ['ORO TOTAL', score]
    ];
    rows.forEach(([a, b], i) => { if (clearT > 20 + i*20) { txt(a, 40, 70 + i*13, C.w); txt(String(b).padStart(7, '0'), 280, 70 + i*13, i === 3 ? C.a : C.w, { right:true }); } });
    if (clearT > 105) {
      r(40, 124, 240, 30, '#a8722e'); r(42, 126, 236, 26, '#e6dcc0'); r(42, 126, 236, 1, '#fff3c4');
      txt('PÁGINA DEL GRIMORIO DoD', 160, 129, '#3a2a1a', { center:true });
      txt(['LOGS Y TRAZAS', 'MONITORIZACIÓN Y ALERTAS', 'COSTES Y ETIQUETAS'][stageIdx] || 'LOGS Y TRAZAS', 160, 141, '#2f7a5a', { center:true });
    }
    const nextSt = STAGES[stageIdx + 1];
    if (clearT > 130) txt(clearBonus.rush ? 'NUEVE JEFES SIN DESCANSO' : (clearBonus.revisor ? 'PR APROBADO · ' : '') + (nextSt ? 'SIGUIENTE: ETAPA ' + (stageIdx + 2) + ' · ' + nextSt.name : 'LA FACTURA ESTÁ PAGADA'), 160, 162, clearBonus.revisor ? C.g : C.e, { center:true });
    if (clearT > 150 && (t >> 4) % 2) txt('PULSA START', 160, 178, C.w, { center:true });
  }
}
/**
 * Dibuja un fotograma completo y, encima, los avisos (logros y mandos).
 */
function draw(){
  drawScene();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawAchToast();
  if (padToast) { panel(80, 172, 160, 13, '#0f2a3a'); txt(padToast.text, 160, 175, '#9fd0ff', { center:true }); }
}
