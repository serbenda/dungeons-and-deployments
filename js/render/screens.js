// Pantallas de título y de selección de héroe.
'use strict';

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
