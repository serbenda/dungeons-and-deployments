# Changelog

Los cambios visibles de cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [0.8.0] - 2026-10-28

### Añadido
- Opción **AVISOS GRANDES** (accesibilidad): los ataques enemigos se avisan con un triángulo «!» fijo en vez de una marca roja que parpadea, la vida se ve en número y con rayas cuando es baja, y las monedas que caen marcan su zona.
- La CI prueba también **Firefox** y **WebKit** (el motor de Safari), con una selección corta de partidas.

### Cambiado
- La pantalla de título dice «EDICIÓN RECREATIVA», sin «V2», y la vista previa al compartir el enlace se ha rehecho con el título actual.
- La página está mejor maquetada: cabecera centrada sobre la pantalla, leyenda centrada bajo ella, y controles y consejos en dos paneles con las teclas dibujadas como botones de recreativa.
- Los textos de la página (cabecera, descripción al compartir, controles y consejos) ya hablan de las tres etapas, los cuatro héroes y el cooperativo; antes decían «Versión 2 · Etapa 1».
- El Kraken del Clúster tiene mecánica propia: su CONTROL PLANE tiene un *taint* y solo recibe daño con los dos nodos caídos a la vez.

## [0.7.0] - 2026-10-28

### Añadido
- Partida guardada: al empezar las etapas 2 y 3 se guarda un punto de control y el título ofrece **CONTINUAR**. Tras un GAME OVER también se puede seguir desde ahí, contando como continuación.

### Cambiado
- GIF del README nuevo: cooperativo y las tres etapas.

## [0.6.0] - 2026-10-28

### Añadido
- Aviso de derechos: © 2026 serbenda, todos los derechos reservados (`LICENSE`).
- Etapa 3, **La Nube**, tras Las Cuevas: Archipiélago de Clústeres, Nubes Serverless, Torre de Facturación y la Cumbre, a cielo abierto, con tres temas nuevos.
- Seis enemigos nuevos: sidecar pegajoso, operador de K8s, indentación rota (YAML, se divide), lambda en frío, NAT Gateway e instancia zombi.
- Tres jefes nuevos: el Kraken del Clúster (control plane), el Autoescalador (`SCALE OUT` con réplicas) y la Factura de Fin de Mes (lluvia de cargos, pico de uso y renovación automática).
- Tres logros nuevos: EN LA NUBE, CONTROL PLANE CAÍDO y FINOPS (24 en total).

### Cambiado
- El modo jefes pasa a nueve jefes.
- Los créditos llegan al final de la etapa 3.
- La prueba de humo juega las tres etapas seguidas.

## [0.5.0] - 2026-10-28

### Añadido
- **Modo jefes**: los seis jefes de las dos etapas seguidos, con +30 de vida entre combate y combate, bonus por tiempo y un ranking propio.
- **Teclas reasignables** en Opciones › TECLAS: cada acción del jugador 1 a la tecla que quieras; si ya estaba ocupada, se intercambian. Se guardan en el navegador.
- Logro SIN DESCANSO por superar el modo jefes (21 en total).

### Cambiado
- El menú del título tiene cuatro opciones: JUGAR, MODO JEFES, OPCIONES y LOGROS.
- La prueba de humo también juega el modo jefes.

## [0.4.0] - 2026-10-27

### Añadido
- Etapa 2, **Las Cuevas**, a continuación de la primera: Minas de Datos, Cripta de Seguridad, Observatorio y Trono del Mainframe, con su decorado, sus luces y tres temas nuevos.
- Ocho enemigos nuevos: kobold del SELECT *, troll del legacy, consulta N+1, cofre phishing, ransomware (cifra tu arma), troyano, falso positivo y gnomo del dashboard.
- Tres jefes nuevos: Troll DBA (`LOCK TABLE` atrapa a quien la pisa), Cancerbero de las 3 AAA (se regenera mientras viva el MFA) y el Lich COBOL (se protege con copias en cinta).
- Cuatro logros nuevos: BATCH NOCTURNO, MFA ROTO, STOP RUN y UNLOCK TABLES.

### Cambiado
- Al terminar la etapa 1, START lleva a la etapa 2 conservando vida, vidas y puntuación. Los créditos llegan al final de la etapa 2.
- La vida del Dragón Negro también depende de la dificultad y del número de jugadores.
- La prueba de humo juega las dos etapas seguidas.

## [0.3.0] - 2026-10-27

### Añadido
- Cooperativo para dos jugadores: teclado compartido (tecla 2), mandos o teclado y mando. El jugador 2 puede unirse en plena partida con START.
- Soporte de mandos con la Gamepad API (Xbox, PlayStation y mandos estándar).
- Dos héroes nuevos: la Pícara del Frontend (`!IMPORTANT`, carga en línea recta) y el Bardo Scrum Master (`DAILY`, cura a todo el equipo).
- El Revisor, jefe secreto tras el Dragón Negro si se llega sin continuar: se protege con las tareas pendientes de la Definition of Done.
- Menú de opciones: volumen de música y efectos, dificultad (BECARIO, SENIOR, GUARDIA 24/7), destellos y vibración.
- 16 logros con su pantalla y avisos.
- Créditos finales con las estadísticas de la partida y el elenco.
- Menú en la pantalla de título: JUGAR, OPCIONES y LOGROS.

### Cambiado
- La selección muestra los cuatro héroes y una ficha por jugador.
- En cooperativo los enemigos tienen un 50 % más de vida y pueden atacar tres a la vez.
- La prueba de humo juega con los cuatro héroes y en cooperativo.

## [0.2.0] - 2026-10-27

### Añadido
- Minotauro del Firewall, jefe de Network: hachazos, embestidas, tormenta de broadcast y `ACL: DENY ALL` (solo vulnerable por la espalda).
- Hidra RAID, jefe de Storage: tres cabezas que se reconstruyen mientras viva la de paridad.
- Viñetas de historia al empezar, antes de cada jefe y al terminar.
- Ranking de los 5 mejores con iniciales y modo demo en la pantalla de título.
- Modo táctil para móvil y tableta: cruceta analógica de 8 direcciones, botones grandes, disposición vertical y horizontal, pantalla completa, vibración y pantalla siempre encendida.
- PWA instalable que funciona sin conexión, favicon y vista previa al compartir el enlace.
- Modo depuración con `?debug` y partidas reproducibles con `?seed=N`.
- Pruebas unitarias (`node:test`), ESLint y prueba de humo con un bot que juega la etapa.
- CI en GitHub Actions (Lint, Unit tests y Smoke test) y despliegue automático en GitHub Pages.
- Documentación técnica en `docs/` y JSDoc en todas las funciones.
- Dependabot, plantillas de issues y PR, código de conducta y política de seguridad.

### Cambiado
- La guarida final pasa a ser la Guarida de Automation, con su núcleo de jobs en vez del monolito AS/400.
- El código se divide en archivos por responsabilidad (`css/` y `js/`) en lugar de un único HTML.
- La versión clásica de vista cenital sale de este repositorio.

### Corregido
- Los enemigos ya no se quedan fuera de la pantalla, donde no se les podía alcanzar.
- Los jefes ya no se quedan tumbados para siempre tras el «hotfix» al perder una vida.
- Los enemigos ya no buscan posiciones fuera de la pantalla cuando el jugador está en el borde.

## [0.1.0] - 2026-10-27

### Añadido
- Edición recreativa con el Guerrero de Rundeck y el Mago Desarrollador.
- Cinco departamentos: Sistemas, Network, Storage, Virtualización y CaaS, y el Dragón Negro.
- Música chiptune por zona, animaciones interpoladas, contador de combo y cámara lenta final.

[0.6.0]: https://github.com/serbenda/dungeons-and-deployments/compare/v0.4.0...v0.6.0
[0.5.0]: https://github.com/serbenda/dungeons-and-deployments/compare/v0.4.0...v0.6.0
[0.4.0]: https://github.com/serbenda/dungeons-and-deployments/releases/tag/v0.4.0
[0.3.0]: https://github.com/serbenda/dungeons-and-deployments/releases/tag/v0.4.0
[0.2.0]: https://github.com/serbenda/dungeons-and-deployments/releases/tag/v0.4.0
[0.1.0]: https://github.com/serbenda/dungeons-and-deployments/releases/tag/v0.4.0
