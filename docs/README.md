# Documentación

Guías para entender, modificar y publicar Dungeons & Deployments. Si es tu primera vez en el código, léelas en este orden.

| Guía | Qué explica |
|---|---|
| [Arquitectura](arquitectura.md) | Cómo se cargan los scripts, el mapa de archivos, el bucle, la máquina de estados, las coordenadas, los dos jugadores, las etapas, el modo jefes y lo que se guarda |
| [Diseño del juego](diseno-del-juego.md) | Héroes, cooperativo, partida guardada, modo jefes, dificultad, enemigos y jefes de las tres etapas, objetos, puntuación, logros y secretos, con todos los números |
| [Gráficos](graficos.md) | El motor de pixel art, los esqueletos y las poses, los decorados de las tres etapas, la iluminación y la interfaz |
| [Audio](audio.md) | Efectos de sonido y el secuenciador de música chiptune |
| [Controles, móvil y PWA](controles-y-movil.md) | Teclas lógicas, dos jugadores, teclado y teclas reasignables, mandos, controles táctiles, accesibilidad e instalación sin conexión |
| [Recetas](recetas.md) | Paso a paso para añadir enemigos, jefes, secciones, objetos, diálogos, temas, héroes, logros, opciones, etapas y archivos |
| [Pruebas](pruebas.md) | Lint, las 50 pruebas unitarias, la prueba de humo en tres navegadores, semillas y modo depuración |
| [Despliegue y versiones](despliegue-y-versiones.md) | Ramas y su protección, CI, GitHub Pages, caché de la PWA, cómo publicar una versión y las releases publicadas |

La referencia de cada función está en el propio código: todas las funciones y tablas de datos tienen su comentario JSDoc, que los editores (VS Code y otros) muestran al pasar el ratón.

Las capturas y el GIF del README están en [`img/`](img/). Para rehacer una captura, abre el juego con `?debug&seed=N`, colócate con `window.dnd` y guarda el canvas a 640×400; el GIF se genera a 320×200, la resolución del juego, para que pese poco.

Las reglas para colaborar (ramas, estilo, commits y derechos) están en [CONTRIBUTING](../CONTRIBUTING.md), y los cambios de cada versión, en el [CHANGELOG](../CHANGELOG.md).
