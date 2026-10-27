// Sprites del gólem, el dragón, los objetos y los enemigos no humanoides.
'use strict';

/**
 * Pinta el Gólem Hipervisor.
 * @param {object} S Pintor.
 * @param {string} pose walk0, walk1, charge, roar, rest o down.
 * @param {boolean} angry Runas rojas cuando está enfadado.
 */
function paintGolem(S, pose, angry){
  const st = '#a99f86', sS = '#766c58', sL = '#d6cdb2', cr = '#4b4438', rune = angry ? '#ff5d73' : '#6ee7a8', moss = '#4f6b3a';
  if (pose === 'down') {
    S.ell(42, 70, 30, 8, sS); S.ell(44, 67, 27, 8, st); S.ell(50, 63, 10, 3, sL);
    S.rect(66, 62, 13, 11, st); S.rect(67, 63, 11, 2, sL); S.rect(73, 66, 3, 2, '#4b4438');
    S.rect(10, 66, 16, 7, sS); S.disc(12, 69, 5, sS);
    for (let i = 0; i < 3; i++) S.rect(36 + i*6, 66, 2, 2, angry ? '#8a2c3c' : '#2f7a5a');
    return;
  }
  const w = pose === 'walk1' ? 2 : 0, ln = pose === 'charge' ? 6 : pose === 'rest' ? 3 : 0;
  S.rect(29 - w, 56, 11, 18, sS); S.rect(27 - w, 71, 15, 6, sS);
  if (pose === 'charge') { S.line(34, 34, 18, 44, 9, sS); S.disc(16, 46, 6, sS); }
  else if (pose === 'roar') { S.line(34, 32, 28, 10, 9, sS); S.disc(28, 8, 6, sS); }
  else { S.line(32, 34, 25, 58, 9, sS); S.disc(25, 61, 6, sS); }
  S.ell(42 + ln, 43, 22, 19, sS);
  S.ell(44 + ln, 41, 20, 17, st);
  S.ell(49 + ln, 33, 8, 5, sL);
  S.line(30 + ln, 36, 36 + ln, 46, 1, cr); S.line(36 + ln, 46, 33 + ln, 53, 1, cr); S.line(54 + ln, 47, 58 + ln, 54, 1, cr);
  S.rect(25 + ln, 31, 5, 2, moss); S.rect(27 + ln, 33, 3, 1, moss); S.rect(55 + ln, 54, 4, 2, moss);
  const cx = 44 + ln, cy = 42;
  for (const [x, y] of [[-5,-2],[-6,-1],[-6,0],[-6,1],[-5,2],[5,-2],[6,-1],[6,0],[6,1],[5,2]]) S.px(cx + x, cy + y, rune);
  for (let i = 0; i < 3; i++) S.rect(cx - 4 + i*3, cy + 8, 2, 2, rune);
  S.rect(52 + ln, 17, 16, 13, sS); S.rect(52 + ln, 16, 15, 12, st); S.rect(53 + ln, 17, 13, 2, sL);
  S.rect(57 + ln, 21, 9, 1, cr); S.rect(61 + ln, 23, 4, 2, rune);
  S.rect(46 + w, 56, 12, 18, st); S.rect(45 + w, 71, 16, 6, st); S.rect(47 + w, 57, 3, 14, sL);
  if (pose === 'charge') { S.line(52, 34, 68, 46, 10, st); S.disc(70, 48, 7, st); S.px(68, 45, sL); }
  else if (pose === 'roar') { S.line(54, 30, 62, 8, 10, st); S.disc(62, 6, 7, st); S.px(60, 4, sL); }
  else { S.line(54, 34, 62, 56, 10, st); S.disc(62, 59, 7, st); S.px(60, 56, sL); S.px(61, 55, sL); }
}
/**
 * Sprite de una fuga de memoria (slime).
 * @param {boolean} small Mini leak.
 * @param {string} pose n, wind, jump o flat.
 * @returns {object}
 */
function slimeSprite(small, pose){
  const sz = small ? 7 : 11;
  return sprite('slime|' + small + '|' + pose, 40, 36, S => {
    const wx = pose === 'wind' ? 1.35 : pose === 'jump' ? .8 : pose === 'flat' ? 1.6 : 1, wy = pose === 'wind' ? .7 : pose === 'jump' ? 1.3 : pose === 'flat' ? .45 : 1;
    const rx = sz*wx, ry = sz*.85*wy, cy = 33 - ry;
    S.ell(20, cy, rx, ry, '#2f7a5a');
    S.ell(20.5, cy - 1, rx - 1.2, ry - 1.2, '#6ee7a8');
    S.ell(17, cy - ry*.45, rx*.35, ry*.25, '#d8fff0');
    for (const [x, y] of [[-4, 3], [3, 4], [-1, 6], [5, 1]]) if (Math.abs(x) < rx - 2 && y < ry) S.px(20 + x*sz/11, cy + y*sz/11, '#3aa678');
    if (pose !== 'flat') { const ey = cy - ry*.1; S.rect(22, ey - 1, 2, 3, OUTLINE); S.rect(26 - (small ? 1 : 0), ey - 1, 2, 3, OUTLINE); S.px(22, ey - 1, '#ffffff'); S.px(26 - (small ? 1 : 0), ey - 1, '#ffffff'); if (pose === 'jump' || pose === 'wind') S.rect(23, ey + 3, 3, 1, OUTLINE); }
    else { S.px(22, cy, OUTLINE); S.px(25, cy, OUTLINE); }
  });
}
/**
 * Sprite del murciélago de paquetes perdidos (con su sobre).
 * @param {number} f Fotograma de aleteo (0 o 1).
 * @returns {object}
 */
function batSprite(f){
  return sprite('bat|' + f, 40, 30, S => {
    const up = f === 0;
    S.poly(up ? [[20, 14], [4, 2], [7, 10], [2, 14], [10, 15]] : [[20, 14], [3, 20], [8, 18], [4, 25], [12, 18]], '#2c2440');
    S.poly(up ? [[20, 14], [36, 2], [33, 10], [38, 14], [30, 15]] : [[20, 14], [37, 20], [32, 18], [36, 25], [28, 18]], '#2c2440');
    S.line(20, 14, up ? 5 : 4, up ? 4 : 21, 1, '#4b4470'); S.line(20, 14, up ? 35 : 36, up ? 4 : 21, 1, '#4b4470');
    S.ell(20, 15, 5, 6, '#3d3358'); S.ell(21, 14, 3, 3, '#574a7a');
    S.poly([[16, 10], [17, 5], [19, 9]], '#3d3358'); S.poly([[24, 10], [23, 5], [21, 9]], '#3d3358');
    S.px(18, 13, '#ff5d73'); S.px(22, 13, '#ff5d73'); S.px(19, 17, '#ece6f6'); S.px(21, 17, '#ece6f6');
    S.rect(15, 21, 10, 7, '#ece6f6'); S.line(15, 21, 20, 25, 1, '#8d8468'); S.line(25, 21, 20, 25, 1, '#8d8468'); S.rect(15, 27, 10, 1, '#c9c4ba');
  });
}
/**
 * Sprite de la VM huérfana (fantasma con pantalla).
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function ghostSprite(f){
  return sprite('ghost|' + f, 36, 44, S => {
    const w = f ? 1 : -1;
    S.disc(18, 14, 10, '#b9b4ff'); S.rect(8, 14, 21, 18, '#b9b4ff');
    for (let i = 0; i < 4; i++) S.poly([[8 + i*5.2, 31], [10.6 + i*5.2 + w, 38 + (i % 2)*2], [13.2 + i*5.2, 31]], '#b9b4ff');
    S.ell(14, 18, 4, 10, '#8a84d6'); S.ell(21, 10, 4, 3, '#e8e6ff');
    S.rect(19, 13, 3, 4, '#2c2440'); S.rect(25, 13, 3, 4, '#2c2440'); S.px(19, 13, '#ffffff'); S.px(25, 13, '#ffffff');
    S.ell(23, 21, 3, 2, '#2c2440');
    S.rect(14, 24, 12, 5, '#2c2440'); S.rect(15, 25, 10, 3, '#5ec8f2'); S.px(16, 26, '#ece6f6'); S.px(18, 26, '#ece6f6');
  });
}
/**
 * Sprite del mímico de disco lleno.
 * @param {number} open 1 con la boca abierta, 0 disfrazado de cofre.
 * @returns {object}
 */
function mimicSprite(open){
  return sprite('mimic|' + open, 34, 34, S => {
    if (!open) {
      S.rect(4, 15, 26, 16, '#7a4a20'); S.ell(17, 15, 13, 6, '#8a5a2a'); S.rect(4, 15, 26, 2, '#f4b860'); S.rect(4, 28, 26, 2, '#f4b860');
      S.rect(15, 12, 4, 7, '#f4b860'); S.rect(16, 15, 2, 2, '#0b0912'); S.rect(4, 10, 2, 20, '#c9a24a'); S.rect(28, 10, 2, 20, '#c9a24a');
      return;
    }
    S.rect(4, 20, 26, 12, '#7a4a20'); S.rect(4, 28, 26, 2, '#f4b860'); S.rect(4, 20, 2, 12, '#c9a24a'); S.rect(28, 20, 2, 12, '#c9a24a');
    S.poly([[4, 18], [30, 10], [30, 2], [4, 6]], '#8a5a2a'); S.line(4, 6, 30, 2, 2, '#f4b860');
    S.poly([[6, 18], [28, 11], [28, 20], [6, 21]], '#5a0f1c');
    S.poly([[10, 21], [20, 15], [26, 21]], '#ff5d73');
    for (let i = 0; i < 5; i++) { S.poly([[7 + i*5, 20], [9 + i*5, 16], [11 + i*5, 20]], '#f2ecdc'); S.poly([[8 + i*5, 17 - i*1.4], [10 + i*5, 21 - i*1.4], [12 + i*5, 16 - i*1.4]], '#f2ecdc'); }
    S.rect(12, 6, 3, 3, '#ffd23f'); S.rect(21, 4, 3, 3, '#ffd23f'); S.px(13, 7, '#0b0912'); S.px(22, 5, '#0b0912');
  });
}
/**
 * Sprite de un pod de Kubernetes.
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function podSprite(f){
  return sprite('pod|' + f, 26, 24, S => {
    const b = f ? 1 : 0;
    S.rect(5, 6 + b, 16, 12, '#2b6fd6'); S.rect(5, 6 + b, 16, 2, '#6fa8ff'); S.rect(5, 16 + b, 16, 2, '#1a4a9a');
    for (let i = 8; i < 20; i += 3) S.rect(i, 9 + b, 1, 6, '#1f58b8');
    S.rect(9, 10 + b, 2, 3, '#ffffff'); S.rect(15, 10 + b, 2, 3, '#ffffff'); S.px(10, 11 + b, '#0b0912'); S.px(16, 11 + b, '#0b0912');
    S.rect(7, 18 + b, 2, 4 - b, '#1a4a9a'); S.rect(17, 18 + b, 2, 4 - b, '#1a4a9a');
  });
}
/**
 * Sprite del tótem Deployment que genera pods.
 * @returns {object}
 */
function totemSprite(){
  return sprite('totem', 36, 70, S => {
    S.poly([[8, 66], [28, 66], [24, 8], [12, 8]], '#4b5266'); S.poly([[8, 66], [18, 66], [17, 8], [12, 8]], '#3a4052'); S.rect(12, 6, 12, 4, '#6a7290');
    S.rect(4, 62, 28, 6, '#3a4052'); S.rect(4, 62, 28, 1, '#6a7290');
    S.disc(18, 30, 9, '#2b6fd6'); S.disc(18, 30, 7, '#1a4a9a');
    for (let i = 0; i < 7; i++) { const a = i/7*Math.PI*2; S.line(18, 30, 18 + Math.cos(a)*7, 30 + Math.sin(a)*7, 1, '#ece6f6'); S.disc(18 + Math.cos(a)*9, 30 + Math.sin(a)*9, 1.2, '#ece6f6'); }
    S.disc(18, 30, 2, '#ece6f6');
    for (let j = 0; j < 3; j++) S.rect(14, 46 + j*5, 8, 2, '#5ec8f2');
  });
}
/**
 * Sprite cacheado del gólem (ver paintGolem).
 * @param {string} pose
 * @param {boolean} angry
 * @returns {object}
 */
function golemSprite(pose, angry){ return sprite('golem|' + pose + '|' + angry, 86, 80, S => paintGolem(S, pose, angry)); }

/**
 * Pinta el Dragón Negro.
 * @param {object} S Pintor de 180×124.
 * @param {{wing: number, mouth: number, lunge: number, tail: number, fly: number, dizzy: number}} f
 * Fotograma: ala (0-2), boca (0 cerrada, 1 abierta, 2 aliento), mordisco, coletazo, vuelo y mareo.
 */
function paintDragon(S, f){
  const B = '#241d36', BS = '#151120', BL = '#3f3760', BE = '#5d5784', BEL = '#857bb5', BONE = '#d8cfb4', MEM = '#2c2344', MEML = '#463a63', ACID = '#6ee7a8';
  const L = f.lunge ? 12 : 0;
  // ala lejana
  const wy = [-12, 12, 32][f.wing];
  S.poly([[80, 52], [44, wy], [8, wy + 26], [30, 60]], MEM);
  S.line(80, 52, 44, wy, 2, BE); S.line(44, wy, 8, wy + 26, 2, BE); S.line(44, wy, 30, 60, 1, BE);
  // cola
  const tr = f.tail ? 1 : 0;
  const tp = [[52, 90], [32, 96 - tr*8], [16, 98 - tr*18], [4, 92 - tr*30]];
  const tw = [11, 8, 5];
  for (let i = 0; i < 3; i++) S.line(tp[i][0], tp[i][1], tp[i + 1][0], tp[i + 1][1], tw[i], B);
  S.poly([[tp[3][0] + 2, tp[3][1] - 4], [tp[3][0] - 8, tp[3][1] - 2], [tp[3][0] + 2, tp[3][1] + 4]], BONE);
  for (let i = 0; i < 3; i++) { const p = tp[i]; S.poly([[p[0] - 2, p[1] - tw[i]/2], [p[0] - 5, p[1] - tw[i]/2 - 4], [p[0] + 1, p[1] - tw[i]/2]], BONE); }
  // patas traseras
  S.line(52, 86, 50, 110, 10, BS); S.ell(52, 114, 8, 4, BS);
  S.px(58, 117, BONE); S.px(60, 116, BONE); S.px(56, 117, BONE);
  // cuerpo
  S.ell(72, 82, 35, 23, BS);
  S.ell(75, 79, 33, 21, B);
  S.ell(82, 70, 15, 7, BL);
  S.ell(82, 94, 25, 8, BE);
  for (let i = 0; i < 4; i++) S.line(66 + i*8, 91, 66 + i*8, 98, 1, BEL);
  for (let i = 0; i < 6; i++) { const x = 46 + i*8, y = 62 - Math.sin((i + 1)/7*Math.PI)*6; S.poly([[x - 3, y + 4], [x, y - 3], [x + 3, y + 4]], BONE); }
  // patas delanteras
  S.line(94, 90, 100, 112, 9, B); S.ell(102, 115, 8, 4, B);
  S.px(108, 117, BONE); S.px(110, 116, BONE); S.px(106, 118, BONE);
  // cuello y cabeza
  const hx = 130 + L, hy = 40 + (f.fly ? 8 : 0) + (f.dizzy ? 14 : 0);
  S.line(98, 72, 112 + L*.5, 58, 16, B);
  S.line(112 + L*.5, 58, hx - 8, hy + 8, 13, B);
  S.line(104, 76, 116 + L*.5, 64, 3, BE); S.line(116 + L*.5, 64, hx - 6, hy + 14, 3, BE);
  S.poly([[hx - 14, hy - 8], [hx + 14, hy - 6], [hx + 30, hy + 2], [hx + 28, hy + 9], [hx + 8, hy + 12], [hx - 12, hy + 11]], B);
  S.poly([[hx - 12, hy - 7], [hx + 14, hy - 5], [hx + 26, hy + 1], [hx + 8, hy - 1]], BL);
  S.line(hx - 8, hy - 6, hx - 24, hy - 20, 3, BONE); S.line(hx - 24, hy - 20, hx - 31, hy - 22, 2, BONE);
  S.line(hx + 1, hy - 6, hx - 8, hy - 22, 3, BONE); S.line(hx - 8, hy - 22, hx - 12, hy - 26, 1, BONE);
  S.rect(hx + 6, hy - 3, 5, 3, f.dizzy ? '#5ec8f2' : ACID); S.px(hx + 10, hy - 3, '#f0fff8');
  S.px(hx + 26, hy + 2, ACID);
  if (f.mouth) {
    S.poly([[hx - 6, hy + 10], [hx + 26, hy + 12], [hx + 22, hy + 24], [hx - 2, hy + 19]], B);
    S.poly([[hx - 2, hy + 11], [hx + 24, hy + 11], [hx + 19, hy + 19], [hx, hy + 15]], f.mouth === 2 ? ACID : '#8a2c3c');
    if (f.mouth === 2) S.ell(hx + 12, hy + 14, 5, 2, '#d8fff0');
    for (let i = 0; i < 5; i++) { S.px(hx + 2 + i*5, hy + 11, BONE); S.px(hx + 4 + i*4, hy + 18, BONE); }
  } else {
    S.line(hx - 4, hy + 11, hx + 26, hy + 9, 1, BS);
    for (let i = 0; i < 4; i++) S.px(hx + 4 + i*6, hy + 11, BONE);
  }
  // ala cercana
  const ny = [-26, 4, 30][f.wing];
  S.poly([[72, 56], [48, ny], [4, ny + 18], [22, ny + 38], [42, 64]], MEML);
  S.line(72, 56, 48, ny, 3, BE); S.line(48, ny, 4, ny + 18, 2, BE); S.line(48, ny, 22, ny + 38, 2, BE); S.line(48, ny, 42, 64, 1, BE);
  S.line(36, ny + 14, 30, ny + 30, 1, MEM); S.line(20, ny + 18, 14, ny + 26, 1, MEM);
  S.disc(72, 56, 5, B); S.px(71, 54, BL);
}
/**
 * Sprite cacheado del dragón para un fotograma (ver paintDragon).
 * @param {object} f
 * @returns {object}
 */
function dragonSprite(f){ return sprite('dragon|' + f.wing + f.mouth + f.lunge + f.tail + f.fly + f.dizzy, 180, 124, S => paintDragon(S, f)); }

/**
 * Sprite de un objeto del suelo, un barril o un cofre.
 * @param {string} k pocion, pollo, tortilla, bocata, baculo, martillo, patito, stack, barril o cofre.
 * @returns {object}
 */
function itemSprite(k){
  return sprite('item|' + k, 28, 28, S => {
    switch (k) {
      case 'pocion': S.rect(12, 6, 4, 4, '#cfe8f2'); S.rect(12, 4, 4, 2, '#7a4f22'); S.disc(14, 16, 7, '#9fd8ee'); S.ell(14, 18, 6, 4, '#6b3a1a'); S.ell(14, 17, 5, 2, '#9a5a2a'); S.px(11, 13, '#ffffff'); S.px(11, 14, '#ffffff'); S.px(14, 20, '#f4b860'); break;
      case 'pollo': S.ell(13, 17, 9, 6, '#a8561f'); S.ell(12, 15, 6, 3, '#d98a45'); S.px(9, 14, '#ffd27a'); S.line(20, 18, 25, 13, 2, '#f2ecdc'); S.disc(25, 12, 1.4, '#f2ecdc'); break;
      case 'tortilla': S.ell(14, 18, 11, 5, '#c98a2a'); S.ell(14, 17, 10, 4, '#f4c05a'); S.ell(14, 16, 7, 2, '#ffe09a'); S.poly([[14, 17], [24, 14], [24, 20]], '#0b0912'); S.px(9, 16, '#a8722e'); break;
      case 'bocata': S.ell(14, 17, 12, 5, '#a8692a'); S.ell(14, 15, 11, 3, '#d9963f'); S.rect(4, 17, 20, 2, '#f2ecdc'); for (let i = 0; i < 4; i++) { S.disc(7 + i*5, 18, 1.6, '#f4b860'); S.px(7 + i*5, 18, '#f2ecdc'); } S.px(10, 13, '#ffe0a8'); break;
      case 'baculo': S.line(5, 24, 21, 8, 2, '#7a4f22'); S.disc(22, 6, 3, '#5ec8f2'); S.px(21, 5, '#e9f8ff'); S.line(18, 10, 20, 12, 1, '#f4b860'); break;
      case 'martillo': S.line(6, 24, 16, 12, 2, '#5a3a22'); S.poly([[11, 4], [24, 11], [19, 18], [6, 11]], '#3d3754'); for (const [x, y] of [[11, 8], [15, 10], [19, 12], [10, 11], [14, 13]]) S.rect(x, y, 2, 2, '#ece6f6'); break;
      case 'patito': S.ell(13, 18, 8, 6, '#ffd23f'); S.disc(18, 11, 5, '#ffd23f'); S.ell(11, 17, 4, 3, '#f0b81a'); S.poly([[22, 11], [27, 12], [22, 14]], '#ff8a3d'); S.px(19, 10, '#0b0912'); S.px(18, 9, '#ffffff'); break;
      case 'stack': S.rect(6, 7, 16, 16, '#f2ecdc'); S.ell(6, 15, 3, 8, '#d8cfb4'); S.ell(22, 15, 3, 8, '#d8cfb4'); for (let i = 0; i < 4; i++) S.rect(9 + i*3, 10 + (3 - i)*0, 2, 4 + i*2, '#f48024'); S.rect(9, 20, 11, 1, '#8d8468'); S.rect(8, 22, 13, 1, '#8d8468'); break;
      case 'barril': S.ell(14, 6, 9, 3, '#5a3a1e'); S.rect(5, 6, 18, 18, '#8a5a2a'); S.rect(5, 6, 4, 18, '#6b4220'); S.rect(18, 6, 5, 18, '#6b4220'); S.rect(5, 10, 18, 2, '#4b4470'); S.rect(5, 19, 18, 2, '#4b4470'); S.ell(14, 6, 8, 2, '#a8723e'); S.rect(10, 7, 2, 16, '#a8723e'); break;
      case 'cofre': S.rect(3, 11, 22, 13, '#7a4a20'); S.ell(14, 11, 11, 5, '#8a5a2a'); S.rect(3, 11, 22, 2, '#f4b860'); S.rect(3, 22, 22, 2, '#f4b860'); S.rect(12, 9, 4, 6, '#f4b860'); S.rect(13, 12, 2, 2, '#0b0912'); S.rect(3, 6, 2, 18, '#c9a24a'); S.rect(23, 6, 2, 18, '#c9a24a'); S.px(8, 8, '#d9963f'); break;
    }
  });
}
/**
 * Fotograma de la llama de una antorcha.
 * @param {number} i 0, 1 o 2.
 * @returns {object}
 */
function flameSprite(i){
  return sprite('flame|' + i, 14, 18, S => {
    const s = [0, 1, -1][i];
    S.ell(7, 12, 4, 5, '#c43d1a'); S.poly([[3, 12], [7 + s, 1], [11, 12]], '#c43d1a');
    S.ell(7, 13, 3, 3.5, '#ff8a3d'); S.poly([[4.5, 13], [7 - s, 4], [9.5, 13]], '#ff8a3d');
    S.ell(7, 14, 1.8, 2.2, '#ffe09a');
  });
}
