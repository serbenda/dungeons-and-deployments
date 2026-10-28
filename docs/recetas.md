# Recetas

Pasos concretos para los cambios más habituales. En todos los casos, al terminar:

```bash
npm run lint && npm test && npm run test:e2e
```

## Añadir un enemigo humanoide

Ejemplo: un «Troll del Legacy».

1. **Aspecto**, en `RIGS` (`js/sprites/characters.js`):
   ```js
   troll: { scale: 1.3, style: 'orc', weapon: 'axe', cols: { skin: '#6a7a5a', skinS: '#4a5a3a', ... } },
   ```
   Reutiliza un `style` existente o añade el tuyo en `paintRig()`.
2. **Datos**, en `FOES` (`js/data/game-data.js`):
   ```js
   troll: { name: 'TROLL DEL LEGACY', short: 'TROLL', rig: 'troll', hp: 90, spd: .7, dmg: 11, wind: 20, score: 500 },
   ```
3. **Que cuente en las oleadas**: añade `troll: 1` a `GRUNTS` (`js/core/utils.js`).
4. **Mensaje al eliminarlo** (opcional): `troll: ['COBOL COMPILADO']` en `KILL_BY`.
5. **Ponlo en una oleada** de `SECTIONS`: `['troll', 1]`.

La IA genérica de `updateFoe()` ya lo hace acercarse, esperar turno y golpear. Las pruebas unitarias comprueban que el `rig` y el tipo existan.

## Añadir un enemigo no humanoide

1. Pinta su sprite en `js/sprites/monsters.js` con `sprite('clave|' + fotograma, w, h, S => { ... })`.
2. Añade sus datos a `FOES` con alguna marca propia (por ejemplo `bouncy: true`) y su tipo a `GRUNTS`.
3. En `drawActor()` (`js/render/draw.js`), añade un caso antes de los humanoides:
   ```js
   if (a.kind === 'rebote') { shadow(sx, a.y, 18); blit(reboteSprite((t >> 3) % 2), sx, sy, a.face, 16, 30, fl); return; }
   ```
4. Si su comportamiento es distinto, enrútalo al principio de `updateFoe()` (`js/entities/enemies.js`) hacia una función propia, como hace `updateBat()`.
5. Si tiene una medida de colisión distinta, ajústala en `halfW()`.

## Añadir un jefe de sección

Ejemplo real: el Minotauro del Firewall.

1. Datos en `FOES` con `boss: true` y `nograb: true`. Los jefes no se aturden ni se derriban hasta morir.
2. IA en `js/entities/bosses.js` (`updateMinotaur()`) y enrútala en `updateFoe()`.
3. En la sección, `miniboss: 'nombre'`. En `updatePlay()` (`js/game/loop.js`), el bloque `sec.miniboss` lo crea al acabar las oleadas; añade ahí tu caso.
4. Su diálogo en `STORIES` y su barra de vida en `bossBar()`.
5. Una prueba unitaria de su mecánica principal en `tests/game.test.js`.

## Añadir una sección (ticket)

En `SECTIONS`, en orden de `cam`:

```js
{ cam: 3000, mission: 'DB-042 DEADLOCK', close: 'COMMIT; ROLLBACK;', waves: [
  [['goblin', 1], ['orco', -1]],
  [['esqueleto', 0], ['goblin', 1]]
] },
```

- `cam`: x de la cámara donde se bloquea la pantalla.
- `mission`: código y título del ticket (la prueba unitaria exige el formato `ABC-123 TÍTULO`).
- `close`: frase al cerrarlo.
- Lado de aparición: `1` derecha, `-1` izquierda, `0` sale del suelo.
- Extras opcionales: `golem`, `mimics: [[x, y]]`, `totem: [x, y]`, `miniboss`.

Si la sección necesita decorado nuevo, añádelo en `buildLevel()` y, si cambia de zona, en `ZONE`.

## Añadir un objeto

1. Su sprite en `itemSprite()` (`js/sprites/monsters.js`).
2. Si es comida, una entrada en `FOOD`. Si es otra cosa, su efecto en `tryPickup()` (`js/entities/player.js`).
3. Colócalo en `CRATES` y añádelo a la lista de objetos válidos de la prueba «los datos del juego son coherentes».

## Añadir un diálogo

En `STORIES` (`js/ui/story.js`):

```js
db: () => [
  ['narr', 'LA BASE DE DATOS HA ENTRADO EN DEADLOCK.'],
  ['hero', 'Nadie toca esa tabla hasta que yo diga.']
],
```

Y llámalo con `startStory('db', alTerminar)`. Quien habla puede ser `narr`, `hero` o cualquier clave de `SPEAKERS`; para un retrato nuevo, añade su caso en `drawStory()`.

## Añadir un tema musical

1. Una entrada en la tabla `T` de `js/audio/music.js` (formato en [Audio](audio.md#formato-de-un-tema)).
2. Devuélvelo desde `musicFor()` en la situación que toque.

## Añadir un héroe

Ejemplo real: la Pícara del Frontend.

1. **Aspecto** en `RIGS` (`js/sprites/characters.js`). Si su estilo es nuevo (`style:'rogue'`), añade sus colores de piernas y brazos en `legC` y `armC` de `paintRig()`, sus detalles del torso y su cabeza. Si su arma es nueva, añádela en `paintWeapon()`.
2. **Datos** en `HEROES`, su posición en `HERO_ORDER` y su ficha de tres líneas en `HERO_INFO` (`js/data/game-data.js`).
3. **Frases** en `HERO_LINES` (`js/ui/story.js`): `intro`, `mino`, `dragon` y `outro`.
4. **Especial**: el texto en `doSpecial()` y el efecto en el caso `special` de `updatePlayer()` (por ejemplo, `picaraDash()` o `bardDaily()`).
5. Añádelo a `TEAMS` en `tools/smoke-test.js` para que la CI juegue con él. La prueba unitaria «cada héroe tiene esqueleto, frases, descripción...» comprueba que no falte nada.

La selección se adapta sola: muestra los héroes de `HERO_ORDER` en columnas. Con más de cuatro, habrá que estrechar las tarjetas en `drawSelect()`.

## Añadir un logro

1. Una entrada `[clave, NOMBRE, 'Cómo se consigue.']` en `ACHIEVEMENTS` (`js/ui/achievements.js`). La descripción debe caber en la tarjeta (unos 33 caracteres).
2. Llama a `unlock('clave')` donde ocurra: es seguro llamarla muchas veces, solo cuenta la primera.
3. Si depende de la partida entera (como «sin continuar»), guarda el dato en `RUN` (`startGame()`) y comprueba en `stageClear()`.

## Añadir una opción

1. Su valor por defecto en `OPTS_DEFAULT` (`js/ui/options.js`).
2. Una fila en `OPT_ROWS` con `label`, `show()` (lo que se ve a la derecha) y `change(d)` (con `d` = -1 o 1).
3. Úsala donde toque leyendo `OPTS.tuOpcion`. Se guarda sola en `localStorage`.

## Añadir una etapa

Ejemplos reales: Las Cuevas y La Nube.

1. **Datos**: sus secciones y cajas (`SECTIONS_4`, `CRATES_4`) y una entrada en `STAGES` con `name`, `sub` (el cartel), `boss` y `story` (`js/data/game-data.js`).
2. **Decorado**: un archivo en `js/world/` con su función de zonas, su `build` (un canvas prerenderizado con `prng`), su `draw(cx)` animado y sus luces. En `drawLevel()`, `drawLights()` y `ZONE` (`js/world/level.js`), añade el caso de la nueva `stageIdx`.
3. **Enemigos y jefes**: como en las recetas anteriores. El jefe final se crea en `updatePlay()` según `STAGES[stageIdx].boss`, y al morir llama a `startStory(..., stageClear)`.
4. **Música**: un tema por zona en `T` (`js/audio/music.js`); `musicFor()` usa el nombre de la zona.
5. **Historia**: la viñeta de entrada en `STORIES` y una frase por héroe en `HERO_LINES`.
6. **Pruebas**: `tests/etapa2.test.js` comprueba la coherencia de todas las etapas (y en `tools/smoke-test.js` sube el número de la última etapa); el bot de `tools/smoke-test.js` juega todas seguidas.

## Añadir un archivo de código

1. Créalo en la carpeta que le corresponda de `js/` con `'use strict'` y una línea de resumen.
2. Añade su `<script>` en `index.html` en el punto correcto del orden.
3. Añádelo a `ASSETS` en `sw.js`.

`npm run lint` falla si te olvidas de alguno de los dos.
