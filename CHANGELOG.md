# Changelog

Los cambios visibles de cada versión. El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto usa [versionado semántico](https://semver.org/lang/es/).

## [0.2.0] - Sin publicar

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
