// Datos del juego: héroes, enemigos, comida, secciones (tickets y oleadas) y cajas.
'use strict';

/**
 * Héroes jugables: velocidad, daño de cada golpe del combo y especial.
 */
const HEROES = {
  guerrero: { name:'GUERRERO', sub:'DE RUNDECK', rig:'guerrero', spd:1.15, dmg:[8,8,17], special:'RUN JOB', fuerza:5, vel:2 },
  mago: { name:'MAGO', sub:'DESARROLLADOR', rig:'mago', spd:1.4, dmg:[6,6,12], special:'GIT PUSH -F', fuerza:3, vel:4 },
  picara: { name:'PÍCARA', sub:'DEL FRONTEND', rig:'picara', spd:1.6, dmg:[5,5,11], special:'!IMPORTANT', fuerza:2, vel:5 },
  bardo: { name:'BARDO', sub:'SCRUM MASTER', rig:'bardo', spd:1.2, dmg:[7,7,14], special:'DAILY', fuerza:4, vel:3 }
};
/** Orden de los héroes en la pantalla de selección. */
const HERO_ORDER = ['guerrero', 'mago', 'picara', 'bardo'];
/** Descripción corta de cada héroe y de su especial, para la selección. */
const HERO_INFO = {
  guerrero: ['Golpes pesados y armadura.', 'Salta y ejecuta un job que', 'sacude el suelo.'],
  mago: ['Lanza console.log() al', 'final del combo. Su especial', 'fuerza el push y borra balas.'],
  picara: ['La más rápida del CPD.', 'Su especial cruza la pantalla', 'con display:none !important.'],
  bardo: ['Aguanta y motiva al equipo.', 'Su daily aturde enemigos y', 'cura a todo el equipo.']
};
/**
 * Enemigos: vida (hp), velocidad (spd), daño (dmg), preparación del golpe en
 * actualizaciones (wind) y puntos (score). boss, nograb, fly, ghost... activan
 * comportamientos especiales.
 */
const FOES = {
  minotauro: { name:'MINOTAURO DEL FIREWALL', short:'MINOTAURO', rig:'minotauro', boss:true, nograb:true, hp:300, spd:.8, dmg:14, wind:16, score:3000 },
  hidra: { name:'HIDRA RAID', short:'HIDRA', boss:true, nograb:true, hp:1, score:3000 },
  cabeza: { name:'DISCO', short:'DISCO', boss:true, nograb:true, hp:80, score:0 },
  goblin: { name:'GOBLIN CLICKOPS', short:'GOBLIN', rig:'goblin', hp:34, spd:1.0, dmg:6, wind:18, score:150 },
  orco: { name:'ORCO CONSULTOR', short:'ORCO CONS.', rig:'orco', hp:80, spd:.8, dmg:10, wind:15, score:450 },
  murcielago: { name:'PAQUETE PERDIDO', short:'PAQUETE', fly:true, nograb:true, hp:14, spd:1.4, dmg:4, wind:14, score:120 },
  firewall: { name:'CABALLERO FIREWALL', short:'FIREWALL', rig:'firewall', nograb:true, slowturn:true, hp:64, spd:.6, dmg:9, wind:18, score:500 },
  mimico: { name:'MÍMICO DISCO LLENO', short:'MÍMICO', nograb:true, hopper:true, hp:40, spd:.9, dmg:8, wind:20, score:400 },
  fantasma: { name:'VM HUÉRFANA', short:'VM HUÉRF.', nograb:true, ghost:true, hp:30, spd:.8, dmg:6, wind:18, score:300 },
  pod: { name:'POD', short:'POD', nograb:true, hp:12, spd:1.25, dmg:4, wind:14, score:100 },
  totem: { name:'DEPLOYMENT', short:'DEPLOYMENT', nograb:true, hp:80, score:1200 },
  slime: { name:'FUGA DE MEMORIA', short:'MEM LEAK', slime:true, hp:30, spd:.7, dmg:6, wind:22, score:200 },
  slimeS: { name:'MINI LEAK', short:'MINI LEAK', slime:true, small:true, hp:10, spd:1.1, dmg:4, wind:16, score:80 },
  revisor: { name:'EL REVISOR', short:'REVISOR', rig:'revisor', boss:true, nograb:true, hp:320, spd:.75, dmg:13, wind:18, score:10000 },
  pendiente: { name:'TAREA PENDIENTE', short:'PENDIENTE', rig:'pendiente', hp:26, spd:1.05, dmg:5, wind:16, score:300 },
  // Etapa 2: Las Cuevas
  kobold: { name:'KOBOLD DEL SELECT *', short:'KOBOLD', rig:'kobold', hp:40, spd:1.05, dmg:7, wind:16, score:200 },
  troll: { name:'TROLL DEL LEGACY', short:'TROLL', rig:'troll', hp:110, spd:.7, dmg:12, wind:18, score:600 },
  consulta: { name:'CONSULTA N+1', short:'N+1', fly:true, look:'eye', nograb:true, hp:12, spd:1.5, dmg:4, wind:14, score:120 },
  dba: { name:'TROLL DBA', short:'DBA', rig:'dba', boss:true, nograb:true, hp:340, spd:.75, dmg:15, wind:18, score:4000 },
  phishing: { name:'COFRE PHISHING', short:'PHISHING', nograb:true, hopper:true, look:'phish', hp:44, spd:1.0, dmg:9, wind:18, score:450 },
  ransom: { name:'RANSOMWARE', short:'RANSOMWARE', rig:'ransom', hp:50, spd:.85, dmg:9, wind:18, score:450 },
  troyano: { name:'TROYANO', short:'TROYANO', nograb:true, ghost:true, look:'horse', hp:36, spd:.85, dmg:7, wind:18, score:350 },
  alerta: { name:'FALSO POSITIVO', short:'ALERTA', fly:true, look:'bell', nograb:true, hp:14, spd:1.5, dmg:5, wind:14, score:150 },
  gnomo: { name:'GNOMO DEL DASHBOARD', short:'GNOMO', rig:'gnomo', hp:34, spd:1.1, dmg:6, wind:16, score:220 },
  cinta: { name:'COPIA EN CINTA', short:'CINTA', nograb:true, hp:90, score:1500 },
  lich: { name:'EL LICH COBOL', short:'LICH COBOL', rig:'lich', boss:true, nograb:true, hp:520, spd:.7, dmg:14, wind:20, score:8000 },
  // Etapa 3: La Nube
  sidecar: { name:'SIDECAR PEGAJOSO', short:'SIDECAR', rig:'sidecar', hp:42, spd:1.1, dmg:7, wind:16, score:220 },
  operador: { name:'OPERADOR DE K8S', short:'OPERADOR', rig:'operador', hp:96, spd:.75, dmg:11, wind:16, score:550 },
  yaml: { name:'INDENTACIÓN ROTA', short:'YAML', slime:true, look:'yaml', hp:34, spd:.75, dmg:6, wind:20, score:220 },
  yamlS: { name:'TABULADOR', short:'TAB', slime:true, small:true, look:'yaml', hp:10, spd:1.15, dmg:4, wind:16, score:80 },
  lambda: { name:'LAMBDA EN FRÍO', short:'LAMBDA', fly:true, look:'lambda', nograb:true, hp:16, spd:1.6, dmg:5, wind:14, score:160 },
  nat: { name:'NAT GATEWAY', short:'NAT GW', nograb:true, ghost:true, look:'coin', hp:40, spd:.85, dmg:7, wind:18, score:400 },
  zombieVm: { name:'INSTANCIA ZOMBI', short:'INST. ZOMBI', rig:'zombieVm', hp:36, spd:.8, dmg:8, wind:20, score:280 },
  autoscaler: { name:'EL AUTOESCALADOR', short:'AUTOESCALADOR', rig:'autoscaler', boss:true, nograb:true, hp:360, spd:.85, dmg:13, wind:16, score:4500 },
  replica: { name:'RÉPLICA', short:'RÉPLICA', rig:'replica', hp:30, spd:1.2, dmg:6, wind:14, score:150 },
  factura: { name:'LA FACTURA DE FIN DE MES', short:'FACTURA', boss:true, nograb:true, hp:600, spd:.7, dmg:14, wind:20, score:12000 },
  esqueleto: { name:'PROC. ZOMBI', short:'ZOMBI', rig:'esqueleto', hp:30, spd:.75, dmg:7, wind:20, score:250 }
};
/**
 * Comida: vida que cura y puntos.
 */
const FOOD = {
  pocion:{ heal:15, score:200, name:'POCIÓN DE CAFÉ' }, pollo:{ heal:35, score:400, name:'POLLO ASADO' },
  tortilla:{ heal:50, score:600, name:'TORTILLA' }, bocata:{ heal:100, score:1000, name:'BOCATA DE CALAMARES' }
};
/**
 * Secciones de la etapa. Al llegar la cámara a `cam` se bloquea la pantalla, se
 * muestra el ticket `mission` y salen las oleadas `waves` ([tipo, lado, papel]: lado 1
 * derecha, -1 izquierda, 0 sale del suelo). Al acabar, el jefe `miniboss` si lo hay, y
 * después se muestra `close`.
 */
const SECTIONS_1 = [
  { cam:110, mission:'SYS-101 SALA DE GUARDIA', close:'FUNCIONA EN MI MÁQUINA', waves:[ [['goblin',1],['goblin',1]], [['esqueleto',0],['goblin',1],['goblin',-1]] ] },
  { cam:760, mission:'NET-404 PAQUETES PERDIDOS', close:'SIEMPRE ES EL DNS', miniboss:'minotauro', waves:[ [['murcielago',1],['murcielago',1],['murcielago',-1]], [['firewall',1],['goblin',-1],['murcielago',1]] ] },
  { cam:1400, mission:'STO-100 DISCO AL 100%', close:'rm -rf /tmp/*', miniboss:'hidra', mimics:[[1590, 152], [1680, 178]], waves:[ [['slime',1],['goblin',-1]], [['slime',1],['orco',-1]] ] },
  { cam:2040, mission:'VIR-007 VMS HUÉRFANAS', close:'SNAPSHOTS BORRADOS', golem:true, waves:[ [['goblin',1,'patcher'],['fantasma',-1],['fantasma',1]], [['fantasma',0],['esqueleto',0],['orco',1]] ] },
  { cam:2680, mission:'K8S-503 CRASHLOOPBACKOFF', close:'kubectl delete deploy', totem:[2920, 152], waves:[ [['pod',1],['orco',-1]] ] },
  { cam:LEVEL_END, mission:'AUT-500 GUARIDA DE AUTOMATION', boss:true }
];
/**
 * Cajas y barriles de la etapa 1: [tipo, x, y, objeto que sueltan].
 */
const CRATES_1 = [
  ['barril',290,170,'pocion'], ['cofre',560,142,'baculo'], ['barril',990,178,'tortilla'], ['cofre',1220,140,'patito'],
  ['barril',1760,174,'pollo'], ['cofre',1860,140,'stack'], ['barril',2380,142,'pocion'], ['cofre',2500,170,'martillo'],
  ['barril',3060,160,'tortilla'], ['cofre',3440,162,'bocata']
];
/**
 * Secciones de la etapa 2, Las Cuevas: Bases de datos, Seguridad y Monitorización.
 * mimics admite un tercer elemento con el tipo (por defecto 'mimico').
 */
const SECTIONS_2 = [
  { cam:110, mission:'DB-101 DEADLOCK EN LA MINA', close:'COMMIT;', waves:[ [['kobold',1],['kobold',-1]], [['esqueleto',0],['kobold',1],['consulta',1]] ] },
  { cam:760, mission:'DB-500 CONSULTAS N+1', close:'CREATE INDEX', miniboss:'dba', waves:[ [['consulta',1],['consulta',-1],['consulta',1]], [['troll',1],['kobold',-1]] ] },
  { cam:1400, mission:'SEC-403 ACCESO DENEGADO', close:'MÍNIMO PRIVILEGIO', mimics:[[1590, 152, 'phishing'], [1690, 178, 'phishing']], waves:[ [['ransom',1],['kobold',-1]], [['troyano',-1],['troyano',1],['ransom',1]] ] },
  { cam:2040, mission:'SEC-666 DÍA CERO', close:'PARCHE APLICADO', miniboss:'cancerbero', waves:[ [['ransom',1],['troyano',0],['firewall',-1]] ] },
  { cam:2680, mission:'MON-200 ALERTAS A LAS 3:00', close:'ALERTA SILENCIADA', waves:[ [['alerta',1],['alerta',-1],['gnomo',1]], [['gnomo',-1],['troll',1],['alerta',1]] ] },
  { cam:LEVEL_END, mission:'MF-001 TRONO DEL MAINFRAME', boss:true }
];
/** Cajas y barriles de la etapa 2. */
const CRATES_2 = [
  ['barril',300,172,'pocion'], ['cofre',600,146,'martillo'], ['barril',1010,176,'pollo'], ['cofre',1230,142,'patito'],
  ['barril',1780,170,'tortilla'], ['cofre',1880,144,'baculo'], ['barril',2400,150,'pocion'], ['cofre',2520,172,'stack'],
  ['barril',3080,160,'pollo'], ['cofre',3440,164,'bocata']
];
/**
 * Secciones de la etapa 3, La Nube: Kubernetes gestionado, Serverless y Facturación.
 */
const SECTIONS_3 = [
  { cam:110, mission:'K8S-101 NODOS NOTREADY', close:'kubectl drain', waves:[ [['sidecar',1],['sidecar',-1]], [['yaml',1],['sidecar',1],['pod',-1]] ] },
  { cam:760, mission:'K8S-404 CONTROL PLANE CAÍDO', close:'CLÚSTER SANO', miniboss:'kraken', waves:[ [['operador',1],['yaml',-1]], [['pod',1],['pod',-1],['sidecar',1]] ] },
  { cam:1400, mission:'FN-500 COLD START', close:'PROVISIONED CONCURRENCY', waves:[ [['lambda',1],['lambda',-1],['lambda',1]], [['zombieVm',0],['lambda',1],['sidecar',-1]] ] },
  { cam:2040, mission:'FN-429 TOO MANY REQUESTS', close:'RATE LIMIT OK', miniboss:'autoscaler', waves:[ [['operador',1],['lambda',-1],['lambda',1]] ] },
  { cam:2680, mission:'FIN-402 PAYMENT REQUIRED', close:'TAGS DE COSTE OK', waves:[ [['nat',1],['zombieVm',0],['zombieVm',-1]], [['nat',-1],['operador',1],['lambda',1]] ] },
  { cam:LEVEL_END, mission:'FIN-999 LA FACTURA DE FIN DE MES', boss:true }
];
/** Cajas y barriles de la etapa 3. */
const CRATES_3 = [
  ['barril',280,170,'pocion'], ['cofre',580,146,'baculo'], ['barril',1000,176,'tortilla'], ['cofre',1240,142,'stack'],
  ['barril',1770,172,'pollo'], ['cofre',1870,146,'martillo'], ['barril',2390,150,'pocion'], ['cofre',2510,172,'patito'],
  ['barril',3070,162,'tortilla'], ['cofre',3440,164,'bocata']
];
/**
 * Etapas: secciones, cajas, jefe final, viñeta de entrada y textos del cartel.
 */
const STAGES = [
  { name:'LAS CATACUMBAS', sub:'LAS CATACUMBAS DE SISTEMAS', sections:SECTIONS_1, crates:CRATES_1, boss:'dragon', story:'intro' },
  { name:'LAS CUEVAS', sub:'LAS MINAS DE DATOS', sections:SECTIONS_2, crates:CRATES_2, boss:'lich', story:'cuevas' },
  { name:'LA NUBE', sub:'EL ARCHIPIÉLAGO DE CLÚSTERES', sections:SECTIONS_3, crates:CRATES_3, boss:'factura', story:'nube' }
];
/** Secciones y cajas de la etapa en curso (cambian con loadStage()). */
let SECTIONS = SECTIONS_1, CRATES = CRATES_1;
