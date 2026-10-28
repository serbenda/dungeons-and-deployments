// Efectos de sonido sintetizados con WebAudio.
'use strict';

let actx = null, muted = false;
/**
 * Crea el AudioContext. Los navegadores solo lo permiten tras una interacción del
 * usuario, por eso se llama al pulsar la primera tecla.
 */
function initAudio(){ if (actx) return; try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { actx = null; } }
/**
 * Efectos de sonido: [frecuencia inicial, final, duración, forma de onda].
 */
const SFX = {
  swing:[700,250,.06,'triangle'], punch:[240,70,.09,'square'], heavy:[160,40,.18,'sawtooth'], hurt:[320,80,.2,'sawtooth'],
  jump:[300,600,.1,'square'], land:[90,60,.05,'square'], pick:[700,1200,.12,'square'], food:[500,1300,.25,'triangle'],
  shoot:[1200,400,.12,'triangle'], roar:[110,35,.8,'sawtooth'], special:[180,900,.4,'sawtooth'], coin:[988,1976,.2,'square'],
  go:[660,990,.15,'square'], break:[260,90,.14,'sawtooth'], select:[440,880,.06,'square'], boom:[80,30,.5,'sawtooth'], clink:[1500,1300,.05,'square']
};
/**
 * Volumen de los efectos según la opción EFECTOS (0 a 10; 8 es el volumen original).
 * @returns {number} Multiplicador de la ganancia.
 */
const sfxVol = () => typeof OPTS === 'undefined' ? 1 : OPTS.sfx/8;
/**
 * Reproduce un efecto de sonido sintetizado de la tabla SFX. No suena si el sonido
 * está silenciado (M) o si EFECTOS está a 0.
 * @param {string} n Nombre del efecto (swing, punch, roar...).
 */
function sfx(n){
  if (!actx || muted || sfxVol() <= 0) return;
  try {
    const [f1,f2,d,type] = SFX[n]; const now = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f1, now); o.frequency.exponentialRampToValueAtTime(f2, now + d);
    g.gain.setValueAtTime(.05*sfxVol(), now); g.gain.exponentialRampToValueAtTime(.0008, now + d);
    o.connect(g); g.connect(actx.destination); o.start(now); o.stop(now + d + .02);
  } catch(e) {}
}
