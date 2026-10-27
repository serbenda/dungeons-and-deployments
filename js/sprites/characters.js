// Personajes con esqueleto articulado (héroes, goblins, orcos, esqueletos, minotauro) y sus poses.
'use strict';

/**
 * Esqueletos de los humanoides: escala, estilo de dibujo, arma y colores.
 */
const RIGS = {
  guerrero: { scale:1.12, style:'warrior', weapon:'sword', cols:{
    skin:'#e3a982', skinS:'#b47552', hair:'#6b4426', armor:'#8d96b8', armorS:'#5a6186', armorL:'#d3d9f0', cloth:'#b8323f', clothS:'#7a1d29',
    boot:'#4a3428', belt:'#6b4a26', metal:'#a9b2cf', metalL:'#f2f5ff', gold:'#f4b860' } },
  clerigo: { scale:1.08, style:'cleric', weapon:'mace', shield:true, cols:{
    skin:'#d9a07a', skinS:'#a26a48', hair:'#3a2216', robe:'#e8a948', robeS:'#a8722e', trim:'#f5efe0', cloth:'#3a3550', clothS:'#26223a',
    boot:'#3d2a20', belt:'#7a4f22', metal:'#9aa3c2', metalL:'#e9eefc', gold:'#ffd27a', shield:'#2b5f7d', shieldL:'#5ec8f2' } },
  mago: { scale:1.08, style:'mage', weapon:'staff', cols:{
    skin:'#e3b08a', skinS:'#b47552', hair:'#e6e0d4', robe:'#5b3fa8', robeS:'#3a2878', trim:'#ffd27a', cloth:'#2c2440', clothS:'#1d1830',
    boot:'#3d2a20', belt:'#ffd27a', metal:'#9aa3c2', metalL:'#e9eefc', gold:'#ffd27a', hat:'#4a33a0', hatS:'#2f2070' } },
  goblin: { scale:.9, style:'goblin', weapon:'dagger', cols:{
    skin:'#6fae4a', skinS:'#3f6e29', hair:'#2a1c10', armor:'#7a5230', armorS:'#4e321c', armorL:'#a2774a', cloth:'#5a4a36', clothS:'#3b3022',
    boot:'#2e2218', belt:'#3b2a18', metal:'#9aa3c2', metalL:'#e9eefc', eye:'#ffd23f' } },
  orco: { scale:1.28, style:'orc', weapon:'axe', cols:{
    skin:'#7f9a6a', skinS:'#526b45', hair:'#1b1410', armor:'#3d3754', armorS:'#26223a', armorL:'#5d5784', cloth:'#2a2438', clothS:'#1a1626',
    boot:'#1f1813', belt:'#4b3220', metal:'#8e97b5', metalL:'#dfe5f7', tie:'#b98cff', eye:'#ff5d73', gold:'#c9a24a' } },
  minotauro: { scale:1.5, style:'minotaur', weapon:'axe', cols:{
    skin:'#8a5a3a', skinS:'#5e3a24', hair:'#2a1a10', armor:'#3d4152', armorS:'#26283a', armorL:'#6a7290', cloth:'#5a2418', clothS:'#3a160e',
    boot:'#1f1813', belt:'#4b3220', metal:'#8e97b5', metalL:'#dfe5f7', snout:'#b07a58', horn:'#e6dcc0', eye:'#ff5d73', gold:'#ff8a3d' } },
  firewall: { scale:1.16, style:'warrior', weapon:'sword', shield:'wall', cols:{
    skin:'#d9a07a', skinS:'#a26a48', hair:'#3a2216', armor:'#5d6274', armorS:'#3d4152', armorL:'#a2a8bf', cloth:'#c43d1a', clothS:'#8a2c14',
    boot:'#2a1e16', belt:'#4b3220', metal:'#7a8098', metalL:'#d3d9f0', gold:'#ff8a3d' } },
  firewallRoto: null,
  esqueleto: { scale:1.04, style:'skeleton', weapon:'rustsword', cols:{
    bone:'#e6e0cf', boneS:'#a59c84', skin:'#e6e0cf', skinS:'#a59c84', eye:'#ff5d73' } }
};
RIGS.firewallRoto = Object.assign({}, RIGS.firewall, { shield:false });
RIGS.picara = { scale:1.0, style:'rogue', weapon:'dagger', cols:{
  skin:'#e8b48e', skinS:'#b47552', hair:'#ff6fae', hairS:'#c23f7e', armor:'#2f8f8a', armorS:'#1f5f5c', armorL:'#7fe0d8', cloth:'#3a2a4a', clothS:'#261a32',
  boot:'#2a1e16', belt:'#6b4a26', metal:'#a9b2cf', metalL:'#f2f5ff', gold:'#f4b860', scarf:'#ff8ad0' } };
RIGS.bardo = { scale:1.06, style:'bard', weapon:'lute', cols:{
  skin:'#d9a07a', skinS:'#a26a48', hair:'#8a4a26', robe:'#2f7a46', robeS:'#1f5a32', trim:'#ffd27a', cloth:'#3a3550', clothS:'#26223a',
  boot:'#3d2a20', belt:'#7a4f22', metal:'#9aa3c2', metalL:'#e9eefc', gold:'#ffd27a', hat:'#b8323f', hatS:'#7a1d29', feather:'#f5efe0' } };
RIGS.revisor = Object.assign({}, RIGS.clerigo, { scale:1.3, cols:Object.assign({}, RIGS.clerigo.cols, {
  robe:'#e6e0d4', robeS:'#a59c84', trim:'#3ddc84', hair:'#c9c2b0', cloth:'#2c3a30', clothS:'#1c2620', gold:'#3ddc84', shield:'#1f7a46', shieldL:'#8dffbf' }) });
RIGS.pendiente = Object.assign({}, RIGS.goblin, { cols:Object.assign({}, RIGS.goblin.cols, {
  skin:'#d9c25a', skinS:'#a08a2e', armor:'#3a5a8a', armorS:'#26406a', armorL:'#7fa8e0', eye:'#ff5d73' }) });
/**
 * Poses de los humanoides. Ángulos en grados de piernas (bl, fl) y brazos (ba, fa):
 * [ángulo del segmento superior, ángulo relativo del inferior]. lean es la inclinación
 * del torso, hip la altura de la cadera y wpn el giro del arma.
 */
const POSES = {
  idle0:{ lean:4, hip:0, bl:[-10,-4], fl:[12,-14], ba:[-10,30], fa:[25,55], wpn:60 },
  idle1:{ lean:5, hip:1, bl:[-10,-6], fl:[12,-16], ba:[-8,32], fa:[25,58], wpn:58 },
  walk0:{ lean:8, hip:0, bl:[-26,-8], fl:[26,-12], ba:[22,30], fa:[-6,50], wpn:62 },
  walk1:{ lean:8, hip:-1, bl:[-4,-40], fl:[6,-4], ba:[6,30], fa:[10,52], wpn:60 },
  walk2:{ lean:8, hip:0, bl:[26,-12], fl:[-26,-8], ba:[-14,30], fa:[30,50], wpn:58 },
  walk3:{ lean:8, hip:-1, bl:[6,-4], fl:[-4,-40], ba:[0,30], fa:[16,52], wpn:60 },
  atk1a:{ lean:-4, hip:1, bl:[-15,-5], fl:[20,-20], ba:[-30,40], fa:[150,20], wpn:10 },
  atk1b:{ lean:14, hip:2, bl:[-26,-5], fl:[32,-26], ba:[-20,30], fa:[82,4], wpn:0 },
  atk2b:{ lean:10, hip:2, bl:[-26,-5], fl:[32,-26], ba:[-20,30], fa:[124,-8], wpn:8 },
  atk3a:{ lean:-10, hip:0, bl:[-15,-5], fl:[20,-20], ba:[-40,60], fa:[172,8], wpn:0 },
  atk3b:{ lean:22, hip:5, bl:[-36,-5], fl:[42,-48], ba:[-20,40], fa:[52,0], wpn:-12 },
  jump:{ lean:0, hip:-2, bl:[-20,-70], fl:[45,-90], ba:[-40,60], fa:[110,30], wpn:30 },
  kick:{ lean:-12, hip:-2, bl:[-30,-55], fl:[86,0], ba:[-60,40], fa:[60,60], wpn:40 },
  hurt:{ lean:-20, hip:2, bl:[-6,-10], fl:[20,-20], ba:[-60,-30], fa:[-30,-40], wpn:90 },
  crouch:{ lean:16, hip:6, bl:[14,-62], fl:[50,-96], ba:[0,40], fa:[40,50], wpn:50 },
  grab:{ lean:8, hip:1, bl:[-15,-5], fl:[15,-15], ba:[80,10], fa:[86,5], wpn:80 },
  knee:{ lean:12, hip:0, bl:[-8,-4], fl:[80,-110], ba:[80,10], fa:[86,5], wpn:80 },
  throw:{ lean:20, hip:2, bl:[-30,-5], fl:[30,-25], ba:[120,0], fa:[140,0], wpn:20 },
  special:{ lean:-5, hip:0, bl:[-16,-5], fl:[16,-10], ba:[172,0], fa:[176,0], wpn:0 },
  shoot:{ lean:6, hip:0, bl:[-15,-5], fl:[18,-15], ba:[-10,30], fa:[88,0], wpn:0 },
  windup:{ lean:-8, hip:0, bl:[-15,-5], fl:[18,-15], ba:[-20,30], fa:[160,30], wpn:10 },
  strike:{ lean:14, hip:2, bl:[-26,-5], fl:[32,-26], ba:[-20,30], fa:[80,0], wpn:0 },
  down:{ down:true, lean:-88, bl:[96,6], fl:[86,0], ba:[-96,0], fa:[-82,0], wpn:0 }
};

/**
 * Pinta un arma en la mano de un personaje.
 * @param {object} S Pintor.
 * @param {string} type sword, mace, staff, dagger, axe, rustsword, baculo o martillo.
 * @param {number[]} h Posición de la mano.
 * @param {number[]} d Dirección del arma.
 * @param {number} k Escala.
 */
function paintWeapon(S, type, h, d, k){
  const at = l => [h[0] + d[0]*l, h[1] + d[1]*l];
  const per = [-d[1], d[0]];
  const ln = (a, b, th, col) => S.line(a[0], a[1], b[0], b[1], th, col);
  switch (type) {
    case 'sword': {
      ln(at(-3), at(1), 2, '#6b4a26');
      ln(add(at(1.5), per, -3.5), add(at(1.5), per, 3.5), 2, '#f4b860');
      ln(at(3), at(19*k), 3, '#a9b2cf'); ln(add(at(3), per, -.8), add(at(18*k), per, -.8), 1, '#f2f5ff');
      S.px(...at(20*k), '#f2f5ff');
      for (const l of [7, 11, 15]) S.px(...at(l*k), '#5ec8f2');
      break; }
    case 'mace': {
      ln(at(-2), at(9), 2, '#6b4a26');
      const m = at(11.5); S.disc(m[0], m[1], 3.2, '#9aa3c2'); S.px(m[0] - 1, m[1] - 1, '#e9eefc');
      for (const p of [at(15.5), add(m, per, 4.2), add(m, per, -4.2)]) S.px(p[0], p[1], '#e9eefc');
      break; }
    case 'dagger': {
      ln(at(-1.5), at(1), 2, '#3b2a18');
      ln(add(at(1.5), per, -2), add(at(1.5), per, 2), 1, '#8e97b5');
      ln(at(2), at(9), 2, '#dfe5f7');
      break; }
    case 'axe': {
      ln(at(-5), at(15*k), 2, '#5a3a22');
      S.poly([at(9), add(at(8), per, -7), add(at(14), per, -9), add(at(15.5), per, -1)], '#8e97b5');
      ln(add(at(8), per, -7), add(at(14), per, -9), 1, '#dfe5f7');
      break; }
    case 'rustsword': {
      ln(at(-2), at(1), 2, '#3b2a18');
      ln(add(at(1), per, -2.5), add(at(1), per, 2.5), 1, '#6b5a4a');
      ln(at(2), at(14), 2, '#8a6a4a'); S.px(...at(6), '#5a4030'); S.px(...at(11), '#5a4030');
      break; }
    case 'staff': {
      ln(at(-12), at(15), 2, '#7a4f22'); ln(add(at(-12), per, .7), add(at(14), per, .7), 1, '#a8723e');
      const top = at(18); ln(add(at(14), per, -3), add(top, per, -2), 1, '#ffd27a'); ln(add(at(14), per, 3), add(top, per, 2), 1, '#ffd27a');
      S.disc(top[0], top[1], 3.2, '#b98cff'); S.px(top[0] - 1, top[1] - 1, '#f3e8ff'); S.px(top[0], top[1] - 1, '#e2ccff');
      break; }
    case 'baculo': {
      ln(at(-9), at(13), 2, '#7a4f22');
      const top = at(15.5); S.disc(top[0], top[1], 2.8, '#5ec8f2'); S.px(top[0] - 1, top[1] - 1, '#e9f8ff');
      ln(add(at(12), per, -2), add(at(12), per, 2), 1, '#f4b860');
      break; }
    case 'lute': {
      ln(at(-4), at(6), 2, '#6b4a26');
      for (const l of [-3, -1.5]) S.px(...add(at(l), per, 1.6), '#f4b860');
      const b = at(10); S.ell(b[0], b[1], 4.6, 4.6, '#c98a3a'); S.ell(b[0] - .5, b[1] - .5, 3.4, 3.4, '#e0a454');
      S.disc(b[0], b[1], 1.2, '#3a2216'); ln(at(3), at(13), 1, '#f5efe0');
      break; }
    case 'martillo': {
      ln(at(-4), at(12), 2, '#5a3a22');
      const a1 = at(10), a2 = at(16);
      S.poly([add(a1, per, -6), add(a1, per, 6), add(a2, per, 6), add(a2, per, -6)], '#3d3754');
      for (let i = -4; i <= 4; i += 3) for (const l of [11.5, 14.5]) { const p = add(at(l), per, i); S.rect(p[0], p[1], 2, 2, '#ece6f6'); }
      break; }
  }
}

/**
 * Pinta un personaje articulado (cuerpo, cabeza, escudo y arma) en una pose.
 * Las articulaciones se calculan a partir de los ángulos de la pose.
 * @param {object} S Pintor de 80×84.
 * @param {object} rig Entrada de RIGS (escala, estilo, colores y arma).
 * @param {object} p Pose de POSES (inclinación, cadera y ángulos de piernas y brazos).
 * @param {string} [weapon] Arma que sustituye a la del esqueleto.
 * @returns {{hx: number, hy: number, hr: number}} Centro y radio de la cabeza, para los retratos.
 */
function paintRig(S, rig, p, weapon){
  const k = rig.scale, c = rig.cols, st = rig.style;
  const TH = 7.4*k, SH = 7.4*k, TO = 10.5*k, UA = 6.2*k, FA = 5.8*k, HR = 7*k;
  const sk = st === 'skeleton';
  const LW = sk ? 2 : Math.max(3, Math.round(4*k)), AW = sk ? 2 : Math.max(2, Math.round(3*k));
  const OX = 40, BASE = 80;
  const lean = p.lean || 0;
  const hip = p.down ? [OX - 4, BASE - 5] : [OX, BASE - 1 - (TH + SH)*.96 + (p.hip || 0)*k];
  const up = D(180 - lean), nrm = [Math.cos(lean*Math.PI/180), Math.sin(lean*Math.PI/180)];
  const neck = add(hip, up, TO);
  const limb = (o, a1, a2, l1, l2) => { const j = add(o, D(a1), l1); return [j, add(j, D(a1 + a2), l2)]; };
  const hipB = add(hip, nrm, -1.5), hipF = add(hip, nrm, 1.5);
  const [bk, bf] = limb(hipB, p.bl[0], p.bl[1], TH, SH);
  const [fk, ff] = limb(hipF, p.fl[0], p.fl[1], TH, SH);
  const shBase = add(neck, up, -2*k);
  const shB = add(shBase, nrm, -2*k), shF = add(shBase, nrm, 2*k);
  const [be, bh] = limb(shB, p.ba[0], p.ba[1], UA, FA);
  const [fe, fh] = limb(shF, p.fa[0], p.fa[1], UA, FA);
  const seg = (a, b, th, col) => S.line(a[0], a[1], b[0], b[1], th, col);
  const legC = { rogue:[c.clothS, c.cloth], bard:[c.clothS, c.cloth], mage:[c.clothS, c.cloth], warrior:[c.armorS, c.armor], cleric:[c.clothS, c.cloth], goblin:[c.clothS, c.cloth], orc:[c.clothS, c.cloth], minotaur:[c.clothS, c.cloth], skeleton:[c.boneS, c.bone] }[st];
  const armC = { rogue:[c.armorS, c.armor], bard:[c.robeS, c.robe], mage:[c.robeS, c.robe], warrior:[c.armorS, c.armor], cleric:[c.robeS, c.robe], goblin:[c.skinS, c.skin], orc:[c.skinS, c.skin], minotaur:[c.skinS, c.skin], skeleton:[c.boneS, c.bone] }[st];
  const hand = sk ? c.bone : st === 'warrior' ? c.metal : c.skin;
  const boot = (f, col) => {
    if (sk) { S.rect(f[0] - 1, f[1] - 1, 4, 2, c.bone); return; }
    S.rect(f[0] - 2, f[1] - 2, Math.round(5*k) + 1, 3, col); S.px(f[0] + Math.round(4*k), f[1], col);
  };
  // brazo trasero
  seg(shB, be, AW, armC[0]); seg(be, bh, AW, armC[0]);
  S.disc(bh[0], bh[1], 1.4*k, st === 'warrior' ? c.armorS : sk ? c.boneS : c.skinS);
  // piernas
  seg(hipB, bk, LW, legC[0]); seg(bk, bf, Math.max(2, LW - 1), legC[0]); boot(bf, sk ? c.bone : '#2a1e16');
  seg(hipF, fk, LW, legC[1]); seg(fk, ff, Math.max(2, LW - 1), legC[1]); boot(ff, sk ? c.bone : c.boot);
  if (st === 'warrior') { S.disc(fk[0], fk[1], 1.6, c.metal); S.px(fk[0] - 1, fk[1] - 1, c.metalL); }
  if (sk) { S.disc(fk[0], fk[1], 1, c.bone); S.disc(bk[0], bk[1], 1, c.boneS); }
  // torso
  const hw = 4*k, sw = 4.8*k;
  const quad = (a, b, wa, wb) => [add(a, nrm, -wa), add(a, nrm, wa), add(b, nrm, wb), add(b, nrm, -wb)];
  if (sk) {
    seg(hip, neck, 2, c.bone);
    for (let i = 0; i < 3; i++) { const q = add(neck, up, -(3 + i*3)*k); seg(add(q, nrm, -3*k), add(q, nrm, 3*k), 1, i === 1 ? c.boneS : c.bone); }
    S.rect(hip[0] - 3, hip[1] - 1, 7, 2, c.boneS);
  } else {
    const robed = st === 'cleric' || st === 'mage' || st === 'bard';
    const tc = robed ? c.robe : c.armor, ts = robed ? c.robeS : c.armorS, tl = robed ? c.trim : c.armorL;
    if (robed) {
      const hemC = add(hip, D(lean*.3), (st === 'mage' ? 13 : 10)*k);
      S.poly([add(hip, nrm, -hw), add(hip, nrm, hw), add(hemC, nrm, 6.5*k), add(hemC, nrm, -6.5*k)], c.robe);
      S.poly([add(hip, nrm, -hw), hip, hemC, add(hemC, nrm, -6.5*k)], c.robeS);
      seg(add(hemC, nrm, -6.5*k), add(hemC, nrm, 6.5*k), 1, c.trim);
      seg(hip, hemC, 1, c.trim);
    }
    S.poly(quad(hip, neck, hw, sw), tc);
    S.poly([add(hip, nrm, -hw), hip, neck, add(neck, nrm, -sw)], ts);
    seg(add(add(hip, nrm, hw - 1), up, 1), add(neck, nrm, sw - 1), 1, tl);
    if (st === 'warrior') {
      const tb = add(hip, D(lean*.2), 8*k);
      S.poly([add(hip, nrm, -2.2), add(hip, nrm, 2.6), add(tb, nrm, 2.2), add(tb, nrm, -2.2)], c.cloth);
      seg(add(hip, nrm, .4), add(tb, nrm, .4), 1, c.clothS);
      const pm = add(hip, D(lean*.2), 4*k); S.poly([[pm[0] - 1.5, pm[1] - 2.5], [pm[0] + 2.5, pm[1]], [pm[0] - 1.5, pm[1] + 2.5]], '#ece6f6');
      const ch = add(neck, up, -5); S.px(ch[0], ch[1], c.gold); S.px(ch[0] + 1, ch[1] + 1, c.gold); S.px(ch[0] - 1, ch[1] + 1, c.gold);
      S.disc(shF[0], shF[1], 2.8, c.metal); S.px(shF[0] - 1, shF[1] - 1, c.metalL); S.px(shF[0], shF[1] - 2, c.metalL);
    }
    if (st === 'rogue') {
      // Pañuelo al cuello que ondea hacia atrás y cinturón con bolsitas.
      const nk = add(neck, up, -1);
      seg(add(nk, nrm, -sw), add(nk, nrm, sw), 2, c.scarf);
      seg(add(nk, nrm, -sw), add(add(nk, nrm, -sw - 5*k), up, -3), 2, c.scarf);
      for (const o of [-2.5, 2]) { const b0 = add(add(hip, nrm, o*k), up, 1.5); S.rect(b0[0] - 1, b0[1] - 1, 3, 3, c.belt); }
      const lg = add(neck, up, -6*k); S.px(lg[0], lg[1], c.armorL); S.px(lg[0] + 1, lg[1] + 1, c.armorL); S.px(lg[0] - 1, lg[1] + 1, c.armorL);
    }
    if (st === 'bard') {
      // Pósits del tablero Scrum pegados a la túnica.
      const cols = ['#ffd23f', '#ff8ad0', '#7fe0d8'];
      for (let i = 0; i < 3; i++) { const q = add(add(neck, up, -(3.5 + i*3.2)*k), nrm, (i % 2 ? -1.5 : 1.2)*k); S.rect(q[0] - 1, q[1] - 1, 3, 3, cols[i]); }
    }
    if (st === 'cleric') {
      const ch = add(neck, up, -5*k);
      for (const [x, y] of [[-1,-1],[-2,0],[-1,1],[1,-1],[2,0],[1,1]]) S.px(ch[0] + x, ch[1] + y, c.gold);
    }
    if (st === 'mage') {
      const ch = add(neck, up, -5*k);
      for (const [x, y] of [[-3,0],[-2,-1],[-2,1],[3,0],[2,-1],[2,1],[1,-2],[0,0],[-1,2]]) S.px(ch[0] + x, ch[1] + y, c.gold);
      for (let i = 0; i < 3; i++) { const st2 = add(add(hip, D(lean*.3), (4 + i*4)*k), nrm, (i % 2 ? -2 : 2.5)*k); S.px(st2[0], st2[1], '#ffd27a'); }
    }
    if (st === 'orc') {
      seg(add(neck, up, -1), add(neck, up, -9*k), 2, c.tie);
      const bd = add(add(neck, up, -6*k), nrm, -3*k); S.rect(bd[0] - 1, bd[1] - 1, 3, 4, '#ece6f6'); S.px(bd[0], bd[1], '#5ec8f2');
      S.disc(shF[0], shF[1], 2.8*k, c.metal); S.px(shF[0], shF[1] - 3.5, c.metalL); S.px(shF[0] + 1, shF[1] - 4.5, c.metalL);
    }
    if (st === 'minotaur') {
      seg(add(neck, nrm, -sw), add(hip, nrm, hw), 2, c.belt);
      const em = add(neck, up, -7*k);
      for (let yy = 0; yy < 3; yy++) for (let xx = 0; xx < 2; xx++) S.rect(em[0] - 3 + xx*3 + (yy % 2), em[1] - 3 + yy*2, 2, 1, yy % 2 ? '#a8432a' : '#b8563a');
      S.disc(shF[0], shF[1], 3.4*k, c.metal); S.px(shF[0] - 1, shF[1] - 3, c.metalL);
      for (let i = 0; i < 3; i++) S.px(shF[0] - 2 + i*2, shF[1] - 4*k, c.metalL);
    }
    if (st === 'goblin') { const lt = add(neck, up, -4); S.px(lt[0], lt[1], c.armorL); S.px(lt[0] - 1, lt[1] + 2, c.armorL); }
    seg(add(hip, nrm, -hw), add(hip, nrm, hw), 2, c.belt);
    S.px(hip[0] + nrm[0], hip[1], st === 'goblin' ? c.armorL : (c.gold || '#f4b860'));
  }
  // cabeza
  const hc = add(neck, up, HR + .3);
  const cap = (col, from) => { const R = Math.ceil(HR) + 1; for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) { const v = -(i*up[0] + j*up[1]); if (i*i + j*j <= HR*HR + HR*.5 && v <= from) S.px(hc[0] + i, hc[1] + j, col); } };
  if (st === 'cleric') {
    S.disc(hc[0] - nrm[0]*1.2, hc[1] - nrm[1]*1.2, HR + .7, c.hair);
    const br0 = add(hc, nrm, -HR), br1 = add(add(br0, nrm, -1), D(lean*.2), 11*k);
    seg(br0, br1, 2, c.hair); S.px(br1[0], br1[1] + 1, c.gold);
  }
  const skin = sk ? c.bone : c.skin, skinS = sk ? c.boneS : c.skinS;
  S.disc(hc[0], hc[1], HR, skinS);
  S.disc(hc[0] + nrm[0]*.7 + up[0]*.7, hc[1] + nrm[1]*.7 + up[1]*.7, HR - 1, skin);
  const eye = add(add(hc, nrm, HR*.58), up, -.8), eye2 = add(add(hc, nrm, HR*.08), up, -.8);
  const eyes = (col, glint) => { for (const e of [eye, eye2]) { S.rect(e[0] - .5, e[1] - 1, 2, 3, col); if (glint) S.px(e[0] - .5, e[1] - 1, glint); } };
  const blush = col => { const b1 = add(add(hc, nrm, HR*.72), up, -2.6); S.px(b1[0], b1[1], col); S.px(b1[0] - 1, b1[1], col); };
  if (st === 'warrior') {
    cap(c.metal, -0.2);
    seg(add(add(hc, nrm, -HR), up, .3), add(add(hc, nrm, HR), up, .3), 1, c.metalL);
    seg(add(hc, nrm, HR*.75), add(add(hc, nrm, HR*.75), up, -3), 1, c.metal);
    const h0 = add(add(hc, nrm, -HR*.35), up, HR*.75);
    const h1 = add(add(h0, up, 4*k), nrm, -3.5*k), h2 = add(add(h1, up, 2.5*k), nrm, 1.5*k);
    seg(h0, h1, 2, '#e6dcc0'); seg(h1, h2, 1, '#e6dcc0');
    const bd = add(add(hc, nrm, HR*.3), up, -HR*.66); S.disc(bd[0], bd[1], HR*.42, c.hair); S.px(bd[0] + nrm[0]*3, bd[1] + 1, c.hair);
    eyes(OUTLINE, '#ffffff'); blush('#e88a74');
  } else if (st === 'rogue') {
    cap(c.hair, -HR*.15);
    // Coleta rosa hacia atrás y cinta en la frente.
    const t0 = add(add(hc, nrm, -HR*.85), up, HR*.35), t1 = add(add(t0, nrm, -4*k), up, -3*k), t2 = add(add(t1, nrm, -2*k), up, -4*k);
    seg(t0, t1, 3, c.hair); seg(t1, t2, 2, c.hairS);
    seg(add(add(hc, nrm, -HR), up, HR*.3), add(add(hc, nrm, HR), up, HR*.3), 1, c.armorL);
    eyes(OUTLINE, '#ffffff'); blush('#ff8ad0');
    const m = add(add(hc, nrm, HR*.55), up, -HR*.55); S.px(m[0], m[1], c.skinS);
  } else if (st === 'bard') {
    cap(c.hair, -HR*.35);
    // Gorro con pluma.
    const b0 = add(add(hc, up, HR*.5), nrm, -HR*1.1), b1 = add(add(hc, up, HR*.55), nrm, HR*1.1), top = add(add(hc, up, HR*1.35), nrm, -HR*.2);
    S.poly([b0, b1, add(top, nrm, HR*.6), top, add(add(hc, up, HR*1.1), nrm, -HR*1.2)], c.hat);
    seg(b0, b1, 1, c.hatS);
    const f0 = add(add(hc, up, HR*.9), nrm, -HR*.8), f1 = add(add(f0, up, 6*k), nrm, -4*k);
    seg(f0, f1, 2, c.feather); S.px(f1[0], f1[1], '#ffd23f');
    eyes(OUTLINE, '#ffffff'); blush('#e88a74');
    const bd = add(add(hc, nrm, HR*.35), up, -HR*.75); S.disc(bd[0], bd[1], HR*.36, c.hair);
  } else if (st === 'cleric') {
    cap(c.hair, -HR*.2);
    seg(add(add(hc, nrm, -HR), up, HR*.3), add(add(hc, nrm, HR), up, HR*.3), 1, c.gold);
    const gem = add(add(hc, nrm, HR*.3), up, HR*.32); S.px(gem[0], gem[1], c.shieldL);
    eyes(OUTLINE, '#ffffff'); blush('#e88a74');
    const m = add(add(hc, nrm, HR*.5), up, -HR*.55); S.px(m[0], m[1], c.skinS);
  } else if (st === 'mage') {
    const bd = add(add(hc, nrm, HR*.35), up, -HR*.7); S.disc(bd[0], bd[1], HR*.5, c.hair); S.px(bd[0] + nrm[0]*2, bd[1] + HR*.5 + 1, c.hair);
    eyes(OUTLINE, '#ffffff');
    for (const e of [eye, eye2]) { S.rect(e[0] - 2, e[1] - 2, 5, 1, '#1a1626'); S.rect(e[0] - 2, e[1] + 2, 5, 1, '#1a1626'); S.px(e[0] - 2, e[1], '#1a1626'); S.px(e[0] + 2, e[1], '#1a1626'); S.px(e[0] + 1, e[1] - 1, '#9fd0ff'); }
    const b0 = add(add(hc, up, HR*.45), nrm, -HR*1.25), b1 = add(add(hc, up, HR*.45), nrm, HR*1.3);
    const tip = add(add(hc, up, HR*2.7), nrm, -HR*1.2), mid = add(add(hc, up, HR*1.7), nrm, HR*.1);
    S.poly([b0, b1, mid, tip, add(add(hc, up, HR*1.3), nrm, -HR*.8)], c.hat);
    S.poly([b0, add(add(hc, up, HR*1.3), nrm, -HR*.8), tip], c.hatS);
    seg(add(b0, up, -.5), add(b1, up, -.5), 2, c.hatS);
    seg(add(add(hc, up, HR*.75), nrm, -HR*.9), add(add(hc, up, HR*.75), nrm, HR*.95), 1, c.gold);
    const sy = add(add(hc, up, HR*1.25), nrm, HR*.05);
    for (const [x, y] of [[-3,0],[-2,-1],[-2,1],[3,0],[2,-1],[2,1],[1,-2],[0,0],[-1,2]]) S.px(sy[0] + x, sy[1] + y, '#ffd27a');
    S.px(tip[0], tip[1], '#ffd27a');
  } else if (st === 'minotaur') {
    const mz = add(add(hc, nrm, HR*.62), up, -HR*.38);
    S.ell(mz[0], mz[1], HR*.55, HR*.42, c.snout);
    S.px(mz[0] + nrm[0]*2, mz[1], OUTLINE); S.px(mz[0] - 1, mz[1], OUTLINE);
    S.disc(mz[0], mz[1] + HR*.35, 1.5, '#ffd27a'); S.px(mz[0], mz[1] + HR*.35, c.snout);
    eyes(c.eye, null);
    for (const [side, l] of [[-1, 1], [1, 1.15]]) {
      const h0 = add(add(hc, up, HR*.55), nrm, side*HR*.55);
      const h1 = add(add(h0, up, HR*.35), nrm, side*HR*.85*l), h2 = add(add(h1, up, HR*.75), nrm, side*HR*.15);
      seg(h0, h1, 3, c.horn); seg(h1, h2, 2, c.horn); S.px(h2[0], h2[1], '#8d8468');
    }
    const ear = add(add(hc, up, HR*.2), nrm, -HR*1.05); S.ell(ear[0], ear[1], 2.5, 1.5, c.skinS);
  } else if (st === 'goblin') {
    const e0 = add(add(hc, nrm, -HR*.25), up, HR*.15);
    S.poly([e0, add(add(hc, nrm, -HR*1.6), up, HR*.75), add(add(hc, nrm, -HR*.45), up, -HR*.3)], c.skin);
    S.px(...add(add(hc, nrm, -HR*1.05), up, HR*.4), c.skinS);
    const ns = add(add(hc, nrm, HR + .5), up, -1); S.px(ns[0], ns[1], c.skin); S.px(ns[0] + nrm[0], ns[1] + 1, c.skinS);
    eyes(c.eye, OUTLINE);
    const m = add(add(hc, nrm, HR*.4), up, -HR*.6); S.px(m[0], m[1], OUTLINE); S.px(m[0] + 1, m[1], '#ece6f6');
  } else if (st === 'orc') {
    cap(c.skinS, HR*.75);
    seg(add(add(hc, nrm, 0), up, HR*.3), add(add(hc, nrm, HR), up, HR*.22), 1, '#2a2438');
    eyes(c.eye, null);
    const tk = add(add(hc, nrm, HR*.62), up, -HR*.6); S.px(tk[0], tk[1], '#ece6f6'); S.px(tk[0], tk[1] - 1, '#ece6f6');
    const tn = add(hc, up, HR + 1); seg(tn, add(add(tn, up, 3), nrm, -2), 2, c.hair);
  } else {
    for (const e of [eye, eye2]) { S.rect(e[0] - 1, e[1] - 1, 3, 3, OUTLINE); S.px(e[0], e[1], c.eye); }
    const jw = add(add(hc, nrm, 1), up, -HR + .5); S.rect(jw[0] - 2, jw[1], 4, 2, c.bone); S.px(jw[0], jw[1], OUTLINE);
    S.px(...add(add(hc, nrm, HR*.8), up, -.5), OUTLINE);
  }
  // escudo
  if (rig.shield === 'wall') {
    const sc = add(add(bh, nrm, 4*k), up, 2);
    const w2 = 6*k, h2 = 9*k;
    S.rect(sc[0] - w2, sc[1] - h2, w2*2, h2*2, '#5a2418');
    for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 3; xx++) { const bx = sc[0] - w2 + 1 + xx*w2*.66 + (yy % 2 ? w2*.33 : 0), by = sc[1] - h2 + 1 + yy*h2*.4; S.rect(Math.min(bx, sc[0] + w2 - 4), by, w2*.6, h2*.32, yy % 2 ? '#a8432a' : '#b8563a'); }
    for (let i = 0; i < 4; i++) { const fx0 = sc[0] - w2 + 2 + i*w2*.5; S.poly([[fx0 - 2, sc[1] - h2], [fx0 + 1, sc[1] - h2 - 5 - (i % 2)*3], [fx0 + 3, sc[1] - h2]], i % 2 ? '#ffd23f' : '#ff8a3d'); }
  } else if (rig.shield) {
    const sc = add(add(bh, nrm, 3*k), up, 1);
    S.ell(sc[0], sc[1], 5*k, 7.5*k, c.gold);
    S.ell(sc[0], sc[1], 4*k, 6.3*k, c.shield);
    S.ell(sc[0] - 1, sc[1] - 1.5, 2.2*k, 3.6*k, c.shieldL);
    for (const [x, y] of [[-2,-1],[-3,0],[-2,1],[2,-1],[3,0],[2,1],[-2,-2],[-2,2],[2,-2],[2,2]]) S.px(sc[0] + x, sc[1] + y, '#ece6f6');
  }
  // brazo delantero
  seg(shF, fe, AW, armC[1]); seg(fe, fh, AW, armC[1]);
  if (st === 'warrior') S.disc(fe[0], fe[1], 1.5, c.metal);
  if (st === 'orc') { seg(fe, add(fe, D(p.fa[0] + p.fa[1]), 3), AW + 1, c.armor); }
  S.disc(fh[0], fh[1], 1.5*k, hand);
  // arma
  const wa = p.fa[0] + p.fa[1] + (p.wpn || 0);
  paintWeapon(S, weapon || rig.weapon, fh, D(wa), Math.max(.85, k));
  return { hx:hc[0], hy:hc[1], hr:HR };
}
/**
 * Devuelve una pose por nombre. Admite mezclas 'a~b~k': interpola de la pose a
 * a la b con el factor k (0..1) y guarda el resultado en POSES.
 * @param {string} name Por ejemplo 'walk0' o 'walk0~walk1~0.5'.
 * @returns {object}
 */
function getPose(name){
  let p = POSES[name];
  if (p) return p;
  const [an, bn, ks] = name.split('~'), a = getPose(an), b = getPose(bn), k = parseFloat(ks);
  if (a.down || b.down) return POSES[name] = b;
  const l = (x, y) => (x || 0) + ((y || 0) - (x || 0))*k;
  const l2 = (x, y) => [l(x[0], y[0]), l(x[1], y[1])];
  return POSES[name] = { lean:l(a.lean, b.lean), hip:l(a.hip, b.hip), wpn:l(a.wpn, b.wpn), bl:l2(a.bl, b.bl), fl:l2(a.fl, b.fl), ba:l2(a.ba, b.ba), fa:l2(a.fa, b.fa) };
}
/**
 * Sprite cacheado de un personaje en una pose.
 * @param {string} key Clave de RIGS.
 * @param {string} pose Nombre de pose (admite mezclas, ver getPose).
 * @param {string} [weapon]
 * @returns {object} Sprite (ver sprite()).
 */
function rigSprite(key, pose, weapon){
  return sprite('rig|' + key + '|' + pose + '|' + (weapon || ''), 80, 84, S => paintRig(S, RIGS[key], getPose(pose), weapon));
}
