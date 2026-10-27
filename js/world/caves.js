// Etapa 2, Las Cuevas: Minas de Datos, Cripta de Seguridad, Observatorio y Trono
// del Mainframe. Mismo sistema que la mazmorra: un canvas prerenderizado, decorado
// animado encima y luces aditivas.
'use strict';

/**
 * Zona de la etapa 2 según la x del mundo.
 * @param {number} x
 * @returns {'datos'|'seguridad'|'monitor'|'trono'}
 */
const ZONE2 = x => x < 1280 ? 'datos' : x < 2560 ? 'seguridad' : x < 3200 ? 'monitor' : 'trono';
/** Faroles de la mina, braseros de la cripta y del trono. */
const CAVE_TORCHES = [120, 330, 540, 760, 980, 1200].map(x => ({ x, y:66 }))
  .concat([1350, 1560, 1770, 1980, 2190, 2400].map(x => ({ x, y:96, brazier:true })))
  .concat([3260, 3500, 3760].map(x => ({ x, y:96, brazier:true })));
/** Cristales de índice (brillan en la mina): [x, y, color]. */
const CRYSTALS = [];
/** Bóvedas de la cripta, pantallas del observatorio y armarios del Mainframe. */
const VAULTS = [1440, 1700, 1960, 2220, 2480];
const SCREENS = [2600, 2690, 2780, 2870, 2960, 3050, 3140];
const MAINFRAME = [3290, 3380, 3650, 3740];
const THRONE_X = LEVEL_END + 160;
let LEVEL2 = null;

/**
 * Pinta una sola vez Las Cuevas en un canvas grande (LEVEL2). Usa prng(2027): la
 * cueva es siempre igual.
 */
function buildCaves(){
  const S = painter(LVW, 200), rnd = prng(2027);
  const pick = a => a[(rnd()*a.length) | 0];
  CRYSTALS.length = 0;
  // roca de fondo de toda la cueva, con tono por zona
  const ROCK = {
    datos:['#4a3a36', '#42332f', '#52403a', '#3a2d2a'],
    seguridad:['#2e3640', '#28303a', '#343d48', '#232a33'],
    monitor:['#2c2840', '#262338', '#332e4a', '#211e30'],
    trono:['#22302a', '#1c2924', '#283830', '#17221d']
  };
  S.rect(0, 0, LVW, 125, '#120e14');
  for (let i = 0; i < 3600; i++) { const x = rnd()*LVW, y = 28 + rnd()*94; S.ell(x, y, 4 + rnd()*10, 3 + rnd()*6, pick(ROCK[ZONE2(x)])); }
  for (let x = 0; x < LVW; x += 10 + rnd()*18) { const l = 6 + rnd()*22; S.poly([[x, 26], [x + 9, 26], [x + 4, 26 + l]], pick(ROCK[ZONE2(x)])); }
  S.rect(0, 0, LVW, 28, '#0a080c');
  // suelo por zonas
  const rows = [125, 131, 138, 146, 155, 165, 176, 188, 201];
  S.rect(0, 125, LVW, 75, '#241c1a');
  for (let i = 0; i < 2400; i++) {
    const x = rnd()*LVW, y = 126 + rnd()*74, z = ZONE2(x);
    if (z === 'datos') S.ell(x, y, 3 + rnd()*9, 1.5 + rnd()*3, pick(['#46362f', '#3e302a', '#4e3c34', '#56443a']));
  }
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], hh = rows[r + 1] - y0, tw = 22 + r*7, off = (r % 2)*tw/2;
    for (let x = 1280 - off; x < LVW; x += tw) {
      const x0 = Math.max(1280, x), w = x + tw - x0, z = ZONE2(x0 + 2); if (w < 3) continue;
      if (z === 'seguridad') { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, pick(['#3a434e', '#353d48', '#404a56', '#313844'])); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#56606e'); }
      else if (z === 'monitor') { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, '#2a2638'); for (let gx = x0 + 3; gx < x0 + w - 1; gx += 4) S.rect(gx, y0 + 2, 1, hh - 3, '#1a1726'); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#4a4466'); }
      else if (z === 'trono') { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, pick(['#4e5260', '#494d5a', '#535866'])); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#6e7486'); if (rnd() < .3) for (let k = 0; k < 3; k++) S.rect(x0 + 4 + k*4, y0 + hh/2, 2, 1, '#2e3240'); }
    }
  }
  // raíles de la mina
  for (const ry of [150, 182]) {
    for (let x = 0; x < 1280; x += 9) S.rect(x, ry - 1, 6, 4, '#5a3a22');
    S.rect(0, ry - 2, 1280, 1, '#8e97b5'); S.rect(0, ry + 2, 1280, 1, '#8e97b5');
  }
  // zócalo
  S.rect(0, 118, LVW, 7, '#3a302c'); S.rect(0, 118, LVW, 1, '#5a4a40'); S.rect(0, 124, LVW, 1, '#151012');

  // --- MINAS DE DATOS: vigas de madera, vagonetas con tablas y cristales de índice
  for (let x = 40; x < 1280; x += 160) {
    S.rect(x, 30, 8, 92, '#6b4a26'); S.rect(x + 2, 30, 2, 92, '#8a6a3a'); S.rect(x + 72, 30, 8, 92, '#6b4a26');
    S.rect(x - 4, 30, 88, 8, '#7a5230'); S.rect(x - 4, 30, 88, 2, '#a8723e');
    S.line(x + 8, 40, x + 24, 32, 2, '#5a3a22'); S.line(x + 72, 40, x + 56, 32, 2, '#5a3a22');
  }
  for (const cx of [210, 450, 690, 1100]) {
    S.rect(cx, 100, 46, 18, '#4b4470'); S.rect(cx, 100, 46, 2, '#6a64a0'); S.rect(cx + 2, 104, 42, 1, '#2c2440');
    S.disc(cx + 9, 119, 4, '#26223a'); S.disc(cx + 37, 119, 4, '#26223a'); S.disc(cx + 9, 119, 1.5, '#8e97b5'); S.disc(cx + 37, 119, 1.5, '#8e97b5');
    for (let k = 0; k < 4; k++) { S.rect(cx + 4 + k*10, 92 - (k % 2)*3, 9, 9 + (k % 2)*3, '#e6e0d4'); for (let j = 0; j < 3; j++) S.rect(cx + 5 + k*10, 94 - (k % 2)*3 + j*3, 7, 1, '#8a90a6'); }
  }
  for (let i = 0; i < 26; i++) {
    const x = 20 + rnd()*1240, y = 40 + rnd()*70, col = pick(['#5ec8f2', '#b98cff', '#3ddc84']);
    S.poly([[x, y + 8], [x + 3, y - 4], [x + 6, y + 8]], col); S.poly([[x + 4, y + 8], [x + 8, y], [x + 10, y + 8]], mix(col, -.25));
    S.px(x + 2, y, '#ffffff');
    CRYSTALS.push([x + 5, y + 4, col]);
  }
  // --- CRIPTA DE SEGURIDAD: muro de sillares, bóvedas y candados
  for (let row = 0; row < 9; row++) {
    const y = 42 + row*9, off = row % 2 ? 13 : 0;
    for (let x = 1280 - off; x < 2560; x += 26) {
      const x0 = Math.max(1280, x);
      S.rect(x0, y, 26, 9, '#1a2028'); S.rect(x0 + 1, y + 1, 24, 7, pick(['#3a434e', '#353d48', '#404a56'])); S.rect(x0 + 1, y + 1, 24, 1, '#56606e');
    }
  }
  for (const vx of VAULTS) {
    S.disc(vx, 76, 30, '#5d6274'); S.disc(vx, 76, 26, '#8e97b5'); S.disc(vx, 76, 22, '#6a7290');
    for (let k = 0; k < 6; k++) { const a = k/6*Math.PI*2; S.line(vx, 76, vx + Math.cos(a)*18, 76 + Math.sin(a)*18, 2, '#3a4052'); S.disc(vx + Math.cos(a)*18, 76 + Math.sin(a)*18, 2, '#d3d9f0'); }
    S.disc(vx, 76, 6, '#3a4052'); S.disc(vx, 76, 3, '#ffd23f');
    for (let k = 0; k < 12; k++) { const a = k/12*Math.PI*2; S.px(vx + Math.cos(a)*28, 76 + Math.sin(a)*28, '#d3d9f0'); }
  }
  for (let x = 1330; x < 2540; x += 260) {
    S.rect(x, 96, 14, 12, '#ffd23f'); S.rect(x + 1, 97, 12, 2, '#fff3c4'); S.rect(x + 3, 88, 8, 9, '#ffd23f'); S.rect(x + 5, 90, 4, 7, '#3a434e'); S.rect(x + 6, 101, 2, 4, '#3a2a10');
  }
  // --- OBSERVATORIO: muro de pantallas
  S.rect(2560, 34, 640, 88, '#1a1726');
  for (const sx of SCREENS) {
    for (const sy of [42, 82]) { S.rect(sx, sy, 80, 34, '#3a3550'); S.rect(sx + 3, sy + 3, 74, 28, '#0a0d14'); S.rect(sx, sy, 80, 1, '#5b5580'); }
  }
  // --- TRONO DEL MAINFRAME: armarios, trono y cables
  for (const mx of MAINFRAME) {
    S.rect(mx, 40, 70, 82, '#2b4a6a'); S.rect(mx, 40, 70, 3, '#4a7aa6'); S.rect(mx + 66, 40, 4, 82, '#1c3248');
    S.rect(mx + 6, 48, 58, 30, '#0b0912');
    S.rect(mx + 6, 84, 58, 30, '#1c3248'); for (let j = 0; j < 5; j++) S.rect(mx + 8, 86 + j*6, 54, 2, '#4a7aa6');
    S.rect(mx + 22, 30, 26, 10, '#3a4052'); S.rect(mx + 22, 30, 26, 1, '#6a7290');
  }
  const T0 = THRONE_X;
  S.poly([[T0 - 30, 122], [T0 - 24, 40], [T0, 26], [T0 + 24, 40], [T0 + 30, 122]], '#26283a');
  S.poly([[T0 - 22, 120], [T0 - 18, 46], [T0, 34], [T0 + 18, 46], [T0 + 22, 120]], '#3a4052');
  S.rect(T0 - 34, 96, 68, 26, '#2b4a6a'); S.rect(T0 - 34, 96, 68, 2, '#4a7aa6');
  for (let k = -2; k <= 2; k++) S.disc(T0 + k*10, 44 + Math.abs(k)*6, 2.5, '#3ddc84');
  for (let i = 0; i < 10; i++) { const x0 = 3220 + i*60 + rnd()*20; S.line(x0, 121, x0 + 30, 123, 2, pick(['#2b6fd6', '#ffd23f', '#c43d1a', '#3ddc84'])); }
  // soportes de faroles y braseros
  for (const tc of CAVE_TORCHES) {
    if (tc.brazier) { S.rect(tc.x - 2, 104, 5, 20, '#3d3754'); S.ell(tc.x, 104, 9, 4, '#4b4470'); S.ell(tc.x, 103, 8, 2, '#1a1524'); S.rect(tc.x - 6, 122, 13, 3, '#3d3754'); }
    else { S.line(tc.x, 30, tc.x, 58, 1, '#2a2338'); S.rect(tc.x - 4, 58, 9, 3, '#6b4a26'); S.rect(tc.x - 3, 61, 7, 8, '#3a2a1a'); S.rect(tc.x - 2, 62, 5, 6, '#ffd27a'); }
  }
  LEVEL2 = toCanvas(S, false).c;
}

/**
 * Dibuja la parte visible de Las Cuevas y su decorado animado: carteles de la
 * mina, láseres de la cripta, gráficas del observatorio y bobinas del Mainframe.
 * @param {number} cx Posición de la cámara.
 */
function drawCaves(cx){
  if (!LEVEL2) buildCaves();
  ctx.drawImage(LEVEL2, cx, 0, W, H, 0, 0, W, H);
  // carteles de la mina
  for (const [x, s] of [[120, 'SELECT * FROM mina'], [600, 'WHERE 1=1'], [1000, 'NO HAY ÍNDICES']]) {
    const sx = x - cx; if (sx < -120 || sx > W) continue;
    r(sx - 2, 84, s.length*5 + 8, 11, '#6b4a26'); r(sx - 1, 85, s.length*5 + 6, 9, '#c9935c'); txt(s, sx + 2, 86, '#3a2a1a');
  }
  // láseres de la cripta
  for (let i = 0; i < VAULTS.length - 1; i++) {
    const a = VAULTS[i] + 34 - cx, b = VAULTS[i + 1] - 34 - cx; if (b < 0 || a > W) continue;
    const on = ((t >> 5) + i) % 3 !== 0;
    if (!on) continue;
    for (const [y, ph] of [[60, 0], [76, 1], [92, 2]]) { ctx.fillStyle = (t + ph*7) % 20 < 14 ? '#ff5d73' : '#ff9aa8'; ctx.fillRect(Math.round(a), y + Math.round(Math.sin(t/20 + ph)*2), Math.round(b - a), 1); }
  }
  { const sx = 1500 - cx; if (sx > -160 && sx < W) { r(sx + 70, 36, 108, 11, '#1a2028'); txt('ACCESO RESTRINGIDO', sx + 74, 37, '#ff5d73'); } }
  // gráficas del observatorio
  SCREENS.forEach((sx0, i) => {
    const sx = sx0 - cx; if (sx < -80 || sx > W) return;
    for (const [sy, k] of [[45, 0], [85, 1]]) {
      const kind = (i + k) % 3;
      if (kind === 0) {
        ctx.fillStyle = '#3ddc84';
        for (let x = 0; x < 72; x += 2) { const v = 12 + Math.sin((x + t*.6 + i*20)/9)*7 + Math.sin((x*3 + t)/13)*3; ctx.fillRect(sx + 4 + x, sy + 26 - v, 2, 1); }
      } else if (kind === 1) {
        for (let b = 0; b < 8; b++) { const h = 6 + ((b*37 + (t >> 4) + i*11) % 18); ctx.fillStyle = h > 20 ? '#ff5d73' : h > 15 ? '#ffd23f' : '#5ec8f2'; ctx.fillRect(sx + 6 + b*9, sy + 26 - h, 6, h); }
      } else {
        txt('99.9%', sx + 14, sy + 4, (t >> 5) % 4 ? '#3ddc84' : '#ff5d73', { big:true });
        txt('SLA', sx + 30, sy + 20, '#9fd0ff');
      }
    }
  });
  if (cx > 2300 && cx < 3300 && (t >> 4) % 2) for (const bx of [2640, 2900, 3120]) { const sx = bx - cx; if (sx > -10 && sx < W + 10) { r(sx - 4, 30, 8, 5, '#ff5d73'); } }
  // Mainframe: bobinas girando y pantalla de fósforo verde
  MAINFRAME.forEach((mx, i) => {
    const sx = mx - cx; if (sx < -80 || sx > W) return;
    for (const [rx, ry] of [[sx + 20, 63], [sx + 50, 63]]) {
      ctx.fillStyle = '#c9c4ba'; ctx.beginPath(); ctx.arc(rx, ry, 10, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#3a4052'; ctx.beginPath(); ctx.arc(rx, ry, 4, 0, Math.PI*2); ctx.fill();
      const a = t/(8 + i*2);
      ctx.fillStyle = '#3a4052'; for (let k = 0; k < 3; k++) ctx.fillRect(Math.round(rx + Math.cos(a + k*2.09)*7) - 1, Math.round(ry + Math.sin(a + k*2.09)*7) - 1, 2, 2);
    }
    for (let j = 0; j < 5; j++) if (((t >> 3) + j*3 + i) % 4) { ctx.fillStyle = '#3ddc84'; ctx.fillRect(sx + 10 + ((j*13 + i*7) % 40), 88 + j*6, 3, 1); }
  });
  { const sx = THRONE_X - cx; if (sx > -120 && sx < W + 120) {
    const lines = ['IDENTIFICATION DIVISION.', 'PROGRAM-ID. MAINFRAME.', 'PROCEDURE DIVISION.', 'PERFORM FOREVER.'];
    txt(lines[(t >> 7) % lines.length], sx, 30, '#3ddc84', { center:true, outline:true });
  } }
}

/**
 * Luces propias de Las Cuevas (se suman a las de faroles y braseros): cristales,
 * láseres, pantallas y el brillo verde del Mainframe.
 * @param {number} cx Posición de la cámara.
 */
function caveLights(cx){
  for (const [x, y, col] of CRYSTALS) {
    const sx = x - cx; if (sx < -40 || sx > W + 40) continue;
    const [r0, g0, b0] = rgb(col);
    const gr = ctx.createRadialGradient(sx, y, 1, sx, y, 26);
    gr.addColorStop(0, `rgba(${r0},${g0},${b0},${.22 + .08*Math.sin(t/15 + x)})`); gr.addColorStop(1, `rgba(${r0},${g0},${b0},0)`);
    ctx.fillStyle = gr; ctx.fillRect(sx - 26, y - 26, 52, 52);
  }
  for (const sx0 of SCREENS) {
    const sx = sx0 + 40 - cx; if (sx < -80 || sx > W + 80) continue;
    ctx.fillStyle = 'rgba(94,200,242,.06)'; ctx.fillRect(sx - 40, 40, 80, 150);
  }
  for (const mx of MAINFRAME.concat([THRONE_X - 35])) {
    const sx = mx + 35 - cx; if (sx < -90 || sx > W + 90) continue;
    const gr = ctx.createRadialGradient(sx, 70, 4, sx, 70, 80);
    gr.addColorStop(0, 'rgba(61,220,132,.16)'); gr.addColorStop(1, 'rgba(61,220,132,0)');
    ctx.fillStyle = gr; ctx.fillRect(sx - 80, 0, 160, 190);
  }
  if (cx > 1200 && cx < 2600) { ctx.fillStyle = 'rgba(255,93,115,.035)'; ctx.fillRect(0, 50, W, 50); }
}
