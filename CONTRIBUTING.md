# Cómo contribuir

## Derechos

Dungeons & Deployments es © 2026 serbenda, con todos los derechos reservados (ver [LICENSE](LICENSE)). Al enviar una Pull Request:

- Confirmas que la contribución es tuya y que puedes cederla.
- Cedes a serbenda, de forma gratuita y sin límite de tiempo, los derechos sobre esa contribución, para que pueda usarla, modificarla y distribuirla como parte del juego.

Si no estás de acuerdo, no envíes la Pull Request: abre un issue con la idea.

## Ramas

- `main` es lo que está publicado en GitHub Pages. No se trabaja directamente sobre ella.
- `development` es la rama de integración.
- Para cada cambio, crea una rama desde `development` con un prefijo: `feature/`, `fix/`, `mejora/` o `docs/`. Por ejemplo, `feature/jefe-virtualizacion`.
- Abre la Pull Request contra `development`. De `development` a `main` se pasa con otra PR cuando hay una versión lista.
- Las dos ramas están protegidas: solo aceptan cambios por PR y con los cinco checks de la CI en verde (Lint, Unit tests y la prueba de humo en Chromium, Firefox y WebKit). No admiten push forzado. Los detalles están en [Despliegue y versiones](docs/despliegue-y-versiones.md#protección-de-ramas).

## Antes de abrir la PR

```bash
npm install
npx playwright install chromium
npm run lint        # estructura del proyecto y ESLint
npm test            # pruebas unitarias
npm run test:e2e    # el bot juega las tres etapas y el modo jefes
```

Si tu cambio puede afectar a un navegador concreto, prueba también `BROWSER=firefox` o `BROWSER=webkit` (ver [Pruebas](docs/pruebas.md#prueba-de-humo-end-to-end)).

Si el cambio añade lógica nueva, añade también su prueba en `tests/`. Las [recetas](docs/recetas.md) explican paso a paso los cambios más habituales.

Prueba también el cambio a mano en el navegador, con teclado y en modo táctil (`index.html?touch` o las herramientas de dispositivo móvil del navegador). Con `index.html?debug&seed=N` tienes `window.dnd` en la consola y una partida reproducible.

## Estilo de código

- JavaScript sin dependencias ni compilación. Cada archivo empieza con `'use strict'` y un comentario de una línea que explica qué contiene.
- Los scripts comparten ámbito global y se cargan en el orden de `index.html` (ver [Arquitectura](docs/arquitectura.md)). Si un archivo nuevo necesita algo **al cargarse**, colócalo después del archivo que lo declara. Si añades un archivo, añade su `<script>` en `index.html` y su ruta en `ASSETS` de `sw.js` (`npm run lint` lo comprueba).
- Documenta cada función nueva con un comentario JSDoc: qué hace, sus parámetros y lo que devuelve.
- Si cambias un número de equilibrio (vida, daño, tiempos), actualiza el [documento de diseño](docs/diseno-del-juego.md).
- Sangría de 2 espacios, comillas simples y punto y coma (ver `.editorconfig`).
- Nombres de funciones y variables en inglés. Textos del juego, comentarios y documentación en castellano.
- Los gráficos se pintan por código: usa `sprite()` con una clave única para que se cacheen.

## Mensajes de commit

En castellano, en imperativo y con una primera línea corta: «Añade el jefe de Virtualización», «Corrige el bloqueo del Firewall». Si hace falta, añade detalle en el cuerpo.

## Versiones

Anota los cambios visibles en `CHANGELOG.md`, en la sección «Sin publicar». Al publicar en `main` se sube la versión de `package.json` y `CACHE_VERSION` en `sw.js`, y se crea la release. El paso a paso está en [Despliegue y versiones](docs/despliegue-y-versiones.md#publicar-una-versión).
