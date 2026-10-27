// Menú de opciones: volumen, dificultad, destellos y vibración, guardado en el navegador.
'use strict';

/** Opciones por defecto. music y sfx van de 0 a 10; diff es el índice de DIFFS. */
const OPTS_DEFAULT = { music:8, sfx:8, diff:1, flashes:true, vibration:true };
let OPTS = Object.assign({}, OPTS_DEFAULT);
try { Object.assign(OPTS, JSON.parse(localStorage.getItem('dnd-arcade-options') || '{}')); } catch(e) {}
/** Guarda las opciones en localStorage (si el navegador lo permite). */
const saveOptions = () => { try { localStorage.setItem('dnd-arcade-options', JSON.stringify(OPTS)); } catch(e) {} };

/**
 * Niveles de dificultad: multiplicadores de la vida y del daño de los enemigos y
 * vidas extra del jugador.
 */
const DIFFS = [
  { name:'BECARIO', hp:.8, dmg:.7, lives:1, desc:'Menos daño y una vida extra.' },
  { name:'SENIOR', hp:1, dmg:1, lives:0, desc:'La experiencia original.' },
  { name:'GUARDIA 24/7', hp:1.3, dmg:1.35, lives:-1, desc:'Para quien lleva el busca.' }
];
/**
 * Dificultad actual.
 * @returns {{name: string, hp: number, dmg: number, lives: number, desc: string}}
 */
const DIFF = () => DIFFS[OPTS.diff] || DIFFS[1];

/**
 * Filas del menú: etiqueta, valor que se muestra y cómo cambia con izquierda/derecha.
 */
const OPT_ROWS = [
  { label:'MÚSICA', show:() => bar(OPTS.music), change:d => { OPTS.music = clamp(OPTS.music + d, 0, 10); } },
  { label:'EFECTOS', show:() => bar(OPTS.sfx), change:d => { OPTS.sfx = clamp(OPTS.sfx + d, 0, 10); sfx('select'); } },
  { label:'DIFICULTAD', show:() => DIFF().name, change:d => { OPTS.diff = (OPTS.diff + d + DIFFS.length) % DIFFS.length; } },
  { label:'DESTELLOS', show:() => OPTS.flashes ? 'SÍ' : 'NO', change:() => { OPTS.flashes = !OPTS.flashes; } },
  { label:'VIBRACIÓN', show:() => OPTS.vibration ? 'SÍ' : 'NO', change:() => { OPTS.vibration = !OPTS.vibration; } },
  { label:'VOLVER', show:() => '', change:null }
];
/**
 * Valor de volumen: se dibuja como una barra de 10 bloques.
 * @param {number} v 0..10
 * @returns {{bar: number}}
 */
const bar = v => ({ bar:v });
let optSel = 0;

/** Navegación del menú de opciones. */
function updateOptions(){
  if (pressed('up')) { optSel = (optSel + OPT_ROWS.length - 1) % OPT_ROWS.length; sfx('select'); }
  if (pressed('down')) { optSel = (optSel + 1) % OPT_ROWS.length; sfx('select'); }
  const row = OPT_ROWS[optSel];
  const d = pressed('left') ? -1 : pressed('right') ? 1 : 0;
  if (d && row.change) { row.change(d); saveOptions(); sfx('select'); }
  if (pressed('atk')) { if (row.change) { row.change(1); saveOptions(); sfx('select'); } else { state = 'title'; titleT = 0; sfx('pick'); } }
  if (pressed('start') || pressed('jump')) { state = 'title'; titleT = 0; sfx('pick'); }
}
/** Dibuja el menú de opciones. */
function drawOptions(){
  drawLevel(1500);
  ctx.fillStyle = 'rgba(8,6,14,.78)'; ctx.fillRect(0, 0, W, H);
  goldText('OPCIONES', 160, 10, true);
  panel(30, 34, 260, 120, '#0a120d');
  OPT_ROWS.forEach((row, i) => {
    const y = 42 + i*17, on = i === optSel;
    if (on) r(32, y - 3, 256, 14, '#123a24');
    txt((on ? '> ' : '  ') + row.label, 38, y, on ? NEONT : C.w);
    const v = row.show();
    if (v && typeof v === 'object') {
      for (let j = 0; j < 10; j++) r(184 + j*9, y, 7, 7, j < v.bar ? (on ? '#ffd23f' : NEON) : '#2c3a30');
      if (on) { txt('<', 174, y, '#ffd23f'); txt('>', 282, y, '#ffd23f', { right:true }); }
    } else if (v) txt(row.change && on ? '< ' + v + ' >' : v, 282, y, on ? '#ffd23f' : '#a39bc2', { right:true });
  });
  panel(30, 160, 260, 26, '#0a120d');
  const help = optSel === 2 ? DIFF().desc : optSel === 3 ? 'Sin flashes ni temblores.' : optSel === 4 ? 'Vibrar con los golpes (móvil).' : 'A CAMBIAR · START SALIR';
  txt(help, 160, 169, '#a39bc2', { center:true });
}
