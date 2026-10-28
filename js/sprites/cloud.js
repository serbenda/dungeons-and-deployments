// Personajes y sprites de la etapa 3, La Nube: Kubernetes gestionado, Serverless
// y Facturación cloud.
'use strict';

RIGS.sidecar = reRig('goblin', { scale:.92 }, { skin:'#7fb8e0', skinS:'#4a80a8', armor:'#2b5f7d', armorS:'#1f4660', armorL:'#5ec8f2', eye:'#ffd23f' });
RIGS.operador = reRig('orco', { scale:1.3, weapon:'axe' }, { skin:'#8a9ab8', skinS:'#5a6a88', armor:'#2b3f8a', armorS:'#1c2a60', armorL:'#4a6ad8', tie:'#ffd23f', eye:'#5ec8f2' });
RIGS.zombieVm = reRig('esqueleto', {}, { bone:'#f0a060', boneS:'#a86a30', skin:'#f0a060', skinS:'#a86a30', eye:'#5ec8f2' });
RIGS.autoscaler = reRig('guerrero', { scale:1.45 }, { armor:'#c9d4e6', armorS:'#8a96b0', armorL:'#ffffff', cloth:'#2b6fd6', clothS:'#1a4a9a', metal:'#5ec8f2', metalL:'#e9f8ff', hair:'#e6e0d4', gold:'#ffd23f' });
RIGS.replica = reRig('guerrero', { scale:.92 }, { armor:'#9fb4d0', armorS:'#6a7e9a', armorL:'#e9f8ff', cloth:'#5ec8f2', clothS:'#2b6fd6', metal:'#9fd0ff', metalL:'#ffffff', gold:'#9fd0ff' });

/**
 * Lambda en frío: una λ helada con alas que tarda en «arrancar».
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function lambdaSprite(f){
  return sprite('lambda|' + f, 36, 32, S => {
    const w = f ? -3 : 3;
    S.poly([[18, 14], [3, 6 + w], [8, 13], [2, 19 + w]], '#e9f8ff'); S.poly([[18, 14], [33, 6 + w], [28, 13], [34, 19 + w]], '#e9f8ff');
    S.disc(18, 15, 9, '#5ec8f2'); S.disc(18, 14, 7.5, '#9fd8ee');
    S.line(13, 7, 18, 13, 2, '#1a4a9a'); S.line(18, 13, 23, 22, 2, '#1a4a9a'); S.line(18, 13, 13, 22, 2, '#1a4a9a');
    S.px(15, 10, '#ffffff'); S.px(22, 18, '#ffffff');
    for (const [x, y] of [[10, 24], [26, 24], [18, 27]]) S.px(x, y, '#e9f8ff');
  });
}
/**
 * NAT Gateway: una moneda fantasma que cobra por cada giga.
 * @param {number} f Fotograma (0 o 1).
 * @returns {object}
 */
function coinGhostSprite(f){
  return sprite('coinghost|' + f, 36, 44, S => {
    const w = f ? 1 : -1;
    S.poly([[8, 26], [6, 40 + w], [12, 36], [16, 42 - w], [20, 36], [24, 42 + w], [28, 36], [30, 40 - w], [28, 26]], '#c9a24a');
    S.disc(18, 18, 13, '#a8722e'); S.disc(18, 18, 11, '#ffd23f'); S.disc(17, 17, 8, '#ffe07a');
    S.rect(17, 9, 2, 18, '#a8722e'); S.rect(13, 12, 9, 2, '#a8722e'); S.rect(13, 17, 9, 2, '#a8722e'); S.rect(13, 22, 9, 2, '#a8722e'); S.rect(13, 12, 2, 7, '#a8722e'); S.rect(20, 17, 2, 7, '#a8722e');
    S.rect(9, 15, 3, 3, '#0b0912'); S.rect(24, 15, 3, 3, '#0b0912'); S.px(10, 15, '#ffffff'); S.px(25, 15, '#ffffff');
  });
}
/**
 * La Factura de Fin de Mes: un pergamino de factura gigante con fauces y un total
 * que no para de subir.
 * @param {number} f 0 reposo, 1 boca abierta, 2 cargando el pico de uso.
 * @returns {object}
 */
function invoiceSprite(f){
  return sprite('invoice|' + f, 120, 120, S => {
    S.ell(60, 112, 40, 6, '#1a1626');
    S.rect(18, 14, 84, 90, '#a59c84'); S.rect(20, 12, 80, 90, '#f5efe0'); S.rect(20, 12, 80, 3, '#ffffff');
    S.ell(60, 12, 42, 6, '#d8cfb4'); S.ell(60, 104, 42, 6, '#d8cfb4'); S.ell(60, 11, 38, 4, '#f5efe0');
    for (const y of [24, 30, 36, 64, 70]) { S.rect(26, y, 40, 2, '#a59c84'); S.rect(74, y, 20, 2, '#a59c84'); }
    S.rect(26, 78, 68, 2, '#3a2a1a');
    S.rect(26, 84, 30, 6, '#8a2c3c'); S.rect(62, 82, 32, 10, f === 2 ? '#ff5d73' : '#ffd23f');
    const eyeC = f === 2 ? '#ff5d73' : '#0b0912';
    S.disc(42, 46, 7, '#ffffff'); S.disc(78, 46, 7, '#ffffff'); S.disc(44, 47, 3.5, eyeC); S.disc(80, 47, 3.5, eyeC);
    S.line(34, 36, 50, 40, 2, '#3a2a1a'); S.line(86, 36, 70, 40, 2, '#3a2a1a');
    const mo = f ? 10 : 4;
    S.rect(40, 54, 40, mo, '#3a1028');
    for (let i = 0; i < 6; i++) { S.poly([[41 + i*7, 54], [44 + i*7, 58], [47 + i*7, 54]], '#ffffff'); if (f) S.poly([[41 + i*7, 54 + mo], [44 + i*7, 50 + mo], [47 + i*7, 54 + mo]], '#ffffff'); }
    for (const [x, y] of [[8, 30], [110, 36], [12, 80], [108, 84]]) { S.disc(x, y, 5, '#ffd23f'); S.rect(x - 1, y - 3, 2, 6, '#a8722e'); }
  });
}
/**
 * Moneda que cae del cielo (ataque de la Factura).
 * @returns {object}
 */
function coinSprite(){
  return sprite('coin', 12, 12, S => { S.disc(6, 6, 5, '#a8722e'); S.disc(6, 6, 4, '#ffd23f'); S.rect(5, 3, 2, 6, '#a8722e'); S.px(4, 4, '#fff3c4'); });
}
