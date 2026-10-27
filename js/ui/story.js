// Viñetas de historia con retratos.
'use strict';

const HERO_LINES = {
  guerrero: { intro:'Mi job de Rundeck lleva tres horas en rojo. Voy a bajar a ver qué pasa.', mino:'Traigo la petición firmada... en un ticket de hace dos años.', dragon:'Los jobs de Automation son de quien los revisa. Y hoy reviso yo.', outro:'Job ejecutado: OK. Y todavía no son las 18:00.' },
  mago: { intro:'En mi máquina funcionaba. Bajaré al CPD a demostrarlo.', mino:'¿Has probado a abrir el puerto 443?', dragon:'Vengo a desplegar. Con tests. Y en viernes.', outro:'Deploy hecho y pipeline en verde. Me voy de fin de semana.' }
};
const STORIES = {
  intro: () => [
    ['narr', 'VIERNES, 17:45. ALGUIEN HA TOCADO PRODUCCIÓN A MANO Y LAS ALERTAS NO PARAN.'],
    ['hero', HERO_LINES[P.hero].intro],
    ['narr', 'Cierra los tickets de cada departamento y llega a la Guarida de Automation antes del fin de semana.']],
  mino: () => [
    ['mino', '¿TRÁFICO NO AUTORIZADO? NADIE CRUZA MI RED SIN UNA REGLA APROBADA.'],
    ['hero', HERO_LINES[P.hero].mino],
    ['narr', 'PISTA: cuando active ACL: DENY ALL, atácalo por la espalda.']],
  hidra: () => [
    ['hidra', 'CORTA UN DISCO Y ME RECONSTRUYO. MIENTRAS VIVA MI PARIDAD, SOY ETERNA.'],
    ['narr', 'PISTA: acaba primero con la cabeza de PARIDAD.']],
  dragon: () => [
    ['dragon', 'ESTA ES LA GUARIDA DE AUTOMATION. AHORA TODOS LOS JOBS SON MÍOS.'],
    ['hero', HERO_LINES[P.hero].dragon]],
  outro: () => [
    ['hero', HERO_LINES[P.hero].outro],
    ['narr', 'LA GUARIDA DE AUTOMATION VUELVE A ESTAR EN BUENAS MANOS. FIN DE LA ETAPA 1.']]
};
let story = null;
function startStory(key, after){ story = { lines:STORIES[key](), i:0, chars:0, after:after || null }; state = 'story'; }
function updateStory(){
  const ln = story.lines[story.i];
  story.chars += 1.3;
  if (pressed('atk') || pressed('start') || pressed('jump')) {
    if (story.chars < ln[1].length) story.chars = ln[1].length;
    else if (++story.i >= story.lines.length) { const cb = story.after; story = null; state = 'play'; if (cb) cb(); }
    else { story.chars = 0; sfx('select'); }
  }
}
function wrapText(s, max){
  const out = []; let line = '';
  for (const w of s.split(' ')) { const c = line ? line + ' ' + w : w; if (c.length > max && line) { out.push(line); line = w; } else line = c; }
  if (line) out.push(line);
  return out;
}
const SPEAKERS = { narr:'SISTEMA DE ALERTAS', mino:'MINOTAURO DEL FIREWALL', hidra:'HIDRA RAID', dragon:'DRAGÓN NEGRO' };
function drawStory(){
  if (!story) return;
  const [who, text] = story.lines[story.i];
  ctx.fillStyle = 'rgba(6,8,7,.45)'; ctx.fillRect(0, 31, W, H - 31);
  panel(4, 132, 312, 64, '#0a120d');
  r(8, 137, 46, 46, NEON); r(9, 138, 44, 44, '#16241b');
  if (who === 'hero') portrait(P.h.rig, 9, 138, 44);
  else if (who === 'mino') portrait('minotauro', 9, 138, 44);
  else if (who === 'dragon') ctx.drawImage(dragonSprite({ wing:1, mouth:(t >> 4) % 2, lunge:0, tail:0, fly:0, dizzy:0 }).c, 112, 20, 54, 54, 9, 138, 44, 44);
  else if (who === 'hidra') ctx.drawImage(headSprite('#7a4a9a', (t >> 4) % 2, 0).c, 0, 0, 50, 34, 9, 144, 44, 30);
  else { txt('>_', 18, 152, (t >> 4) % 2 ? NEON : '#1f7a46', { big:true }); }
  txt(who === 'hero' ? P.h.name + ' ' + P.h.sub : SPEAKERS[who], 60, 137, who === 'hero' ? '#ffd27a' : NEONT);
  let n = Math.floor(story.chars);
  wrapText(text, 31).forEach((ln, i) => { if (n > 0) txt(ln.slice(0, n), 60, 150 + i*11, C.w); n -= ln.length + 1; });
  if (story.chars >= text.length && (t >> 4) % 2) txt('A', 304, 184, '#ffd23f');
}
