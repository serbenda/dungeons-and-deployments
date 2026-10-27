# Audio

Todo el sonido se sintetiza en tiempo real con la Web Audio API. No hay archivos de audio.

## Arranque

Los navegadores no dejan sonar nada hasta que el usuario interactúa. `initAudio()` crea el `AudioContext` en la primera pulsación (tecla, botón o toque) y, si estaba suspendido, lo reanuda. Hasta entonces `sfx()` y la música no hacen nada.

La tecla **M** (o el botón SONIDO en móvil) silencia todo: pone `muted = true`, la música baja su volumen a 0 y la vibración se desactiva.

## Efectos de sonido (`js/audio/sfx.js`)

Cada efecto de la tabla `SFX` es un oscilador con un barrido de frecuencia y una envolvente que decae:

```js
swing: [700, 250, .06, 'triangle']   // [frecuencia inicial, final, duración en s, forma de onda]
```

| Efecto | Cuándo suena |
|---|---|
| `swing` | Lanzar un golpe |
| `punch` · `heavy` | Golpe que entra (normal o que derriba) |
| `hurt` | Recibir un golpe |
| `jump` · `land` | Saltar y caer |
| `pick` · `food` | Coger un arma o comida |
| `shoot` | Disparo del Báculo de Ping o del `console.log()` |
| `roar` | Rugidos de jefes y enemigos |
| `special` | Especiales y hotfix |
| `coin` | Crédito, rangos de combo y récord |
| `go` · `select` | Avanzar y menús |
| `break` · `boom` · `clink` | Cajas, explosiones y bloqueos |

Para añadir uno: nueva entrada en `SFX` y `sfx('nombre')` donde toque.

## Música (`js/audio/music.js`)

`MUSIC` es un secuenciador por pasos de **semicorchea** con cuatro voces:

| Voz | Onda | Qué toca |
|---|---|---|
| Melodía | Pulso al 25 % | Los motivos `lead` sobre el acorde de cada compás |
| Bajo | Triangular | La fundamental del acorde (`x`), la quinta (`o`) o la octava (`8`) |
| Arpegio (opcional) | Pulso al 12,5 % | Las notas del acorde en bucle, si `arp: true` |
| Percusión | Ruido y seno | Bombo (`k`), caja (`s`) y charles (`h`) |

### Formato de un tema

```js
network: {
  bpm: 138,               // tempo
  root: 52,               // nota raíz en MIDI (52 = Mi)
  sc: 'min',              // escala: min, dor, phr, maj o harm
  prog: [0, 5, 3, 4],     // acorde de cada compás, en grados de la escala (se repite)
  arp: true,
  lead: [                 // un motivo por compás (se repiten en ciclo)
    [0,_,_,_, R,_,4,_, 7,_,_,_, 6,_,4,_],
    [4,_,_,_, _,_,_,_, 2,_,4,_, 2,_,_,_]
  ],
  bass: 'x.xx.xx.x.xx.xx.',
  k:    'x...x...x...x...',
  s:    '....x.......x...',
  h:    'xxxxxxxxxxxxxxxx'
}
```

- Cada motivo tiene 16 pasos. Un número es una nota (en grados de la escala, **relativos al acorde del compás**), `_` alarga la nota anterior y `R` es silencio.
- Como las notas son relativas al acorde, la melodía sigue la armonía sola: el mismo motivo suena bien sobre los cuatro acordes.
- Los temas con `once: N` (victoria y game over) suenan N pasos y se paran.

### Temas

| Tema | Cuándo | Tempo | Carácter |
|---|---|---|---|
| `title` | Título, selección, ranking | 104 | Épico, La menor |
| `sistemas` | Sistemas | 126 | Aventura, Re dórico |
| `network` | Network | 138 | Electrónico con arpegio, Mi menor |
| `storage` | Storage | 116 | Polvoriento, La frigio |
| `virtual` | Virtualización | 96 | Misterioso con arpegio, Si menor armónica |
| `caas` | CaaS | 148 | Industrial, Do menor |
| `boss` | Jefes y guarida | 160 | Tenso, Do menor armónica. Acelera un 12 % a media vida del dragón |
| `continue` | ¿ROLLBACK? | 120 | Cuenta atrás |
| `victory` | Final de la etapa | 150 | Jingle, Do mayor |
| `over` | Game over | 80 | Jingle descendente |

`musicFor()` decide el tema según el estado y la zona de la cámara. `update()` llama en cada actualización a `MUSIC.play(musicFor())`, que solo cambia de tema si es distinto, con un fundido corto.

### Programación del audio

`MUSIC.tick()` programa con antelación (120 ms) las notas de los pasos siguientes usando el reloj del `AudioContext`, no el del juego. Así el ritmo es estable aunque la pantalla vaya a tirones. Si la pestaña ha estado en segundo plano, recoloca el reloj en lugar de reproducir de golpe las notas atrasadas.

Toda la música compuesta es original del proyecto.
