// HUD (paneles, vidas, barras de vida, jefe activo) y menús de título y selección.
'use strict';

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
