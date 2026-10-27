<div align="center">

# 🐉 Dungeons & Deployments

**Un beat 'em up de fantasía en pixel art en el que un equipo de desarrollo<br>se abre camino por las catacumbas del CPD hasta la Guarida de Automation.**

[![CI](https://github.com/serbenda/dungeons-and-deployments/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/serbenda/dungeons-and-deployments/actions/workflows/ci.yml)
[![Deploy](https://github.com/serbenda/dungeons-and-deployments/actions/workflows/pages.yml/badge.svg)](https://github.com/serbenda/dungeons-and-deployments/actions/workflows/pages.yml)
![Versión](https://img.shields.io/github/package-json/v/serbenda/dungeons-and-deployments?label=versi%C3%B3n&color=f4b860)
![Sin dependencias](https://img.shields.io/badge/dependencias-0-3ddc84)
![PWA](https://img.shields.io/badge/PWA-sin%20conexi%C3%B3n-5ec8f2)
![Móvil](https://img.shields.io/badge/m%C3%B3vil%20y%20tableta-t%C3%A1ctil-ff8a3d)

### [▶ Jugar ahora](https://serbenda.github.io/dungeons-and-deployments/)

<img src="docs/img/gameplay.gif" alt="Partida: combate en la sala de guardia, el Minotauro del Firewall, la Hidra RAID y el Dragón Negro" width="640">

</div>

---

> Viernes, 17:45. Alguien ha tocado producción a mano y las alertas no paran.<br>
> Elige al **Guerrero de Rundeck** o al **Mago Desarrollador**, cierra el ticket de cada departamento y derrota al **Dragón Negro** antes del fin de semana.

## Índice

- [Características](#características)
- [Cómo se juega](#cómo-se-juega)
- [Capturas](#capturas)
- [Inicio rápido para desarrolladores](#inicio-rápido-para-desarrolladores)
- [Tecnología](#tecnología)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Documentación](#documentación)
- [Calidad y CI](#calidad-y-ci)
- [Hoja de ruta](#hoja-de-ruta)
- [Contribuir](#contribuir)

## Características

| | |
|---|---|
| 🎮 **Recreativa de verdad** | Combos de 3 golpes, saltos y patadas, agarres y lanzamientos, especiales que cuestan vida, armas con usos limitados y comida escondida en barriles |
| 🏢 **Cinco departamentos** | Sistemas, Network, Storage, Virtualización y CaaS, cada uno con su decorado, sus enemigos y su ticket (`NET-404`, `K8S-503`...) |
| 👹 **Jefes con mecánicas** | Minotauro del Firewall (`ACL: DENY ALL`), Hidra RAID (se reconstruye mientras viva la paridad) y el Dragón Negro |
| 🤓 **Humor geek** | Goblins del ClickOps, VMs huérfanas, pods en CrashLoopBackOff, «SIEMPRE ES EL DNS», el patito de goma y el pergamino de Stack Overflow |
| 🎨 **Pixel art generado por código** | Personajes articulados con animación interpolada, mazmorra con iluminación dinámica. Ni una sola imagen |
| 🎵 **Banda sonora chiptune** | Un tema original por departamento, sintetizado en directo con Web Audio |
| 📱 **Móvil y tableta** | Cruceta analógica, botones grandes, pantalla completa, vibración y diseño vertical u horizontal |
| 📶 **Sin conexión** | PWA instalable: se añade a la pantalla de inicio y funciona sin internet |
| 🏆 **Ranking** | Top 5 con iniciales, como en los salones recreativos |

## Cómo se juega

| Teclado | Móvil | Acción |
|---|---|---|
| ←↑→↓ / WASD | Cruceta | Moverse (arriba y abajo cambian de carril) |
| Z · J · Espacio | **A** | Atacar (combo de 3), coger objetos |
| X · K | **B** | Saltar (A en el aire: patada) |
| C · L | **SP** | Especial: cuesta 10 de vida |
| Enter | START | Empezar, pausa, insertar crédito |
| M | SONIDO | Silenciar |

**Trucos:** camina contra un enemigo para agarrarlo y lánzalo contra los demás. Al Firewall, por la espalda. A la Hidra, primero la paridad. Y hay un código secreto en la pantalla de título.

Todos los números del juego (vida, daño, puntos) están en el [documento de diseño](docs/diseno-del-juego.md).

## Capturas

| | |
|---|---|
| ![Pantalla de título](docs/img/titulo.png) | ![Selección de personaje](docs/img/seleccion.png) |
| ![Viñeta de historia](docs/img/historia.png) | ![Sala de guardia con combo](docs/img/sistemas.png) |
| ![Minotauro del Firewall](docs/img/minotauro.png) | ![Hidra RAID](docs/img/hidra.png) |
| ![Forja de contenedores](docs/img/caas.png) | ![Guarida de Automation](docs/img/automation.png) |

<div align="center">

![En móvil y tableta](docs/img/movil.png)

</div>

## Inicio rápido para desarrolladores

**Jugar en local** no necesita instalar nada:

```bash
git clone https://github.com/serbenda/dungeons-and-deployments.git
cd dungeons-and-deployments
python3 -m http.server 8000        # o abre index.html directamente
```

Y abre http://localhost:8000/. Para probar el modo táctil en el ordenador: http://localhost:8000/?touch.

**Desarrollar con pruebas** (Node.js 20 o superior):

```bash
npm install
npx playwright install chromium

npm run lint        # estructura del proyecto + ESLint
npm test            # pruebas unitarias (sin navegador, ~3 s)
npm run test:e2e    # un bot juega la etapa completa en Chromium
```

**Depurar:** abre `index.html?debug&seed=42` y tendrás `window.dnd` en la consola, con una partida reproducible.

```js
dnd.P.hp = 100;        // vida al máximo
camX = 2600;           // saltar a la Forja de contenedores
spawnHydra(camX + 262) // invocar a la Hidra RAID
```

## Tecnología

- **HTML5 Canvas 2D** a 320×200, escalado sin suavizado.
- **JavaScript puro** (ES2022) en scripts clásicos: sin dependencias, sin empaquetador, sin compilación.
- **Motor de pixel art propio**: pintor por píxeles, contorno automático, caché de sprites y esqueletos con poses interpoladas.
- **Web Audio API**: efectos sintetizados y secuenciador chiptune.
- **PWA**: manifest y service worker (primero la red, caché sin conexión).
- **Pointer Events, Fullscreen, Vibration y Screen Wake Lock** para móvil.
- **Node.js** solo para desarrollo: `node:test`, ESLint 9 y Playwright.
- **GitHub Actions** para CI y despliegue en GitHub Pages.

## Estructura del proyecto

```
├── index.html              Página y orden de carga de los scripts
├── manifest.webmanifest    PWA: nombre, iconos, pantalla completa
├── sw.js                   Service worker (juego sin conexión)
├── css/styles.css          Estilos de la página y de los mandos táctiles
├── img/                    Iconos y vista previa para redes sociales
├── js/
│   ├── core/               Configuración, motor de píxeles, teclado, táctil y utilidades
│   ├── sprites/            Personajes articulados y monstruos
│   ├── world/              Mazmorra e iluminación
│   ├── data/               Héroes, enemigos, objetos y secciones
│   ├── audio/              Efectos y música
│   ├── game/               Estado, combate y bucle
│   ├── entities/           Jugador, enemigos y jefes
│   ├── ui/                 Historia y ranking
│   ├── render/             Dibujo, HUD y pantallas
│   └── main.js             Arranque
├── tests/                  Pruebas unitarias (node:test)
├── tools/                  Lint del proyecto y prueba de humo
├── docs/                   Documentación técnica y capturas
└── .github/                CI, despliegue, Dependabot y plantillas
```

Cada archivo empieza con una línea que resume su contenido, y cada función y tabla de datos tiene su comentario JSDoc.

## Documentación

| Guía | Contenido |
|---|---|
| [Arquitectura](docs/arquitectura.md) | Carga de scripts, bucle de paso fijo, máquina de estados, coordenadas y secciones |
| [Diseño del juego](docs/diseno-del-juego.md) | Héroes, enemigos, jefes, etapa, objetos y puntuación, con todos los números |
| [Gráficos](docs/graficos.md) | Motor de píxeles, esqueletos y poses, mazmorra e iluminación |
| [Audio](docs/audio.md) | Efectos y formato de los temas del secuenciador |
| [Controles, móvil y PWA](docs/controles-y-movil.md) | Teclas lógicas, cruceta analógica, disposición táctil e instalación |
| [Recetas](docs/recetas.md) | Paso a paso: enemigos, jefes, secciones, objetos, diálogos, temas y héroes |
| [Pruebas](docs/pruebas.md) | Lint, pruebas unitarias, prueba de humo, semillas y modo depuración |
| [Despliegue y versiones](docs/despliegue-y-versiones.md) | Ramas, CI, GitHub Pages, caché de la PWA y publicación de versiones |

## Calidad y CI

```mermaid
flowchart LR
  PR[Push o PR] --> L[Lint<br>estructura + ESLint]
  PR --> U[Unit tests<br>node:test]
  L --> S[Smoke test<br>bot en Chromium]
  U --> S
  M[Merge a main] --> D[Deploy to<br>GitHub Pages]
```

- **Lint**: sintaxis, orden de carga, coherencia entre `index.html`, el service worker y el manifest, y ESLint.
- **Unit tests**: datos, poses, combos, jefes, ranking, semillas y música, cargando el juego en un contexto aislado.
- **Smoke test**: un bot juega la etapa completa con los dos héroes y varias semillas; cualquier atasco o error de consola hace fallar la CI, con una URL para reproducirlo.
- **Dependabot** mantiene al día las acciones y las dependencias de desarrollo.

## Hoja de ruta

- [x] Etapa 1 completa: cinco departamentos, tres jefes, historia y ranking
- [x] Música chiptune, combos y animaciones interpoladas
- [x] Móvil, tableta y PWA sin conexión
- [ ] Cooperativo para dos jugadores y soporte de mando (Gamepad API)
- [ ] Nuevos héroes: la Pícara del Frontend y el Bardo Scrum Master
- [ ] Menú de opciones: volumen, dificultad, teclas y modo sin destellos
- [ ] El Revisor, jefe secreto que exige la Definition of Done
- [ ] Etapa 2: Las Cuevas

## Contribuir

Las contribuciones son bienvenidas. Antes de empezar, lee la [guía de contribución](CONTRIBUTING.md) y el [código de conducta](CODE_OF_CONDUCT.md).

- ¿Un fallo? [Abre un issue](https://github.com/serbenda/dungeons-and-deployments/issues/new/choose) con la plantilla; si puedes, con una URL `?debug&seed=N` que lo reproduzca.
- ¿Una idea de enemigo o de referencia geek? Usa la plantilla de propuestas.
- ¿Una vulnerabilidad? Sigue la [política de seguridad](SECURITY.md).

Los cambios de cada versión están en el [CHANGELOG](CHANGELOG.md).

<div align="center">

Hecho con ☕, pixel art y demasiados tickets por [@serbenda](https://github.com/serbenda)

</div>
