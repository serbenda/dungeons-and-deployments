// Logros: se desbloquean jugando, se guardan en el navegador y tienen su pantalla.
'use strict';

/**
 * Logros: clave, nombre y cómo se consigue.
 */
const ACHIEVEMENTS = [
  ['dns', 'SIEMPRE ES EL DNS', 'Cierra el ticket NET-404.'],
  ['firewall', 'PUERTO ABIERTO', 'Satura la ACL de un Firewall.'],
  ['paridad', 'SIN PARIDAD', 'Rompe la paridad de la Hidra.'],
  ['legacy', 'NO TOQUES EL LEGACY', 'VIR-007 sin enfadar al gólem.'],
  ['combo20', '10X DEVELOPER', 'Haz un combo de 20 golpes.'],
  ['combo50', 'ARQUITECTO', 'Haz un combo de 50 golpes.'],
  ['lanzar', 'A PRODUCCIÓN', 'Lanza 10 enemigos en una partida.'],
  ['patito', 'RUBBER DUCK DEBUGGING', 'Encuentra el patito de goma.'],
  ['stack', 'COPIAR Y PEGAR', 'Copia de Stack Overflow.'],
  ['viernes', 'DESPLIEGUE EN VIERNES', 'Termina la etapa 1.'],
  ['cuevas', 'BATCH NOCTURNO', 'Termina la etapa 2.'],
  ['mfa', 'MFA ROTO', 'Rompe el MFA del Cancerbero.'],
  ['cobol', 'STOP RUN', 'Derrota al Lich COBOL.'],
  ['unlock', 'UNLOCK TABLES', 'Libérate de un LOCK TABLE.'],
  ['rollback', 'SIN ROLLBACK', 'Termina sin usar continuaciones.'],
  ['expres', 'HOTFIX EXPRÉS', 'Acaba la etapa en menos de 8 min.'],
  ['pair', 'PAIR PROGRAMMING', 'Termina la etapa en cooperativo.'],
  ['revisor', 'APPROVED', 'Derrota a El Revisor.'],
  ['oncall', 'GUARDIA SUPERADA', 'Acaba la etapa en GUARDIA 24/7.'],
  ['konami', 'MODO DIOS', 'Introduce el código secreto.']
];
let unlocked = {};
try { unlocked = JSON.parse(localStorage.getItem('dnd-arcade-logros') || '{}') || {}; } catch(e) {}
/** Avisos de logros nuevos pendientes de mostrar. */
let achToasts = [];
/**
 * Desbloquea un logro (si no lo estaba), lo guarda y muestra el aviso.
 * @param {string} id Clave de ACHIEVEMENTS.
 * @returns {boolean} true si es nuevo.
 */
function unlock(id){
  if (unlocked[id]) return false;
  const a = ACHIEVEMENTS.find(x => x[0] === id);
  if (!a) return false;
  unlocked[id] = Date.now();
  try { localStorage.setItem('dnd-arcade-logros', JSON.stringify(unlocked)); } catch(e) {}
  achToasts.push({ name:a[1], t:200 });
  sfx('coin');
  return true;
}
/** Número de logros desbloqueados. */
const achCount = () => ACHIEVEMENTS.filter(a => unlocked[a[0]]).length;

let achScroll = 0;
/** Pantalla de logros: arriba y abajo desplazan, A, B o START vuelven. */
function updateAchievements(){
  if (pressed('up')) achScroll = Math.max(0, achScroll - 1);
  if (pressed('down')) achScroll = Math.min(ACHIEVEMENTS.length - 6, achScroll + 1);
  if (pressed('atk') || pressed('start') || pressed('jump')) { state = 'title'; titleT = 0; sfx('pick'); }
}
/** Dibuja la pantalla de logros. */
function drawAchievements(){
  drawLevel(2800);
  ctx.fillStyle = 'rgba(8,6,14,.8)'; ctx.fillRect(0, 0, W, H);
  goldText('LOGROS', 160, 6, true);
  txt(achCount() + ' / ' + ACHIEVEMENTS.length, 160, 26, NEONT, { center:true });
  ACHIEVEMENTS.slice(achScroll, achScroll + 6).forEach(([id, name, desc], i) => {
    const y = 38 + i*25, on = !!unlocked[id];
    panel(8, y, 304, 23, on ? '#123a24' : '#0c0f0d');
    r(12, y + 4, 15, 15, on ? '#ffd23f' : '#2c3a30');
    if (on) for (const [x, yy] of [[14, 11], [16, 13], [18, 11], [20, 9], [22, 7]]) r(x, y + yy, 2, 2, '#3a1c08');
    else { r(16, y + 9, 7, 7, '#4f5a52'); r(17, y + 6, 5, 4, '#4f5a52'); r(18, y + 7, 3, 3, '#2c3a30'); }
    txt(on ? name : '???', 33, y + 4, on ? '#ffd27a' : '#6b7a70');
    txt(desc, 33, y + 13, on ? C.w : '#6b7a70');
  });
  if (achScroll > 0) txt('^', 304, 30, NEONT);
  if (achScroll < ACHIEVEMENTS.length - 6) txt('v', 304, 190, NEONT);
}
/** Dibuja el aviso del logro recién desbloqueado (en cualquier pantalla). */
function drawAchToast(){
  const a = achToasts[0];
  if (!a) return;
  if (--a.t <= 0) { achToasts.shift(); return; }
  const k = Math.min(1, a.t/20, (200 - a.t)/12), w = Math.max(140, a.name.length*8 + 24), x = Math.round((W - w)/2), y = Math.round(150 + (1 - k)*20);
  ctx.globalAlpha = k;
  panel(x, y, w, 26, '#3a2a10');
  txt('¡LOGRO DESBLOQUEADO!', 160, y + 4, '#ffd23f', { center:true });
  txt(a.name, 160, y + 14, C.w, { center:true });
  ctx.globalAlpha = 1;
}
