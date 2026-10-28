// Composición de cada fotograma: la escena según el estado del juego, y los avisos superpuestos.
'use strict';

/**
 * Dibuja la escena según el estado.
 */
function drawScene(){
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (!LEVEL) buildLevel();
  r(0, 0, W, H, C.k);
  if (state === 'title') return drawTitle();
  if (state === 'ranking') return drawRanking();
  if (state === 'select') return drawSelect();
  if (state === 'options') return drawOptions();
  if (state === 'keys') return drawKeys();
  if (state === 'logros') return drawAchievements();
  if (state === 'credits') return drawCredits();
  const shk = OPTS.flashes ? shake : 0;
  const sx = shk ? Math.round((Math.random()*2 - 1)*shk) : 0, sy = shk ? Math.round((Math.random()*2 - 1)*shk) : 0;
  ctx.save(); ctx.translate(sx, sy);
  const cx = Math.round(camX);
  drawLevel(cx);
  for (const f of fx) if (f.ring) {
    ctx.strokeStyle = f.col; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(f.x - cx, f.y - 2, f.r, f.r*.3, 0, 0, Math.PI*2); ctx.stroke();
    if (f.runes) { ctx.fillStyle = f.col; for (let i = 0; i < 8; i++) { const a = i/8*Math.PI*2 + t/10; ctx.fillRect(Math.round(f.x - cx + Math.cos(a)*f.r) - 1, Math.round(f.y - 2 + Math.sin(a)*f.r*.3) - 1, 3, 3); } }
  }
  for (const L of locks) {
    const k = Math.min(1, L.t/20), sxL = L.x - cx;
    ctx.strokeStyle = 'rgba(255,210,63,' + (.5 + .3*Math.sin(t/3)) + ')'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(Math.round(sxL), Math.round(L.y), L.r*k, L.r*.3*k, 0, 0, Math.PI*2); ctx.stroke();
    if (L.t < L.arm) { ctx.fillStyle = 'rgba(255,210,63,.15)'; ctx.beginPath(); ctx.ellipse(Math.round(sxL), Math.round(L.y), L.r*k, L.r*.3*k, 0, 0, Math.PI*2); ctx.fill(); }
    else txt('LOCK TABLE', sxL, L.y - 10, '#ffd23f', { center:true, outline:true });
  }
  if (boss && boss.state === 'breath') {
    const mx = boss.x + boss.face*80 - cx;
    ctx.fillStyle = 'rgba(110,231,168,.18)'; ctx.fillRect(Math.round(boss.face > 0 ? mx : mx - 190), boss.y - 70, 190, 14);
  }
  const list = activePlayers().concat(foes, crates, items.map(it => ({ kind:'item', it, x:it.x, y:it.y, z:0 })), shots.map(s => ({ kind:'shot', x:s.x, y:s.y, z:s.z, col:s.col })));
  list.sort((a, b) => a.y - b.y);
  for (const a of list) drawActor(a, cx);
  for (const f of fx) {
    if (f.ring) continue;
    if (f.spark) {
      const k = f.life/f.max, s = (f.big ? 14 : 9)*(1.2 - k), x = Math.round(f.x - cx), y = Math.round(f.y);
      ctx.fillStyle = 'rgba(255,255,255,' + k + ')';
      ctx.fillRect(x - s, y, s*2, 1); ctx.fillRect(x, y - s, 1, s*2);
      ctx.fillStyle = 'rgba(244,184,96,' + k + ')';
      ctx.fillRect(x - s*.6, y - s*.6, 2, 2); ctx.fillRect(x + s*.6, y + s*.6, 2, 2); ctx.fillRect(x + s*.6, y - s*.6, 2, 2); ctx.fillRect(x - s*.6, y + s*.6, 2, 2);
      continue;
    }
    r(f.x - cx, f.y, f.big ? 3 : 2, f.big ? 3 : 2, f.col);
  }
  for (const d of drops) {
    const x = Math.round(d.x - cx); shadow(x, d.y, 6 + Math.max(0, 14 - d.z/12));
    if (OPTS.bigCues) { ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(x, Math.round(d.y), 12, 4, 0, 0, Math.PI*2); ctx.stroke(); }
    ctx.drawImage(coinSprite().c, x - 6, Math.round(d.y - d.z - 6));
  }
  drawLights(cx);
  for (const s of eshots) { const x = Math.round(s.x - cx), y = Math.round(s.y - s.z); r(x - 4, y - 4, 8, 8, OUTLINE); r(x - 3, y - 3, 6, 6, '#ff8a3d'); r(x - 1, y - 2, 2, 3, '#ffffff'); r(x - 1, y + 2, 2, 1, '#ffffff'); }
  for (const s of texts) { if (s.life < 12 && (s.life >> 1) % 2) continue; const x = clamp(s.x - cx, 2, W - 2 - 8*s.s.length); txt(s.s, x, s.y, s.col, { outline:true }); }
  ctx.restore();

  if (flashT > 0 && OPTS.flashes) { ctx.fillStyle = 'rgba(255,255,255,' + Math.min(.5, flashT*.08) + ')'; ctx.fillRect(0, 0, W, H); }
  if (slowmo > 0) { ctx.fillStyle = 'rgba(255,210,63,.06)'; ctx.fillRect(0, 0, W, H); }
  drawHUD();
  for (const p of PLAYERS) {
    if (p.chain < 2 || state !== 'play' || story) continue;
    const col = p.chain >= 20 ? '#ff5d73' : p.chain >= 10 ? '#ffd23f' : '#ffffff', left = p.slot === 1 ? false : PLAYERS.length > 1;
    const x = left ? 4 : 316, o = left ? {} : { right:true }, x0 = left ? 4 : 256;
    txt(PLAYERS.length > 1 ? (p.slot + 1) + 'P COMBO' : 'COMBO', x, 54, NEONT, Object.assign({ outline:true }, o));
    txt('x' + p.chain, x, 64, col, Object.assign({ big:true, outline:true }, o));
    r(x0, 83, 60, 3, '#16241b'); r(x0, 83, Math.round(60*p.chainT/120), 3, col);
  }
  if (rankFx) {
    ctx.globalAlpha = Math.min(1, rankFx.t/15);
    goldText(rankFx.text, 160, 132 - Math.max(0, rankFx.t - 55), true);
    ctx.globalAlpha = 1;
  }
  const bb = bossBar();
  if (bb) {
    panel(2, 186, 316, 13);
    txt(bb.name, 6, 189, NEONT);
    const bw = 316 - 12 - bb.name.length*8 - 6, bx0 = 314 - bw;
    r(bx0 - 1, 189, bw + 1, 7, '#16241b'); r(bx0, 190, Math.round(bw*bb.frac), 5, bb.hl ? C.a : '#ff5d73'); r(bx0, 190, Math.round(bw*bb.frac), 1, '#ffd0d6');
  }
  if (banner && banner.t < 150) {
    panel(40, 70, 240, 44);
    txt(banner.a, 160, 78, NEONT, { center:true, big:true });
    txt(banner.b, 160, 100, C.w, { center:true });
  }
  if (goT > 0 && (t >> 4) % 2 && !locked) { goldText('GO!', 286, 58, true); r(272, 84, 26, 6, OUTLINE); r(273, 85, 20, 4, '#f4b860'); r(290, 80, 3, 14, '#f4b860'); r(293, 82, 3, 10, '#f4b860'); r(296, 85, 3, 4, '#f4b860'); }
  if (state === 'pause') { r(0, 84, W, 30, 'rgba(11,9,18,.9)'); goldText('PAUSA', 160, 92, true); }
  if (state === 'story') drawStory();
  if (state === 'initials') drawInitials();
  if (state === 'continue') {
    ctx.fillStyle = 'rgba(11,9,18,.82)'; ctx.fillRect(0, 31, W, H - 31);
    goldText('¿ROLLBACK?', 160, 62, true);
    txt(String(Math.max(0, Math.ceil(contT/60) - 1)), 160, 92, C.r, { center:true, big:true, outline:true });
    if ((t >> 4) % 2) txt('INSERTA CRÉDITO · START', 160, 130, C.w, { center:true });
  }
  if (state === 'over') {
    ctx.fillStyle = 'rgba(11,9,18,.9)'; ctx.fillRect(0, 31, W, H - 31);
    txt('GAME OVER', 160, 70, C.r, { center:true, big:true, outline:true });
    txt('El despliegue se queda para el lunes.', 160, 100, C.w, { center:true });
    txt('ORO ' + String(score).padStart(7, '0'), 160, 120, C.a, { center:true });
    if (overT > 120 && (t >> 4) % 2) txt('PULSA START', 160, 160, C.w, { center:true });
  }
  if (state === 'clear' && clearBonus) {
    ctx.fillStyle = 'rgba(11,9,18,.9)'; ctx.fillRect(0, 31, W, H - 31);
    goldText(clearBonus.rush ? 'JEFES SUPERADOS' : 'DEPLOY OK', 160, 38, true);
    txt('pipeline en verde', 160, 56, NEONT, { center:true });
    const rows = [
      ['SPRINT ' + String(Math.floor(clearBonus.secs/60)).padStart(2,'0') + ':' + String(clearBonus.secs % 60).padStart(2,'0'), clearBonus.timeBonus],
      ['VIDA Y VIDAS', clearBonus.lifeBonus], ['COMBO MÁX x' + clearBonus.maxChain, clearBonus.comboBonus], ['ORO TOTAL', score]
    ];
    rows.forEach(([a, b], i) => { if (clearT > 20 + i*20) { txt(a, 40, 70 + i*13, C.w); txt(String(b).padStart(7, '0'), 280, 70 + i*13, i === 3 ? C.a : C.w, { right:true }); } });
    if (clearT > 105) {
      r(40, 124, 240, 30, '#a8722e'); r(42, 126, 236, 26, '#e6dcc0'); r(42, 126, 236, 1, '#fff3c4');
      txt('PÁGINA DEL GRIMORIO DoD', 160, 129, '#3a2a1a', { center:true });
      txt(['LOGS Y TRAZAS', 'MONITORIZACIÓN Y ALERTAS', 'COSTES Y ETIQUETAS'][stageIdx] || 'LOGS Y TRAZAS', 160, 141, '#2f7a5a', { center:true });
    }
    const nextSt = STAGES[stageIdx + 1];
    if (clearT > 130) txt(clearBonus.rush ? 'NUEVE JEFES SIN DESCANSO' : (clearBonus.revisor ? 'PR APROBADO · ' : '') + (nextSt ? 'SIGUIENTE: ETAPA ' + (stageIdx + 2) + ' · ' + nextSt.name : 'LA FACTURA ESTÁ PAGADA'), 160, 162, clearBonus.revisor ? C.g : C.e, { center:true });
    if (clearT > 150 && (t >> 4) % 2) txt('PULSA START', 160, 178, C.w, { center:true });
  }
}
/**
 * Dibuja un fotograma completo y, encima, los avisos (logros y mandos).
 */
function draw(){
  drawScene();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  drawAchToast();
  if (padToast) { panel(80, 172, 160, 13, '#0f2a3a'); txt(padToast.text, 160, 175, '#9fd0ff', { center:true }); }
}
