// Utilidades: textos flotantes, partículas, colisiones y mensajes.
'use strict';

/**
 * Limita v al intervalo [a, b].
 * @param {number} v
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
/**
 * Elemento al azar de una lista.
 * @template T
 * @param {T[]} a
 * @returns {T}
 */
const pickC = a => a[(Math.random()*a.length) | 0];
/**
 * Mensajes al eliminar a un enemigo genérico.
 */
const KILL_MSGS = ['SIGKILL', 'EXIT 1', '404', 'SEGFAULT', 'OOM KILLED', 'TIMEOUT', 'CORE DUMPED', 'kill -9'];
/**
 * Mensajes específicos al eliminar a cada tipo de enemigo.
 */
const KILL_BY = { minotauro:['FIREWALL DESACTIVADO'], murcielago:['PACKET LOSS', 'TTL EXPIRED', '100% LOSS'], firewall:['ACL BORRADA', 'PORT OPEN'], mimico:['DISCO FORMATEADO', 'QUOTA OK'], fantasma:['VM ELIMINADA', 'SNAPSHOT BORRADO'], pod:['CrashLoopBackOff', 'OOMKilled', 'Evicted'], slime:['malloc() x2'], slimeS:['free()', 'GC'], pendiente:['HECHO'] };
const HURT_MSGS = ['ERROR 500', 'WARN', '503', 'EXCEPTION', 'NullPointer'];
/**
 * Añade un texto flotante que sube y se desvanece.
 * @param {string} s
 * @param {number} x Coordenada x del mundo.
 * @param {number} y
 * @param {string} [col]
 * @param {number} [life] Duración en actualizaciones.
 */
function addText(s, x, y, col, life){ texts.push({ s, x, y, col:col || C.w, life:life || 50 }); }
/**
 * Lanza una explosión de partículas.
 * @param {number} x
 * @param {number} y
 * @param {string} col
 * @param {number} [n] Número de partículas.
 * @param {number} [spd] Velocidad.
 * @param {string} [glow] Color rgb() del brillo aditivo, opcional.
 */
function burst(x, y, col, n, spd, glow){ for (let i = 0; i < (n || 8); i++) { const a = Math.random()*Math.PI*2, v = (spd || 1.6)*(.4 + Math.random()); fx.push({ x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v - .6, life:16 + (Math.random()*16 | 0), col, glow }); } }
/**
 * Destello en cruz de un impacto.
 * @param {number} x
 * @param {number} y
 * @param {boolean} [big]
 */
function spark(x, y, big){ fx.push({ spark:true, x, y, life:big ? 10 : 7, max:big ? 10 : 7, big }); }
/**
 * Medio ancho de colisión de un actor.
 * @param {object} e
 * @returns {number}
 */
const halfW = e => e.kind === 'minotauro' ? 12 : e.kind === 'cabeza' ? 12 : e.kind === 'dragon' ? 40 : e.kind === 'golem' ? 22 : e.kind === 'crate' ? 10 : e.kind === 'totem' ? 12 : 7;
/**
 * Indica si `tgt` está al alcance de un ataque de `att` hacia donde mira.
 * @param {object} att Atacante (usa x, y y face).
 * @param {object} tgt Objetivo.
 * @param {number} reach Alcance horizontal.
 * @param {number} [depth=9] Tolerancia de profundidad (y).
 * @returns {boolean}
 */
function inFront(att, tgt, reach, depth){
  const dx = (tgt.x - att.x)*att.face;
  return dx > -6 && dx < reach + halfW(tgt) && Math.abs(tgt.y - att.y) <= (depth || 9) && (tgt.z || 0) < 30;
}
/**
 * Indica si un actor sigue vivo.
 * @param {object} e
 * @returns {boolean}
 */
const alive = e => !e.dead && e.hp > 0;
/**
 * Tipos que cuentan como enemigos de oleada (ver hostile()).
 */
const GRUNTS = { minotauro:1, cabeza:1, goblin:1, orco:1, esqueleto:1, slime:1, slimeS:1, murcielago:1, firewall:1, mimico:1, fantasma:1, pod:1, totem:1, pendiente:1, revisor:1 };
/**
 * Enemigos de oleada vivos (los de GRUNTS). La sección no se cierra hasta que no queda ninguno.
 * @returns {object[]}
 */
const hostile = () => foes.filter(e => GRUNTS[e.kind] && !e.dead);
