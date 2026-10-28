# Gráficos

El juego no carga ninguna imagen: todos los gráficos se pintan por código al arrancar y se guardan en caché. La resolución interna es **320×200** (como las recreativas de la época) y el canvas se escala con `image-rendering: pixelated` para que los píxeles se vean nítidos.

## Paleta

`C` en `js/core/config.js`. Todos los sprites usan estos tonos u otros cercanos, y un contorno común `OUTLINE` (`#0b0912`).

| Clave | Color | Uso |
|---|---|---|
| `k` | `#0b0912` | Contorno y fondo |
| `d` · `m` · `l` | `#2c2440` · `#4b4470` · `#7a70ad` | Piedra y metal oscuro |
| `w` | `#ece6f6` | Texto y brillos |
| `a` · `ad` | `#f4b860` · `#a8722e` | Oro, antorchas |
| `g` · `gd` | `#6ee7a8` · `#2f7a5a` | Ácido, LED, vida |
| `r` · `rd` | `#ff5d73` · `#8a2c3c` | Peligro, daño |
| `b` · `bd` | `#5ec8f2` · `#2b5f7d` | Runas, red, magia |
| `e` | `#ff8a3d` | Fuego, Firewall |

La interfaz usa además el verde neón `NEON` (`#3ddc84`) de los paneles.

## El motor de píxeles (`js/core/pixel.js`)

### `painter(w, h)`

Crea un búfer de `w×h` píxeles en memoria (`null` es transparente) con estas primitivas:

| Primitiva | Dibuja |
|---|---|
| `px(x, y, color)` | Un píxel |
| `rect(x, y, w, h, color)` | Un rectángulo relleno |
| `disc(cx, cy, r, color)` | Un círculo relleno |
| `ell(cx, cy, rx, ry, color)` | Una elipse rellena |
| `line(x0, y0, x1, y1, grosor, color)` | Una línea con grosor |
| `poly([[x, y], ...], color)` | Un polígono relleno (scanline) |

Las coordenadas se redondean al píxel: no hay antialias, así que todo se ve pixelado aunque se usen ángulos y curvas.

### `toCanvas(S, outline)`

Vuelca el búfer a un canvas. Con `outline = true`:

1. Añade un contorno de 1 píxel (`OUTLINE`) alrededor de todo lo pintado, el sello del estilo 16 bits.
2. Genera una segunda versión toda en blanco (`f`), que se usa para el destello al recibir un golpe.

### `sprite(clave, w, h, fn)`

Es la forma normal de crear gráficos:

```js
function batSprite(f){
  return sprite('bat|' + f, 40, 30, S => {
    S.ell(20, 15, 5, 6, '#3d3358');   // cuerpo
    S.px(18, 13, '#ff5d73');          // ojo
    // ...
  });
}
```

- La primera llamada pinta y guarda el resultado; las siguientes lo devuelven de la caché `SPR`.
- **La clave debe cambiar con cualquier parámetro visual** (fotograma, color, estado). Si dos dibujos distintos comparten clave, el segundo nunca se pintará.
- Lo que devuelva `fn` se guarda en `sprite.meta`. Los personajes devuelven la posición de su cabeza, que usan los retratos.

### Dibujar un sprite: `blit()`

En `js/render/draw.js`, con el resto de primitivas de pantalla (`r()`, `txt()`, `goldText()`, `shadow()`):

```js
blit(spr, sx, sy, face, ox, base, flash, alpha)
```

`(ox, base)` es el punto del sprite que se apoya en el suelo (normalmente el centro de los pies). Con `face = -1` el sprite se voltea en horizontal; todos se pintan mirando a la derecha.

## Personajes articulados

Los humanoides (héroes, goblins, orcos, esqueletos, Firewall, Minotauro) comparten un **esqueleto** dibujado por `paintRig()` en un sprite de 80×84.

### `RIGS`: el aspecto

```js
guerrero: { scale: 1.12, style: 'warrior', weapon: 'sword', cols: { skin, armor, cloth, ... } }
```

- `scale`: tamaño. Las proporciones son chibi: cabeza grande y piernas cortas, como en los juegos de referencia.
- `style`: qué se dibuja encima del esqueleto (casco con cuernos, túnica y sombrero, orejas de goblin, cuernos de toro...). Ver los `if (st === ...)` de `paintRig()`.
- `weapon`: arma por defecto (ver `paintWeapon()`).
- `shield`: escudo redondo (`true`) o muro de ladrillos en llamas (`'wall'`, el Firewall).

`RIGS.clerigo` (Clériga) no es un personaje jugable: es la base de El Revisor (`RIGS.revisor` la copia con otra escala y otros colores).

### `POSES`: el movimiento

Cada pose da ángulos en grados:

| Campo | Significado |
|---|---|
| `lean` | Inclinación del torso (positivo, hacia delante) |
| `hip` | Desplazamiento vertical de la cadera |
| `bl` · `fl` | Pierna de atrás y de delante: `[ángulo del muslo, ángulo relativo de la espinilla]` |
| `ba` · `fa` | Brazo de atrás y de delante: `[ángulo del brazo, ángulo relativo del antebrazo]` |
| `wpn` | Giro extra del arma |
| `down` | Tumbado en el suelo |

Los ángulos se miden desde la vertical hacia abajo (0°) y crecen hacia delante (90°). `D(a)` convierte un ángulo en vector y `add(punto, vector, longitud)` avanza sobre él (`js/core/pixel.js`).

### Poses mezcladas

`getPose('walk0~walk1~0.5')` devuelve una pose interpolada al 50 % entre `walk0` y `walk1`. Se usa para:

- Los fotogramas intermedios del paso (8 fotogramas a partir de 4 poses).
- La respiración en reposo (`breathe()`).
- Las transiciones: al cambiar de pose, `drawActor()` muestra durante 3 fotogramas la mezcla entre la anterior y la nueva.

Las mezclas se cachean en `POSES` y sus sprites en `SPR`, así que el coste solo se paga la primera vez.

### Qué pose toca: `rigPose(a)`

En `js/render/draw.js`, junto a `breathe()` y `drawActor()`. Traduce el estado de un actor (`walk`, `punch`, `jump`, `grab`...) y su tiempo en él (`a.t`) en un nombre de pose. Para añadir una animación nueva: crea la pose en `POSES` y devuélvela desde `rigPose()` para el estado que corresponda.

## Monstruos

`js/sprites/monsters.js` pinta a mano los que no son humanoides: gólem, dragón (180×124, con fotogramas de alas, boca, mordisco, cola, vuelo y mareo), slime, murciélago, fantasma, mímico, pod, tótem, objetos y llamas. El cuerpo y las cabezas de la Hidra RAID (`hydraBodySprite()`, `headSprite()`), que también usan el Cancerbero y el Kraken con otros colores, están junto a su lógica en `js/entities/bosses.js`.

`js/sprites/cloud.js` añade los de la etapa 3: lambda en frío, NAT Gateway (moneda fantasma), la Factura de Fin de Mes (120×120, con tres caras) y las monedas que caen. El elemental YAML usa el sprite del slime con otra paleta (`look:'yaml'`).

`js/sprites/caves.js` añade los de la etapa 2: el ojo de la consulta N+1, la campana del falso positivo, el cofre phishing, el troyano y la copia en cinta (con bobinas que giran). Los humanoides nuevos (kobold, troll, Troll DBA, ransomware, gnomo y Lich COBOL) no tienen dibujo propio: `reRig(base, cambios, colores)` reutiliza el esqueleto y el estilo de otro personaje con otra escala y otra paleta. Para dibujar un monstruo volador o fantasmal con otro aspecto basta con `look` en `FOES` (`'eye'`, `'bell'`, `'horse'`, `'phish'`).

`js/sprites/cloud.js` hace lo mismo con los humanoides de La Nube: sidecar pegajoso, operador de K8s, instancia zombi, el Autoescalador y sus réplicas son esqueletos recoloreados con `reRig()`.

## La mazmorra (`js/world/level.js`)

`buildLevel()` pinta **una sola vez** toda la etapa (unos 3.960×200 píxeles) en el canvas `LEVEL`, con `prng(1993)` para que el resultado sea siempre el mismo:

| Zona | Pared | Suelo | Decorado |
|---|---|---|---|
| Sistemas | Ladrillo cálido | Tablones de madera | Rastrillo, estandartes, hornacinas con calaveras, kanban, «NO DEPLOY VIERNES», puestos con monitores |
| Network | Ladrillo azulado | Losas | Racks rotulados (CORE, DMZ, VLAN 10, PROD, WIFI, VPN) y cables colgando |
| Storage | Ladrillo terroso | Losas | Estanterías con cintas, discos y cajas |
| Virtualización | Piedra lavanda | Losas | Columnas y vidrieras |
| CaaS | Hormigón | Planchas de metal | Contenedores apilados, grúa y bandas de peligro |
| Guarida | Roca | Roca | Tesoro, servidores olvidados, charcos de ácido y el núcleo de Automation |

En cada fotograma, `drawLevel(cx)` recorta los 320 píxeles visibles y añade lo animado: LED de switches y discos, paquetes por la bandeja, pantallas de los monitores y la cola de jobs del núcleo de Automation.

## Las Cuevas (`js/world/caves.js`)

La etapa 2 sigue el mismo esquema: `buildCaves()` pinta una vez el canvas `LEVEL2` con `prng(2027)` y `drawCaves(cx)` añade lo animado. `drawLevel()` delega en ella cuando `stageIdx === 1`.

| Zona | Pared | Suelo | Decorado |
|---|---|---|---|
| Minas de Datos | Roca cálida | Tierra con raíles | Vigas, vagonetas con tablas, cristales de índice que brillan y carteles «SELECT * FROM mina» |
| Cripta de Seguridad | Sillares azulados | Losas oscuras | Bóvedas acorazadas, candados y láseres rojos que se encienden y apagan |
| Observatorio | Roca violeta | Rejilla metálica | Muro de pantallas con gráficas en directo, «99.9% SLA» y balizas de alarma |
| Trono del Mainframe | Roca verdosa | Suelo técnico | Armarios con bobinas de cinta que giran, el trono y el código COBOL en fósforo verde |

## La Nube (`js/world/cloud.js`)

`buildSky()` pinta el canvas `LEVEL3` con `prng(2031)` y `drawSky(cx)` añade lo animado. Es la única etapa a cielo abierto: el fondo es un degradado en bandas con estrellas y nubes, y en vez de muros hay una barandilla.

| Zona | Cielo | Suelo | Decorado |
|---|---|---|---|
| Archipiélago de Clústeres | Azul noche | Pasarela de rejilla | Islas flotantes con contenedores y pods, y timones de Kubernetes que giran |
| Nubes Serverless | Violeta | Plataforma de nubes | Cúmulos, símbolos λ con rayos que iluminan la pantalla y cajas `fn()` que pasan a COLD |
| Torre de Facturación | Atardecer | Mármol dorado | Muro de oro, pilas de monedas, etiquetas de precio y el contador «ESTE MES» que no para de subir |
| Cumbre | Noche dorada | Mármol dorado | El arco de FACTURACIÓN |

## Iluminación (`drawLights`)

Se dibuja después de los actores:

1. Una viñeta oscura precalculada (`VIG`).
2. Con `globalCompositeOperation = 'lighter'` (mezcla aditiva) se suman degradados radiales: antorchas y braseros (con parpadeo), charcos de ácido, rayos de las vidrieras, el aliento del dragón y las partículas con `glow`. En Las Cuevas, `caveLights()` suma los cristales, las pantallas, el brillo verde del Mainframe y el tinte rojo de la cripta; en La Nube, `skyLights()` añade los relámpagos de los símbolos λ y un tinte dorado desde la Torre de Facturación.
3. Encima, las llamas y unas motas de polvo en suspensión.

## Efectos

| Efecto | Dónde |
|---|---|
| Partículas (`burst`), destellos de impacto (`spark`), anillos de los especiales | `js/core/utils.js`, dibujados en `drawScene()` (`js/render/scene.js`) |
| Estela del arma | `slashArc()` (`js/render/draw.js`) |
| Destello blanco del golpe final y cámara lenta | `flashT` y `slowmo` en `drawScene()` (`js/render/scene.js`) |
| Temblor de pantalla | `shake` |
| Textos flotantes (daño, `SIGKILL`...) | `addText()` |
| Aviso de ataque enemigo | Marca roja que parpadea; con AVISOS GRANDES, `windupCue()` dibuja un triángulo amarillo fijo con «!» |

## Interfaz

El HUD y los menús están en `js/render/hud.js`: `drawHUD()` (un panel por jugador, puntos y vidas), `hpBar()` (con AVISOS GRANDES añade el número y rayas por debajo de 30), `bossBar()`, `drawTitle()` y `drawSelect()`. La escena completa de cada estado la compone `drawScene()` en `js/render/scene.js`.

Toda la interfaz usa `panel()` (borde verde neón) y la fuente Press Start 2P a 8 y 16 píxeles (`F8`, `F16`). Los títulos usan `goldText()`, con degradado dorado. Los retratos (`portrait()`) recortan la cabeza del sprite usando el `meta` que devuelve `paintRig()`.
