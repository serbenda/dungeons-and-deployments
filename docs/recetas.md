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

1. Su aspecto en `RIGS` y sus datos en `HEROES` (incluidas sus frases en `HERO_LINES`).
2. En la selección (`drawSelect()` y el caso `select` de `update()`), cambia la lista `['guerrero', 'mago']` y el `sel = 1 - sel` por un índice que recorra todos.
3. Su especial en `doSpecial()` y `specialBlast()`.
4. Añádelo a `HEROES` del bot en `tools/smoke-test.js` para que la CI lo pruebe.

## Añadir un archivo de código

1. Créalo en la carpeta que le corresponda de `js/` con `'use strict'` y una línea de resumen.
2. Añade su `<script>` en `index.html` en el punto correcto del orden.
3. Añádelo a `ASSETS` en `sw.js`.

`npm run lint` falla si te olvidas de alguno de los dos.
