// Ranking con iniciales guardado en el navegador.
'use strict';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.-';
/**
 * Ranking inicial (geek) cuando el navegador no tiene uno guardado.
 */
const DEFAULT_RANK = [['LTS', 60000], ['K8S', 45000], ['SSH', 30000], ['DNS', 20000], ['GIT', 10000]];
let ranking = DEFAULT_RANK.map(([n, s]) => ({ n, s })), entry = null, rankShow = null, titleT = 0;
try { const saved = JSON.parse(localStorage.getItem('dnd-arcade-ranking') || 'null'); if (Array.isArray(saved) && saved.length) ranking = saved.slice(0, 5); } catch(e) {}
/**
 * Guarda el ranking en localStorage (si el navegador lo permite).
 */
const saveRanking = () => { try { localStorage.setItem('dnd-arcade-ranking', JSON.stringify(ranking)); } catch(e) {} };
/**
 * Tras ganar o perder: pide iniciales si la puntuación entra en el top 5 o enseña el ranking.
 */
function afterRun(){
  if (score > ranking[ranking.length - 1].s) { entry = { l:[0, 0, 0], pos:0 }; state = 'initials'; sfx('coin'); }
  else { rankShow = { t:0, hi:-1, attract:false }; state = 'ranking'; }
}
/**
 * Introducción de iniciales: arriba y abajo cambian la letra; A confirma.
 */
function updateInitials(){
  if (pressed('up')) { entry.l[entry.pos] = (entry.l[entry.pos] + 1) % LETTERS.length; sfx('select'); }
  if (pressed('down')) { entry.l[entry.pos] = (entry.l[entry.pos] + LETTERS.length - 1) % LETTERS.length; sfx('select'); }
  if (pressed('left') && entry.pos > 0) { entry.pos--; sfx('select'); }
  if (pressed('atk') || pressed('start') || pressed('right')) {
    sfx('pick');
    if (++entry.pos >= 3) {
      const n = entry.l.map(i => LETTERS[i]).join('');
      ranking.push({ n, s:score }); ranking.sort((a, b) => b.s - a.s); ranking = ranking.slice(0, 5); saveRanking();
      rankShow = { t:0, hi:ranking.findIndex(r2 => r2.n === n && r2.s === score), attract:false };
      entry = null; state = 'ranking';
    }
  }
}
/**
 * Pantalla de ranking: vuelve al título o, en modo demo, deja empezar a jugar.
 */
function updateRanking(){
  rankShow.t++;
  if ((rankShow.t > 40 && (pressed('start') || pressed('atk'))) || rankShow.t > 420) {
    if (rankShow.attract && rankShow.t <= 420) { enterSelect(); sfx('coin'); }
    else state = 'title';
    titleT = 0; rankShow = null;
  }
}
/**
 * Dibuja la pantalla de ¡NUEVO RÉCORD!.
 */
function drawInitials(){
  ctx.fillStyle = 'rgba(11,9,18,.92)'; ctx.fillRect(0, 31, W, H - 31);
  goldText('¡NUEVO RÉCORD!', 160, 44, true);
  txt('ORO ' + String(score).padStart(7, '0'), 160, 68, C.a, { center:true });
  txt('ESCRIBE TUS INICIALES', 160, 88, NEONT, { center:true });
  for (let i = 0; i < 3; i++) {
    const x = 118 + i*30, on = entry.pos === i;
    panel(x, 102, 24, 28, on ? '#123a24' : NEOND);
    txt(LETTERS[entry.l[i]], x + 12, 108, on && (t >> 3) % 2 ? '#ffd23f' : C.w, { center:true, big:true });
  }
  txt('ARRIBA/ABAJO: LETRA · A: OK', 160, 146, '#a39bc2', { center:true });
}
/**
 * Dibuja la tabla del ranking.
 * @param {number} y0
 * @param {number} hi Fila que parpadea (la recién añadida) o -1.
 */
function drawRankingTable(y0, hi){
  panel(48, y0, 224, 100, '#0a120d');
  goldText('RANKING DE DEVS', 160, y0 + 6, false);
  ranking.forEach((e, i) => {
    const y = y0 + 22 + i*14, col = i === hi && (t >> 3) % 2 ? '#ffd23f' : i === 0 ? '#ffd27a' : C.w;
    txt((i + 1) + '.', 64, y, '#a39bc2'); txt(e.n, 96, y, col); txt(String(e.s).padStart(7, '0'), 256, y, col, { right:true });
  });
}
/**
 * Dibuja la pantalla de ranking con la mazmorra de fondo.
 */
function drawRanking(){
  const cx = 2150 + Math.sin(t/400)*120;
  drawLevel(cx); drawLights(cx);
  ctx.fillStyle = 'rgba(8,6,14,.6)'; ctx.fillRect(0, 0, W, H);
  drawRankingTable(40, rankShow.hi);
  if ((t >> 5) % 2) txt('PULSA START', 160, 160, C.w, { center:true, outline:true });
}
