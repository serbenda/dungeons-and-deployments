# Política de seguridad

## Versiones con soporte

Solo se mantiene la versión publicada en `main` (la que sirve GitHub Pages).

## Superficie del proyecto

El juego es una web estática: no tiene servidor, cuentas ni datos personales. Solo guarda en el navegador (`localStorage`) el ranking y el récord, y el service worker guarda en caché los archivos del juego y sus fuentes para jugar sin conexión.

## Cómo informar de una vulnerabilidad

No abras un issue público. Usa el aviso privado de GitHub: *Security → Report a vulnerability* en este repositorio, e incluye:

- Qué has encontrado y su impacto.
- Pasos para reproducirlo, idealmente con una URL `index.html?debug&seed=N`.
- Navegador y versión.

Recibirás respuesta en cuanto sea posible, y el arreglo se publicará con su entrada en el `CHANGELOG.md`.
