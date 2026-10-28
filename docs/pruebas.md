# Pruebas

Hay tres niveles de comprobación. Todos se ejecutan en la CI en cada push a `main` y `development` y en cada Pull Request.

| Comando | Qué comprueba | Tiempo | Necesita |
|---|---|---|---|
| `npm run lint` | Estructura del proyecto y ESLint | Segundos | `npm install` |
| `npm test` | Lógica del juego (50 pruebas unitarias) | ~12 s | Solo Node |
| `npm run test:e2e` | El juego completo en un navegador real | 1-2 min | Chromium de Playwright (o Firefox y WebKit) |

Preparación (una vez):

```bash
npm install
npx playwright install chromium          # y, si quieres probarlos, firefox webkit
```

## Lint

`npm run lint` ejecuta dos comprobaciones:

**`lint:project`** (`tools/lint.js`), específica de este proyecto:

- Sintaxis de todos los scripts (`node --check`).
- `index.html` carga cada archivo de `js/` exactamente una vez, y `js/main.js` el último.
- `sw.js` precarga exactamente los scripts de `index.html`.
- Existen todos los archivos que citan `index.html`, `sw.js` y el manifest.

**`lint:js`**: ESLint (versión 10, en formato *flat config*) con las reglas recomendadas (`eslint.config.js`). Como los scripts comparten ámbito global, `no-undef` está desactivada (el orden de carga ya lo vigila `lint:project`) y `no-unused-vars` solo revisa variables locales.

## Pruebas unitarias

`tests/harness.js` carga el juego entero **sin navegador**, en un contexto aislado de Node (`vm`), con lo mínimo simulado: un canvas falso, `localStorage` en memoria y eventos vacíos. Los scripts se cargan en el orden de `index.html` y comparten ámbito, igual que en la página.

```js
const { loadGame } = require('./harness');
const game = loadGame();                    // un juego nuevo y aislado
game.ev("startGame('mago')");               // ejecuta código dentro del juego
game.ev('P.hp');                            // y lee su estado (los objetos vuelven como copia JSON)
game.step(60);                              // avanza un segundo
game.press('atk');                          // simula una pulsación
```

Cada `loadGame()` crea un juego independiente con su propio `Math`, así que la semilla de una prueba no afecta a las demás.

| Archivo | Pruebas | Tema |
|---|---|---|
| `tests/game.test.js` | 10 | Base del juego: carga, datos, poses, combos, etapa 1, ranking, semilla y música |
| `tests/coop-and-extras.test.js` | 15 | Cooperativo, mandos, dificultad, opciones, logros, héroes y El Revisor |
| `tests/etapa2.test.js` | 10 | Etapas y Las Cuevas |
| `tests/etapa3.test.js` | 6 | La Nube |
| `tests/guardar.test.js` | 4 | Partida guardada |
| `tests/modo-jefes.test.js` | 5 | Modo jefes y teclas reasignables |

`tests/game.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Carga | Todos los scripts cargan en orden y existen las funciones principales |
| Datos coherentes | Cada enemigo de las oleadas existe, cada `rig` existe, los tickets tienen formato, las cajas sueltan objetos válidos |
| Poses mezcladas | La interpolación de poses es correcta y se cachea |
| Combos | Cada golpe suma, a los 5 aparece NICE! y recibir un golpe lo rompe |
| Firewall | Bloquea de frente y cae por la espalda |
| Hidra RAID | Los discos se reconstruyen con la paridad viva y no sin ella |
| Ranking | Las iniciales se guardan ordenadas en `localStorage`; una puntuación baja no pide iniciales |
| Semilla | La misma semilla da la misma partida |
| Música | Cada zona tiene su tema |

`tests/coop-and-extras.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Cooperativo | Dos jugadores con su `slot` y +50 % de vida en los enemigos |
| Teclas por jugador | Cada jugador se mueve solo con las suyas |
| Unirse | START en un mando nuevo añade al jugador 2 sin pausar, con otro héroe |
| Gamepad API | Un mando simulado (`navigator.getGamepads`) maneja los menús y pasa a ser el del jugador 1 |
| Jugador fuera | Sin vidas en cooperativo queda fuera, el otro sigue y START lo devuelve |
| Dificultad | Cambia la vida de los enemigos y el daño recibido |
| Opciones | Se guardan en `localStorage` |
| Logros | Se desbloquean una vez, se guardan, y el combo de 20 da 10X DEVELOPER |
| Bardo y pícara | La daily cura a todo el equipo; la carga cruza y golpea a todos |
| El Revisor | Protegido mientras quedan tareas pendientes; solo aparece sin continuar |
| Héroes completos | Cada héroe tiene esqueleto, frases de todas las etapas, ficha que cabe en la tarjeta y está en la selección |
| AVISOS GRANDES | Se activa en Opciones y se guarda |

`tests/etapa2.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Datos de las etapas | Secciones en orden, tickets bien formados, enemigos, mímicos, jefes, cajas y viñetas existentes en todas las etapas |
| `loadStage` | Cambia secciones, cajas y cámara y conserva la vida y las vidas |
| Paso de etapa | Al terminar la etapa 1, START lleva a Las Cuevas; al terminar la 2, a La Nube; y tras la 3 llegan los créditos |
| Zonas y música | Las zonas de la etapa 2 tienen su tema y la etapa 1 conserva las suyas |
| LOCK TABLE | Atrapa al jugador y cinco pulsaciones de A lo liberan |
| Lich COBOL | No recibe daño mientras existe su copia en cinta |
| Cancerbero | Es una Hidra con MFA en vez de paridad y da su propio logro |
| Ransomware | Cifra el arma del jugador |
| Copia en cinta | El HOTFIX no la tumba (tumbada sería invulnerable y el Lich no se podría vencer) |

`tests/etapa3.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Zonas y música | La Nube tiene sus tres temas |
| Kraken | El CONTROL PLANE no recibe daño (ni con especiales) hasta que caen los dos nodos a la vez; al caer da su logro |
| Autoescalador | Saca dos réplicas cada 25 % y, con ellas vivas, reparte la carga |
| Monedas | Solo dañan a quien está debajo al caer |
| La Factura | Hace llover monedas y, al pagarla, llega el epílogo |
| YAML | Se divide en dos tabuladores |

`tests/guardar.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Guardar | Al empezar la etapa 2 se guarda la partida y el título ofrece CONTINUAR |
| Continuar | Sigue en la etapa guardada, con el héroe, la vida y la puntuación de entonces |
| Tras GAME OVER | Seguir cuenta como continuación (y cierra el paso a El Revisor) |
| Borrar | El modo jefes no guarda y terminar el juego borra la partida |

`tests/modo-jefes.test.js`:

| Prueba | Qué garantiza |
|---|---|
| Orden de los jefes | Los nueve, en su etapa, con +30 de vida entre combates y el final con su logro |
| Sin oleadas | Cada combate saca a su jefe directamente y sin viñetas |
| Ranking propio | El del modo jefes se guarda aparte y se carga al elegirlo |
| Reasignar teclas | Cambia `KEYMAP`, intercambia si la tecla estaba ocupada, se guarda y RESTABLECER deshace |
| Capturar tecla | La pantalla espera una tecla física y la asigna |

Para añadir una prueba, crea un `test(...)` en uno de esos archivos o en uno nuevo `tests/*.test.js`.

## Prueba de humo (end-to-end)

`tools/smoke-test.js` abre el juego en un navegador sin ventana (Chromium por defecto) y deja que un **bot** juegue partidas enteras:

- Las **tres etapas** seguidas: al terminar cada una pulsa START y sigue.
- Antes de cada partida borra la partida guardada, para que el título no ofrezca CONTINUAR, y reinicia `Math.random` con la semilla: la pantalla de título gasta un número variable de números aleatorios antes de que llegue el bot, y así cada partida se juega siempre igual.
- Además, por cada semilla, dos partidas del **modo jefes** (un jugador invulnerable y dos jugadores en normal).
- Con cada uno de los cuatro héroes y en cooperativo (guerrero + bardo, el bot maneja a los dos), en modo invulnerable y en modo normal.
- Si queda atrapado en un LOCK TABLE, pulsa A hasta liberarse.
- En modo invulnerable nunca se continúa, así que el bot también tiene que vencer a El Revisor (la salida lo indica con `revisor=OK`).
- Con varias semillas (`SEEDS`, por defecto `1,2`; en la CI `1,2,3`).
- En total, 12 partidas por semilla (36 en la CI de Chromium). Con `QUICK=1`, 3 por semilla: el guerrero y la pareja pícara + bardo en invulnerable, y el modo jefes.
- Falla si alguna partida no termina la etapa 3 (o el modo jefes) en una hora de juego simulado (`MAX_FRAMES`) o si hay errores en la consola. En la CI, cada fallo sale además como anotación `::error` en el resumen de la ejecución.

```bash
npm run test:e2e
SEEDS=1,2,3,4,5 npm run test:e2e              # más partidas
CONCURRENCY=2 npm run test:e2e                # menos partidas a la vez (por defecto 4)
BASE_URL=http://localhost:8000/ npm run test:e2e   # contra un servidor, como GitHub Pages
BROWSER=firefox npm run test:e2e              # o webkit (el motor de Safari); necesita npx playwright install firefox webkit
QUICK=1 npm run test:e2e                      # selección corta: un héroe, cooperativo y modo jefes
```

El bot no simula teclas del sistema operativo: escribe directamente en `held` y `pressedQ` a través de `window.dnd` y llama a `update()` en bucle, así que una partida de varios minutos se juega en segundos.

Si una partida falla, la salida incluye la URL para reproducirla y el estado del jugador y de los enemigos:

```
ERR semilla=2 mago                   normal       estado=play etapa=1 sección=1 fotogramas=... oro=... continues=0
    Reproducir: file:///.../index.html?debug&seed=2
    Jugador: [{"x":1068,"y":131,"state":"walk","hp":34,"out":false}] camX=760
    Enemigos: [{"kind":"firewall","state":"walk","x":1128,...}]
```

Así se encontró, por ejemplo, el fallo de los enemigos que se quedaban esperando fuera de la pantalla.

## Semillas y modo depuración

| URL | Efecto |
|---|---|
| `index.html?debug` | Expone `window.dnd` y no registra el service worker |
| `index.html?debug&seed=42` | Además, `Math.random` pasa a ser determinista: la partida es reproducible |
| `index.html?touch` | Fuerza el modo táctil en un ordenador |

`window.dnd` da acceso al estado de la partida desde la consola:

```js
dnd.state            // estado actual de la máquina de estados
dnd.P                // el jugador: dnd.P.hp = 100, dnd.P.lives = 9...
dnd.foes             // enemigos en pantalla
dnd.camX, dnd.secIdx // cámara y sección
dnd.update()         // avanza una actualización a mano
```

Como los scripts son clásicos, desde la consola también se puede usar directamente cualquier función o variable global: `startGame('mago')`, `spawnHydra(camX + 262)`, `camX = 2600`...
