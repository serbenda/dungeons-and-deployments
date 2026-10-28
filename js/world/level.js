// Mazmorra prerenderizada por departamentos, decorado animado e iluminación.
'use strict';

/**
 * Departamento al que pertenece una coordenada x del mundo.
 * @param {number} x
 * @returns {'sistemas'|'network'|'storage'|'virtual'|'caas'|'guarida'}
 */
const ZONE1 = x => x < 640 ? 'sistemas' : x < 1280 ? 'network' : x < 1920 ? 'storage' : x < 2560 ? 'virtual' : x < 3200 ? 'caas' : 'guarida';
/**
 * Zona de una coordenada x en la etapa en curso.
 * @param {number} x
 * @returns {string}
 */
const ZONE = x => stageIdx === 2 ? ZONE3(x) : stageIdx === 1 ? ZONE2(x) : ZONE1(x);
const RACKS = [656, 756, 856, 956, 1056, 1156];
const RACK_LABELS = ['CORE', 'DMZ', 'VLAN 10', 'PROD', 'WIFI', 'VPN'];
const SHELVES = [1296, 1396, 1496, 1596, 1696, 1796];
const PILLARS = [1940, 2105, 2270, 2435];
const AS400X = LEVEL_END + 122;
/**
 * Antorchas y braseros: posición y si proyectan luz.
 */
const TORCHES = [150, 330, 510, 732, 932, 1132, 1390, 1590, 1790, 1951, 2116, 2281, 2446].map(x => ({ x, y:70 }))
  .concat([2640, 2860, 3080, 3290, 3540, 3800].map(x => ({ x, y:96, brazier:true })));
const POOLS = [[LEVEL_END - 160, 160, 26], [LEVEL_END + 90, 184, 22], [LEVEL_END + 280, 146, 18]];
const STORAGE_LEDS = [];
let LEVEL = null, VIG = null;
/**
 * Aclara (f > 0) u oscurece (f < 0) un color.
 * @param {string} hex
 * @param {number} f Entre -1 y 1.
 * @returns {string}
 */
function mix(hex, f){
  const [r0, g0, b0] = rgb(hex);
  const m = v => Math.max(0, Math.min(255, Math.round(f > 0 ? v + (255 - v)*f : v*(1 + f))));
  return '#' + [m(r0), m(g0), m(b0)].map(v => v.toString(16).padStart(2, '0')).join('');
}
/**
 * Pinta una sola vez toda la mazmorra en un canvas grande (LEVEL) y prepara la
 * viñeta de oscuridad (VIG). Usa prng(1993): la mazmorra es siempre igual.
 */
function buildLevel(){
  const S = painter(LVW, 200), rnd = prng(1993);
  const pick = a => a[(rnd()*a.length) | 0];
  // techo
  S.rect(0, 28, LVW, 14, '#0e0b16');
  for (let x = 0; x < LVW; x += 48) { S.rect(x, 28, 7, 14, '#1d1828'); S.rect(x + 1, 28, 2, 14, '#2a2338'); }
  S.rect(0, 40, LVW, 2, '#1a1524');
  // ladrillos de cada departamento
  const BR = {
    sistemas:{ pal:['#6b5850', '#64524a', '#725e55', '#5d4c45'], hi:'#86705f', lo:'#463833', mortar:'#2f2420' },
    network:{ pal:['#3e4a5e', '#394557', '#435066', '#344051'], hi:'#56647e', lo:'#252e3c', mortar:'#1a202b' },
    storage:{ pal:['#6a5a4a', '#625344', '#716050', '#5b4c3f'], hi:'#857260', lo:'#433629', mortar:'#2a2119' },
    virtual:{ pal:['#5a5c7c', '#545674', '#606283', '#4f516d'], hi:'#72749a', lo:'#3e405a', mortar:'#2a2b3e' },
    caas:{ pal:['#4e5058', '#484a52', '#55575f', '#43454c'], hi:'#666870', lo:'#2e3036', mortar:'#1f2024' }
  };
  S.rect(0, 42, LVW, 78, '#2f2420');
  for (let row = 0; row < 9; row++) {
    const y = 42 + row*9, off = row % 2 ? 11 : 0;
    for (let x = -off; x < LVW; x += 22) {
      const z = ZONE1(x + 11); if (z === 'guarida') continue;
      const b = BR[z];
      S.rect(x, y, 22, 9, b.mortar);
      S.rect(x + 1, y + 1, 20, 7, pick(b.pal)); S.rect(x + 1, y + 1, 20, 1, b.hi); S.rect(x + 1, y + 7, 20, 1, b.lo);
      if (rnd() < .25) S.px(x + 3 + rnd()*15, y + 3 + rnd()*3, b.lo);
      if (row >= 7 && rnd() < .3 && z !== 'caas') S.rect(x + 2 + rnd()*14, y + 6, 3 + rnd()*4, 2, '#4d6b3a');
    }
  }
  // cueva de la guarida
  const G0 = 3170;
  for (let i = 0; i < 900; i++) { const x = G0 + rnd()*(LVW - G0), y = 40 + rnd()*82; S.ell(x, y, 4 + rnd()*10, 3 + rnd()*6, pick(['#4a3a36', '#42332f', '#52403a', '#3a2d2a', '#5a4740'])); }
  for (let i = 0; i < 160; i++) { const x = G0 + rnd()*(LVW - G0), y = 42 + rnd()*76; S.rect(x, y, 3, 1, '#6e5a50'); }
  for (let x = G0 + 20; x < LVW; x += 14 + rnd()*20) { const l = 6 + rnd()*20; S.poly([[x, 40], [x + 9, 40], [x + 4, 40 + l]], pick(['#42332f', '#4a3a36', '#3a2d2a'])); S.px(x + 3, 41, '#6e5a50'); }
  // zócalo
  S.rect(0, 118, LVW, 7, '#4a3b34'); S.rect(0, 118, LVW, 1, '#7a6455'); S.rect(0, 124, LVW, 1, '#22191a');
  for (let x = 2560; x < 3200; x += 12) { S.rect(x, 119, 6, 5, '#ffd23f'); S.rect(x + 6, 119, 6, 5, '#1a1626'); }
  // suelo
  S.rect(0, 125, LVW, 75, '#2a1f1b');
  const rows = [125, 131, 138, 146, 155, 165, 176, 188, 201];
  const FL = {
    network:{ pal:['#3a4456', '#353f50', '#3f4a5d', '#313a4a'], hi:'#52607a', cr:'#222a36' },
    storage:{ pal:['#6a5a50', '#62534a', '#715f55', '#5b4d45'], hi:'#86725f', cr:'#3a2e2a' },
    virtual:{ pal:['#5c5a76', '#56546f', '#62607d', '#514f69'], hi:'#7a7898', cr:'#3a3a52' }
  };
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], hh = rows[r + 1] - y0, tw = 20 + r*7, off = (r % 2)*tw/2;
    for (let x = -off; x < LVW; x += tw) {
      const f = FL[ZONE1(x + tw/2)];
      if (!f || x + tw <= 640) continue;
      S.rect(x + 1, y0 + 1, tw - 1, hh - 1, pick(f.pal));
      S.rect(x + 1, y0 + 1, tw - 1, 1, f.hi);
      if (rnd() < .15) S.line(x + 4, y0 + 2, x + 4 + rnd()*10, y0 + hh - 2, 1, f.cr);
    }
  }
  // tablones de la sala de guardia
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], hh = rows[r + 1] - y0;
    let x = -(rnd()*40) | 0;
    while (x < 640) {
      const len = Math.min(34 + rnd()*40 + r*6, 640 - x);
      if (len < 4) break;
      S.rect(x + 1, y0, len - 1, hh - 1, pick(['#b07a48', '#a87244', '#b9824e', '#9e6a3e']));
      S.rect(x + 1, y0, len - 1, 1, '#cf9a62'); S.rect(x + 1, y0 + hh - 2, len - 1, 1, '#8a5a32');
      for (let g = 0; g < 2; g++) S.rect(x + 4 + rnd()*Math.max(1, len - 10), y0 + 2 + rnd()*(hh - 4), 4 + rnd()*6, 1, '#96633a');
      S.px(x + 3, y0 + (hh >> 1), '#5a3a20'); S.px(x + len - 4, y0 + (hh >> 1), '#5a3a20');
      x += len;
    }
  }
  S.rect(638, 125, 4, 75, '#4a3b34');
  // planchas de metal de la forja de contenedores
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], hh = rows[r + 1] - y0, tw = 30 + r*6, off = (r % 2)*tw/2;
    for (let x = 2560 - off; x < 3200; x += tw) {
      const x0 = Math.max(2560, x), w = Math.min(x + tw, 3200) - x0; if (w < 3) continue;
      S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, pick(['#5a5c66', '#55575f', '#60626c', '#4f5159']));
      S.rect(x0 + 1, y0 + 1, w - 1, 1, '#7a7c86');
      S.px(x0 + 2, y0 + 2, '#8a8c96'); S.px(x0 + w - 2, y0 + 2, '#8a8c96');
    }
  }
  // suelo de la cueva
  for (let i = 0; i < 1500; i++) { const x = G0 + rnd()*(LVW - G0), y = 126 + rnd()*74; S.ell(x, y, 3 + rnd()*9, 1.5 + rnd()*3, pick(['#46362f', '#3e302a', '#4e3c34', '#56443a'])); }
  for (const [x, y, rr] of POOLS) { S.ell(x, y, rr + 3, rr*.25 + 2, '#14251e'); S.ell(x, y, rr, rr*.22, '#1f5a44'); S.ell(x - 3, y - 1, rr*.6, rr*.1, '#3aa678'); }

  // --- SISTEMAS: portón, estandartes, hornacinas, kanban, pergamino y puestos de guardia
  S.ell(74, 58, 44, 18, '#3b3552'); S.rect(30, 58, 88, 66, '#3b3552');
  S.ell(74, 60, 38, 15, '#07060b'); S.rect(36, 60, 76, 64, '#07060b');
  for (let x = 40; x < 110; x += 7) { S.rect(x, 50, 2, 70, '#4b4470'); S.px(x, 52, '#7a70ad'); S.rect(x - 1, 118, 4, 3, '#4b4470'); }
  for (const y of [70, 94]) S.rect(36, y, 76, 2, '#4b4470');
  const banner = (bx, col, colS, colL) => {
    S.rect(bx - 2, 44, 28, 2, '#6b4a26'); S.px(bx - 3, 44, '#f4b860'); S.px(bx + 26, 44, '#f4b860');
    S.rect(bx, 46, 24, 40, col); S.rect(bx + 18, 46, 6, 40, colS); S.rect(bx + 1, 47, 2, 38, colL);
    S.poly([[bx, 86], [bx + 12, 94], [bx + 24, 86]], col);
    S.disc(bx + 12, 62, 7, '#a8722e'); S.disc(bx + 12, 62, 5.5, col);
    for (const [x, y] of [[-2,-2],[-3,-1],[-3,0],[-3,1],[-2,2],[2,-2],[3,-1],[3,0],[3,1],[2,2]]) S.px(bx + 12 + x, 62 + y, '#f4b860');
    S.rect(bx + 2, 84, 20, 1, '#f4b860');
  };
  banner(236, '#8a2c3c', '#661f2b', '#a8394a'); banner(426, '#8a2c3c', '#661f2b', '#a8394a');
  banner(2193, '#2b5f7d', '#1f4660', '#3f7fa3'); banner(2358, '#2b5f7d', '#1f4660', '#3f7fa3');
  for (const nx of [176, 366, 566]) {
    S.ell(nx + 9, 66, 10, 7, '#3b3552'); S.rect(nx - 1, 66, 20, 24, '#3b3552');
    S.ell(nx + 9, 66, 8, 6, '#0b0912'); S.rect(nx + 1, 66, 16, 22, '#0b0912');
    S.disc(nx + 9, 79, 4, '#d8cfb4'); S.rect(nx + 7, 82, 5, 3, '#d8cfb4'); S.px(nx + 7, 78, '#0b0912'); S.px(nx + 10, 78, '#0b0912'); S.px(nx + 8, 81, '#8d8468');
    S.rect(nx + 3, 82, 2, 6, '#ece6f6'); S.rect(nx - 1, 88, 20, 2, '#4b4470');
  }
  S.rect(268, 50, 54, 34, '#6b4a26'); S.rect(270, 52, 50, 30, '#b8915a');
  S.rect(286, 58, 1, 23, '#8a6a3a'); S.rect(303, 58, 1, 23, '#8a6a3a');
  for (const [x, y, c] of [[272, 60, '#ffd23f'], [274, 68, '#ff8a9a'], [289, 61, '#7ed36a'], [291, 70, '#ffd23f'], [306, 60, '#9fd0ff'], [308, 67, '#7ed36a'], [306, 74, '#9fd0ff']]) { S.rect(x, y, 9, 6, c); S.px(x + 4, y, '#c43d1a'); }
  S.rect(578, 50, 58, 40, '#e6dcc0'); S.rect(578, 50, 58, 2, '#c9b98f'); S.rect(578, 88, 58, 2, '#c9b98f');
  for (const [x, y] of [[578, 51], [636, 51], [578, 89], [636, 89]]) S.disc(x, y, 3, '#c9b98f');
  for (const dx of [196, 452]) {
    S.rect(dx + 20, 102, 16, 14, '#3a3550'); S.rect(dx + 20, 102, 16, 2, '#5b5580'); S.rect(dx + 26, 116, 4, 6, '#26223a'); S.rect(dx + 21, 121, 14, 2, '#26223a');
    S.rect(dx, 96, 58, 6, '#b07a48'); S.rect(dx, 96, 58, 1, '#cf9a62'); S.rect(dx, 101, 58, 1, '#7a5230');
    S.rect(dx + 2, 102, 3, 22, '#7a5230'); S.rect(dx + 53, 102, 3, 22, '#7a5230');
    S.rect(dx + 16, 76, 26, 19, '#c9c4ba'); S.rect(dx + 16, 76, 26, 1, '#ece6f6'); S.rect(dx + 18, 78, 22, 14, '#1e5bb8');
    S.rect(dx + 27, 95, 4, 1, '#8d8468');
    S.rect(dx + 46, 91, 6, 5, '#4b4470'); S.rect(dx + 52, 92, 2, 3, '#4b4470'); S.rect(dx + 47, 91, 4, 1, '#857bb5');
    S.rect(dx + 4, 90, 7, 6, '#c27a4a'); S.disc(dx + 7, 86, 4, '#4caf50'); S.disc(dx + 5, 84, 2, '#7ed36a');
  }
  // --- NETWORK: racks, switches y cables colgando
  S.rect(640, 42, 640, 3, '#3a4456'); S.rect(640, 42, 640, 1, '#56647e');
  for (const rx of RACKS) {
    S.rect(rx, 45, 52, 75, '#14161d'); S.rect(rx, 45, 2, 75, '#2a3040'); S.rect(rx + 50, 45, 2, 75, '#0a0b10');
    for (let j = 0; j < 7; j++) {
      const y = 50 + j*9;
      S.rect(rx + 4, y, 44, 7, '#1f2430'); S.rect(rx + 4, y, 44, 1, '#323a4c');
      for (let q = 0; q < 8; q++) S.rect(rx + 7 + q*5, y + 3, 3, 2, '#0a0b10');
    }
  }
  for (let i = 0; i < RACKS.length - 1; i++) {
    const a = RACKS[i] + 50, b = RACKS[i + 1] + 2;
    for (const [col, sag, y0] of [['#2b6fd6', 18, 53], ['#ffd23f', 12, 62], ['#c43d1a', 24, 71], ['#3ddc84', 9, 89]]) {
      let px = a, py = y0;
      for (let k = 1; k <= 12; k++) { const x = a + (b - a)*k/12, y = y0 + Math.sin(k/12*Math.PI)*sag; S.line(px, py, x, y, 1, col); px = x; py = y; }
    }
  }
  // --- STORAGE: estanterías con cintas, discos y cajas
  for (const sx of SHELVES) {
    S.rect(sx, 46, 4, 74, '#6b4a26'); S.rect(sx + 80, 46, 4, 74, '#6b4a26'); S.rect(sx, 46, 84, 3, '#7a5230');
    for (let j = 0; j < 4; j++) {
      const y = 64 + j*18;
      let x = sx + 6;
      while (x < sx + 70) {
        const kind = rnd();
        if (kind < .45) { S.disc(x + 5, y - 6, 5, '#2a2a33'); S.disc(x + 5, y - 6, 3.5, '#8e97b5'); S.disc(x + 5, y - 6, 1.2, '#2a2a33'); x += 11; }
        else if (kind < .75) { S.rect(x, y - 10, 9, 10, '#5d6274'); S.rect(x, y - 10, 9, 1, '#8a90a6'); STORAGE_LEDS.push([x + 2, y - 3]); x += 10; }
        else { S.rect(x, y - 13, 12, 13, '#a8723e'); S.rect(x, y - 13, 12, 2, '#c9935c'); S.rect(x + 3, y - 8, 6, 3, '#f2ecdc'); x += 13; }
      }
      S.rect(sx, y, 84, 3, '#8a5a2a'); S.rect(sx, y, 84, 1, '#b07a48');
    }
  }
  // --- VIRTUALIZACIÓN: columnas y vidrieras
  for (const px of PILLARS) {
    const wx = px + 82;
    S.rect(wx - 18, 52, 36, 50, '#55527a'); S.ell(wx, 52, 18, 12, '#55527a');
    S.rect(wx - 15, 52, 30, 48, '#16233f'); S.ell(wx, 52, 15, 10, '#16233f');
    for (const [x, y, ww, hh, c] of [[-14, 58, 13, 14, '#2b4a7a'], [1, 58, 13, 14, '#3a2c5a'], [-14, 74, 13, 24, '#1f3a63'], [1, 74, 13, 24, '#2b4a7a'], [-8, 44, 16, 13, '#3a5a8a']]) S.rect(wx + x, y + 1, ww, hh, c);
    S.rect(wx - 1, 42, 2, 58, '#0b0912'); S.rect(wx - 15, 72, 30, 2, '#0b0912');
    for (const [x, y] of [[-5, 48], [5, 48], [0, 46]]) S.px(wx + x, y, '#5ec8f2');
    S.rect(px, 40, 22, 84, '#4a4766'); S.rect(px + 16, 40, 6, 84, '#38364f'); S.rect(px + 2, 40, 2, 84, '#6a6790');
    for (let y = 50; y < 112; y += 12) S.rect(px, y, 22, 1, '#38364f');
    S.rect(px - 4, 42, 30, 7, '#5d5a84'); S.rect(px - 4, 42, 30, 1, '#7a77a6'); S.rect(px - 4, 112, 30, 8, '#5d5a84'); S.rect(px - 4, 112, 30, 1, '#7a77a6');
  }
  // --- CAAS: contenedores apilados y grúa
  const container = (x, y, c) => {
    S.rect(x, y, 60, 26, mix(c, -.35)); S.rect(x + 1, y + 1, 58, 24, c); S.rect(x + 1, y + 1, 58, 1, mix(c, .3));
    for (let i = 4; i < 50; i += 4) S.rect(x + i, y + 3, 1, 20, mix(c, -.2));
    S.rect(x + 50, y + 3, 1, 21, mix(c, -.45)); S.rect(x + 54, y + 4, 1, 18, mix(c, .25)); S.rect(x + 57, y + 4, 1, 18, mix(c, .25));
    for (const [cx, cy] of [[x, y], [x + 57, y], [x, y + 23], [x + 57, y + 23]]) S.rect(cx, cy, 3, 3, '#1a1626');
  };
  const CONT = ['#2b5f7d', '#8a2c3c', '#2f7a5a', '#a8561f', '#5b3fa8'];
  for (let x = 2572; x < 3180; x += 64) { container(x, 92, pick(CONT)); if (rnd() < .7) container(x + (rnd() < .5 ? 0 : 6), 66, pick(CONT)); }
  S.rect(2560, 44, 640, 5, '#ffd23f'); for (let x = 2560; x < 3200; x += 10) S.poly([[x, 49], [x + 5, 44], [x + 9, 44], [x + 4, 49]], '#1a1626');
  for (let y = 49; y < 74; y += 3) S.rect(2899, y, 2, 2, '#8e97b5');
  S.line(2900, 74, 2900, 80, 2, '#8e97b5'); S.line(2900, 80, 2894, 84, 2, '#8e97b5'); S.line(2894, 84, 2890, 80, 2, '#8e97b5');
  // --- GUARIDA DE AUTOMATION: tesoro, servidores olvidados y el núcleo de Automation
  for (let i = 0; i < 70; i++) {
    const x = G0 + 40 + rnd()*(LVW - G0 - 80), rr = 6 + rnd()*12;
    if (x > AS400X - 30 && x < AS400X + 100) continue;
    S.ell(x, 121, rr, rr*.45, pick(['#a8722e', '#c98a2a', '#8a5a1e']));
    for (let j = 0; j < rr; j++) S.px(x - rr + rnd()*rr*2, 121 - rnd()*rr*.4, pick(['#f4b860', '#ffd27a', '#fff3c4']));
  }
  for (const sx of [3270, 3420, 3570, 3780]) { S.rect(sx, 102, 20, 16, '#2c2440'); S.rect(sx, 102, 20, 2, '#4b4470'); for (let j = 0; j < 3; j++) S.rect(sx + 3, 106 + j*4, 14, 2, '#1a1524'); S.ell(sx + 24, 114, 4, 3, '#d8cfb4'); S.px(sx + 23, 113, '#0b0912'); }
  const A = AS400X;
  S.rect(A - 16, 36, 100, 12, '#2a2e3c'); S.rect(A - 16, 36, 100, 1, '#5d6274'); S.rect(A - 14, 38, 96, 8, '#123a24');
  S.rect(A - 6, 48, 80, 70, '#3a4052'); S.rect(A - 6, 48, 2, 70, '#5d6274'); S.rect(A + 72, 48, 2, 70, '#26283a');
  S.rect(A - 2, 52, 72, 48, '#0a120d'); S.rect(A - 2, 52, 72, 1, '#1f7a46');
  S.disc(A + 34, 108, 7, '#5d6274'); for (let i = 0; i < 8; i++) { const an = i/8*Math.PI*2; S.rect(A + 34 + Math.cos(an)*8 - 1, 108 + Math.sin(an)*8 - 1, 3, 3, '#5d6274'); } S.disc(A + 34, 108, 3, '#26283a');
  for (const sx2 of [A - 4, A + 62]) { S.rect(sx2, 102, 10, 14, '#26283a'); S.rect(sx2 + 2, 104, 6, 2, '#3ddc84'); S.rect(sx2 + 2, 108, 6, 2, '#3ddc84'); }
  S.rect(A - 20, 118, 108, 7, '#3a4052'); S.rect(A - 20, 118, 108, 1, '#6a7290');
  // soportes de antorchas y braseros
  for (const tc of TORCHES) {
    if (tc.brazier) { S.rect(tc.x - 2, 104, 5, 20, '#3d3754'); S.ell(tc.x, 104, 9, 4, '#4b4470'); S.ell(tc.x, 103, 8, 2, '#1a1524'); S.rect(tc.x - 6, 122, 13, 3, '#3d3754'); }
    else { S.rect(tc.x - 1, 76, 3, 10, '#4b4470'); S.rect(tc.x - 3, 74, 7, 3, '#6b4a26'); S.px(tc.x - 3, 74, '#a8723e'); }
  }
  LEVEL = toCanvas(S, false).c;
  VIG = mkCanvas(W, H);
  const g = VIG.getContext('2d');
  const gr = g.createRadialGradient(W/2, 120, 60, W/2, 120, 230);
  gr.addColorStop(0, 'rgba(6,4,12,0)'); gr.addColorStop(1, 'rgba(6,4,12,.5)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

/**
 * Dibuja la parte visible de la mazmorra y su decorado animado (LED, pantallas,
 * núcleo de Automation...).
 * @param {number} cx Posición de la cámara.
 */
function drawLevel(cx){
  if (stageIdx === 1) return drawCaves(cx);
  if (stageIdx === 2) return drawSky(cx);
  if (!LEVEL) buildLevel();
  ctx.drawImage(LEVEL, cx, 0, W, H, 0, 0, W, H);
  // pantallas de la sala de guardia
  for (const dx of [196, 452]) {
    const sx = dx - cx; if (sx < -60 || sx > W) continue;
    ctx.fillStyle = '#3f8ff0'; ctx.fillRect(sx + 20, 80, 18, 2);
    for (let j = 0; j < 4; j++) { ctx.fillStyle = ((t >> 4) + j + dx) % 3 ? '#9fd0ff' : '#6ee7a8'; ctx.fillRect(sx + 20, 84 + j*2, 4 + ((j*7 + (t >> 5)) % 12), 1); }
  }
  { const kx = 268 - cx; if (kx > -60 && kx < W) txt('KANBAN', kx + 3, 51, '#3a2a1a'); }
  { const px2 = 578 - cx; if (px2 > -70 && px2 < W) { txt('NO', px2 + 21, 54, '#8a2c3c'); txt('DEPLOY', px2 + 5, 65, '#3a2a1a'); txt('VIERNES', px2 + 1, 77, '#8a2c3c'); } }
  // ledes de los switches y paquetes por la bandeja
  RACKS.forEach((rx, i) => {
    const sx = rx - cx; if (sx < -60 || sx > W + 10) return;
    for (let j = 0; j < 7; j++) for (let q = 0; q < 8; q++) {
      const on = ((t >> 3) + q*7 + j*3 + i*5) % 9;
      if (on < 5) { ctx.fillStyle = on === 0 ? '#ffd23f' : '#3ddc84'; ctx.fillRect(sx + 7 + q*5, 53 + j*9, 1, 1); }
    }
    const lb = RACK_LABELS[i], w = lb.length*8 + 6, x = sx + 26 - w/2;
    r(x, 110, w, 10, '#1a202b'); r(x, 110, w, 1, '#56647e'); txt(lb, x + 3, 111, lb === 'PROD' ? '#ff5d73' : '#9fd0ff');
  });
  if (cx > 330 && cx < 1290) {
    for (let i = 0; i < 9; i++) { const wx = 640 + ((t*2 + i*73) % 640), sx = wx - cx; if (sx < 0 || sx > W) continue; ctx.fillStyle = ['#ffd23f', '#3ddc84', '#5ec8f2'][i % 3]; ctx.fillRect(sx, 43, 3, 1); }
  }
  // actividad de los discos
  for (let i = 0; i < STORAGE_LEDS.length; i++) {
    const [x, y] = STORAGE_LEDS[i], sx = x - cx; if (sx < -4 || sx > W) continue;
    ctx.fillStyle = ((t >> 2) + i*13) % 7 < 2 ? '#ffd23f' : '#5a4a20'; ctx.fillRect(sx, y, 2, 1);
  }
  // núcleo de Automation: cola de jobs en directo
  const ax = AS400X - cx;
  if (ax > -110 && ax < W + 20) {
    txt('AUTOMATION', ax - 6, 38, '#3ddc84');
    for (let j = 0; j < 7; j++) {
      const y = 55 + j*6, seed = j*37 + (t >> 6);
      const st2 = (seed*7) % 10, col = st2 < 6 ? '#3ddc84' : st2 < 8 ? '#ffd23f' : '#ff5d73';
      ctx.fillStyle = col; ctx.fillRect(ax + 1, y, 5, 4);
      ctx.fillStyle = '#1f3a2a'; ctx.fillRect(ax + 9, y + 1, 56, 2);
      const prog = st2 < 6 ? 56 : st2 < 8 ? ((t*.5 + j*13) % 56) : 20 + (j*7) % 20;
      ctx.fillStyle = col; ctx.fillRect(ax + 9, y + 1, Math.round(prog), 2);
    }
    if ((t >> 4) % 2) { ctx.fillStyle = '#3ddc84'; ctx.fillRect(ax + 2, 97, 4, 1); }
  }
}

/**
 * Dibuja la viñeta y suma la luz de antorchas, ácido y vidrieras con mezcla
 * aditiva ('lighter'). Después, las llamas y el polvo en suspensión.
 * @param {number} cx Posición de la cámara.
 */
function drawLights(cx){
  ctx.globalCompositeOperation = 'source-over';
  ctx.drawImage(VIG, 0, 0);
  ctx.globalCompositeOperation = 'lighter';
  const cave = stageIdx > 0, torches = stageIdx === 2 ? SKY_TORCHES : cave ? CAVE_TORCHES : TORCHES;
  if (stageIdx === 1) caveLights(cx);
  if (stageIdx === 2) skyLights(cx);
  for (const tc of torches) {
    const sx = tc.x - cx; if (sx < -90 || sx > W + 90) continue;
    const fl = .8 + .2*Math.sin(t*.3 + tc.x) + Math.random()*.06;
    const gr = ctx.createRadialGradient(sx, tc.y, 2, sx, tc.y + 10, 84);
    gr.addColorStop(0, 'rgba(255,180,100,' + (.34*fl) + ')'); gr.addColorStop(.4, 'rgba(255,130,60,' + (.13*fl) + ')'); gr.addColorStop(1, 'rgba(255,100,40,0)');
    ctx.fillStyle = gr; ctx.fillRect(sx - 90, tc.y - 80, 180, 190);
  }
  for (const [x, y, rr] of cave ? [] : POOLS) {
    const sx = x - cx; if (sx < -60 || sx > W + 60) continue;
    const gr = ctx.createRadialGradient(sx, y, 2, sx, y, rr*2.4);
    gr.addColorStop(0, 'rgba(110,231,168,' + (.2 + .06*Math.sin(t/12 + x)) + ')'); gr.addColorStop(1, 'rgba(110,231,168,0)');
    ctx.fillStyle = gr; ctx.fillRect(sx - rr*2.5, y - rr*2, rr*5, rr*4);
  }
  for (const px of cave ? [] : PILLARS) {
    const wx = px + 82 - cx; if (wx < -60 || wx > W + 80) continue;
    ctx.fillStyle = 'rgba(94,200,242,.06)';
    ctx.beginPath(); ctx.moveTo(wx - 14, 56); ctx.lineTo(wx + 14, 56); ctx.lineTo(wx + 44, 188); ctx.lineTo(wx + 4, 188); ctx.closePath(); ctx.fill();
  }
  if (boss && (boss.state === 'breath' || boss.state === 'breathWind')) {
    const mx = boss.x + boss.face*80 - cx, my = boss.y - 70;
    const gr = ctx.createRadialGradient(mx, my, 4, mx, my, 120);
    gr.addColorStop(0, 'rgba(110,231,168,.35)'); gr.addColorStop(1, 'rgba(110,231,168,0)');
    ctx.fillStyle = gr; ctx.fillRect(mx - 130, my - 120, 260, 240);
  }
  for (const f of fx) if (f.glow) {
    const sx = f.x - cx;
    ctx.fillStyle = f.glow; ctx.globalAlpha = Math.min(1, f.life/20)*.5;
    ctx.fillRect(Math.round(sx - 2), Math.round(f.y - 2), 5, 5);
    ctx.globalAlpha = 1;
  }
  ctx.globalCompositeOperation = 'source-over';
  // llamas por encima de la luz
  for (const tc of torches) {
    const sx = tc.x - cx; if (tc.lamp || sx < -20 || sx > W + 20) continue;
    const fsp = flameSprite(((t >> 3) + tc.x) % 3);
    ctx.drawImage(fsp.c, Math.round(sx - 7), Math.round(tc.y - (tc.brazier ? 8 : 12)));
  }
  // motas de polvo
  ctx.fillStyle = 'rgba(255,214,160,.35)';
  for (let i = 0; i < 18; i++) { const x = ((i*53 + t*.15*(1 + i % 3)) % (W + 20)) - 10, y = 46 + ((i*37 + Math.sin(t/60 + i)*8) % 120); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
}
