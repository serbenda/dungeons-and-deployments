// Personajes y sprites de la etapa 2, Las Cuevas: bases de datos, seguridad,
// monitorización y el Mainframe.
'use strict';

/** Recolorea un esqueleto existente con otra escala y otros colores. */
const reRig = (base, extra, cols) => Object.assign({}, RIGS[base], extra, { cols:Object.assign({}, RIGS[base].cols, cols) });

RIGS.kobold = reRig('goblin', { scale:.94 }, { skin:'#c4683a', skinS:'#8a4422', armor:'#5a4a36', armorS:'#3b3022', armorL:'#8a7458', eye:'#ffd23f' });
RIGS.troll = reRig('orco', { scale:1.42, weapon:'mace' }, { skin:'#7a8a9a', skinS:'#4e5c6a', armor:'#4a3a2a', armorS:'#2e2418', armorL:'#6e5a44', tie:'#c43d1a', eye:'#ffd23f' });
RIGS.dba = reRig('orco', { scale:1.65, weapon:'martillo' }, { skin:'#6a8a6a', skinS:'#46604a', armor:'#2b4a6a', armorS:'#1c3248', armorL:'#4a7aa6', tie:'#ffd23f', eye:'#ff5d73', gold:'#ffd23f' });
RIGS.ransom = reRig('esqueleto', { weapon:'rustsword' }, { bone:'#d9c25a', boneS:'#9a8430', skin:'#d9c25a', skinS:'#9a8430', eye:'#ff5d73' });
RIGS.gnomo = reRig('goblin', { scale:.86, weapon:'dagger' }, { skin:'#e0b090', skinS:'#a8785a', armor:'#5b3fa8', armorS:'#3a2878', armorL:'#8a6ad8', eye:'#3ddc84' });
RIGS.lich = reRig('mago', { scale:1.5 }, { skin:'#c9d4bc', skinS:'#8a9a80', hair:'#e6e0cf', robe:'#1d2a3a', robeS:'#111a26', trim:'#3ddc84', hat:'#16233f', hatS:'#0c1420', gold:'#3ddc84', belt:'#3ddc84' });

/**
 * Consulta N+1: un ojo volador con un rastro de consultas repetidas.
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function eyeSprite(f){
  return sprite('eye|' + f, 36, 30, S => {
    const w = f ? -2 : 2;
    S.poly([[18, 14], [4, 6 + w], [8, 13], [3, 18 + w]], '#3a2a5a'); S.poly([[18, 14], [32, 6 + w], [28, 13], [33, 18 + w]], '#3a2a5a');
    S.disc(18, 14, 8, '#e6e0d4'); S.disc(18, 14, 8, '#e6e0d4');
    S.disc(19, 14, 4.5, '#2b6fd6'); S.disc(19, 14, 2.5, '#0b0912'); S.px(17, 12, '#ffffff');
    for (const [x, y] of [[11, 8], [25, 9], [12, 20], [24, 20]]) S.px(x, y, '#ff5d73');
    S.rect(13, 24, 11, 4, '#2c2440'); S.rect(14, 25, 9, 2, '#5ec8f2');
  });
}
/**
 * Falso positivo: una campana de alarma con alas.
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function bellSprite(f){
  return sprite('bell|' + f, 36, 32, S => {
    const w = f ? -3 : 3;
    S.poly([[18, 14], [3, 8 + w], [7, 15], [2, 20 + w]], '#9fd0ff'); S.poly([[18, 14], [33, 8 + w], [29, 15], [34, 20 + w]], '#9fd0ff');
    S.poly([[11, 22], [13, 9], [18, 6], [23, 9], [25, 22]], '#ffd23f');
    S.poly([[11, 22], [13, 9], [16, 7], [15, 22]], '#c9a020'); S.rect(9, 21, 18, 3, '#e6b82a'); S.rect(9, 21, 18, 1, '#fff3c4');
    S.disc(18, 26, 2.5, '#a8722e'); S.rect(17, 3, 3, 4, '#a8722e');
    S.px(15, 14, '#0b0912'); S.px(21, 14, '#0b0912'); S.rect(16, 17, 5, 1, '#0b0912');
    S.rect(16, 10, 2, 3, '#ff5d73');
  });
}
/**
 * Cofre phishing: un cofre que promete premios y muerde.
 * @param {number} open 0 cerrado, 1 abierto.
 * @returns {object}
 */
function phishSprite(open){
  return sprite('phish|' + open, 36, 34, S => {
    S.rect(5, 16, 26, 16, '#2b5f7d'); S.rect(5, 16, 26, 2, '#3f7fa3'); S.rect(5, 30, 26, 2, '#1f4660');
    for (const x of [5, 29]) S.rect(x, 16, 2, 16, '#ffd23f');
    if (open) {
      S.poly([[5, 16], [31, 16], [31, 4], [5, 8]], '#3f7fa3'); S.rect(6, 15, 24, 3, '#1a0f16');
      for (let i = 0; i < 6; i++) { S.poly([[7 + i*4, 15], [9 + i*4, 19], [11 + i*4, 15]], '#ece6f6'); S.poly([[7 + i*4, 17], [9 + i*4, 13], [11 + i*4, 17]], '#ece6f6'); }
      S.rect(10, 6, 16, 6, '#ffffff'); S.rect(11, 7, 14, 4, '#ff5d73');
    } else {
      S.poly([[5, 16], [31, 16], [29, 9], [7, 9]], '#3f7fa3'); S.rect(7, 9, 22, 1, '#5ec8f2');
      S.rect(15, 18, 6, 6, '#ffd23f'); S.px(17, 20, '#1f4660'); S.px(18, 20, '#1f4660');
    }
    S.rect(10, 24, 16, 5, '#e6e0d4'); S.rect(11, 25, 2, 1, '#2b5f7d'); S.rect(14, 25, 8, 1, '#2b5f7d'); S.rect(11, 27, 10, 1, '#8a90a6');
  });
}
/**
 * Troyano: un caballo de madera fantasmal.
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function trojanSprite(f){
  return sprite('trojan|' + f, 40, 46, S => {
    const b = f ? 1 : 0;
    S.rect(8, 16 + b, 22, 12, '#a8723e'); S.rect(8, 16 + b, 22, 2, '#c9935c'); S.rect(8, 26 + b, 22, 2, '#7a4f22');
    for (const x of [10, 16, 22, 27]) S.rect(x, 18 + b, 1, 8, '#7a4f22');
    S.poly([[26, 18 + b], [30, 4 + b], [37, 6 + b], [36, 11 + b], [31, 12 + b], [30, 20 + b]], '#a8723e');
    S.rect(32, 6 + b, 2, 2, '#ff5d73'); S.poly([[29, 4 + b], [27, 0 + b], [31, 3 + b]], '#7a4f22');
    for (let i = 0; i < 4; i++) S.line(27 - i*2, 8 + b + i*2, 25 - i*2, 12 + b + i*2, 1, '#6b4a26');
    for (const x of [9, 14, 23, 28]) S.rect(x, 28 + b, 3, 10, '#7a4f22');
    S.rect(6, 38, 28, 4, '#6b4a26'); for (const x of [9, 29]) S.disc(x, 42, 3, '#4a3018');
    S.rect(15, 20 + b, 8, 5, '#2a1a10'); S.px(18, 22 + b, '#3ddc84'); S.px(20, 22 + b, '#3ddc84');
  });
}
/**
 * Copia en cinta: la filacteria del Lich, un armario de cintas magnéticas.
 * @param {number} f Fotograma (giro de las bobinas).
 * @returns {object}
 */
function tapeSprite(f){
  return sprite('tape|' + f, 36, 66, S => {
    S.rect(4, 4, 28, 60, '#3a4052'); S.rect(4, 4, 28, 2, '#6a7290'); S.rect(30, 4, 2, 60, '#26283a');
    S.rect(7, 8, 22, 34, '#0b0912');
    for (const [cx, cy] of [[12, 18], [24, 18]]) {
      S.disc(cx, cy, 5, '#c9c4ba'); S.disc(cx, cy, 2, '#3a4052');
      const a = (f/4)*Math.PI*2 + (cx > 16 ? 1 : 0);
      for (let k = 0; k < 3; k++) { const an = a + k*2.09; S.px(cx + Math.cos(an)*3.5, cy + Math.sin(an)*3.5, '#3a4052'); }
    }
    S.line(12, 23, 24, 23, 1, '#6b4a26');
    for (let j = 0; j < 3; j++) S.rect(8, 30 + j*4, 20, 2, j === 1 ? '#3ddc84' : '#1f3a2a');
    S.rect(8, 46, 20, 14, '#2c3a30'); for (let j = 0; j < 3; j++) S.rect(10, 48 + j*4, 16, 2, '#4f8a66');
  });
}
