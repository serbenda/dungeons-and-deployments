// Viñetas de historia con retratos.
'use strict';

const HERO_LINES = {
  guerrero: { intro:'Mi job de Rundeck lleva tres horas en rojo. Voy a bajar a ver qué pasa.', mino:'Traigo la petición firmada... en un ticket de hace dos años.', dragon:'Los jobs de Automation son de quien los revisa. Y hoy reviso yo.', outro:'Job ejecutado: OK. Y todavía no son las 18:00.',
    cuevas:'¿Un job que lanza COBOL a las 3:00? Eso no pasó mi revisión.', lich:'Tus batch no tienen ni logs. A producción no vuelves.',
    nube:'Migramos a la nube para no tocar servidores. Y aquí estoy, con la espada.', factura:'Este gasto no tiene ni ticket ni etiqueta. Rechazado.' },
  mago: { intro:'En mi máquina funcionaba. Bajaré al CPD a demostrarlo.', mino:'¿Has probado a abrir el puerto 443?', dragon:'Vengo a desplegar. Con tests. Y en viernes.', outro:'Deploy hecho y pipeline en verde. Me voy de fin de semana.',
    cuevas:'Más abajo todavía hay más legacy. Esto es como el git log.', lich:'Te voy a migrar a microservicios. Quieras o no.',
    nube:'En mi máquina funcionaba. En la nube, cobra por funcionar.', factura:'Te apago las instancias de desarrollo. Todas. Ahora.' },
  picara: { intro:'Producción se ve rota en todos los navegadores. Hasta en Internet Explorer.', mino:'Tranqui, solo quiero cargar una fuente de Google.', dragon:'Te voy a centrar en un div. A la primera.', outro:'Responsive, accesible y en verde. Así se entrega.',
    cuevas:'¿Una API que devuelve XML de 1987? Vamos a ver quién la sirve.', lich:'Tu interfaz es una pantalla verde de 80 columnas. Me ofende.',
    nube:'Una CDN para servir un favicon. Alguien tiene que explicarme esto.', factura:'¿Pagamos tráfico de salida por una imagen de 8 MB? Se acabó.' },
  bardo: { intro:'Daily rápida: ¿qué hice ayer? Nada. ¿Bloqueos? Todos. Vamos.', mino:'Esto lo hablamos en la retro. Ahora, apártate.', dragon:'Este dragón no estaba en el sprint. Lo estimamos en 13 puntos.', outro:'Objetivo del sprint cumplido. Mañana, retro con churros.',
    cuevas:'Nuevo sprint, nuevas cuevas. El backlog no se limpia solo.', lich:'Esto lo estimamos en... no. Esto no se estima. Esto se apaga.',
    nube:'Retro del sprint: la nube era más barata. ¿Verdad? ¿Verdad?', factura:'Hoy la daily es contigo. Y la acción es reducir costes.' }
};
/**
 * Línea del jugador 2 (si lo hay) en una viñeta.
 * @param {string} key intro, mino, dragon u outro.
 * @returns {Array[]} [] o [['hero2', texto]].
 */
const p2Line = key => PLAYERS[1] && PLAYERS[1].hero !== P.hero ? [['hero2', HERO_LINES[PLAYERS[1].hero][key]]] : [];
/**
 * Viñetas de historia. Cada una es una función que devuelve [quién, texto][],
 * para poder usar el héroe elegido.
 */
const STORIES = {
  intro: () => [
    ['narr', 'VIERNES, 17:45. ALGUIEN HA TOCADO PRODUCCIÓN A MANO Y LAS ALERTAS NO PARAN.'],
    ['hero', HERO_LINES[P.hero].intro],
    ...p2Line('intro'),
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
    ['hero', HERO_LINES[P.hero].dragon],
    ...p2Line('dragon')],
  revisor: () => [
    ['narr', 'EL DRAGÓN HA CAÍDO... PERO EL PULL REQUEST AÚN NO ESTÁ APROBADO.'],
    ['revisor', 'ALTO. NADA LLEGA A PRODUCCIÓN SIN CUMPLIR LA DEFINITION OF DONE.'],
    ['revisor', 'TESTS, LOGS, DOCUMENTACIÓN. CADA TAREA PENDIENTE ME PROTEGE.'],
    ['narr', 'PISTA: completa las tareas pendientes y El Revisor quedará expuesto.']],
  outro: () => [
    ...(RUN && RUN.revisor ? [['revisor', 'APPROVED. CUMPLE LA DoD. PUEDES HACER MERGE.']] : []),
    ['hero', HERO_LINES[P.hero].outro],
    ...p2Line('outro'),
    ['narr', 'LA GUARIDA DE AUTOMATION VUELVE A ESTAR EN BUENAS MANOS. FIN DE LA ETAPA 1.']],
  cuevas: () => [
    ['narr', 'LUNES, 03:00. UN BATCH NOCTURNO SALE DE LAS CUEVAS DONDE NADIE BAJA DESDE 1987.'],
    ['hero', HERO_LINES[P.hero].cuevas],
    ...p2Line('cuevas'),
    ['narr', 'Atraviesa las Minas de Datos, la Cripta de Seguridad y el Observatorio hasta el Trono del Mainframe.']],
  jefes: () => [
    ['narr', 'MODO JEFES: NUEVE JEFES SEGUIDOS. ENTRE COMBATE Y COMBATE, +30 DE VIDA.'],
    ['narr', 'Cuanto antes acabes, más oro. Hay un ranking solo para este modo.']],
  nube: () => [
    ['narr', 'FIN DE MES. LLEGA EL CORREO DE FACTURACIÓN Y NADIE SE ATREVE A ABRIRLO.'],
    ['hero', HERO_LINES[P.hero].nube],
    ...p2Line('nube'),
    ['narr', 'Cruza el Archipiélago de Clústeres y las Nubes Serverless hasta la Cumbre de Facturación.']],
  kraken: () => [
    ['kraken', 'MIS TENTÁCULOS SON NODOS. MIENTRAS VIVA MI CONTROL PLANE, NADA ME TUMBA.'],
    ['narr', 'PISTA: ataca primero el tentáculo del CONTROL PLANE.']],
  autoscaler: () => [
    ['autoscaler', '¿MÁS CARGA? ¡MÁS RÉPLICAS! MI LÍMITE ES TU PRESUPUESTO.'],
    ['narr', 'PISTA: mientras tenga réplicas, la carga se reparte y pega más flojo. Acaba con ellas.']],
  factura: () => [
    ['factura', 'SOY LA FACTURA DE FIN DE MES. CADA GIGA, CADA HORA, CADA LOG QUE NADIE LEE.'],
    ['hero', HERO_LINES[P.hero].factura],
    ...p2Line('factura'),
    ['narr', 'PISTA: esquiva la lluvia de cargos mirando las sombras en el suelo.']],
  epilogo: () => [
    ['factura', 'PAGO... RECIBIDO...'],
    ['hero', HERO_LINES[P.hero].outro],
    ...p2Line('outro'),
    ['narr', 'LOS COSTES BAJAN UN 40 %. ALGUIEN PROPONE VOLVER A ON-PREMISE. FIN DE LA ETAPA 3.']],
  dba: () => [
    ['dba', '¿QUIÉN HA LANZADO UN SELECT SIN WHERE EN MI TABLA? AHORA LA BLOQUEO ENTERA.'],
    ['narr', 'PISTA: si te atrapa un LOCK TABLE, pulsa A rápido para liberarte.']],
  cancerbero: () => [
    ['cancerbero', 'TRES CABEZAS, TRES AES: AUTENTICACIÓN, AUTORIZACIÓN... Y MI FAVORITA, EL MFA.'],
    ['narr', 'PISTA: mientras viva la cabeza del MFA, las otras se vuelven a autenticar.']],
  lich: () => [
    ['lich', 'IDENTIFICATION DIVISION. PROGRAM-ID. ETERNIDAD. LLEVO 40 AÑOS EN PRODUCCIÓN.'],
    ['hero', HERO_LINES[P.hero].lich],
    ...p2Line('lich'),
    ['narr', 'PISTA: cuando aparezca la COPIA EN CINTA, destrúyela o el Lich no recibirá daño.']],
  final: () => [
    ['lich', 'STOP RUN...'],
    ['hero', HERO_LINES[P.hero].outro],
    ...p2Line('outro'),
    ['narr', 'EL MAINFRAME DESCANSA AL FIN. LOS BATCH NOCTURNOS PASAN A RUNDECK. FIN DE LA ETAPA 2.']]
};
let story = null;
/**
 * Abre una viñeta de historia y pausa la partida.
 * @param {string} key Clave de STORIES.
 * @param {Function} [after] Se llama al cerrarla.
 */
function startStory(key, after){
  // En el modo jefes solo se ve la viñeta de entrada: el resto se salta.
  if (playMode === 'jefes' && key !== 'jefes') { if (after) after(); return; }
  story = { key, lines:STORIES[key](), i:0, chars:0, after:after || null }; state = 'story';
}
/**
 * Avanza el texto tipo máquina de escribir; A, B o START completan o pasan de línea.
 */
function updateStory(){
  const ln = story.lines[story.i];
  story.chars += 1.3;
  if (pressed('atk') || pressed('start') || pressed('jump')) {
    if (story.chars < ln[1].length) story.chars = ln[1].length;
    else if (++story.i >= story.lines.length) { const cb = story.after; story = null; state = 'play'; if (cb) cb(); }
    else { story.chars = 0; sfx('select'); }
  }
}
/**
 * Parte un texto en líneas de como mucho `max` caracteres.
 * @param {string} s
 * @param {number} max
 * @returns {string[]}
 */
function wrapText(s, max){
  const out = []; let line = '';
  for (const w of s.split(' ')) { const c = line ? line + ' ' + w : w; if (c.length > max && line) { out.push(line); line = w; } else line = c; }
  if (line) out.push(line);
  return out;
}
const SPEAKERS = { narr:'SISTEMA DE ALERTAS', mino:'MINOTAURO DEL FIREWALL', hidra:'HIDRA RAID', dragon:'DRAGÓN NEGRO', revisor:'EL REVISOR',
  dba:'TROLL DBA', cancerbero:'CANCERBERO DE LAS 3 AAA', lich:'EL LICH COBOL',
  kraken:'EL KRAKEN DEL CLÚSTER', autoscaler:'EL AUTOESCALADOR', factura:'LA FACTURA DE FIN DE MES' };
/**
 * Dibuja el cuadro de diálogo con el retrato de quien habla.
 */
function drawStory(){
  if (!story) return;
  const [who, text] = story.lines[story.i];
  ctx.fillStyle = 'rgba(6,8,7,.45)'; ctx.fillRect(0, 31, W, H - 31);
  panel(4, 132, 312, 64, '#0a120d');
  r(8, 137, 46, 46, NEON); r(9, 138, 44, 44, '#16241b');
  const hero = who === 'hero' ? P : who === 'hero2' ? PLAYERS[1] : null;
  if (hero) portrait(hero.h.rig, 9, 138, 44);
  else if (who === 'revisor' || who === 'dba' || who === 'lich' || who === 'autoscaler') portrait(who, 9, 138, 44);
  else if (who === 'kraken') ctx.drawImage(headSprite('#326ce5', (t >> 4) % 2, 0).c, 0, 0, 50, 34, 9, 144, 44, 30);
  else if (who === 'factura') ctx.drawImage(invoiceSprite((t >> 4) % 2).c, 20, 10, 80, 80, 9, 138, 44, 44);
  else if (who === 'cancerbero') ctx.drawImage(headSprite('#8a2c3c', (t >> 4) % 2, 0).c, 0, 0, 50, 34, 9, 144, 44, 30);
  else if (who === 'mino') portrait('minotauro', 9, 138, 44);
  else if (who === 'dragon') ctx.drawImage(dragonSprite({ wing:1, mouth:(t >> 4) % 2, lunge:0, tail:0, fly:0, dizzy:0 }).c, 112, 20, 54, 54, 9, 138, 44, 44);
  else if (who === 'hidra') ctx.drawImage(headSprite('#7a4a9a', (t >> 4) % 2, 0).c, 0, 0, 50, 34, 9, 144, 44, 30);
  else { txt('>_', 18, 152, (t >> 4) % 2 ? NEON : '#1f7a46', { big:true }); }
  txt(hero ? hero.h.name + ' ' + hero.h.sub : SPEAKERS[who], 60, 137, hero ? (who === 'hero2' ? '#9fd0ff' : '#ffd27a') : NEONT);
  let n = Math.floor(story.chars);
  wrapText(text, 31).forEach((ln, i) => { if (n > 0) txt(ln.slice(0, n), 60, 150 + i*11, C.w); n -= ln.length + 1; });
  if (story.chars >= text.length && (t >> 4) % 2) txt('A', 304, 184, '#ffd23f');
}
