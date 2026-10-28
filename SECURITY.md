# Política de seguridad

## Versiones con soporte

Solo se mantiene la última versión publicada en `main`, la que sirve GitHub Pages (ver las [releases](https://github.com/serbenda/dungeons-and-deployments/releases)). Los arreglos no se aplican a versiones anteriores.

## Superficie del proyecto

El juego es una web estática: no tiene servidor, cuentas, analítica ni datos personales, y no envía nada a ningún sitio. Solo guarda en el navegador (`localStorage`) los dos rankings y el récord, las opciones, los logros y la partida guardada (ver [Persistencia](docs/arquitectura.md#persistencia)). El service worker guarda en caché los archivos del juego y sus fuentes para jugar sin conexión. Las únicas peticiones externas son las de las fuentes de Google Fonts.

## Cómo informar de una vulnerabilidad

No abras un issue público. Usa el aviso privado de GitHub: *Security → Report a vulnerability* en este repositorio, e incluye:

- Qué has encontrado y su impacto.
- Pasos para reproducirlo, idealmente con una URL `index.html?debug&seed=N`.
- Navegador y versión.

Recibirás respuesta en cuanto sea posible, y el arreglo se publicará con su entrada en el `CHANGELOG.md`.
