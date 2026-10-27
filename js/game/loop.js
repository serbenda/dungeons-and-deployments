// Máquina de estados y actualización de cada fotograma.
'use strict';

function update(){
  t++;
  if (pressed('mute')) muted = !muted;
  switch (state) {
    case 'title':
      if (pressed('start') || pressed('atk')) { state = 'select'; sel = 0; sfx('coin'); titleT = 0; }
      else if (++titleT > 540) { titleT = 0; rankShow = { t:0, hi:-1, attract:true }; state = 'ranking'; }
      break;
    case 'story': updateStory(); break;
    case 'initials': updateInitials(); break;
    case 'ranking': updateRanking(); break;
    case 'select': {
      if (pressed('left') || pressed('right')) { sel = 1 - sel; sfx('select'); }
      if (pressed('atk') || pressed('start')) { startGame(sel === 0 ? 'guerrero' : 'mago'); sfx('go'); }
      break; }
    case 'pause': if (pressed('start')) state = 'play'; break;
    case 'play': updatePlay(); break;
    case 'continue': {
      contT--;
      if (pressed('start') || pressed('atk')) { credits++; P.lives = 2; P.hp = P.max; P.state = 'getup'; P.t = 0; P.inv = 160; state = 'play'; sfx('coin'); addText('¡CRÉDITO INSERTADO!', camX + 84, 90, C.a, 90); }
      else if (contT <= 0) { state = 'over'; overT = 0; if (score > best) { best = score; try { localStorage.setItem('dnd-arcade-best', String(best)); } catch(e) {} } }
      break; }
    case 'over': if (++overT > 120 && (pressed('start') || pressed('atk'))) afterRun(); break;
    case 'clear': if (++clearT > 150 && (pressed('start') || pressed('atk'))) afterRun(); break;
  }
  for (const k in pressedQ) pressedQ[k] = false;
  MUSIC.play(musicFor());
  MUSIC.setVol(state === 'pause' ? .35 : 1);
  MUSIC.setRate(boss && boss.hp < boss.max/2 && state === 'play' ? 1.12 : 1);
  MUSIC.tick();
}
function updatePlay(){
  if (pressed('start')) { state = 'pause'; return; }
  if (flashT > 0) flashT--;
  if (rankFx && --rankFx.t <= 0) rankFx = null;
  if (slowmo > 0) { slowmo--; if (slowmo % 3) return; }
  if (hitstop > 0) { hitstop--; return; }
  stageT++;
  if (P.chainT > 0 && --P.chainT === 0) P.chain = 0;
  if (banner && --banner.t <= 0) banner = null;
  if (goT > 0) goT--;
  if (mission && mission.t > 0) mission.t--;
  updatePlayer();
  if (state !== 'play') return;
  for (const e of foes.slice()) updateFoe(e);
  if (state !== 'play') return;
  for (const s of shots.slice()) {
    s.x += s.vx; s.life--;
    if (t % 2 === 0) fx.push({ x:s.x, y:s.y - s.z, vx:-s.vx*.1, vy:(Math.random() - .5)*.4, life:12, col:s.col, glow:s.glow });
    let hit = false;
    for (const e of foes.concat(crates)) {
      if (!(e.kind === 'crate' || alive(e))) continue;
      if (Math.abs(e.x - s.x) < 6 + halfW(e) && Math.abs(e.y - s.y) < 9) { damage(e, s.dmg, P, {}); hit = true; break; }
    }
    if (hit || s.life <= 0 || s.x < camX - 10 || s.x > camX + W + 10) { shots.splice(shots.indexOf(s), 1); if (hit) burst(s.x, s.y - s.z, s.col, 8, 1.4, s.glow); }
  }
  for (const s of eshots.slice()) {
    s.x += s.vx; s.y += s.vy; s.life--;
    if (t % 3 === 0) fx.push({ x:s.x, y:s.y - s.z, vx:0, vy:-.2, life:10, col:'#ff8a3d', glow:'rgb(255,138,61)' });
    if (Math.abs(s.x - P.x) < 9 && Math.abs(s.y - P.y) < 8 && P.z < 30 && P.state !== 'down') { eshots.splice(eshots.indexOf(s), 1); damage(P, 8, { x:s.x - s.vx*4, y:s.y }); continue; }
    if (s.life <= 0 || s.y < FY0 - 4 || s.y > FY1 + 4) eshots.splice(eshots.indexOf(s), 1);
  }
  const target = P.x - 130;
  if (target > camX) camX += Math.min(2.4, target - camX);
  const maxCam = secIdx < SECTIONS.length ? SECTIONS[secIdx].cam : LEVEL_END;
  camX = Math.min(camX, maxCam);
  if (!locked && secIdx < SECTIONS.length && camX >= SECTIONS[secIdx].cam) {
    locked = true; waveIdx = 0;
    const sec = SECTIONS[secIdx];
    mission = { text: sec.mission, t: 200 };
    if (sec.boss) { boss = mkDragon(camX + W + 80, 158); foes.push(boss); banner = { a:'¡CUIDADO!', b:'GUARIDA DE AUTOMATION', t:150 }; startStory('dragon'); }
    else {
      if (sec.golem) { golem = mkGolem(camX + 215, 152); foes.push(golem); addText('Un GÓLEM HIPERVISOR vigila la granja...', camX + 4, 58, C.u, 120); }
      if (sec.mimics) for (const [x, y] of sec.mimics) { const m = mkFoe('mimico', x, y); m.state = 'sleep'; m.face = -1; foes.push(m); }
      if (sec.totem) { const tt = mkFoe('totem', sec.totem[0], sec.totem[1]); tt.state = 'idle'; tt.t = 60; foes.push(tt); }
      spawnWave();
    }
  }
  if (locked) {
    const sec = SECTIONS[secIdx];
    if (!sec.boss && hostile().length === 0) {
      if (waveIdx < sec.waves.length - 1) { waveIdx++; spawnWave(); }
      else if (sec.miniboss && !mbDone[secIdx]) {
        mbDone[secIdx] = true;
        if (sec.miniboss === 'minotauro') { const m = mkFoe('minotauro', camX + W + 30, 158); m.state = 'enter'; m.face = -1; foes.push(m); lastFoe = m; banner = { a:'¡JEFE!', b:'MINOTAURO DEL FIREWALL', t:140 }; startStory('mino'); }
        else { const h = spawnHydra(camX + 262); lastFoe = h; banner = { a:'¡JEFE!', b:'HIDRA RAID', t:140 }; sfx('roar'); shake = 6; startStory('hidra'); }
      }
      else if (!(golem && golem.angry && alive(golem))) { locked = false; mission = { text: sec.close, t: 200, closed:true }; secIdx++; goT = 200; sfx('go'); }
    }
  }
  for (const f of fx.slice()) {
    if (f.ring || f.spark) { if (f.ring) f.r += (f.max - f.r)*.25; if (--f.life <= 0) fx.splice(fx.indexOf(f), 1); continue; }
    f.x += f.vx; f.y += f.vy; f.vy += f.big ? 0 : .08; f.vx *= .96;
    if (--f.life <= 0) fx.splice(fx.indexOf(f), 1);
  }
  for (const s of texts.slice()) { s.y -= .3; if (--s.life <= 0) texts.splice(texts.indexOf(s), 1); }
  for (const c of crates) if (c.flash > 0) c.flash--;
  if (shake > 0) { shake *= .86; if (shake < .4) shake = 0; }
}
