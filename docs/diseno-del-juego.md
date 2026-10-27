# Diseño del juego

Todos los números de esta guía salen del código. Los tiempos están en **actualizaciones** (60 = 1 segundo). Si cambias un valor, actualiza también esta tabla.

## Premisa

Viernes, 17:45. Alguien ha tocado producción a mano. Un equipo de desarrollo baja a las catacumbas del CPD y cierra el ticket de cada departamento hasta llegar a la Guarida de Automation, donde el Dragón Negro se ha adueñado de todos los jobs.

Lunes, 03:00. Un batch nocturno sale de **Las Cuevas**, más abajo todavía, donde nadie baja desde 1987: Bases de datos, Seguridad, Monitorización y, al fondo, el Trono del Mainframe del Lich COBOL.

El juego tiene dos etapas seguidas (`STAGES`). Al terminar la primera, START lleva a la segunda conservando vida, vidas y puntuación.

Las bromas giran en torno a la informática: tickets, ClickOps, DNS, RAID, VMs huérfanas, CrashLoopBackOff… Nunca sobre personas.

## Héroes

Datos en `HEROES` (`js/data/game-data.js`) y aspecto en `RIGS` (`js/sprites/characters.js`).

| | Guerrero de Rundeck | Mago Desarrollador | Pícara del Frontend | Bardo Scrum Master |
|---|---|---|---|---|
| Velocidad (px/actualización) | 1,15 | 1,40 | 1,60 | 1,20 |
| Daño del combo (golpe 1 · 2 · 3) | 8 · 8 · 17 | 6 · 6 · 12 | 5 · 5 · 11 | 7 · 7 · 14 |
| Patada en el aire | 14 | 12 | 12 | 12 |
| Especial | `RUN JOB`: salta y golpea el suelo | `GIT PUSH -F`: explosión arcana | `!IMPORTANT`: carga en línea recta | `DAILY`: reunión relámpago |
| Efecto del especial | 74 px · 24 de daño | 88 px · 18 (además borra los proyectiles enemigos) | Avanza ~100 px y hace 16 a cada enemigo que cruza; rompe cajas | 110 px · 10 de daño y derriba; **cura 20 a todo el equipo** |
| Extra | — | El tercer golpe lanza un `console.log()` (10 de daño) | — | — |

Todos empiezan con 100 de vida y 2 vidas extra (8 con el código Konami), más o menos según la dificultad.

El orden de la selección está en `HERO_ORDER` y la ficha de cada uno en `HERO_INFO`.

### Movimientos

| Movimiento | Cómo | Detalles |
|---|---|---|
| Combo | A, A, A | Golpes de 12 actualizaciones (el tercero, 18). El tercero derriba. Si el golpe anterior no ha dado, el combo vuelve a empezar |
| Salto y patada | B, y A en el aire | La patada derriba |
| Agarre | Caminar contra un enemigo durante 10 actualizaciones | Solo enemigos con `nograb` falso |
| Rodillazos | A con el enemigo agarrado | 6 de daño; al tercero, o con A hacia atrás, se lanza |
| Lanzamiento | — | El lanzado hace 20 de daño a quien golpee y 20 más al caer |
| Especial | SP (o A+B) | Cuesta 10 de vida; no se puede con 10 o menos. Invulnerable mientras dura |

### Vidas y continuar

- Al perder toda la vida se gasta una vida: «¡HOTFIX APLICADO!» recupera la vida, da invulnerabilidad y derriba a los enemigos cercanos (no a los jefes).
- Sin vidas aparece **¿ROLLBACK?**: 10 segundos para insertar crédito (START) y seguir con 2 vidas.
- En cooperativo, el jugador que se queda sin vidas sale de la partida («P2 FUERA · START PARA VOLVER») y el otro sigue. Pulsando START vuelve con 2 vidas (cuenta como continuación). Solo si caen los dos aparece ¿ROLLBACK?.

## Cooperativo

| Regla | Valor |
|---|---|
| Unirse | En la selección, o en cualquier momento de la partida, pulsando START en otro dispositivo (tecla 2 o un mando). Gasta un crédito y entra con 1 vida extra menos |
| Vida de los enemigos | +50 % |
| Enemigos atacando a la vez | Hasta 3 (2 con un jugador) |
| Objetivo de cada enemigo | El jugador más cercano que siga en pie; se revisa cada medio segundo |
| Cámara | Sigue al que va delante sin dejar fuera al que va detrás |
| Puntuación | Compartida; el bonus de vida suma a los dos y el de combo usa el mejor |
| Combos | Cada jugador lleva el suyo |

## Dificultad

Se elige en Opciones (`DIFFS`, `js/ui/options.js`).

| | Vida de los enemigos | Daño que recibes | Vidas extra |
|---|---|---|---|
| BECARIO | ×0,8 | ×0,7 | 3 |
| SENIOR | ×1 | ×1 | 2 |
| GUARDIA 24/7 | ×1,3 | ×1,35 | 1 |

## Enemigos

Datos en `FOES`. `wind` es lo que tardan en golpear tras avisar con la marca roja.

| Enemigo | Zona | Vida | Velocidad | Daño | `wind` | Puntos | Comportamiento |
|---|---|---|---|---|---|---|---|
| Goblin ClickOps | Todas | 34 | 1,0 | 6 | 18 | 150 | Básico. Uno parchea al gólem («runa de parche manual») |
| Orco consultor | Varias | 80 | 0,8 | 10 | 15 | 450 | Doble golpe; el segundo derriba |
| Proceso zombi | Sistemas, Virtualización | 30 | 0,75 | 7 | 20 | 250 | Sale del suelo. Al morir, 60 % de que «se reinicie» una vez con 22 de vida |
| Paquete perdido | Network | 14 | 1,4 | 4 | 14 | 120 | Vuela en círculo (radio 54) y se lanza en picado. No se puede agarrar |
| Caballero Firewall | Network | 64 | 0,6 | 9 | 18 | 500 | Bloquea de frente (`ACL: DENY`) y gira despacio. Tras 7 bloqueos pierde el escudo |
| Fuga de memoria | Storage | 30 | 0,7 | 6 | 22 | 200 | Salta al atacar. Al morir se divide en dos mini leaks |
| Mini leak | Storage | 10 | 1,1 | 4 | 16 | 80 | — |
| Mímico de disco lleno | Storage | 40 | 0,9 | 8 | 20 | 400 | Dormido como un cofre hasta que te acercas (60 px) o le pegas |
| VM huérfana | Virtualización | 30 | 0,8 | 6 | 18 | 300 | Se apaga 80 de cada 240 actualizaciones: apagada no se le puede golpear ni ataca |
| Pod | CaaS | 12 | 1,25 | 4 | 14 | 100 | El tótem Deployment los repone |
| Deployment (tótem) | CaaS | 80 | — | — | — | 1.200 | Mantiene 3 réplicas: crea un pod cada 130 actualizaciones si faltan |

Como mucho **dos enemigos atacan a la vez**; el resto merodea a distancia esperando turno.

### El Gólem Hipervisor

En Virtualización. 120 de vida. Es pacífico hasta que un goblin le graba una runa de parche manual (70 actualizaciones) o hasta que alguien le pega. Enfadado, embiste en línea recta (16 de daño) contra **todos**, enemigos incluidos. La sección no se cierra mientras siga enfadado y vivo.

## Jefes

### Minotauro del Firewall (Network)

| Dato | Valor |
|---|---|
| Vida | 300 |
| Hachazo | 14, derriba; alcance 34 px |
| `SYN FLOOD` | Embestida en su carril cuando estás a más de 90 px (50 %): 16 de daño |
| Tormenta de broadcast | Al bajar del 70 %, invoca 2 paquetes perdidos (una vez) |
| `ACL: DENY ALL` | Por debajo del 50 %: 170 actualizaciones de bloqueo frontal, cada 420. Solo gira cada 55 actualizaciones: hay que atacarle por la espalda. Los especiales y los lanzamientos atraviesan el bloqueo |
| Puntos | 3.000 |

### Hidra RAID (Storage)

Un cuerpo invulnerable («¡ATACA LAS CABEZAS!») y tres cabezas de 80 de vida, cada una en un carril:

| Cabeza | Carril (y) | Ataque |
|---|---|---|
| Disco 1 | 138 | Mordisco en su carril: 12, derriba |
| Paridad | 158 | Escupe sectores defectuosos dirigidos: 8 |
| Disco 2 | 180 | Mordisco en su carril: 12, derriba |

Mecánica RAID: una cabeza de disco rota se **reconstruye** en 420 actualizaciones (con el 60 % de la vida) mientras la paridad siga viva. Si cae la paridad, las cabezas rotas mueren para siempre. Estrategia: la paridad primero. 3.000 puntos al caer la última cabeza.

### Dragón Negro (Guarida de Automation)

| Dato | Valor |
|---|---|
| Vida | 440 |
| Aliento de ácido (`rm -rf /*`) | En línea recta, 190 px: 5 de daño cada 12 actualizaciones durante 70 |
| Mordisco (`SEGFAULT`) | 15, derriba |
| Coletazo | 11 si estás detrás a menos de 80 px |
| Vuelo y pisotón (`KERNEL PANIC`) | Por debajo del 65 % (30 % de probabilidad): te sigue desde el aire y cae con 18 de daño en 60 px |
| Refuerzos | Al 50 %, un goblin y un orco (una vez) |
| `STACK OVERFLOW` | Si acumula 45 de daño mientras prepara un ataque, se tambalea 40 actualizaciones |
| Final | 5.000 puntos, cámara lenta y «¡CRÍTICO! INCIDENTE CERRADO» |

La música del jefe acelera un 12 % por debajo de la mitad de la vida.

### Troll DBA (Bases de datos)

| Dato | Valor |
|---|---|
| Vida | 340 |
| Martillazos | 15; cada tercer golpe, `DROP TABLE`: onda expansiva de 56 px (10, derriba) |
| `LOCK TABLE` | Cada 5-7 s marca una zona en el suelo bajo su objetivo. Al armarse (40 actualizaciones), quien esté dentro queda **atrapado**: 5 pulsaciones de A para liberarse (o 2,5 s) |
| Refuerzos | Al 50 %, tres consultas N+1 |

### Cancerbero de las 3 AAA (Seguridad)

La misma mecánica que la Hidra RAID con otras cabezas: **AUTENTICACIÓN**, **MFA** y **AUTORIZACIÓN**. Mientras viva la del MFA, las otras se «reautentican» (se reconstruyen). Es una variante de `spawnHydra()` (`CERBERUS`).

### Lich COBOL (Trono del Mainframe)

| Dato | Valor |
|---|---|
| Vida | 520 |
| `//JCL JOB` | Tres proyectiles en abanico (8 cada uno) |
| `SUBMIT BATCH` | Levanta dos procesos zombi a los lados del objetivo (si hay menos de dos) |
| `IPL` | Desaparece y reaparece en el otro lado de la pantalla |
| Báculo | 14, derriba, si estás cerca |
| Copia en cinta | Al 60 % y al 25 % invoca una **COPIA EN CINTA** (90 de vida) en el lado contrario y no recibe daño hasta que se destruye |
| Final | 8.000 puntos, cámara lenta y «STOP RUN» |

### El Revisor (jefe secreto)

Aparece después del Dragón Negro **solo si se ha llegado sin continuar** (`revisorUnlocked()`). Exige la Definition of Done.

| Dato | Valor |
|---|---|
| Vida | 320 |
| Tareas pendientes | Al empezar invoca 2 esbirros (TESTS, LOGS, DOCS, ROLLBACK, LINT, ALERTAS), 3 al 66 % y 4 al 33 %. Cada uno: 26 de vida, 5 de daño |
| Protección | Mientras quede una tarea pendiente, no le entra ningún golpe, ni siquiera los especiales |
| A distancia | Protegido, se aleja y lanza comentarios de revisión (8 de daño) |
| Expuesto | Sin pendientes, «LGTM... ¿SEGURO?»: pelea con la maza (13, derriba) durante 8 segundos y vuelve a pedir cambios |
| Final | 10.000 puntos y «APPROVED · MERGE» |

## Etapa 1: Las Catacumbas

| Sección | Cámara | Ticket | Oleadas | Extra | Al cerrar |
|---|---|---|---|---|---|
| Sistemas | 110 | `SYS-101 SALA DE GUARDIA` | 2 goblins · zombi + 2 goblins | — | FUNCIONA EN MI MÁQUINA |
| Network | 760 | `NET-404 PAQUETES PERDIDOS` | 3 paquetes · Firewall + goblin + paquete | Minotauro | SIEMPRE ES EL DNS |
| Storage | 1400 | `STO-100 DISCO AL 100%` | fuga + goblin · fuga + orco | 2 mímicos, Hidra RAID | `rm -rf /tmp/*` |
| Virtualización | 2040 | `VIR-007 VMS HUÉRFANAS` | goblin parcheador + 2 VMs · VM + zombi + orco | Gólem | SNAPSHOTS BORRADOS |
| CaaS | 2680 | `K8S-503 CRASHLOOPBACKOFF` | pod + orco | Tótem Deployment | `kubectl delete deploy` |
| Automation | 3520 | `AUT-500 GUARIDA DE AUTOMATION` | — | Dragón Negro | — |

Zonas del decorado por x del mundo: Sistemas 0–639, Network 640–1279, Storage 1280–1919, Virtualización 1920–2559, CaaS 2560–3199 y Guarida desde 3200.

## Etapa 2: Las Cuevas

| Sección | Cámara | Ticket | Oleadas | Extra | Al cerrar |
|---|---|---|---|---|---|
| Bases de datos | 110 | `DB-101 DEADLOCK EN LA MINA` | 2 kobolds · zombi + kobold + N+1 | — | `COMMIT;` |
| Bases de datos | 760 | `DB-500 CONSULTAS N+1` | 3 N+1 · troll + kobold | Troll DBA | `CREATE INDEX` |
| Seguridad | 1400 | `SEC-403 ACCESO DENEGADO` | ransomware + kobold · 2 troyanos + ransomware | 2 cofres phishing | MÍNIMO PRIVILEGIO |
| Seguridad | 2040 | `SEC-666 DÍA CERO` | ransomware + troyano + Firewall | Cancerbero | PARCHE APLICADO |
| Monitorización | 2680 | `MON-200 ALERTAS A LAS 3:00` | 2 falsos positivos + gnomo · gnomo + troll + falso positivo | — | ALERTA SILENCIADA |
| Mainframe | 3520 | `MF-001 TRONO DEL MAINFRAME` | — | Lich COBOL | — |

Zonas por x: Minas de Datos 0–1279, Cripta de Seguridad 1280–2559, Observatorio 2560–3199 y Trono del Mainframe desde 3200 (`ZONE2`).

| Enemigo | Vida | Velocidad | Daño | Puntos | Comportamiento |
|---|---|---|---|---|---|
| Kobold del SELECT * | 40 | 1,05 | 7 | 200 | Básico, algo más duro que el goblin |
| Troll del Legacy | 110 | 0,7 | 12 | 600 | Lento y con maza |
| Consulta N+1 | 12 | 1,5 | 4 | 120 | Ojo volador: vuela en círculo y se lanza en picado. Vienen en grupo |
| Cofre phishing | 44 | 1,0 | 9 | 450 | Dormido con «¡PREMIO!» hasta que te acercas. «¡HAS GANADO UN IPHONE!» |
| Ransomware | 50 | 0,85 | 9 | 450 | Si te golpea con un arma en la mano, la cifra y la pierdes |
| Troyano | 36 | 0,85 | 7 | 350 | Caballo de madera que se vuelve invisible a ratos, como la VM huérfana |
| Falso positivo | 14 | 1,5 | 5 | 150 | Campana de alarma voladora |
| Gnomo del dashboard | 34 | 1,1 | 6 | 220 | Rápido y pequeño |

## Objetos

Salen de barriles y cofres (`CRATES`). Se recogen con A.

| Objeto | Efecto | Puntos |
|---|---|---|
| Poción de café | +15 vida | 200 |
| Pollo asado | +35 vida | 400 |
| Tortilla | +50 vida | 600 |
| Bocata de calamares | +100 vida | 1.000 |
| Báculo de Ping | 12 disparos de 13 de daño | — |
| Martillo de Teclas | +7 de daño y 30 px de alcance durante 10 golpes | — |
| Patito de goma | «DEBUG CON PATITO»: 7 segundos de invulnerabilidad | 500 |
| Pergamino de Stack Overflow | 28 de daño a todos los enemigos de la pantalla | 500 |

## Puntuación

| Acción | Puntos |
|---|---|
| Cada punto de daño | ×10 |
| Eliminar un enemigo | Sus puntos de la tabla |
| Romper una caja | 50 |
| Lanzar a un enemigo | 100 (+200 si muere al caer) |
| Vencer al Dragón Negro | 5.000 |
| Bonus de tiempo | 30.000 − 100 por segundo de etapa |
| Bonus de vida | vida × 50 + vidas × 5.000 |
| Bonus de combo | combo máximo × 100 |

### Combos

Cada golpe que entra suma al combo; se pierde tras 2 segundos sin golpear o al recibir un golpe («COMBO ROTO» a partir de 5).

| Golpes | Rango |
|---|---|
| 5 | NICE! |
| 10 | CLEAN CODE |
| 20 | 10X DEVELOPER |
| 35 | SENIOR |
| 50 | ARQUITECTO |

### Ranking

Top 5 guardado en el navegador. El ranking inicial es LTS 60.000, K8S 45.000, SSH 30.000, DNS 20.000 y GIT 10.000.

## Logros

20 logros en `ACHIEVEMENTS` (`js/ui/achievements.js`), guardados en el navegador. Se ven desde el título (LOGROS) y aparece un aviso al conseguir cada uno.

| Logro | Cómo |
|---|---|
| SIEMPRE ES EL DNS | Cerrar NET-404 |
| PUERTO ABIERTO | Saturar la ACL de un Caballero Firewall (7 bloqueos) |
| SIN PARIDAD | Romper la cabeza de paridad de la Hidra |
| NO TOQUES EL LEGACY | Cerrar VIR-007 sin que el gólem se enfade |
| 10X DEVELOPER · ARQUITECTO | Combo de 20 · de 50 |
| A PRODUCCIÓN | Lanzar 10 enemigos en una partida |
| RUBBER DUCK DEBUGGING · COPIAR Y PEGAR | Coger el patito · el pergamino de Stack Overflow |
| DESPLIEGUE EN VIERNES | Terminar la etapa 1 |
| SIN ROLLBACK | Terminar una etapa sin haber continuado |
| HOTFIX EXPRÉS | Terminar una etapa en menos de 8 minutos |
| PAIR PROGRAMMING | Terminar una etapa en cooperativo |
| APPROVED | Derrotar a El Revisor |
| GUARDIA SUPERADA | Terminar una etapa en GUARDIA 24/7 |
| BATCH NOCTURNO | Terminar la etapa 2 |
| MFA ROTO | Romper la cabeza del MFA del Cancerbero |
| STOP RUN | Derrotar al Lich COBOL |
| UNLOCK TABLES | Liberarse de un LOCK TABLE |
| MODO DIOS | Código Konami |

## Secretos

- **El Revisor**: llega al Dragón Negro sin usar continuaciones.
- **Código Konami** en el título o la selección: arriba, arriba, abajo, abajo, izquierda, derecha, izquierda, derecha, B, A. Empiezas con 9 vidas.
- La marquesina del título da la pista (`^^vv<><>BA`).
