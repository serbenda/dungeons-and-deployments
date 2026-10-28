// Etapa 3, La Nube: Archipiélago de Clústeres, Nubes Serverless, Torre de
// Facturación y la Cumbre. Mismo esquema que las demás etapas: canvas
// prerenderizado, decorado animado y luces aditivas.
'use strict';

/**
 * Zona de la etapa 3 según la x del mundo.
 * @param {number} x
 * @returns {'k8s'|'serverless'|'facturas'|'cumbre'}
 */
const ZONE3 = x => x < 1280 ? 'k8s' : x < 2560 ? 'serverless' : x < 3200 ? 'facturas' : 'cumbre';
/** Farolas de la pasarela y braseros dorados de la cumbre. */
const SKY_TORCHES = [180, 500, 820, 1140].map(x => ({ x, y:84, lamp:true }))
  .concat([2620, 2840, 3060].map(x => ({ x, y:96, brazier:true })))
  .concat([3300, 3560, 3800].map(x => ({ x, y:96, brazier:true })));
/** Timones de Kubernetes (giran) y símbolos λ de las nubes serverless. */
const HELMS = [260, 640, 1020];
const LAMBDAS = [1380, 1600, 1840, 2080, 2320];
const GATE_X = LEVEL_END + 160;
let LEVEL3 = null;

/**
 * Pinta una sola vez La Nube en un canvas grande (LEVEL3) con prng(2031).
 */
function buildSky(){
  const S = painter(LVW, 200), rnd = prng(2031);
  const pick = a => a[(rnd()*a.length) | 0];
  // cielo con degradado en bandas, distinto por zona
  const SKY = { k8s:['#14234a', '#1d3366', '#2a4a8a', '#3a64aa'], serverless:['#1e1a4a', '#2e2a6a', '#4a4290', '#6a62b0'],
    facturas:['#3a1a2a', '#6a2a3a', '#a8483a', '#e0884a'], cumbre:['#120c1e', '#24183a', '#3a2450', '#5a3460'] };
  for (let x = 0; x < LVW; x += 4) {
    const pal = SKY[ZONE3(x + 2)];
    for (let y = 0; y < 125; y += 2) { const k = Math.min(3, Math.floor(y/31 + ((x + y) % 4 === 0 ? .5 : 0))); S.rect(x, y, 4, 2, pal[k]); }
  }
  // estrellas y nubes lejanas
  for (let i = 0; i < 260; i++) { const x = rnd()*LVW; if (ZONE3(x) !== 'facturas') S.px(x, 4 + rnd()*50, pick(['#ffffff', '#c9d4e6', '#9fd0ff'])); }
  const cloud = (x, y, w, light, shade) => {
    for (let k = 0; k < 5; k++) S.ell(x + k*w*.22, y - Math.sin(k/4*Math.PI)*w*.18, w*.2, w*.12, shade);
    for (let k = 0; k < 5; k++) S.ell(x + k*w*.22, y - 2 - Math.sin(k/4*Math.PI)*w*.18, w*.18, w*.1, light);
  };
  for (let i = 0; i < 46; i++) { const x = rnd()*LVW, z = ZONE3(x); cloud(x, 60 + rnd()*50, 40 + rnd()*60, z === 'facturas' ? '#f4b880' : '#c9d4e6', z === 'facturas' ? '#a8584a' : '#7a8ab0'); }
  // --- ARCHIPIÉLAGO DE CLÚSTERES: islas flotantes con contenedores y pods
  for (let x = 60; x < 1280; x += 190) {
    const y = 70 + (x % 3)*8, w = 90;
    S.poly([[x, y], [x + w, y], [x + w - 16, y + 18], [x + w/2, y + 34], [x + 16, y + 18]], '#4a3a36');
    S.poly([[x, y], [x + w, y], [x + w - 10, y + 6], [x + 10, y + 6]], '#3a8a4a'); S.rect(x, y - 1, w, 2, '#5ac86a');
    for (let k = 0; k < 3; k++) { const cx = x + 10 + k*26, c = pick(['#326ce5', '#2b5f7d', '#5ec8f2', '#8a2c3c']); S.rect(cx, y - 14, 22, 13, c); S.rect(cx, y - 14, 22, 1, mix(c, .3)); for (let j = 3; j < 20; j += 3) S.rect(cx + j, y - 12, 1, 10, mix(c, -.25)); }
    for (let k = 0; k < 4; k++) { const px = x + 14 + k*20; S.poly([[px, y + 12], [px + 4, y + 10], [px + 8, y + 12], [px + 8, y + 16], [px + 4, y + 18], [px, y + 16]], '#326ce5'); }
  }
  // --- NUBES SERVERLESS: cúmulos grandes y cajas de función
  for (let x = 1290; x < 2560; x += 70) cloud(x, 112 - (x % 5)*3, 80 + (x % 4)*12, '#e9eefc', '#9aa8c8');
  for (let x = 1320; x < 2540; x += 150) { S.rect(x, 82, 34, 20, '#2c2440'); S.rect(x + 1, 83, 32, 18, '#3a3550'); S.rect(x + 1, 83, 32, 1, '#6a64a0'); }
  // --- TORRE DE FACTURACIÓN: muro dorado, pilas de monedas y etiquetas de precio
  for (let row = 0; row < 9; row++) {
    const y = 42 + row*9, off = row % 2 ? 12 : 0;
    for (let x = 2560 - off; x < LVW; x += 24) { const x0 = Math.max(2560, x); S.rect(x0, y, 24, 9, '#5a3a10'); S.rect(x0 + 1, y + 1, 22, 7, pick(['#c9a24a', '#b8913a', '#d4ad55'])); S.rect(x0 + 1, y + 1, 22, 1, '#f4d27a'); }
  }
  for (let x = 2590; x < 3200; x += 60) {
    const h = 3 + ((x/60) | 0) % 5;
    for (let k = 0; k < h; k++) { S.ell(x, 116 - k*4, 9, 3, '#a8722e'); S.ell(x, 115 - k*4, 8, 2, '#ffd23f'); }
  }
  for (let x = 2620; x < 3180; x += 140) { S.rect(x, 54, 40, 18, '#f5efe0'); S.rect(x, 54, 40, 2, '#ffffff'); S.disc(x + 4, 63, 2, '#5a3a10'); }
  // --- LA CUMBRE: arco dorado y el altar de la factura
  const G = GATE_X;
  S.rect(G - 70, 40, 14, 82, '#a8722e'); S.rect(G + 56, 40, 14, 82, '#a8722e'); S.rect(G - 74, 34, 148, 12, '#c9a24a'); S.rect(G - 74, 34, 148, 2, '#ffe07a');
  for (let k = -3; k <= 3; k++) S.disc(G + k*18, 40, 3, '#ffd23f');
  S.rect(G - 40, 100, 80, 22, '#5a3a10'); S.rect(G - 40, 100, 80, 2, '#ffd23f');
  // barandilla
  S.rect(0, 112, LVW, 2, '#8e97b5'); S.rect(0, 120, LVW, 2, '#5d6274');
  for (let x = 0; x < LVW; x += 16) S.rect(x, 112, 2, 10, '#8e97b5');
  S.rect(0, 122, LVW, 3, '#3a4052');
  // suelo por zonas
  const rows = [125, 131, 138, 146, 155, 165, 176, 188, 201];
  S.rect(0, 125, LVW, 75, '#2a2e3c');
  for (let r = 0; r < rows.length - 1; r++) {
    const y0 = rows[r], hh = rows[r + 1] - y0, tw = 24 + r*7, off = (r % 2)*tw/2;
    for (let x = -off; x < LVW; x += tw) {
      const x0 = Math.max(0, x), w = x + tw - x0, z = ZONE3(x0 + 2); if (w < 3) continue;
      if (z === 'k8s') { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, '#3a4052'); for (let gx = x0 + 3; gx < x0 + w - 1; gx += 4) S.rect(gx, y0 + 2, 1, hh - 3, '#26283a'); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#6a7290'); }
      else if (z === 'serverless') { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, pick(['#8a96b8', '#8290b0', '#929ec0'])); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#b8c4dc'); }
      else { S.rect(x0 + 1, y0 + 1, w - 1, hh - 1, pick(['#8a6a3a', '#7e6034', '#967442'])); S.rect(x0 + 1, y0 + 1, w - 1, 1, '#c9a24a'); }
    }
  }
  for (let i = 0; i < 220; i++) { const x = 1280 + rnd()*1280, y = 128 + rnd()*70; S.ell(x, y, 6 + rnd()*10, 2 + rnd()*3, '#c9d4e6'); }
  // farolas y braseros
  for (const tc of SKY_TORCHES) {
    if (tc.brazier) { S.rect(tc.x - 2, 104, 5, 20, '#5a3a10'); S.ell(tc.x, 104, 9, 4, '#a8722e'); S.ell(tc.x, 103, 8, 2, '#3a2410'); S.rect(tc.x - 6, 122, 13, 3, '#5a3a10'); }
    else { S.rect(tc.x - 1, 88, 3, 34, '#5d6274'); S.rect(tc.x - 5, 82, 11, 6, '#3a4052'); S.rect(tc.x - 4, 83, 9, 4, '#ffe07a'); }
  }
  LEVEL3 = toCanvas(S, false).c;
}

/**
 * Dibuja la parte visible de La Nube con su decorado animado: nubes que pasan,
 * timones girando, rayos, el contador de la factura y el arco de la cumbre.
 * @param {number} cx Posición de la cámara.
 */
function drawSky(cx){
  if (!LEVEL3) buildSky();
  ctx.drawImage(LEVEL3, cx, 0, W, H, 0, 0, W, H);
  // nubes que pasan por delante del cielo
  ctx.fillStyle = 'rgba(233,238,252,.5)';
  for (let i = 0; i < 6; i++) {
    const x = ((i*173 - t*.2*(1 + i % 3)) % (W + 120) + W + 120) % (W + 120) - 60, y = 20 + (i*13) % 30;
    ctx.beginPath(); ctx.ellipse(x, y, 30, 6, 0, 0, Math.PI*2); ctx.ellipse(x + 18, y - 4, 18, 5, 0, 0, Math.PI*2); ctx.fill();
  }
  // timones de Kubernetes
  for (const hx of HELMS) {
    const sx = hx - cx; if (sx < -40 || sx > W + 40) continue;
    ctx.strokeStyle = '#326ce5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx, 46, 14, 0, Math.PI*2); ctx.stroke();
    ctx.fillStyle = '#ffffff';
    for (let k = 0; k < 7; k++) { const a = t/60 + k/7*Math.PI*2; ctx.fillRect(Math.round(sx + Math.cos(a)*10) - 1, Math.round(46 + Math.sin(a)*10) - 1, 2, 2); ctx.fillRect(Math.round(sx + Math.cos(a)*16) - 1, Math.round(46 + Math.sin(a)*16) - 1, 3, 3); }
    ctx.fillStyle = '#326ce5'; ctx.beginPath(); ctx.arc(sx, 46, 4, 0, Math.PI*2); ctx.fill();
  }
  // nubes serverless: símbolos λ, rayos y cajas fn()
  for (const lx of LAMBDAS) {
    const sx = lx - cx; if (sx < -60 || sx > W + 60) continue;
    const ly = Math.round(34 + Math.sin(t/30 + lx)*3);
    ctx.strokeStyle = '#1a2a5a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx - 6, ly); ctx.lineTo(sx + 6, ly + 18); ctx.moveTo(sx, ly + 8); ctx.lineTo(sx - 6, ly + 18); ctx.stroke();
    ctx.strokeStyle = '#e9f8ff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 6, ly); ctx.lineTo(sx + 6, ly + 18); ctx.moveTo(sx, ly + 8); ctx.lineTo(sx - 6, ly + 18); ctx.stroke();
    if (((t + lx) % 400) < 6) { ctx.fillStyle = '#ffffff'; for (let k = 0; k < 6; k++) ctx.fillRect(Math.round(sx + 8 + (k % 2 ? 4 : -2)), 56 + k*8, 3, 8); }
  }
  for (let x = 1320; x < 2540; x += 150) { const sx = x - cx; if (sx > -40 && sx < W) txt((t >> 6) % 3 ? 'fn()' : 'COLD', sx + 4, 88, (t >> 6) % 3 ? '#3ddc84' : '#9fd0ff'); }
  // torre de facturación: etiquetas de precio y el total del mes
  const tags = ['$0,023/GB', '$0,045/H', 'EGRESS!', '$$$'];
  for (let x = 2620, i = 0; x < 3180; x += 140, i++) { const sx = x - cx; if (sx > -50 && sx < W) txt(tags[i % 4], sx + 8, 60, '#5a3a10'); }
  if (cx > 2300 && cx < 3400) {
    const total = 1200 + Math.floor((stageT || t)*3.7);
    r(100, 32, 120, 12, 'rgba(26,16,8,.7)'); txt('ESTE MES: ' + String(total).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' EUR', 160, 34, total > 9000 ? '#ff5d73' : '#ffd23f', { center:true });
  }
  // la cumbre
  { const sx = GATE_X - cx; if (sx > -120 && sx < W + 120) txt('FACTURACIÓN', sx, 36, '#5a3a10', { center:true }); }
}

/**
 * Luces propias de La Nube: farolas, el oro de la torre y los rayos.
 * @param {number} cx Posición de la cámara.
 */
function skyLights(cx){
  for (const lx of LAMBDAS) {
    const sx = lx - cx; if (sx < -80 || sx > W + 80) continue;
    if (((t + lx) % 400) < 6) { ctx.fillStyle = 'rgba(233,248,255,.25)'; ctx.fillRect(0, 0, W, H); }
  }
  if (cx > 2300) {
    const gr = ctx.createLinearGradient(0, 40, 0, 200);
    gr.addColorStop(0, 'rgba(255,210,63,.0)'); gr.addColorStop(1, 'rgba(255,210,63,.08)');
    ctx.fillStyle = gr; ctx.fillRect(0, 40, W, 160);
  }
}
