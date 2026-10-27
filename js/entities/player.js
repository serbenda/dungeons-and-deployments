// Control del jugador: combo, salto, agarre, armas y especiales.
'use strict';

function startPunch(n){ P.state = 'punch'; P.t = 0; P.combo = n; P.buffer = false; P.hitSet = new Set(); P.hitAny = false; sfx('swing'); }
function tryPickup(){
  const it = items.find(i => Math.abs(i.x - P.x) < 16 && Math.abs(i.y - P.y) < 9);
  if (!it) return false;
  items.splice(items.indexOf(it), 1);
  if (it.k === 'patito') {
    P.inv = 420; P.duck = 420; score += 500; sfx('food');
    addText('DEBUG CON PATITO: INVULNERABLE', P.x - 120, P.y - 66, '#ffd23f', 90); burst(P.x, P.y - 30, '#ffd23f', 16, 1.6, 'rgb(255,210,63)');
    P.state = 'pick'; P.t = 0; return true;
  }
  if (it.k === 'stack') {
    score += 500; sfx('special'); shake = 8; hitstop = 6;
    addText('COPIAR Y PEGAR DE STACK OVERFLOW', camX + 32, 70, '#f48024', 100);
    for (const e of foes.slice()) if (alive(e) && e.x > camX - 10 && e.x < camX + W + 10 && e.kind !== 'dragon' && !(e.kind === 'golem' && !e.angry)) damage(e, 28, P, { knock:true, pierce:true });
    if (boss && alive(boss)) damage(boss, 28, P, {});
    burst(P.x, P.y - 30, '#f48024', 30, 3, 'rgb(244,128,36)');
    P.state = 'pick'; P.t = 0; return true;
  }
  if (FOOD[it.k]) {
    const f = FOOD[it.k]; P.hp = Math.min(P.max, P.hp + f.heal); score += f.score; sfx('food');
    addText(f.name + ' +' + f.heal, P.x - 40, P.y - 64, C.g, 60); burst(P.x, P.y - 30, C.g, 12, 1.2, 'rgb(110,231,168)');
  } else {
    P.weapon = it.k; P.ammo = it.k === 'baculo' ? 12 : 10; sfx('pick');
    addText(it.k === 'baculo' ? 'BÁCULO DE PING' : 'MARTILLO DE TECLAS', P.x - 56, P.y - 64, C.a, 60);
  }
  P.state = 'pick'; P.t = 0;
  return true;
}
function canGrab(e){
  return GRUNTS[e.kind] && !e.d.slime && !e.d.nograb && !e.dead && (e.state === 'walk' || e.state === 'hurt' || e.state === 'windup')
    && Math.abs(e.y - P.y) < 6 && (e.x - P.x)*P.face > 0 && Math.abs(e.x - P.x) < 20 && P.z === 0;
}
function releaseGrab(thrown){
  const e = P.held; P.held = null;
  if (!e) return;
  if (!thrown && e.state === 'grabbed') { e.state = 'hurt'; e.t = 0; e.x += P.face*8; }
}
function throwHeld(dir){
  const e = P.held; P.held = null; P.face = dir;
  e.state = 'thrown'; e.vx = dir*4.4; e.vz = 3.2; e.z = 8; e.lying = false; e.t = 0;
  e.x = P.x + dir*12;
  P.state = 'throw'; P.t = 0; sfx('heavy'); score += 100;
  addText('¡A PRODUCCIÓN!', P.x - 50, P.y - 68, C.a, 40);
}
function doSpecial(){
  if (P.hp <= 10) { addText('SIN VIDA PARA ESO', P.x - 64, P.y - 64, C.r, 40); return; }
  P.hp -= 10; P.state = 'special'; P.t = 0; P.fired = false; sfx('special');
  if (P.hero === 'guerrero') { P.vz = 3.6; addText('rd run -j deploy', P.x - 64, P.y - 80, C.a, 50); }
  else addText('git push --force', P.x - 64, P.y - 80, '#d9b8ff', 50);
}
function specialBlast(){
  P.fired = true; shake = 7; hitstop = 4;
  const war = P.hero === 'guerrero', rad = war ? 74 : 88, dmg = war ? 24 : 18;
  fx.push({ ring:true, x:P.x, y:P.y, r:6, max:rad, col: war ? C.e : '#b98cff', life:26, runes:!war });
  if (war) { for (let i = 0; i < 18; i++) fx.push({ x:P.x + (Math.random() - .5)*60, y:P.y - 2, vx:(Math.random() - .5)*3, vy:-2 - Math.random()*2.5, life:30, col:pickC(['#6b5850', '#6b4a26', '#a99f86']) }); addText('JOB #42: OK', P.x - 44, P.y - 66, C.g, 60); }
  else { burst(P.x, P.y - 30, '#b98cff', 26, 2.6, 'rgb(185,140,255)'); addText('FORCED UPDATE', P.x - 52, P.y - 66, '#d9b8ff', 60); }
  for (const e of foes) if (alive(e) && Math.abs(e.x - P.x) < rad + halfW(e) && Math.abs(e.y - P.y) < 26) damage(e, dmg, P, { knock:true, power:1.3, pierce:true });
  for (const c of crates.slice()) if (Math.abs(c.x - P.x) < rad && Math.abs(c.y - P.y) < 26) breakCrate(c);
  if (!war) { shots = shots.filter(s => s.owner === P); eshots = []; }
}
function loseLife(){
  if (P.lives > 0) {
    P.lives--; P.hp = P.max; P.state = 'getup'; P.t = 0; P.inv = 160; P.weapon = null;
    addText('¡HOTFIX APLICADO!', P.x - 64, P.y - 80, C.g, 80);
    for (const e of foes) if (alive(e) && e.kind !== 'dragon' && !(e.d && e.d.boss) && Math.abs(e.x - P.x) < 100) { e.state = 'down'; e.lying = false; e.vz = 2.5; e.vx = Math.sign(e.x - P.x || 1)*2.4; e.t = 0; }
    burst(P.x, P.y - 30, C.g, 24, 2.4, 'rgb(110,231,168)'); sfx('special');
  } else { state = 'continue'; contT = 600; sfx('roar'); }
}
function updatePlayer(){
  const p = P;
  if (p.inv > 0) p.inv--;
  if (p.flash > 0) p.flash--;
  if (p.hitT > 0) p.hitT--;
  if (p.z > 0 || p.vz > 0) { p.vz -= .36; p.z += p.vz; if (p.z <= 0) { p.z = 0; p.vz = 0; playerLand(); } }
  p.t++;
  const mx = (held.right ? 1 : 0) - (held.left ? 1 : 0), my = (held.down ? 1 : 0) - (held.up ? 1 : 0);
  switch (p.state) {
    case 'idle': case 'walk': {
      const atk = pressed('atk'), jmp = pressed('jump'), spc = pressed('special');
      if (spc || (atk && jmp)) { doSpecial(); break; }
      if (jmp) { p.state = 'jump'; p.vz = 5.4; p.jx = mx*p.h.spd*1.1; p.jy = my*p.h.spd*.6; p.kicked = false; p.hitSet = new Set(); sfx('jump'); break; }
      if (atk) {
        if (tryPickup()) break;
        if (p.weapon === 'baculo') { p.state = 'shoot'; p.t = 0; break; }
        startPunch(p.comboGap > 0 && p.combo > 0 && p.combo < 3 && p.lastHit ? p.combo + 1 : 1);
        break;
      }
      if (mx || my) {
        p.x += mx*p.h.spd; p.y += my*p.h.spd*.65; if (mx) p.face = mx; p.state = 'walk';
        if (mx === p.face) { const e = foes.find(canGrab); if (e) { if (++p.grabT > 10) { p.held = e; e.state = 'grabbed'; e.t = 0; p.state = 'grab'; p.t = 0; p.knees = 0; p.grabT = 0; } } else p.grabT = 0; }
        else p.grabT = 0;
      } else { p.state = 'idle'; p.grabT = 0; }
      if (p.comboGap > 0) p.comboGap--; else p.combo = 0;
      break; }
    case 'punch': {
      const fin = p.combo === 3, len = fin ? 18 : 12;
      if (p.t >= (fin ? 7 : 3) && p.t <= (fin ? 10 : 6)) {
        const reach = p.weapon === 'martillo' ? 30 : (fin ? 27 : 24);
        for (const e of foes.concat(crates)) {
          if (p.hitSet.has(e) || !(e.kind === 'crate' || alive(e)) || e.state === 'grabbed') continue;
          if (!inFront(p, e, reach)) continue;
          p.hitSet.add(e);
          const dmg = p.h.dmg[p.combo - 1] + (p.weapon === 'martillo' ? 7 : 0);
          if (damage(e, dmg, p, { knock: fin && e.kind !== 'dragon' })) {
            p.hitAny = true;
            if (fin && e.kind !== 'crate') flashT = Math.max(flashT, 3);
            if (p.weapon === 'martillo' && e.kind !== 'crate' && --p.ammo <= 0) { p.weapon = null; addText('MARTILLO ROTO', p.x - 48, p.y - 64, C.r, 40); burst(p.x + p.face*20, p.y - 30, C.w, 12); }
          }
        }
      }
      if (p.t > 4 && pressed('atk')) p.buffer = true;
      if (fin && p.t === 7) { p.x += p.face*4; shake = 2; }
      if (fin && p.t === 8 && p.hero === 'mago' && !p.weapon) { shots.push({ x:p.x + p.face*22, y:p.y, z:36, vx:p.face*4.6, owner:p, dmg:10, life:50, col:'#b98cff', glow:'rgb(185,140,255)' }); addText('console.log()', p.x - 48, p.y - 74, '#d9b8ff', 36); sfx('shoot'); }
      if (p.t >= len) {
        p.lastHit = p.hitAny;
        if (p.buffer && !fin && p.hitAny) startPunch(p.combo + 1);
        else if (p.buffer && !fin) startPunch(1);
        else { p.state = 'idle'; p.comboGap = fin ? 0 : 14; if (fin) p.combo = 0; }
      }
      break; }
    case 'shoot': {
      if (p.t === 3) {
        shots.push({ x:p.x + p.face*20, y:p.y, z:34, vx:p.face*5.5, owner:p, dmg:13, life:70, col:C.b, glow:'rgb(94,200,242)' }); sfx('shoot');
        if (--p.ammo <= 0) { p.weapon = null; addText('BÁCULO AGOTADO', p.x - 52, p.y - 64, C.r, 40); }
      }
      if (p.t >= 12) p.state = 'idle';
      break; }
    case 'pick': if (p.t >= 10) p.state = 'idle'; break;
    case 'jump': {
      p.x += p.jx; p.y += p.jy*.4;
      if (!p.kicked && pressed('atk')) { p.kicked = true; sfx('swing'); }
      if (p.kicked) {
        for (const e of foes.concat(crates)) {
          if (p.hitSet.has(e) || !(e.kind === 'crate' || alive(e)) || e.state === 'grabbed') continue;
          if (!inFront(p, e, 26, 10)) continue;
          p.hitSet.add(e); damage(e, p.hero === 'guerrero' ? 14 : 12, p, { knock: e.kind !== 'dragon' });
        }
      }
      if (pressed('special')) doSpecial();
      break; }
    case 'land': if (p.t >= 6) p.state = 'idle'; break;
    case 'grab': {
      const e = p.held;
      if (!e || e.dead) { p.held = null; p.state = 'idle'; break; }
      e.x = p.x + p.face*16; e.y = p.y; e.face = -p.face;
      if (pressed('atk') || p.kneeBuf) {
        p.kneeBuf = false;
        if (mx && mx !== p.face) { throwHeld(mx); break; }
        if (++p.knees >= 3) { throwHeld(p.face); break; }
        damage(e, 6, p); if (e.state === 'hurt') e.state = 'grabbed';
        p.state = 'knee'; p.t = 0; break;
      }
      if (pressed('jump') || p.t > 110) { releaseGrab(false); p.state = 'idle'; }
      break; }
    case 'knee': {
      const e = p.held;
      if (e && !e.dead) { e.x = p.x + p.face*16; e.y = p.y; }
      if (pressed('atk')) p.kneeBuf = true;
      if (p.t >= 9) { p.state = (e && !e.dead && e.state === 'grabbed') ? 'grab' : 'idle'; if (p.state === 'idle') p.held = null; }
      break; }
    case 'throw': if (p.t >= 14) p.state = 'idle'; break;
    case 'special': {
      if (p.hero === 'mago' && p.t === 8) specialBlast();
      if (p.hero === 'guerrero' && p.t > 4 && p.z === 0 && !p.fired) specialBlast();
      if (p.t >= 30) p.state = 'idle';
      break; }
    case 'hurt': if (p.t >= 16) p.state = 'idle'; break;
    case 'down': {
      if (!p.lying) p.x += p.vx;
      else if (p.t >= 45) { if (p.hp <= 0) loseLife(); else { p.state = 'getup'; p.t = 0; p.inv = 70; } }
      break; }
    case 'getup': if (p.t >= 18) p.state = 'idle'; break;
  }
  p.y = clamp(p.y, FY0, FY1);
  p.x = clamp(p.x, camX + 12, camX + W - 12);
}
function playerLand(){
  if (P.state === 'jump') { P.state = 'land'; P.t = 0; sfx('land'); burst(P.x, P.y, '#4b4470', 4, 1); }
  else if (P.state === 'down' && !P.lying) { P.lying = true; P.t = 0; shake = 2; burst(P.x, P.y, '#4b4470', 6); sfx('land'); }
}
