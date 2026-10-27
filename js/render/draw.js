// Dibujo de actores, HUD y pantallas.
'use strict';

function r(x, y, w, h, c){ ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
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
function goldText(s, x, y, big){
  ctx.font = big ? F16 : F8; ctx.textBaseline = 'top';
  const w = ctx.measureText(s).width, tx = Math.round(x - w/2);
  ctx.fillStyle = '#3a1c08'; for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1],[2,2],[1,2],[2,1]]) ctx.fillText(s, tx + ox, y + oy);
  const g = ctx.createLinearGradient(0, y, 0, y + (big ? 16 : 8));
  g.addColorStop(0, '#fff3c4'); g.addColorStop(.45, '#f4b860'); g.addColorStop(1, '#a8561f');
  ctx.fillStyle = g; ctx.fillText(s, tx, y);
}
function blit(spr, sx, sy, face, ox, base, flash, alpha){
  const img = flash ? spr.f : spr.c;
  if (alpha !== undefined) ctx.globalAlpha = alpha;
  if (face < 0) { ctx.save(); ctx.translate(Math.round(sx), 0); ctx.scale(-1, 1); ctx.drawImage(img, -ox, Math.round(sy - base)); ctx.restore(); }
  else ctx.drawImage(img, Math.round(sx - ox), Math.round(sy - base));
  ctx.globalAlpha = 1;
}
function breathe(a){
  const ph = ((t + (a.seed || 0)*7) >> 4) % 4;
  return ph === 0 ? 'idle0' : ph === 2 ? 'idle1' : 'idle0~idle1~0.5';
}
function rigPose(a){
  const tt = a === P ? P.t : t + (a.seed || 0)*4;
  switch (a.state) {
    case 'walk': {
      if (!(a === P || a.moving !== false)) return breathe(a);
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
function shadow(sx, y, w){ ctx.fillStyle = 'rgba(4,2,8,.5)'; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(y), w/2, Math.max(2, w/8), 0, 0, Math.PI*2); ctx.fill(); }
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
    blit(batSprite(down ? 1 : ((t + a.seed*3) >> 2) % 2), sx, sy, a.face, 20, 28, fl);
    return;
  }
  if (a.d && a.d.ghost) {
    shadow(sx, a.y, 18);
    const bob = Math.sin((t + a.seed*9)/10)*3;
    blit(ghostSprite((t >> 4) % 2), sx, sy - 10 + bob, a.face, 18, 40, fl, a.hidden ? .18 : (a.state === 'down' && a.lying ? .5 : .88));
    if (a.state === 'windup' && (t >> 2) % 2) { r(sx - 1, sy - 62, 3, 6, C.r); r(sx - 1, sy - 54, 3, 2, C.r); }
    return;
  }
  if (a.kind === 'mimico') {
    shadow(sx, a.y, 26);
    const open = a.state !== 'sleep' && (a.state === 'windup' || a.state === 'attack' || ((t + a.seed*5) >> 3) % 2);
    const hop = a.state === 'attack' ? Math.sin(Math.min(1, a.t/10)*Math.PI)*8 : 0;
    blit(mimicSprite(open ? 1 : 0), sx, sy - hop, a.face, 17, 32, fl);
    return;
  }
  if (a.kind === 'pod') {
    shadow(sx, a.y, 16);
    if (a.state === 'rise') { ctx.globalAlpha = Math.min(1, a.t/45); }
    blit(podSprite(((t + a.seed*3) >> 3) % 2), sx, sy, a.face, 13, 22, fl);
    ctx.globalAlpha = 1;
    if (a.state === 'windup' && (t >> 2) % 2) { r(sx - 1, sy - 30, 3, 5, C.r); }
    return;
  }
  if (a.d && a.d.slime) {
    shadow(sx, a.y, a.d.small ? 16 : 26);
    const pose = (a.state === 'down' && a.lying) ? 'flat' : a.state === 'windup' ? 'wind' : (a.state === 'attack' || a.state === 'down' || a.state === 'thrown') ? 'jump' : ((t + (a.seed || 0)*5) >> 3) % 2 ? 'n' : 'wind';
    const hop = a.state === 'attack' ? Math.sin(Math.min(1, a.t/10)*Math.PI)*8 : 0;
    blit(slimeSprite(!!a.d.small, pose), sx, sy - hop, a.face, 20, 34, fl);
    if (a.state === 'windup' && (t >> 2) % 2) { r(sx - 1, sy - 34, 3, 6, C.r); r(sx - 1, sy - 26, 3, 2, C.r); }
    return;
  }
  if (a.kind === 'hidra') {
    shadow(sx, a.y, 100);
    if (!(a.state === 'dying' && (t >> 2) % 2)) blit(hydraBodySprite(), sx, sy + Math.sin(t/30)*1.5, 1, 55, 72, fl);
    return;
  }
  if (a.kind === 'cabeza') { shadow(sx + (a.ox || 0), a.y, 22); drawHead(a, sx, sy, fl); return; }
  const isP = a === P;
  if (isP && P.duck > 0) { P.duck--; if ((t >> 2) % 2) { ctx.globalAlpha = .35; shadow(sx, a.y, 40); ctx.globalAlpha = 1; } const ds = itemSprite('patito'); ctx.drawImage(ds.c, Math.round(sx - 30), Math.round(sy - 66 + Math.sin(t/6)*2)); }
  else if (isP && P.inv > 0 && P.state !== 'down' && (P.inv >> 2) % 2) return;
  const rigKey = isP ? P.h.rig : (a.rig || a.d.rig);
  let pose = rigPose(a);
  const base = pose.split('~')[0];
  if (a._lp && a._lp !== base && !a._lp.includes('down') && base !== 'down' && pose === base && a.state !== 'punch') { a._from = a._lp; a._bt = 3; }
  a._lp = base;
  if (a._bt > 0) { a._bt--; if (a._from !== pose) pose = a._from + '~' + pose + '~0.5'; }
  const spr = rigSprite(rigKey, pose, isP ? P.weapon : null);
  shadow(sx, a.y, pose === 'down' ? 34 : a.d && a.d.boss ? 40 : 24);
  if (a.state === 'rise') {
    const k = Math.min(1, a.t/40);
    ctx.save(); ctx.beginPath(); ctx.rect(sx - 40, sy - 90, 80, 90); ctx.clip();
    blit(spr, sx, sy + (1 - k)*56, a.face, 40, 80, false);
    ctx.restore();
    return;
  }
  blit(spr, sx, sy, a.face, 40, 80, fl);
  slashArc(a, sx, sy);
  if (a.guard > 0) {
    const gx = Math.round(sx + a.face*24), pulse = .25 + .15*Math.sin(t/4);
    ctx.fillStyle = 'rgba(255,93,115,' + pulse + ')'; ctx.fillRect(gx - 4, Math.round(sy - 74), 8, 72);
    ctx.fillStyle = 'rgba(255,210,63,' + (pulse + .2) + ')';
    for (let yy = 0; yy < 8; yy++) ctx.fillRect(gx - 4 + (yy % 2)*4, Math.round(sy - 72 + yy*9), 4, 1);
  }
  if (!isP && a.state === 'windup' && (t >> 2) % 2) { r(sx + a.face*4 - 1, sy - 64, 3, 6, C.r); r(sx + a.face*4 - 1, sy - 56, 3, 2, C.r); }
  if (isP && P.state === 'special' && P.hero === 'mago') {
    ctx.strokeStyle = 'rgba(185,140,255,.85)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(Math.round(sx), Math.round(a.y), 20 + P.t, 6 + P.t*.3, 0, 0, Math.PI*2); ctx.stroke();
  }
}

const NEON = '#3ddc84', NEOND = '#0c1510', NEONT = '#8dffbf';
function panel(x, y, w, h, fill){ r(x, y, w, h, NEON); r(x + 1, y + 1, w - 2, h - 2, fill || NEOND); r(x + 1, y + h - 1, w - 2, 1, '#1f7a46'); }
function portrait(rig, x, y, s){
  const ps = rigSprite(rig, 'idle0'), m = ps.meta, half = Math.round(m.hr*1.7);
  ctx.drawImage(ps.c, Math.round(m.hx - half), Math.round(m.hy - half), half*2, half*2, x, y, s, s);
}
function drawHUD(){
  ctx.fillStyle = 'rgba(6,8,7,.72)'; ctx.fillRect(0, 0, W, 31);
  panel(2, 2, 142, 27);
  r(4, 4, 23, 23, '#16241b'); portrait(P.h.rig, 4, 4, 23);
  txt(P.h.name, 31, 5, NEONT);
  r(31, 16, 108, 8, '#16241b'); r(32, 17, 106, 6, '#2a0f16');
  const hw = Math.round(106*P.hp/P.max);
  const hc = P.hp > 30 ? [NEON, '#1f7a46'] : ['#ff5d73', '#8a2c3c'];
  r(32, 17, hw, 6, hc[0]); r(32, 21, hw, 2, hc[1]); r(32, 17, hw, 1, '#e9fff4');
  panel(147, 2, 32, 27);
  if (P.lives > 2) txt('x' + (P.lives + 1), 151, 5, '#ff5d73'); else for (let i = 0; i < 3; i++) { const x = 151 + i*9, y = 6, on = i <= P.lives; r(x + 1, y, 2, 2, on ? '#ff5d73' : '#2c3a30'); r(x + 4, y, 2, 2, on ? '#ff5d73' : '#2c3a30'); r(x, y + 1, 7, 3, on ? '#ff5d73' : '#2c3a30'); r(x + 1, y + 4, 5, 1, on ? '#ff5d73' : '#2c3a30'); r(x + 2, y + 5, 3, 1, on ? '#ff5d73' : '#2c3a30'); if (on) r(x + 1, y + 1, 1, 1, '#ffc0c8'); }
  if (P.weapon) { ctx.drawImage(itemSprite(P.weapon).c, 0, 0, 28, 28, 149, 15, 12, 12); txt(String(P.ammo), 162, 18, '#9fd0ff'); }
  panel(182, 2, 76, 13);
  r(186, 5, 7, 7, '#a8722e'); r(186, 5, 6, 6, '#ffd23f'); r(187, 6, 2, 2, '#fff3c4');
  txt(String(score).padStart(7, '0'), 196, 5, C.w);
  panel(261, 2, 57, 13, '#123a24'); txt('NIVEL 1', 264, 5, NEONT);
  panel(182, 17, 136, 12);
  const f = lastFoe && foes.includes(lastFoe) ? lastFoe : null;
  if (f) {
    txt(f.d.short || f.d.name, 186, 19, '#ffd27a');
    r(266, 20, 49, 6, '#16241b'); r(267, 21, Math.round(47*f.hp/f.max), 4, '#f4b860');
  } else txt('CRÉDITOS ' + credits, 186, 19, '#4f8a66');
  if (muted) r(316, 0, 4, 2, C.r);
  if (mission && mission.t > 0) {
    const a = Math.min(1, mission.t/20);
    ctx.globalAlpha = a;
    const w = 72 + 8*mission.text.length + 8, x = Math.round((W - w)/2);
    panel(x, 36, w, 13, '#0a120d'); r(x + 1, 37, 70, 11, mission.closed ? '#ffd23f' : NEON); txt(mission.closed ? 'CERRADO' : '! TICKET', x + 4, 39, '#06200f'); txt(mission.text, x + 76, 39, C.w);
    ctx.globalAlpha = 1;
  }
}

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
  panel(84, 60, 152, 13, '#123a24'); txt('EDICIÓN RECREATIVA · V2', 160, 63, NEONT, { center:true });
  blit(rigSprite('guerrero', (t >> 5) % 2 ? 'idle0' : 'atk1b'), 52, 192, 1, 40, 80, false);
  blit(rigSprite('mago', (t >> 5) % 2 ? 'special' : 'idle1'), 100, 194, 1, 40, 80, false);
  if ((t >> 5) % 2) { panel(130, 150, 182, 14, '#0a120d'); txt('INSERTA CRÉDITO · START', 221, 153, C.w, { center:true }); }
  panel(196, 128, 120, 13); txt(ranking[0].n + ' ' + String(ranking[0].s).padStart(7, '0'), 256, 131, NEONT, { center:true });
  const mq = "THERE'S NO PLACE LIKE 127.0.0.1  ·  SUDO MAKE ME A SANDWICH  ·  LA RESPUESTA ES 42  ·  ¿HAS PROBADO A APAGAR Y ENCENDER?  ·  RTFM  ·  PEBKAC  ·  ^^vv<><>BA  ·  ";
  ctx.fillStyle = 'rgba(6,8,7,.85)'; ctx.fillRect(0, 186, W, 12); r(0, 186, W, 1, NEON);
  const off = (t*.6) % (mq.length*8);
  txt(mq + mq, -off, 188, NEONT);
  if (konamiT > 0 || konami) { panel(60, 104, 200, 14, '#3a1028'); txt(konami ? '¡CÓDIGO KONAMI! 9 VIDAS' : '', 160, 107, '#ffd23f', { center:true }); if (konamiT > 0) konamiT--; }
}
function drawSelect(){
  const cx = LEVEL_END + 60;
  drawLevel(cx);
  ctx.fillStyle = 'rgba(8,6,14,.55)'; ctx.fillRect(0, 0, W, H);
  panel(70, 4, 180, 14, '#123a24'); txt('ELIGE TU AVENTURERO', 160, 7, NEONT, { center:true });
  ['guerrero', 'mago'].forEach((k, i) => {
    const h = HEROES[k], x0 = 14 + i*154, on = sel === i;
    r(x0, 22, 138, 172, on ? NEON : '#1f3a2a'); r(x0 + 2, 24, 134, 168, '#0c1510');
    const g = ctx.createRadialGradient(x0 + 69, 100, 4, x0 + 69, 100, 70);
    g.addColorStop(0, on ? 'rgba(255,150,70,.35)' : 'rgba(120,110,170,.15)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(x0 + 2, 24, 134, 110);
    r(x0 + 30, 118, 78, 8, '#6b5850'); r(x0 + 30, 118, 78, 1, '#86705f'); r(x0 + 36, 126, 66, 4, '#463833');
    const s = rigSprite(h.rig, on ? (['idle0', 'idle1', 'atk1b', 'idle0'][(t >> 4) % 4]) : 'idle0');
    ctx.save(); ctx.beginPath(); ctx.rect(x0 + 2, 24, 134, 100); ctx.clip();
    ctx.drawImage(s.c, 0, 0, 80, 84, x0 + 69 - 80, 122 - 160, 160, 168);
    ctx.restore();
    txt(h.name, x0 + 69, 136, on ? NEONT : C.w, { center:true });
    txt(h.sub, x0 + 69, 147, '#a39bc2', { center:true });
    txt('FUERZA', x0 + 8, 160, '#857bb5'); for (let j = 0; j < 5; j++) r(x0 + 72 + j*11, 160, 9, 7, j < h.fuerza ? '#ff5d73' : '#2c2440');
    txt('VELOC.', x0 + 8, 171, '#857bb5'); for (let j = 0; j < 5; j++) r(x0 + 72 + j*11, 171, 9, 7, j < h.vel ? '#5ec8f2' : '#2c2440');
    txt(h.special, x0 + 69, 182, C.g, { center:true });
  });
  if ((t >> 4) % 2) txt('< >', 160, 100, C.w, { center:true, outline:true });
  if (konamiT > 0) { konamiT--; panel(60, 92, 200, 16, '#3a1028'); txt('¡CÓDIGO KONAMI! 9 VIDAS', 160, 96, '#ffd23f', { center:true }); }
}

function bossBar(){
  if (boss && boss.state !== 'enter') return { name:'DRAGÓN NEGRO', frac:boss.hp/boss.max, hl:boss.state === 'stagger' };
  const m = foes.find(f => f.kind === 'minotauro' && !f.dead);
  if (m) return { name:'MINOTAURO', frac:m.hp/m.max, hl:m.guard > 0 };
  const heads = foes.filter(f => f.kind === 'cabeza');
  if (heads.length && heads.some(h => !h.dead)) return { name:'HIDRA RAID', frac:heads.reduce((a, h) => a + (h.dead ? 0 : h.hp), 0)/heads.reduce((a, h) => a + h.max, 0), hl:false };
  return null;
}
function draw(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!LEVEL) buildLevel();
  r(0, 0, W, H, C.k);
  if (state === 'title') return drawTitle();
  if (state === 'ranking') return drawRanking();
  if (state === 'select') return drawSelect();
  const sx = shake ? Math.round((Math.random()*2 - 1)*shake) : 0, sy = shake ? Math.round((Math.random()*2 - 1)*shake) : 0;
  ctx.save(); ctx.translate(sx, sy);
  const cx = Math.round(camX);
  drawLevel(cx);
  for (const f of fx) if (f.ring) {
    ctx.strokeStyle = f.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x - cx, f.y - 2, f.r, f.r*.3, 0, 0, Math.PI*2); ctx.stroke();
    if (f.runes) { ctx.fillStyle = f.col; for (let i = 0; i < 8; i++) { const a = i/8*Math.PI*2 + t/10; ctx.fillRect(Math.round(f.x - cx + Math.cos(a)*f.r) - 1, Math.round(f.y - 2 + Math.sin(a)*f.r*.3) - 1, 3, 3); } }
  }
  if (boss && boss.state === 'breath') {
    const mx = boss.x + boss.face*80 - cx;
    ctx.fillStyle = 'rgba(110,231,168,.18)'; ctx.fillRect(Math.round(boss.face > 0 ? mx : mx - 190), boss.y - 70, 190, 14);
  }
  const list = [P].concat(foes, crates, items.map(it => ({ kind:'item', it, x:it.x, y:it.y, z:0 })), shots.map(s => ({ kind:'shot', x:s.x, y:s.y, z:s.z, col:s.col })));
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
  drawLights(cx);
  for (const s of eshots) { const x = Math.round(s.x - cx), y = Math.round(s.y - s.z); r(x - 4, y - 4, 8, 8, OUTLINE); r(x - 3, y - 3, 6, 6, '#ff8a3d'); r(x - 1, y - 2, 2, 3, '#ffffff'); r(x - 1, y + 2, 2, 1, '#ffffff'); }
  for (const s of texts) { if (s.life < 12 && (s.life >> 1) % 2) continue; const x = clamp(s.x - cx, 2, W - 2 - 8*s.s.length); txt(s.s, x, s.y, s.col, { outline:true }); }
  ctx.restore();

  if (flashT > 0) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.5, flashT*.08) + ')'; ctx.fillRect(0, 0, W, H); }
  if (slowmo > 0) { ctx.fillStyle = 'rgba(255,210,63,.06)'; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  if (P.chain >= 2 && state === 'play' && !story) {
    const col = P.chain >= 20 ? '#ff5d73' : P.chain >= 10 ? '#ffd23f' : '#ffffff';
    txt('COMBO', 316, 54, NEONT, { right:true, outline:true });
    txt('x' + P.chain, 316, 64, col, { right:true, big:true, outline:true });
    r(256, 83, 60, 3, '#16241b'); r(256, 83, Math.round(60*P.chainT/120), 3, col);
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
    goldText('DEPLOY OK', 160, 38, true);
    txt('pipeline en verde', 160, 56, NEONT, { center:true });
    const rows = [
      ['SPRINT ' + String(Math.floor(clearBonus.secs/60)).padStart(2,'0') + ':' + String(clearBonus.secs % 60).padStart(2,'0'), clearBonus.timeBonus],
      ['VIDA Y VIDAS', clearBonus.lifeBonus], ['COMBO MÁX x' + clearBonus.maxChain, clearBonus.comboBonus], ['ORO TOTAL', score]
    ];
    rows.forEach(([a, b], i) => { if (clearT > 20 + i*20) { txt(a, 40, 70 + i*13, C.w); txt(String(b).padStart(7, '0'), 280, 70 + i*13, i === 3 ? C.a : C.w, { right:true }); } });
    if (clearT > 105) {
      r(40, 124, 240, 30, '#a8722e'); r(42, 126, 236, 26, '#e6dcc0'); r(42, 126, 236, 1, '#fff3c4');
      txt('PÁGINA DEL GRIMORIO DoD', 160, 129, '#3a2a1a', { center:true });
      txt('LOGS Y TRAZAS', 160, 141, '#2f7a5a', { center:true });
    }
    if (clearT > 130) txt('CONTINUARÁ: ETAPA 2 · LAS CUEVAS', 160, 162, C.e, { center:true });
    if (clearT > 150 && (t >> 4) % 2) txt('PULSA START', 160, 178, C.w, { center:true });
  }
}
