# Cómo contribuir

## Ramas

- `main` es lo que está publicado en GitHub Pages. No se trabaja directamente sobre ella.
- `development` es la rama de integración.
- Para cada cambio, crea una rama desde `development` con un prefijo: `feature/`, `fix/` o `docs/`. Por ejemplo, `feature/jefe-virtualizacion`.
- Abre la Pull Request contra `development`. De `development` a `main` se pasa con otra PR cuando hay una versión lista.

## Antes de abrir la PR

```bash
npm install
npx playwright install chromium
npm run check   # sintaxis y orden de carga de los scripts
npm test        # el bot juega la etapa completa
```

Prueba también el cambio a mano en el navegador. Con `index.html?debug` tienes `window.dnd` en la consola.

## Estilo de código

- JavaScript sin dependencias ni compilación. Cada archivo empieza con `'use strict'` y un comentario de una línea que explica qué contiene.
- Los scripts comparten ámbito global y se cargan en el orden de `index.html`. Si un archivo nuevo necesita algo **al cargarse**, colócalo después del archivo que lo declara. Si añades un archivo, añade su `<script>` en `index.html` (`npm run check` lo comprueba).
- Sangría de 2 espacios, comillas simples y punto y coma (ver `.editorconfig`).
- Nombres de funciones y variables en inglés. Textos del juego, comentarios y documentación en castellano.
- Los gráficos se pintan por código: usa `sprite()` con una clave única para que se cacheen.

## Mensajes de commit

En castellano, en imperativo y con una primera línea corta: «Añade el jefe de Virtualización», «Corrige el bloqueo del Firewall». Si hace falta, añade detalle en el cuerpo.

## Versiones

Anota los cambios visibles en `CHANGELOG.md`, en la sección «Sin publicar», y sube la versión de `package.json` al publicar en `main`.
