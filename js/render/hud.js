// HUD: paneles, retratos, vidas y barras de vida de uno o dos jugadores y del jefe.
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
