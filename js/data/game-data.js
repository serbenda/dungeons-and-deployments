// Datos del juego: héroes, enemigos, comida, secciones (tickets y oleadas) y cajas.
'use strict';

const HEROES = {
  guerrero: { name:'GUERRERO', sub:'DE RUNDECK', rig:'guerrero', spd:1.15, dmg:[8,8,17], special:'RUN JOB', fuerza:5, vel:2 },
  mago: { name:'MAGO', sub:'DESARROLLADOR', rig:'mago', spd:1.4, dmg:[6,6,12], special:'GIT PUSH -F', fuerza:3, vel:4 }
};
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
  esqueleto: { name:'PROC. ZOMBI', short:'ZOMBI', rig:'esqueleto', hp:30, spd:.75, dmg:7, wind:20, score:250 }
};
const FOOD = {
  pocion:{ heal:15, score:200, name:'POCIÓN DE CAFÉ' }, pollo:{ heal:35, score:400, name:'POLLO ASADO' },
  tortilla:{ heal:50, score:600, name:'TORTILLA' }, bocata:{ heal:100, score:1000, name:'BOCATA DE CALAMARES' }
};
const SECTIONS = [
  { cam:110, mission:'SYS-101 SALA DE GUARDIA', close:'FUNCIONA EN MI MÁQUINA', waves:[ [['goblin',1],['goblin',1]], [['esqueleto',0],['goblin',1],['goblin',-1]] ] },
  { cam:760, mission:'NET-404 PAQUETES PERDIDOS', close:'SIEMPRE ES EL DNS', miniboss:'minotauro', waves:[ [['murcielago',1],['murcielago',1],['murcielago',-1]], [['firewall',1],['goblin',-1],['murcielago',1]] ] },
  { cam:1400, mission:'STO-100 DISCO AL 100%', close:'rm -rf /tmp/*', miniboss:'hidra', mimics:[[1590, 152], [1680, 178]], waves:[ [['slime',1],['goblin',-1]], [['slime',1],['orco',-1]] ] },
  { cam:2040, mission:'VIR-007 VMS HUÉRFANAS', close:'SNAPSHOTS BORRADOS', golem:true, waves:[ [['goblin',1,'patcher'],['fantasma',-1],['fantasma',1]], [['fantasma',0],['esqueleto',0],['orco',1]] ] },
  { cam:2680, mission:'K8S-503 CRASHLOOPBACKOFF', close:'kubectl delete deploy', totem:[2920, 152], waves:[ [['pod',1],['orco',-1]] ] },
  { cam:LEVEL_END, mission:'AUT-500 GUARIDA DE AUTOMATION', boss:true }
];
const CRATES = [
  ['barril',290,170,'pocion'], ['cofre',560,142,'baculo'], ['barril',990,178,'tortilla'], ['cofre',1220,140,'patito'],
  ['barril',1760,174,'pollo'], ['cofre',1860,140,'stack'], ['barril',2380,142,'pocion'], ['cofre',2500,170,'martillo'],
  ['barril',3060,160,'tortilla'], ['cofre',3440,162,'bocata']
];
