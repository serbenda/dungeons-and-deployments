# Diseño del juego

Todos los números de esta guía salen del código. Los tiempos están en **actualizaciones** (60 = 1 segundo). Si cambias un valor, actualiza también esta tabla.

## Premisa

Viernes, 17:45. Alguien ha tocado producción a mano. Un equipo de desarrollo baja a las catacumbas del CPD y cierra el ticket de cada departamento hasta llegar a la Guarida de Automation, donde el Dragón Negro se ha adueñado de todos los jobs.

Las bromas giran en torno a la informática: tickets, ClickOps, DNS, RAID, VMs huérfanas, CrashLoopBackOff… Nunca sobre personas.

## Héroes

Datos en `HEROES` (`js/data/game-data.js`) y aspecto en `RIGS` (`js/sprites/characters.js`).

| | Guerrero de Rundeck | Mago Desarrollador |
|---|---|---|
| Velocidad | 1,15 px/actualización | 1,40 px/actualización |
| Daño del combo (golpe 1 · 2 · 3) | 8 · 8 · 17 | 6 · 6 · 12 |
| Patada en el aire | 14 | 12 |
| Especial | `RUN JOB`: salta y golpea el suelo | `GIT PUSH -F`: explosión arcana |
| Radio y daño del especial | 74 px · 24 | 88 px · 18 (además borra los proyectiles enemigos) |
| Extra | — | El tercer golpe lanza un `console.log()` (10 de daño) |

Los dos empiezan con 100 de vida y 2 vidas extra (8 con el código Konami).

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

## La etapa

| Sección | Cámara | Ticket | Oleadas | Extra | Al cerrar |
|---|---|---|---|---|---|
| Sistemas | 110 | `SYS-101 SALA DE GUARDIA` | 2 goblins · zombi + 2 goblins | — | FUNCIONA EN MI MÁQUINA |
| Network | 760 | `NET-404 PAQUETES PERDIDOS` | 3 paquetes · Firewall + goblin + paquete | Minotauro | SIEMPRE ES EL DNS |
| Storage | 1400 | `STO-100 DISCO AL 100%` | fuga + goblin · fuga + orco | 2 mímicos, Hidra RAID | `rm -rf /tmp/*` |
| Virtualización | 2040 | `VIR-007 VMS HUÉRFANAS` | goblin parcheador + 2 VMs · VM + zombi + orco | Gólem | SNAPSHOTS BORRADOS |
| CaaS | 2680 | `K8S-503 CRASHLOOPBACKOFF` | pod + orco | Tótem Deployment | `kubectl delete deploy` |
| Automation | 3520 | `AUT-500 GUARIDA DE AUTOMATION` | — | Dragón Negro | — |

Zonas del decorado por x del mundo: Sistemas 0–639, Network 640–1279, Storage 1280–1919, Virtualización 1920–2559, CaaS 2560–3199 y Guarida desde 3200.

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

## Secretos

- **Código Konami** en el título o la selección: arriba, arriba, abajo, abajo, izquierda, derecha, izquierda, derecha, B, A. Empiezas con 9 vidas.
- La marquesina del título da la pista (`^^vv<><>BA`).
