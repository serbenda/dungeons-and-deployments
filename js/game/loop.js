// Máquina de estados y actualización de cada fotograma.
'use strict';

/** Opción elegida en el menú del título: 0 jugar, 1 opciones, 2 logros. */
let titleSel = 0;
/** Cursores de la selección de héroe: uno por jugador ({ i: índice en HERO_ORDER, ok: confirmado }). */
let selP = [{ i:0, ok:false }, null];
/** Tiempo en la pantalla de créditos finales. */
let creditsT = 0;
const TITLE_MENU = ['JUGAR', 'MODO JEFES', 'OPCIONES', 'LOGROS'];
/**
 * Pasa a la selección de héroe. El dispositivo que ha entrado es el del jugador 1.
 */
function enterSelect(){
  state = 'select'; sel = 0; selP = [{ i:0, ok:false }, null];
  owner0 = lastDev; assignDevice(owner0, 0);
}
/**
 * Atiende una petición de unirse (START en un dispositivo nuevo) según el estado.
 */
function handleJoin(){
  const dev = joinReq; joinReq = null;
  if (!dev) return;
  if (state === 'select' && !selP[1]) { selP[1] = { i:(selP[0].i + 1) % HERO_ORDER.length, ok:false }; assignDevice(dev, 1); sfx('coin'); }
  else if ((state === 'play' || state === 'pause') && joinPlayer(dev)) state = 'play';
}
/**
 * Selección de héroe para uno o dos jugadores. Izquierda y derecha cambian de
 * héroe, A o START confirman y B deshace (o saca al jugador 2).
 */
function updateSelect(){
  for (let s = 0; s < 2; s++) {
    const c = selP[s]; if (!c) continue;
    ctxSlot = s;
    if (!c.ok) {
      if (pressed('left')) { c.i = (c.i + HERO_ORDER.length - 1) % HERO_ORDER.length; sfx('select'); }
      if (pressed('right')) { c.i = (c.i + 1) % HERO_ORDER.length; sfx('select'); }
      if (pressed('atk') || pressed('start')) { c.ok = true; sfx('pick'); }
      else if (s === 1 && pressed('jump')) { selP[1] = null; for (const d in DEV_SLOT) if (DEV_SLOT[d] === 1) assignDevice(d, null); }
    } else if (pressed('jump')) c.ok = false;
  }
  ctxSlot = -1;
  sel = selP[0].i;
  if (selP[0].ok && (!selP[1] || selP[1].ok)) { (playMode === 'jefes' ? startBossRush : startGame)(selP.filter(Boolean).map(c => HERO_ORDER[c.i])); sfx('go'); }
}
/**
 * Una actualización del juego (60 por segundo): lee los mandos, atiende a quien
 * quiere unirse, despacha según `state` y actualiza la música.
 */
function update(){
  t++;
  pollPads();
  if (joinReq) handleJoin();
  if (padToast && --padToast.t <= 0) padToast = null;
  if (pressed('mute')) muted = !muted;
  switch (state) {
    case 'title':
      if (owner0 !== null) resetDevices();
      if (playMode !== 'arcade' || rankMode !== 'arcade') { playMode = 'arcade'; loadRanking('arcade'); }
      if (stageIdx) stageIdx = 0;
      if (pressed('up')) { titleSel = (titleSel + TITLE_MENU.length - 1) % TITLE_MENU.length; sfx('select'); titleT = 0; }
      if (pressed('down')) { titleSel = (titleSel + 1) % TITLE_MENU.length; sfx('select'); titleT = 0; }
      if (pressed('start') || pressed('atk')) {
        sfx('coin'); titleT = 0;
        if (titleSel <= 1) { if (titleSel === 1) { playMode = 'jefes'; loadRanking('jefes'); } enterSelect(); }
        else if (titleSel === 2) { state = 'options'; optSel = 0; } else { state = 'logros'; achScroll = 0; }
      }
      else if (++titleT > 540) { titleT = 0; rankShow = { t:0, hi:-1, attract:true }; state = 'ranking'; }
      break;
    case 'options': updateOptions(); break;
    case 'keys': updateKeys(); break;
    case 'logros': updateAchievements(); break;
    case 'story': updateStory(); break;
    case 'initials': updateInitials(); break;
    case 'ranking': updateRanking(); break;
    case 'select': updateSelect(); break;
    case 'pause': if (pressed('start')) state = 'play'; break;
    case 'play': updatePlay(); break;
    case 'continue': {
      contT--;
      if (pressed('start') || pressed('atk')) {
        credits++; RUN.continues++;
        for (const p of PLAYERS) { p.out = false; p.lives = 2; p.hp = p.max; p.state = 'getup'; p.t = 0; p.inv = 160; }
        state = 'play'; sfx('coin'); addText('¡CRÉDITO INSERTADO!', camX + 84, 90, C.a, 90);
      }
      else if (contT <= 0) { state = 'over'; overT = 0; if (score > best) { best = score; try { localStorage.setItem('dnd-arcade-best', String(best)); } catch(e) {} } }
      break; }
    case 'over': if (++overT > 120 && (pressed('start') || pressed('atk'))) afterRun(); break;
    case 'clear': if (++clearT > 150 && (pressed('start') || pressed('atk'))) {
      if (playMode === 'jefes') afterRun();
      else if (stageIdx < STAGES.length - 1) { loadStage(stageIdx + 1); sfx('go'); }
      else { state = 'credits'; creditsT = 0; }
    } break;
    case 'credits': if (++creditsT > CREDITS_LEN || (creditsT > 60 && (pressed('start') || pressed('atk')))) afterRun(); break;
  }
  clearPressed();
  MUSIC.play(musicFor());
  MUSIC.setVol((state === 'pause' ? .35 : 1)*OPTS.music/8);
  MUSIC.setRate(boss && boss.hp < boss.max/2 && state === 'play' ? 1.12 : 1);
  MUSIC.tick();
}
/**
 * Hace aparecer al jefe de sección con su cartel y su viñeta.
 * @param {'minotauro'|'hidra'|'dba'|'cancerbero'} name
 */
function spawnMiniboss(name){
  if (name === 'minotauro' || name === 'dba' || name === 'autoscaler') {
    const m = mkFoe(name, camX + W + 30, 158); m.state = 'enter'; m.face = -1; foes.push(m); lastFoe = m;
    banner = { a:'¡JEFE!', b:m.d.name, t:140 };
  } else {
    lastFoe = spawnHydra(camX + 262, name === 'cancerbero' ? CERBERUS : name === 'kraken' ? KRAKEN : null);
    banner = { a:'¡JEFE!', b:lastFoe.d.name, t:140 }; sfx('roar'); shake = 6;
  }
  startStory(name === 'minotauro' ? 'mino' : name);
}
/**
 * Actualización de la partida: jugador, enemigos, proyectiles, cámara, secciones
 * (bloqueos, oleadas y jefes), partículas y textos.
 */
function updatePlay(){
  for (const p of PLAYERS) if (p.out && INP[p.slot].q.start) { INP[p.slot].q.start = false; revivePlayer(p); }
  if (pressed('start')) { state = 'pause'; return; }
  if (flashT > 0) flashT--;
  if (rankFx && --rankFx.t <= 0) rankFx = null;
  if (slowmo > 0) { slowmo--; if (slowmo % 3) return; }
  if (hitstop > 0) { hitstop--; return; }
  stageT++;
  for (const p of PLAYERS) if (p.chainT > 0 && --p.chainT === 0) p.chain = 0;
  if (banner && --banner.t <= 0) banner = null;
  if (goT > 0) goT--;
  if (mission && mission.t > 0) mission.t--;
  for (const p of PLAYERS) {
    if (p.out) continue;
    P = p; ctxSlot = p.slot;
    updatePlayer();
    if (state !== 'play') break;
  }
  ctxSlot = -1; P = PLAYERS[0];
  if (state !== 'play') return;
  for (const e of foes.slice()) { P = targetFor(e); updateFoe(e); }
  updateLocks(); updateDrops();
  P = PLAYERS[0];
  if (state !== 'play') return;
  for (const s of shots.slice()) {
    s.x += s.vx; s.life--;
    if (t % 2 === 0) fx.push({ x:s.x, y:s.y - s.z, vx:-s.vx*.1, vy:(Math.random() - .5)*.4, life:12, col:s.col, glow:s.glow });
    let hit = false;
    for (const e of foes.concat(crates)) {
      if (!(e.kind === 'crate' || alive(e))) continue;
      if (Math.abs(e.x - s.x) < 6 + halfW(e) && Math.abs(e.y - s.y) < 9) { damage(e, s.dmg, s.owner, {}); hit = true; break; }
    }
    if (hit || s.life <= 0 || s.x < camX - 10 || s.x > camX + W + 10) { shots.splice(shots.indexOf(s), 1); if (hit) burst(s.x, s.y - s.z, s.col, 8, 1.4, s.glow); }
  }
  for (const s of eshots.slice()) {
    s.x += s.vx; s.y += s.vy; s.life--;
    if (t % 3 === 0) fx.push({ x:s.x, y:s.y - s.z, vx:0, vy:-.2, life:10, col:'#ff8a3d', glow:'rgb(255,138,61)' });
    const q = activePlayers().find(p => Math.abs(s.x - p.x) < 9 && Math.abs(s.y - p.y) < 8 && p.z < 30 && p.state !== 'down');
    if (q) { eshots.splice(eshots.indexOf(s), 1); damage(q, 8, { x:s.x - s.vx*4, y:s.y }); continue; }
    if (s.life <= 0 || s.y < FY0 - 4 || s.y > FY1 + 4) eshots.splice(eshots.indexOf(s), 1);
  }
  // Cámara compartida: sigue al que va delante sin dejar fuera al que va detrás.
  const xs = activePlayers().map(p => p.x);
  const target = xs.length ? Math.min(Math.max(...xs) - 130, Math.min(...xs) - 14) : camX;
  if (target > camX) camX += Math.min(2.4, target - camX);
  const maxCam = secIdx < SECTIONS.length ? SECTIONS[secIdx].cam : LEVEL_END;
  camX = Math.min(camX, maxCam);
  if (!locked && secIdx < SECTIONS.length && camX >= SECTIONS[secIdx].cam) {
    locked = true; waveIdx = 0;
    const sec = SECTIONS[secIdx];
    mission = { text: sec.mission, t: 200 };
    if (sec.boss && STAGES[stageIdx].boss === 'factura') { boss = mkFactura(camX + W + 50, 156); foes.push(boss); banner = { a:'¡CUIDADO!', b:'LA CUMBRE DE FACTURACIÓN', t:150 }; startStory('factura'); }
    else if (sec.boss && STAGES[stageIdx].boss === 'lich') { boss = mkLich(camX + W + 40, 156); foes.push(boss); banner = { a:'¡CUIDADO!', b:'TRONO DEL MAINFRAME', t:150 }; startStory('lich'); }
    else if (sec.boss) { boss = mkDragon(camX + W + 80, 158); foes.push(boss); banner = { a:'¡CUIDADO!', b:'GUARIDA DE AUTOMATION', t:150 }; startStory('dragon'); }
    else {
      if (sec.golem) { golem = mkGolem(camX + 215, 152); foes.push(golem); addText('Un GÓLEM HIPERVISOR vigila la granja...', camX + 4, 58, C.u, 120); }
      if (sec.mimics) for (const [x, y, kind] of sec.mimics) { const m = mkFoe(kind || 'mimico', x, y); m.state = 'sleep'; m.face = -1; foes.push(m); }
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
        spawnMiniboss(sec.miniboss);
      }
      else if (!(golem && golem.angry && alive(golem))) {
        locked = false; mission = { text: sec.close, t: 200, closed:true }; goT = 200; sfx('go');
        if (sec.mission.startsWith('NET-404')) unlock('dns');
        if (sec.golem && !RUN.golemAngry) unlock('legacy');
        if (playMode === 'jefes') rushNext(); else secIdx++;
      }
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
