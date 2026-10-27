# Controles, móvil y PWA

## Teclas lógicas

El juego no trabaja con teclas físicas sino con **teclas lógicas**: `up`, `down`, `left`, `right`, `atk`, `jump`, `special`, `start` y `mute`. Teclado y mandos táctiles las alimentan igual, así que la lógica del juego no distingue de dónde vienen.

| Estructura | Uso |
|---|---|
| `INP[n].held[k]` | `true` mientras el jugador n+1 mantiene la tecla. Para moverse |
| `INP[n].q[k]` | Pulsación pendiente de consumir. Para acciones |
| `held`, `pressedQ` | Atajos de `INP[0].held` e `INP[0].q` (jugador 1) |
| `pressed(k)` | Consume la pulsación: `true` solo una vez. En los menús vale la de cualquier jugador; durante el turno de un jugador (`ctxSlot`), solo la suya |
| `press(k, dev)` / `release(k, dev)` | Lo que llaman teclado, mandos y táctil, con el dispositivo de origen |

Al final de cada `update()` se vacían las pulsaciones (`clearPressed()`), así que una pulsación que no se consuma en esa actualización se pierde. Es el comportamiento de las recreativas.

## Dispositivos y jugadores

Cada dispositivo tiene un nombre: `kb` (teclado), `kb2` (grupo B del teclado), `touch` y `pad0`, `pad1`... (mandos). `DEV_SLOT` dice a qué jugador va cada uno:

1. En el título no hay nadie asignado: todo maneja al jugador 1.
2. Al entrar en la selección, el dispositivo que ha pulsado pasa a ser el del jugador 1 (`owner0`).
3. START en cualquier otro dispositivo es una petición de unirse (`joinReq`): en la selección aparece el cursor 2P; en la partida entra el jugador 2 (`joinPlayer()`).
4. El resto de dispositivos sin asignar siguen manejando al jugador 1. El táctil nunca se une como jugador 2.
5. Al volver al título se olvidan todas las asignaciones (`resetDevices()`).

## Teclado (`js/core/input.js`)

| Tecla física | Tecla lógica |
|---|---|
| Flechas, WASD | `up` `down` `left` `right` |
| Z, J, Espacio | `atk` |
| X, K | `jump` |
| C, L | `special` |
| Enter, Esc | `start` |
| 2 | `start` del jugador 2 (unirse) |
| M | `mute` |

Con un jugador, todas las teclas lo manejan. **Dos jugadores en un teclado**: al pulsar 2, el grupo B (WASD, J, K, L) pasa a ser del jugador 2 y el jugador 1 se queda con flechas, Z, X, C y Enter.

Para cambiar el mapeo, edita `KEYMAP` y `KB_B` (usan `KeyboardEvent.code`, que no depende del idioma del teclado).

## Mandos (Gamepad API)

Cualquier mando con disposición estándar (Xbox, PlayStation, Switch Pro, 8BitDo...) por USB o Bluetooth. `pollPads()` los lee en cada `update()`, porque la Gamepad API no tiene eventos de botones.

| Mando (Xbox · PlayStation) | Tecla lógica |
|---|---|
| Cruceta o stick izquierdo (umbral 0,45) | `up` `down` `left` `right` |
| A · ✕ | `atk` |
| B · ○ | `jump` |
| X · □ e Y · △ | `special` |
| START · OPTIONS | `start` (en otro mando: unirse) |
| SELECT · SHARE | `mute` |

Al conectar uno aparece «MANDO N CONECTADO». El navegador solo lo detecta después de pulsar un botón. Para cambiar el mapeo, edita `PAD_BUTTONS`.

## Móvil y tableta (`js/core/touch.js`)

### Detección

Un pequeño script en el `<head>` de `index.html` añade la clase `is-touch` a `<html>` **antes de pintar** si el puntero principal es grueso (`pointer: coarse`): móviles y tabletas. En un ordenador se puede forzar con `index.html?touch` para probarlo.

Con `is-touch`:

- Se oculta la ficha de la página (cabecera e instrucciones) y el juego ocupa la pantalla.
- Se bloquea el desplazamiento y la selección de texto.
- Aparecen los mandos táctiles.

### Disposición

| Orientación | Disposición |
|---|---|
| Vertical | Consola portátil: pantalla arriba; debajo START, SONIDO y PANTALLA, y cruceta y botones |
| Horizontal | Pantalla completa con los mandos superpuestos y semitransparentes en las esquinas |
| Horizontal panorámica (móviles) | START, SONIDO y PANTALLA pasan a la franja negra lateral para no tapar el marcador |
| Horizontal baja (≤ 430 px) | Mandos algo más pequeños |

Todo respeta las zonas seguras (`env(safe-area-inset-*)`) de los móviles con muesca.

### Cruceta analógica

Es una sola zona circular. La dirección sale del ángulo entre el dedo y el centro, en 8 sectores (umbral `cos 67,5° ≈ 0,38`), con una zona muerta central del 28 %. Así:

- Admite diagonales.
- Se puede **deslizar** el dedo para cambiar de dirección sin levantarlo.
- El botón central sigue al dedo para dar respuesta visual.

Usa *pointer capture*: aunque el dedo se salga del círculo, la cruceta lo sigue hasta que se levanta.

### Botones

A (atacar), B (saltar), SP (especial), START, SONIDO y PANTALLA. Cada botón captura su propio puntero, así que se puede mantener la cruceta y pulsar A y B a la vez.

### Toques en la pantalla

Fuera de la partida, tocar la pantalla hace de botón A: empieza, pasa diálogos, inserta crédito, vuelve del ranking. En la selección, tocar un héroe lo elige y volver a tocarlo lo confirma. Durante la partida no hace nada, para evitar acciones accidentales.

### Extras

| Función | API | Notas |
|---|---|---|
| Pantalla completa | Fullscreen API + `screen.orientation.lock('landscape')` | El botón solo aparece si el navegador lo admite (no en iPhone, donde se usa la PWA instalada) |
| Vibración | `navigator.vibrate` | Al recibir golpes; más larga si derriban. Solo Android. Se desactiva con SONIDO o en Opciones |
| Pantalla encendida | Screen Wake Lock API | Evita que la pantalla se apague mientras se juega |
| Pausa automática | `visibilitychange` | Si la app pasa a segundo plano durante la partida, se pausa |

## PWA: instalar y jugar sin conexión

El juego es una Progressive Web App:

- `manifest.webmanifest` define nombre, iconos, colores, pantalla completa y orientación horizontal. En Android y en Chrome aparece «Instalar»; en iPhone, *Compartir → Añadir a pantalla de inicio*.
- `sw.js` es el service worker. Ver [Despliegue y versiones](despliegue-y-versiones.md#la-caché-de-la-pwa) para su estrategia de caché.

El service worker solo se registra por `http` o `https` (no con `file://`) y no en modo `?debug`, para que las pruebas siempre usen el código recién editado.

## Probar en el móvil durante el desarrollo

1. Arranca un servidor en tu ordenador: `python3 -m http.server 8000`.
2. Desde el móvil, en la misma red, abre `http://IP-DE-TU-ORDENADOR:8000/`.
3. Para depurar: Chrome en Android con `chrome://inspect`, o Safari en iPhone con *Desarrollo* en el Mac.

Sin móvil a mano: las herramientas de desarrollo de Chrome (modo dispositivo, con un modelo de móvil) activan `pointer: coarse` y los eventos táctiles.
