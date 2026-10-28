// Jefes de la etapa 3, La Nube: Kraken del Clúster, Autoescalador y la Factura de Fin de Mes.
'use strict';

/* --- Etapa 3: el Kraken del Clúster, el Autoescalador y la Factura de Fin de Mes */
/**
 * El Kraken del Clúster: otra variante de la Hidra. Mientras viva el CONTROL PLANE,
 * los nodos se vuelven a programar.
 */
const KRAKEN = {
  name:'EL KRAKEN DEL CLÚSTER', short:'KRAKEN', ach:'kraken', taint:true,
  heads:[
    { name:'NODO 1', short:'NODO 1', tag:'N1', col:'#326ce5', lane:0 },
    { name:'CONTROL PLANE', short:'CONTROL PLANE', tag:'CP', col:'#1a4a9a', lane:1, parity:true },
    { name:'NODO 2', short:'NODO 2', tag:'N2', col:'#326ce5', lane:2 }
  ],
  txt:{ spit:'kubectl apply', rebuild:'RESCHEDULING', done:'POD RUNNING', death:'CLÚSTER DRENADO: KRAKEN ELIMINADO', lost:'¡CONTROL PLANE CAÍDO! NO HAY RESCHEDULING', failed:'NODO NOTREADY', hint:'¡ATACA LOS TENTÁCULOS!' }
};
/**
 * El CONTROL PLANE del Kraken tiene un taint: no acepta golpes mientras quede
 * algún nodo en pie. Hay que tumbar (drenar) los dos nodos a la vez.
 * @param {object} head Cabeza de la Hidra o variante.
 * @returns {boolean} true si está protegida.
 */
const krakenGuarded = head => !!(head.d.parity && head.body && head.body.taint && foes.some(h => h.kind === 'cabeza' && h.body === head.body && h !== head && h.state !== 'broken' && !h.dead));
/**
 * IA del Autoescalador: lucha cuerpo a cuerpo y, cada vez que pierde un 25 % de
 * vida, escala horizontalmente con dos réplicas. Con réplicas vivas, sus golpes
 * hacen la mitad de daño («la carga está repartida»).
 * @param {object} e
 */
function updateAutoscaler(e){
  e.y = clamp(e.y, FY0, FY1);
  const dx = P.x - e.x, dy = P.y - e.y;
  const replicas = foes.filter(f => f.kind === 'replica' && !f.dead).length;
  e.shared = replicas > 0;
  switch (e.state) {
    case 'enter': e.x -= 1; e.face = -1; e.moving = true; if (e.x <= camX + 240) { e.state = 'roar'; e.t = 0; sfx('roar'); shake = 5; addText('DESIRED: 1 · MAX: 999', e.x - 70, e.y - 100, '#9fd0ff', 70); e.step = 0; } break;
    case 'roar': e.moving = false; if (e.t > 50) { e.state = 'walk'; e.t = 0; e.cool = 40; } break;
    case 'walk': {
      if (e.cool > 0) e.cool--;
      e.face = dx > 0 ? 1 : -1;
      const lost = Math.floor((1 - e.hp/e.max)*4);
      if (lost > e.step) { e.step = lost; e.state = 'scale'; e.t = 0; break; }
      if ((P.state === 'down' && P.lying) || state !== 'play') { e.moving = false; break; }
      const tx = P.x - Math.sign(dx || 1)*30;
      e.x += clamp(tx - e.x, -e.d.spd, e.d.spd); e.y += clamp(dy, -e.d.spd*.6, e.d.spd*.6);
      e.moving = Math.abs(tx - e.x) > 1 || Math.abs(dy) > 1;
      if (e.cool <= 0 && Math.abs(dx) < 42 && Math.abs(dy) < 5 && P.z < 10) { e.state = 'windup'; e.t = 0; }
      break; }
    case 'scale': {
      e.moving = false;
      if (e.t === 12) {
        sfx('special'); addText('SCALE OUT: +2 RÉPLICAS', e.x - 90, e.y - 104, '#5ec8f2', 70);
        for (const s of [-1, 1]) { const m = mkFoe('replica', clamp(e.x + s*40, camX + 20, camX + W - 20), clamp(e.y + s*16, FY0, FY1)); m.state = 'rise'; m.t = 20; m.seen = true; foes.push(m); burst(m.x, m.y - 20, '#5ec8f2', 14, 1.6, 'rgb(94,200,242)'); }
      }
      if (e.t > 36) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
    case 'windup': e.moving = false; if (e.t >= e.d.wind) { e.state = 'attack'; e.t = 0; e.hitDone = false; sfx('heavy'); } break;
    case 'attack': {
      if (e.t < 6) e.x += e.face*1.5;
      if (e.t <= 8 && !e.hitDone) for (const q of activePlayers()) if (inFront(e, q, 34, 11)) { e.hitDone = true; damage(q, e.shared ? Math.round(e.d.dmg/2) : e.d.dmg, e, { knock:!e.shared }); }
      if (e.t > 18) { e.state = 'walk'; e.cool = 35 + Math.random()*35; }
      break; }
    case 'down': {
      if (!e.lying) e.x += e.vx;
      else if (e.dead && e.t > 80) {
        foes.splice(foes.indexOf(e), 1); score += e.d.score; if (lastFoe === e) lastFoe = null;
        addText('SCALE TO ZERO +' + e.d.score, e.x - 70, e.y - 60, '#ffd23f', 90);
        for (const f of foes) if (f.kind === 'replica') f.dead = true;
      }
      else if (!e.dead && e.t > 40) { e.state = 'walk'; e.t = 0; e.cool = 30; }
      break; }
  }
}

/** Monedas que caen del cielo: { x, y, z, vz }. Las lanza la Factura. */
let drops = [];
/**
 * Crea la Factura de Fin de Mes, jefe final de La Nube.
 * @param {number} x
 * @param {number} y
 * @returns {object}
 */
function mkFactura(x, y){
  const e = mkFoe('factura', x, y);
  e.state = 'enter'; e.face = -1; e.cool = 60; e.z = 6; e.summoned = 0;
  return e;
}
/**
 * IA de la Factura: flota, hace llover monedas sobre los jugadores (CARGOS),
 * dispara un rayo a lo largo de su carril (PICO DE USO), embiste (RENOVACIÓN
 * AUTOMÁTICA) y, al 66 % y al 33 %, invoca NAT Gateways.
 * @param {object} e
 */
function updateFactura(e){
  e.y = clamp(e.y, FY0 + 6, FY1);
  if (e.state !== 'dying' && e.state !== 'down') e.z = 8 + Math.sin(t/16)*5;
  const dx = P.x - e.x, dy = P.y - e.y;
  switch (e.state) {
    case 'enter': e.x -= .8; e.face = -1; if (e.x <= camX + 236) { e.state = 'roar'; e.t = 0; sfx('roar'); shake = 8; addText('TOTAL: 999.999 EUR', e.x - 70, e.y - 130, C.r, 80); } break;
    case 'roar': if (e.t > 60) { e.state = 'idle'; e.t = 0; } break;
    case 'idle': {
      e.face = dx >= 0 ? 1 : -1;
      const want = Math.abs(dx) - 110;
      if (Math.abs(want) > 10) e.x += Math.sign(dx)*Math.sign(want)*.55;
      e.y += clamp(dy, -.5, .5); e.x = clamp(e.x, camX + 50, camX + W - 50);
      const next = [.66, .33][e.summoned];
      if (next && e.hp < e.max*next) {
        e.summoned++; sfx('roar'); addText('¡CARGOS OCULTOS!', e.x - 66, e.y - 130, C.r, 70);
        for (const s of [-1, 1]) { const g = mkFoe('nat', clamp(e.x + s*70, camX + 20, camX + W - 20), clamp(e.y + s*20, FY0, FY1)); g.seen = true; foes.push(g); }
      }
      if (--e.cool > 0 || state !== 'play' || (P.state === 'down' && P.lying)) break;
      const roll = Math.random();
      if (Math.abs(dy) < 10 && roll < .35) { e.state = 'beamWind'; e.t = 0; addText('PICO DE USO', e.x - 44, e.y - 130, '#ff5d73', 50); }
      else if (roll < .6 && Math.abs(dx) > 70) { e.state = 'chargeWind'; e.t = 0; addText('RENOVACIÓN AUTOMÁTICA', e.x - 84, e.y - 130, '#ffd23f', 50); }
      else { e.state = 'rain'; e.t = 0; addText('CARGOS', e.x - 24, e.y - 130, '#ffd23f', 40); }
      break; }
    case 'rain': {
      if (e.t % 8 === 0 && e.t <= 64) {
        for (const q of activePlayers()) drops.push({ x:clamp(q.x + (Math.random() - .5)*70, camX + 10, camX + W - 10), y:clamp(q.y + (Math.random() - .5)*20, FY0, FY1), z:170, vz:0 });
        sfx('coin');
      }
      if (e.t > 80) { e.state = 'idle'; e.cool = 60; }
      break; }
    case 'beamWind': if (e.t > 40) { e.state = 'beam'; e.t = 0; sfx('roar'); shake = 3; } break;
    case 'beam': {
      for (let i = 0; i < 2; i++) fx.push({ x:e.x + e.face*(36 + Math.random()*8), y:e.y - 50 + Math.random()*6, vx:e.face*(4 + Math.random()*2), vy:(Math.random() - .5)*.4 + .5, life:34, col:Math.random() < .5 ? '#ff5d73' : '#ffd23f', big:true, glow:'rgb(255,93,115)' });
      if (e.t % 10 === 0) for (const q of activePlayers()) { const ddx = (q.x - e.x)*e.face; if (ddx > 0 && ddx < 220 && Math.abs(q.y - e.y) < 9 && q.z < 30) damage(q, 6, e); }
      if (e.t > 60) { e.state = 'idle'; e.cool = 70; }
      break; }
    case 'chargeWind': if (e.t > 26) { e.state = 'charge'; e.t = 0; e.face = dx > 0 ? 1 : -1; e.hitSet = new Set(); } break;
    case 'charge': {
      e.x += e.face*3.4;
      for (const q of activePlayers()) { if (e.hitSet.has(q)) continue; if (Math.abs(q.x - e.x) < 34 && Math.abs(q.y - e.y) < 14 && q.z < 20) { e.hitSet.add(q); damage(q, 15, e, { knock:true, power:1.3 }); } }
      if (e.t > 60 || e.x < camX + 40 || e.x > camX + W - 40) { e.x = clamp(e.x, camX + 40, camX + W - 40); e.state = 'idle'; e.cool = 50; shake = 4; }
      break; }
    case 'down': {
      if (e.dead) { e.state = 'dying'; e.t = 0; slowmo = 120; flashT = 10; sfx('roar'); score += e.d.score; drops = []; addText('FACTURA PAGADA · FINOPS NIVEL DIOS', e.x - 130, e.y - 130, '#ffd23f', 120); for (const f of foes) if (f !== e && f.kind === 'nat') f.dead = true; break; }
      e.state = 'idle'; e.z = 8; e.lying = false;
      break; }
    case 'dying': {
      e.z = Math.max(0, e.z - .5);
      if (e.t % 5 === 0) { burst(e.x + (Math.random() - .5)*80, e.y - 30 - Math.random()*80, Math.random() < .5 ? '#ffd23f' : '#f5efe0', 10, 2.4, 'rgb(255,210,63)'); sfx('coin'); }
      shake = 3;
      if (e.t > 150) { foes.splice(foes.indexOf(e), 1); boss = null; unlock('finops'); if (playMode === 'jefes') rushNext(); else startStory('epilogo', stageClear); }
      break; }
  }
}
/**
 * Avanza las monedas que caen: al tocar el suelo hacen 8 de daño a quien esté debajo.
 */
function updateDrops(){
  for (const d of drops.slice()) {
    d.vz -= .25; d.z += d.vz;
    if (d.z <= 0) {
      drops.splice(drops.indexOf(d), 1); burst(d.x, d.y, '#ffd23f', 6, 1.2, 'rgb(255,210,63)');
      for (const q of activePlayers()) if (Math.abs(q.x - d.x) < 12 && Math.abs(q.y - d.y) < 8 && q.z < 10) damage(q, 8, { x:d.x, y:d.y });
    }
  }
}
