// Utilidades: textos flotantes, partículas, colisiones y mensajes.
'use strict';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pickC = a => a[(Math.random()*a.length) | 0];
const KILL_MSGS = ['SIGKILL', 'EXIT 1', '404', 'SEGFAULT', 'OOM KILLED', 'TIMEOUT', 'CORE DUMPED', 'kill -9'];
const KILL_BY = { minotauro:['FIREWALL DESACTIVADO'], murcielago:['PACKET LOSS', 'TTL EXPIRED', '100% LOSS'], firewall:['ACL BORRADA', 'PORT OPEN'], mimico:['DISCO FORMATEADO', 'QUOTA OK'], fantasma:['VM ELIMINADA', 'SNAPSHOT BORRADO'], pod:['CrashLoopBackOff', 'OOMKilled', 'Evicted'], slime:['malloc() x2'], slimeS:['free()', 'GC'] };
const HURT_MSGS = ['ERROR 500', 'WARN', '503', 'EXCEPTION', 'NullPointer'];
function addText(s, x, y, col, life){ texts.push({ s, x, y, col:col || C.w, life:life || 50 }); }
function burst(x, y, col, n, spd, glow){ for (let i = 0; i < (n || 8); i++) { const a = Math.random()*Math.PI*2, v = (spd || 1.6)*(.4 + Math.random()); fx.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v - .6, life:16 + (Math.random()*16 | 0), col, glow }); } }
function spark(x, y, big){ fx.push({ spark:true, x, y, life:big ? 10 : 7, max:big ? 10 : 7, big }); }
const halfW = e => e.kind === 'minotauro' ? 12 : e.kind === 'cabeza' ? 12 : e.kind === 'dragon' ? 40 : e.kind === 'golem' ? 22 : e.kind === 'crate' ? 10 : e.kind === 'totem' ? 12 : 7;
function inFront(att, tgt, reach, depth){
  const dx = (tgt.x - att.x)*att.face;
  return dx > -6 && dx < reach + halfW(tgt) && Math.abs(tgt.y - att.y) <= (depth || 9) && (tgt.z || 0) < 30;
}
const alive = e => !e.dead && e.hp > 0;
const GRUNTS = { minotauro:1, cabeza:1, goblin:1, orco:1, esqueleto:1, slime:1, slimeS:1, murcielago:1, firewall:1, mimico:1, fantasma:1, pod:1, totem:1 };
const hostile = () => foes.filter(e => GRUNTS[e.kind] && !e.dead);
