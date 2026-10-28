// Primitivas de dibujo (rectángulos, texto, sprites) y dibujo de actores.
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
