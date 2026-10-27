// IA de los enemigos, el gólem y el Dragón Negro.
'use strict';

function updateFoe(e){
  if (e.flash > 0) e.flash--;
  if (e.hitT > 0) e.hitT--;
  if (e.kind !== 'dragon' && e.kind !== 'cabeza' && e.kind !== 'hidra' && !(e.d.fly && e.state !== 'down' && e.state !== 'thrown') && e.state !== 'grabbed' && (e.z > 0 || e.vz > 0)) {
    e.vz -= .36; e.z += e.vz;
    if (e.z <= 0) { e.z = 0; e.vz = 0; foeLand(e); }
  }
  e.t++;
  if (e.kind !== 'dragon' && e.kind !== 'hidra' && e.kind !== 'cabeza' && e.kind !== 'totem') {
    if (e.x > camX + 12 && e.x < camX + W - 12) e.seen = true;
    if (e.seen && locked && e.state !== 'charge' && !(e.kind === 'golem' && e.state === 'charge')) e.x = clamp(e.x, camX + 10, camX + W - 10);
  }
  if (e.kind === 'golem') return updateGolem(e);
  if (e.kind === 'dragon') return updateDragon(e);
  if (e.kind === 'minotauro') return updateMinotaur(e);
  if (e.kind === 'cabeza') return updateHead(e);
  if (e.kind === 'hidra') return updateHydra(e);
  if (e.kind === 'totem') return updateTotem(e);
  if (e.d.fly && (e.state === 'walk' || e.state === 'dive' || e.state === 'hurt')) { updateBat(e); e.y = clamp(e.y, FY0, FY1); return; }
  if (e.d.ghost) { e.ph = (e.ph || (e.seed*7)) + 1; e.hidden = (e.ph % 240) > 160 && (e.state === 'walk'); }
  switch (e.state) {
    case 'sleep': if (Math.abs(P.x - e.x) < 60 && Math.abs(P.y - e.y) < 30 || e.hp < e.max) { e.state = 'walk'; e.cool = 20; sfx('roar'); addText('¡DISCO AL 100%!', e.x - 56, e.y - 50, '#ffd27a', 50); } break;
    case 'rise': if (e.t > 45) { e.state = 'walk'; e.t = 0; if (e.kind === 'esqueleto') addText('¡PROCESO ZOMBI!', e.x - 52, e.y - 62, C.r, 40); } break;
    case 'walk': {
      if (e.cool > 0) e.cool--;
      if (e.role === 'patcher' && golem && !golem.angry && alive(golem)) {
        const dx = golem.x - 30 - e.x, dy = golem.y - e.y;
        e.x += Math.sign(dx)*Math.min(Math.abs(dx), e.d.spd); e.y += Math.sign(dy)*Math.min(Math.abs(dy), e.d.spd*.6);
        e.face = 1; e.moving = true;
        if (Math.abs(dx) < 4 && Math.abs(dy) < 4) { e.state = 'patch'; e.t = 0; addText('runa de parche manual...', e.x - 90, e.y - 60, C.r, 70); }
        break;
      }
      if ((P.state === 'down' && P.lying) || state !== 'play') { e.x += e.hover*.4; break; }
      const attackers = foes.filter(f => f.aggro && f !== e && !f.dead).length;
      if (!e.aggro && e.cool <= 0 && attackers < 2) e.aggro = true;
      const side = e.x < P.x ? -1 : 1;
      const tx = P.x + side*(e.aggro ? 26 : 74 + e.hover*20), ty = e.aggro ? P.y : clamp(P.y + e.hover*24, FY0, FY1);
      const dx = tx - e.x, dy = ty - e.y;
      e.x += Math.sign(dx)*Math.min(Math.abs(dx), e.d.spd); e.y += Math.sign(dy)*Math.min(Math.abs(dy), e.d.spd*.6);
      if (!e.d.slowturn) e.face = P.x > e.x ? 1 : -1; else if (++e.turnT > 50) { e.turnT = 0; e.face = P.x > e.x ? 1 : -1; }
      e.moving = Math.abs(dx) > .5 || Math.abs(dy) > .5;
      if (!e.hidden && e.aggro && Math.abs(dx) < 5 && Math.abs(dy) < 3 && e.cool <= 0 && P.z < 10) { e.state = 'windup'; e.t = 0; e.combo = 1; }
      break; }
    case 'windup': if (e.t >= e.d.wind) { e.state = 'attack'; e.t = 0; e.hitDone = false; sfx('swing'); } break;
    case 'attack': {
      if ((e.d.slime || e.d.hopper) && e.t < 8) e.x += e.face*1.6;
      if (e.t <= 6 && !e.hitDone && inFront(e, P, 22)) { e.hitDone = true; damage(P, e.d.dmg, e, { knock: e.kind === 'orco' && e.combo === 2 }); }
      if (e.t > 12) {
        if (e.kind === 'orco' && e.combo === 1 && Math.random() < .6) { e.state = 'windup'; e.t = 8; e.combo = 2; }
        else { e.state = 'walk'; e.aggro = false; e.cool = 50 + Math.random()*70; }
      }
      break; }
    case 'hurt': if (e.t > 16) e.state = 'walk'; break;
    case 'patch': if (e.t >= 70) { angerGolem('¡PARCHE MANUAL EN EL GÓLEM!'); e.role = null; e.state = 'walk'; } break;
    case 'down': case 'thrown': {
      if (!e.lying) {
        e.x += e.vx;
        if (e.state === 'thrown') {
          for (const o of foes) { if (o === e || !alive(o)) continue; if (Math.abs(o.x - e.x) < 14 + halfW(o) && Math.abs(o.y - e.y) < 10 && o.state !== 'down') damage(o, 20, P, { knock:true, pierce:true }); }
          for (const c of crates.slice()) if (Math.abs(c.x - e.x) < 16 && Math.abs(c.y - e.y) < 10) breakCrate(c);
        }
      } else if (e.dead) {
        if (e.kind === 'esqueleto' && !e.revived && e.t > 50 && Math.random() < .6) { e.revived = true; e.dead = false; e.hp = 22; e.state = 'getup'; e.t = 0; addText('¡SE REINICIA!', e.x - 44, e.y - 60, C.r, 50); burst(e.x, e.y - 10, C.r, 10, 1.2, 'rgb(255,93,115)'); }
        else if (e.t > 50) { foes.splice(foes.indexOf(e), 1); score += e.d.score; addText('+' + e.d.score, e.x - 12, e.y - 44, C.a, 40); if (lastFoe === e) lastFoe = null; }
      } else if (e.t > 40) { e.state = 'getup'; e.t = 0; }
      break; }
    case 'getup': if (e.t > 16) { e.state = 'walk'; e.cool = 30; e.hitsTaken = 0; } break;
  }
  e.y = clamp(e.y, FY0, FY1);
}
function updateBat(e){
  if (e.state === 'hurt') { if (e.t > 12) { e.state = 'walk'; e.t = 0; } return; }
  if (e.z < 22) e.z += (22 - e.z)*.1;
  if (e.state === 'walk') {
    e.ang = (e.ang || e.seed) + .035;
    const tx = P.x + Math.cos(e.ang)*54, ty = clamp(P.y + Math.sin(e.ang*1.3)*16, FY0, FY1);
    e.x += clamp(tx - e.x, -1.6, 1.6); e.y += clamp(ty - e.y, -1, 1);
    e.z = 22 + Math.sin(t/8 + e.seed)*4; e.face = P.x > e.x ? 1 : -1;
    if (e.cool > 0) e.cool--;
    else if (state === 'play' && P.state !== 'down') { e.state = 'dive'; e.t = 0; e.dx = (P.x - e.x)/32; e.dy = (P.y - e.y)/32; }
  } else if (e.state === 'dive') {
    e.x += e.dx; e.y += e.dy; e.z = Math.max(10, e.z - .5);
    if (Math.abs(P.x - e.x) < 12 && Math.abs(P.y - e.y) < 8 && P.z < 24) { damage(P, e.d.dmg, e); e.state = 'walk'; e.cool = 90 + Math.random()*60; addText(pickC(['PING!', 'TTL 0', 'ICMP!']), e.x - 16, e.y - 50, '#9fd0ff', 30); }
    if (e.t > 40) { e.state = 'walk'; e.cool = 80 + Math.random()*60; }
  }
}
function updateTotem(e){
  if (e.flash > 0) e.flash--;
  const pods = foes.filter(f => f.kind === 'pod' && !f.dead).length;
  if (pods < 3 && e.t % 130 === 0 && state === 'play') {
    const p = mkFoe('pod', e.x + (Math.random() < .5 ? -24 : 24), clamp(e.y + (Math.random() - .5)*30, FY0, FY1));
    p.state = 'rise'; p.t = 20; foes.push(p); burst(p.x, p.y - 8, '#5ec8f2', 10, 1.4, 'rgb(94,200,242)');
    addText('replica ' + (pods + 1) + '/3', e.x - 40, e.y - 80, '#9fd0ff', 40);
  }
}
function foeLand(e){
  if (e.state === 'thrown') { e.state = 'down'; const was = e.hp; e.hp -= 20; if (e.hp <= 0) { e.hp = 0; e.dead = true; } e.lying = true; e.t = 0; shake = 3; burst(e.x, e.y, '#4b4470', 8); sfx('heavy'); if (was > 0) score += 200; return; }
  if (e.state === 'down' && !e.lying) { e.lying = true; e.t = 0; burst(e.x, e.y, '#4b4470', 6); sfx('land'); }
}

/* --- gólem */
function mkGolem(x, y){ return { kind:'golem', d:{ name:'GÓLEM HIPERVISOR', short:'HIPERVISOR' }, x, y, z:0, vz:0, vx:0, face:-1, hp:120, max:120, state:'walk', t:0, angry:false, flash:0, hitT:0, hitsTaken:0, tx:x, ty:y, lying:false, dead:false }; }
function angerGolem(msg){
  if (!golem || golem.angry || !alive(golem)) return;
  golem.angry = true; golem.state = 'roar'; golem.t = 0; sfx('roar'); shake = 6;
  addText(msg, golem.x - 100, golem.y - 92, C.r, 90);
  addText('¡GRRROOOM!', golem.x - 36, golem.y - 78, C.a, 70);
}
function updateGolem(e){
  e.y = clamp(e.y, FY0, FY1);
  switch (e.state) {
    case 'walk': {
      if (!e.angry) {
        if (e.t % 140 === 0) { e.tx = clamp(camX + 60 + Math.random()*200, camX + 40, camX + W - 40); e.ty = FY0 + Math.random()*(FY1 - FY0); }
        const dx = e.tx - e.x, dy = e.ty - e.y;
        e.x += Math.sign(dx)*Math.min(Math.abs(dx), .4); e.y += Math.sign(dy)*Math.min(Math.abs(dy), .25);
        if (Math.abs(dx) > 1) e.face = Math.sign(dx);
        e.moving = Math.abs(dx) > 1 || Math.abs(dy) > 1;
        break;
      }
      const targets = [P].filter(x => x.state !== 'down' && state === 'play').concat(foes.filter(f => f !== e && alive(f) && f.kind !== 'dragon' && f.state !== 'down'));
      let tg = null, bd = 1e9;
      for (const o of targets) { const d = Math.abs(o.x - e.x) + Math.abs(o.y - e.y)*2; if (d < bd) { bd = d; tg = o; } }
      if (!tg) break;
      const dy = tg.y - e.y; e.y += Math.sign(dy)*Math.min(Math.abs(dy), .9);
      const dx = tg.x - e.x;
      if (Math.abs(dx) < 70) e.x -= Math.sign(dx)*.7; else if (Math.abs(dx) > 140) e.x += Math.sign(dx)*.8;
      e.face = Math.sign(dx) || e.face; e.moving = true;
      if (Math.abs(dy) < 5 && e.t > 50) { e.state = 'chargeWind'; e.t = 0; }
      break; }
    case 'roar': if (e.t > 50) { e.state = 'walk'; e.t = 0; } break;
    case 'chargeWind': if (e.t > 24) { e.state = 'charge'; e.t = 0; e.hitSet = new Set(); sfx('roar'); } break;
    case 'charge': {
      e.x += e.face*3.2;
      if (e.t % 6 === 0) { burst(e.x - e.face*16, e.y, '#4b4470', 3, 1); shake = 1.5; }
      for (const o of [P].concat(foes)) {
        if (o === e || e.hitSet.has(o) || (o !== P && !alive(o)) || o.kind === 'dragon') continue;
        const dx = (o.x - e.x)*e.face;
        if (dx > 0 && dx < 36 && Math.abs(o.y - e.y) < 12 && (o.z || 0) < 20) { e.hitSet.add(o); damage(o, 16, e, { knock:true, power:1.3, pierce:true }); }
      }
      if (e.t > 70 || e.x < camX - 40 || e.x > camX + W + 40) { e.state = 'rest'; e.t = 0; e.x = clamp(e.x, camX - 30, camX + W + 30); }
      break; }
    case 'rest': if (e.t > 55) { e.state = 'walk'; e.t = 0; } break;
    case 'down': {
      if (!e.lying) e.x += e.vx;
      else if (e.dead) { if (e.t > 60) { foes.splice(foes.indexOf(e), 1); score += 1500; addText('LEGACY APAGADO +1500', e.x - 80, e.y - 50, C.g, 80); golem = null; } }
      else if (e.t > 40) { e.state = 'walk'; e.t = 0; }
      break; }
  }
}

/* --- dragón */
function mkDragon(x, y){ return { kind:'dragon', d:{ name:'DRAGÓN NEGRO' }, x, y, z:0, vz:0, vx:0, face:-1, hp:440, max:440, state:'enter', t:0, poise:0, flash:0, summoned:false, cool:60, lying:false, dead:false, hitT:0 }; }
function updateDragon(b){
  b.y = clamp(b.y, FY0 + 6, FY1);
  const dxp = P.x - b.x, dyp = P.y - b.y;
  const mouthX = b.x + b.face*80;
  switch (b.state) {
    case 'enter': b.x -= .8; b.face = -1; if (b.x <= camX + 245) { b.state = 'roar'; b.t = 0; sfx('roar'); shake = 10; addText('¡¡GRRRAAAOOOR!!', b.x - 80, b.y - 130, C.g, 90); } break;
    case 'roar': if (b.t > 70) { b.state = 'idle'; b.t = 0; } break;
    case 'idle': {
      b.face = dxp >= 0 ? 1 : -1;
      b.y += Math.sign(dyp)*Math.min(Math.abs(dyp), .55);
      const want = Math.abs(dxp) - 96;
      if (Math.abs(want) > 10) b.x += Math.sign(dxp)*Math.sign(want)*.5;
      b.x = clamp(b.x, camX + 40, camX + W - 40);
      if (b.hp < b.max/2 && !b.summoned) {
        b.summoned = true; b.state = 'roar'; b.t = 0; sfx('roar'); shake = 6;
        addText('¡REFUERZOS DEL CLICKOPS!', camX + 64, 70, C.r, 100);
        foes.push(Object.assign(mkFoe('goblin', camX - 20, 140), { face:1 }), Object.assign(mkFoe('orco', camX + W + 20, 178), { face:-1 }));
        break;
      }
      if (--b.cool > 0) break;
      const behind = Math.sign(dxp) !== b.face;
      if (behind && Math.abs(dxp) < 80) { b.state = 'tailWind'; b.t = 0; break; }
      if (Math.abs(dxp) < 105 && Math.abs(dyp) < 14 && P.state !== 'down') { b.state = 'biteWind'; b.t = 0; }
      else if (b.hp < b.max*.65 && Math.random() < .3) { b.state = 'flyUp'; b.t = 0; sfx('roar'); }
      else if (Math.abs(dyp) < 10) { b.state = 'breathWind'; b.t = 0; addText('rm -rf /*', b.x - 36, b.y - 120, C.g, 50); }
      else b.cool = 20;
      break; }
    case 'breathWind': if (b.t > 38) { b.state = 'breath'; b.t = 0; sfx('roar'); } break;
    case 'breath': {
      for (let i = 0; i < 3; i++) fx.push({ x:mouthX + b.face*Math.random()*8, y:b.y - 66 + Math.random()*6, vx:b.face*(3 + Math.random()*2.5), vy:(Math.random() - .5)*.8 + .62, life:30 + (Math.random()*20 | 0), col: Math.random() < .5 ? C.g : C.gd, big:true, glow:'rgb(110,231,168)' });
      const dx = (P.x - mouthX)*b.face;
      if (b.t % 12 === 0 && dx > -10 && dx < 190 && Math.abs(P.y - b.y) < 9 && P.z < 30) { if (damage(P, 5, b)) P.x += b.face*4; }
      if (b.t % 12 === 0) for (const f of foes) if (f.kind !== 'dragon' && alive(f)) { const fdx = (f.x - mouthX)*b.face; if (fdx > -10 && fdx < 190 && Math.abs(f.y - b.y) < 9) damage(f, 5, b); }
      if (b.t > 70) { b.state = 'idle'; b.cool = 70; b.poise = 0; }
      break; }
    case 'biteWind': if (b.t > 20) { b.state = 'bite'; b.t = 0; b.hitDone = false; sfx('heavy'); addText('SEGFAULT', b.x - 32, b.y - 116, C.r, 36); } break;
    case 'bite': {
      if (b.t < 8) b.x += b.face*2.2;
      const dx = (P.x - b.x)*b.face;
      if (!b.hitDone && b.t < 10 && dx > 30 && dx < 112 && Math.abs(dyp) < 13 && P.z < 30) { b.hitDone = true; damage(P, 15, b, { knock:true, power:1.2 }); }
      if (b.t > 22) { b.state = 'idle'; b.cool = 50; b.poise = 0; }
      break; }
    case 'tailWind': if (b.t > 16) { b.state = 'tail'; b.t = 0; b.hitDone = false; sfx('heavy'); } break;
    case 'tail': {
      const dx = (P.x - b.x)*-b.face;
      if (!b.hitDone && b.t < 10 && dx > 0 && dx < 92 && Math.abs(dyp) < 13 && P.z < 20) { b.hitDone = true; damage(P, 11, b, { knock:true }); }
      if (b.t > 20) { b.state = 'idle'; b.cool = 40; b.face *= -1; }
      break; }
    case 'flyUp': b.z += 4; if (b.z > 140) { b.state = 'hover'; b.t = 0; } break;
    case 'hover': {
      b.z = 140; b.x += clamp(P.x - b.x, -2.4, 2.4); b.y += clamp(P.y - b.y, -1.6, 1.6);
      if (b.t > 70) { b.state = 'slam'; b.t = 0; }
      break; }
    case 'slam': {
      b.z -= 9;
      if (b.z <= 0) {
        b.z = 0; b.state = 'land'; b.t = 0; shake = 10; sfx('boom'); burst(b.x, b.y, '#6b5850', 24, 3); addText('KERNEL PANIC', b.x - 48, b.y - 70, C.r, 60);
        fx.push({ ring:true, x:b.x, y:b.y, r:8, max:70, col:C.g, life:20 });
        if (Math.abs(P.x - b.x) < 60 && Math.abs(P.y - b.y) < 16 && P.z < 10) damage(P, 18, b, { knock:true, power:1.4 });
        for (const f of foes) if (f !== b && alive(f) && Math.abs(f.x - b.x) < 60 && Math.abs(f.y - b.y) < 16) damage(f, 18, b, { knock:true });
      }
      break; }
    case 'land': if (b.t > 40) { b.state = 'idle'; b.cool = 50; } break;
    case 'stagger': if (b.t > 40) { b.state = 'idle'; b.cool = 30; } break;
    case 'dying': {
      if (b.z > 0) b.z = Math.max(0, b.z - 6);
      if (b.t % 6 === 0) { burst(b.x + (Math.random() - .5)*90, b.y - Math.random()*90, Math.random() < .5 ? C.g : C.a, 10, 2.2, 'rgb(255,190,110)'); sfx('boom'); }
      shake = 3;
      if (b.t > 150) { foes.splice(foes.indexOf(b), 1); boss = null; startStory('outro', stageClear); }
      break; }
  }
}
function stageClear(){
  const secs = Math.floor(stageT/60);
  const timeBonus = Math.max(0, 30000 - secs*100), lifeBonus = P.hp*50 + P.lives*5000, comboBonus = P.maxChain*100;
  clearBonus = { secs, timeBonus, lifeBonus, comboBonus, maxChain:P.maxChain };
  score += timeBonus + lifeBonus + comboBonus;
  if (score > best) { best = score; try { localStorage.setItem('dnd-arcade-best', String(best)); } catch(e) {} }
  state = 'clear'; clearT = 0; sfx('coin');
}
