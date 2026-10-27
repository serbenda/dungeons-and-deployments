// Créditos finales: estadísticas de la partida y el elenco, en desplazamiento.
'use strict';

/** Elenco: [rig (o null), nombre, papel]. */
const CAST = [
  ['guerrero', 'GUERRERO DE RUNDECK', 'HÉROE'], ['mago', 'MAGO DESARROLLADOR', 'HÉROE'],
  ['picara', 'PÍCARA DEL FRONTEND', 'HEROÍNA'], ['bardo', 'BARDO SCRUM MASTER', 'HÉROE'],
  ['goblin', 'GOBLIN CLICKOPS', 'SISTEMAS'], ['esqueleto', 'PROCESO ZOMBI', 'SISTEMAS'],
  ['firewall', 'CABALLERO FIREWALL', 'NETWORK'], ['minotauro', 'MINOTAURO DEL FIREWALL', 'JEFE DE NETWORK'],
  [null, 'PAQUETE PERDIDO', 'NETWORK'], [null, 'FUGA DE MEMORIA', 'STORAGE'], [null, 'MÍMICO DISCO LLENO', 'STORAGE'],
  [null, 'HIDRA RAID', 'JEFA DE STORAGE'], [null, 'VM HUÉRFANA', 'VIRTUALIZACIÓN'], [null, 'GÓLEM HIPERVISOR', 'VIRTUALIZACIÓN'],
  ['orco', 'ORCO CONSULTOR', 'EXTERNO'], [null, 'POD Y DEPLOYMENT', 'CAAS'], [null, 'DRAGÓN NEGRO', 'AUTOMATION'],
  ['revisor', 'EL REVISOR', 'DEFINITION OF DONE'], ['pendiente', 'TAREAS PENDIENTES', 'DEFINITION OF DONE'],
  ['kobold', 'KOBOLD DEL SELECT *', 'BASES DE DATOS'], ['troll', 'TROLL DEL LEGACY', 'BASES DE DATOS'], [null, 'CONSULTA N+1', 'BASES DE DATOS'],
  ['dba', 'TROLL DBA', 'JEFE DE BASES DE DATOS'], [null, 'COFRE PHISHING', 'SEGURIDAD'], ['ransom', 'RANSOMWARE', 'SEGURIDAD'],
  [null, 'TROYANO', 'SEGURIDAD'], [null, 'CANCERBERO DE LAS 3 AAA', 'JEFE DE SEGURIDAD'], [null, 'FALSO POSITIVO', 'MONITORIZACIÓN'],
  ['gnomo', 'GNOMO DEL DASHBOARD', 'MONITORIZACIÓN'], ['lich', 'EL LICH COBOL', 'MAINFRAME']
];
/**
 * Filas de los créditos: { h: alto, draw(y) }. Se construyen al empezar para usar
 * las estadísticas de la partida.
 * @returns {{h: number, draw: Function}[]}
 */
function creditRows(){
  const rows = [];
  const title = (s, col) => rows.push({ h:22, draw:y => goldText(s, 160, y, col === 'big') });
  const line = (s, col) => rows.push({ h:12, draw:y => txt(s, 160, y, col || C.w, { center:true }) });
  const gap = h => rows.push({ h, draw:() => {} });
  const stat = (a, b) => rows.push({ h:12, draw:y => { txt(a, 40, y, '#a39bc2'); txt(String(b), 280, y, C.w, { right:true }); } });
  title('GRACIAS POR JUGAR', 'big'); gap(8);
  line('DUNGEONS & DEPLOYMENTS · ETAPAS 1 Y 2', NEONT); gap(20);
  title('LA PARTIDA'); gap(4);
  const secs = clearBonus ? clearBonus.secs : Math.floor(stageT/60);
  stat('TIEMPO', String(Math.floor(secs/60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0'));
  if (RUN) {
    stat('ENEMIGOS ELIMINADOS', RUN.kills); stat('LANZADOS A PRODUCCIÓN', RUN.throws); stat('ESPECIALES', RUN.specials);
    stat('COMIDA', RUN.food); stat('GOLPES RECIBIDOS', RUN.hitsTaken); stat('CONTINUACIONES', RUN.continues);
  }
  stat('COMBO MÁXIMO', 'x' + Math.max(0, ...PLAYERS.map(p => p.maxChain)));
  stat('DIFICULTAD', DIFF().name);
  stat('LOGROS', achCount() + ' / ' + ACHIEVEMENTS.length);
  stat('ORO', String(score).padStart(7, '0'));
  gap(24);
  title('ELENCO'); gap(6);
  for (const [rig, name, role] of CAST) {
    rows.push({ h:rig ? 38 : 24, draw:y => {
      if (rig) { panel(66, y, 34, 34); portrait(rig, 68, y + 2, 30); }
      txt(name, 110, y + (rig ? 8 : 2), '#ffd27a'); txt(role, 110, y + (rig ? 19 : 12), '#857bb5');
    } });
  }
  gap(24);
  title('IDEA, DISEÑO Y DIRECCIÓN'); line('SERBENDA', C.w); gap(20);
  title('AGRADECIMIENTOS'); line('A QUIEN REVISA LOS JOBS', C.w); line('Y CUMPLE LA DEFINITION OF DONE', C.w); gap(24);
  line('NINGÚN SERVIDOR DE PRODUCCIÓN', '#a39bc2'); line('SUFRIÓ DAÑOS EN ESTE DESARROLLO.', '#a39bc2'); gap(30);
  line('CONTINUARÁ...', C.e); line('ETAPA 3 · LA NUBE', C.e);
  return rows;
}
let creditList = null;
/** Duración de los créditos en actualizaciones (se recalcula al construirlos). */
let CREDITS_LEN = 3000;
/** Dibuja los créditos desplazándose hacia arriba. */
function drawCredits(){
  if (creditsT <= 1 || !creditList) { creditList = creditRows(); CREDITS_LEN = Math.round((creditList.reduce((a, r2) => a + r2.h, 0) + H)/.5) + 60; }
  drawLevel(LEVEL_END - 200 + creditsT*.2);
  ctx.fillStyle = 'rgba(8,6,14,.82)'; ctx.fillRect(0, 0, W, H);
  let y = H - creditsT*.5;
  for (const row of creditList) { if (y > -60 && y < H + 10) row.draw(y); y += row.h; }
  if (creditsT > 60 && (t >> 5) % 2) txt('START: SALTAR', 316, 190, '#4f8a66', { right:true });
}
