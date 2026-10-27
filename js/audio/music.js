// Secuenciador chiptune y temas de cada zona.
'use strict';

const MUSIC = (() => {
  const _ = null, R = 'r';
  const SC = { min:[0,2,3,5,7,8,10], dor:[0,2,3,5,7,9,10], phr:[0,1,3,5,7,8,10], maj:[0,2,4,5,7,9,11], harm:[0,2,3,5,7,8,11] };
  const T = {
    title:{ bpm:104, root:57, sc:'min', prog:[0,5,2,6], lead:[
      [0,_,_,4, _,_,2,_, 4,_,7,_, 6,_,4,_], [2,_,_,_, 4,_,2,_, 0,_,_,_, R,_,_,_],
      [4,_,_,7, _,_,6,_, 4,_,2,_, 4,_,_,_], [7,_,6,_, 4,_,2,_, 1,_,_,_, 0,_,_,_]],
      bass:'x.x.o.x.x.x.o.x.', k:'x.......x.......', s:'....x.......x...', h:'..x...x...x...x.' },
    sistemas:{ bpm:126, root:50, sc:'dor', prog:[0,0,3,4], lead:[
      [0,_,2,_, 4,_,2,_, 5,_,4,_, 2,_,0,_], [4,_,_,_, 2,_,4,_, 6,_,_,5, 4,_,_,_],
      [2,_,_,4, 5,_,7,_, 6,_,4,_, 2,_,_,_], [4,_,3,_, 2,_,1,_, 2,_,_,_, R,_,_,_]],
      bass:'x.xxx.x.x.xxo.x.', k:'x.....x...x.....', s:'....x.......x...', h:'..x...x...x...x.' },
    network:{ bpm:138, root:52, sc:'min', prog:[0,5,3,4], arp:true, lead:[
      [0,_,_,_, R,_,4,_, 7,_,_,_, 6,_,4,_], [4,_,_,_, _,_,_,_, 2,_,4,_, 2,_,_,_]],
      bass:'x.xx.xx.x.xx.xx.', k:'x...x...x...x...', s:'....x.......x...', h:'xxxxxxxxxxxxxxxx' },
    storage:{ bpm:116, root:57, sc:'phr', prog:[0,1,0,6], lead:[
      [0,_,_,1, 0,_,_,_, 4,_,3,_, 1,_,0,_], [2,_,_,_, 1,_,_,_, 0,_,_,_, R,_,_,_]],
      bass:'x...x.x.x...x.x.', k:'x.......x.x.....', s:'....x.......x...', h:'..x...x...x...x.' },
    virtual:{ bpm:96, root:59, sc:'harm', prog:[0,5,3,4], arp:true, lead:[
      [4,_,_,_, _,_,_,_, 2,_,_,_, 3,_,_,_], [4,_,_,_, 6,_,_,_, 4,_,_,_, _,_,_,_]],
      bass:'x.......x.......', k:'x...............', s:'........x.......', h:'....x.......x...' },
    caas:{ bpm:148, root:48, sc:'min', prog:[0,0,5,6], lead:[
      [0,_,0,_, 3,_,0,_, 4,_,3,_, 1,_,0,_], [7,_,_,6, 4,_,3,_, 4,_,_,_, 2,_,_,_]],
      bass:'xxx.xx.xxxx.xx.x', k:'x...x...x...x...', s:'....x.......x..x', h:'x.xxx.xxx.xxx.xx' },
    boss:{ bpm:160, root:48, sc:'harm', prog:[0,5,0,4], lead:[
      [0,1,2,_, 0,1,2,_, 4,_,3,_, 2,_,1,_], [7,_,6,_, 5,_,4,_, 3,_,2,_, 4,_,_,_]],
      bass:'x8x8x8x8x8x8x8x8', k:'x...x...x...x.x.', s:'....x.......x...', h:'xxxxxxxxxxxxxxxx' },
    continue:{ bpm:120, root:57, sc:'phr', prog:[0,1], lead:[[0,_,_,_, R,_,_,_, 1,_,_,_, R,_,_,_]],
      bass:'x...x...x...x...', k:'x...x...x...x...', s:'................', h:'................' },
    victory:{ bpm:150, root:60, sc:'maj', prog:[0,3,4,0], once:64, lead:[
      [0,_,2,_, 4,_,7,_, _,_,_,_, 4,_,7,_], [2,_,_,_, 4,_,2,_, 0,_,_,_, 2,_,_,_],
      [2,_,4,_, 2,_,4,_, 6,_,_,_, _,_,_,_], [7,_,_,_, _,_,_,_, _,_,_,_, R,_,_,_]],
      bass:'x.x.x.x.x.x.x.x.', k:'x...x...x...x...', s:'....x.......x...', h:'................' },
    over:{ bpm:80, root:57, sc:'min', prog:[0,5,4,0], once:64, lead:[
      [4,_,_,_, 3,_,_,_, 2,_,_,_, _,_,_,_], [2,_,_,_, 1,_,_,_, 0,_,_,_, _,_,_,_],
      [2,_,_,_, 0,_,_,_, -1,_,_,_, _,_,_,_], [0,_,_,_, _,_,_,_, _,_,_,_, R,_,_,_]],
      bass:'x.......x.......', k:'................', s:'................', h:'................' }
  };
  let master = null, bus = null, pulse = null, pulse8 = null, noise = null;
  let cur = null, curName = '', step = 0, next = 0, vol = 1, rate = 1;
  const semi = (sc, d) => { const o = Math.floor(d/7), i = ((d % 7) + 7) % 7; return sc[i] + 12*o; };
  const freq = m => 440*Math.pow(2, (m - 69)/12);
  function mkPulse(duty){
    const n = 32, re = new Float32Array(n), im = new Float32Array(n);
    for (let i = 1; i < n; i++) re[i] = 2/(i*Math.PI)*Math.sin(i*Math.PI*duty);
    return actx.createPeriodicWave(re, im);
  }
  function ensure(){
    if (!actx) return false;
    if (master) return true;
    try {
      master = actx.createGain(); master.gain.value = 0; master.connect(actx.destination);
      pulse = mkPulse(.25); pulse8 = mkPulse(.125);
      noise = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
      const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
      return true;
    } catch(e) { master = null; return false; }
  }
  function start(){
    if (bus) { const b = bus; try { b.gain.setTargetAtTime(0, actx.currentTime, .05); } catch(e) {} setTimeout(() => { try { b.disconnect(); } catch(e) {} }, 700); }
    cur = T[curName] || null;
    bus = actx.createGain(); bus.gain.value = 1; bus.connect(master);
    step = 0; next = actx.currentTime + .06;
  }
  function tone(wave, m, at, dur, g){
    const o = actx.createOscillator(), e = actx.createGain();
    if (wave === 'p25') o.setPeriodicWave(pulse); else if (wave === 'p12') o.setPeriodicWave(pulse8); else o.type = wave;
    o.frequency.setValueAtTime(freq(m), at);
    e.gain.setValueAtTime(0, at); e.gain.linearRampToValueAtTime(g, at + .006);
    e.gain.setTargetAtTime(g*.55, at + .02, dur*.5); e.gain.setTargetAtTime(0, at + dur, .015);
    o.connect(e); e.connect(bus); o.start(at); o.stop(at + dur + .1);
  }
  function hit(kind, at){
    if (kind === 'k') {
      const o = actx.createOscillator(), e = actx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(150, at); o.frequency.exponentialRampToValueAtTime(42, at + .12);
      e.gain.setValueAtTime(.32, at); e.gain.exponentialRampToValueAtTime(.001, at + .16);
      o.connect(e); e.connect(bus); o.start(at); o.stop(at + .18);
      return;
    }
    const s = actx.createBufferSource(), f = actx.createBiquadFilter(), e = actx.createGain();
    s.buffer = noise; f.type = 'highpass'; f.frequency.value = kind === 's' ? 1400 : 7000;
    const g = kind === 's' ? .14 : .045, d = kind === 's' ? .12 : .04;
    e.gain.setValueAtTime(g, at); e.gain.exponentialRampToValueAtTime(.001, at + d);
    s.connect(f); f.connect(e); e.connect(bus); s.start(at, Math.random()*.5); s.stop(at + d + .02);
  }
  function schedule(st, at, spb){
    const c = cur, sc = SC[c.sc], bar = Math.floor(st/16), i = st % 16;
    const chord = c.prog[bar % c.prog.length];
    const mot = c.lead[bar % c.lead.length], v = mot[i];
    if (typeof v === 'number') {
      let len = 1; while (i + len < 16 && mot[i + len] === null) len++;
      tone('p25', c.root + 12 + semi(sc, chord + v), at, len*spb*.92, .075);
    }
    const b = c.bass[i];
    if (b !== '.') tone('triangle', c.root - 12 + semi(sc, chord) + (b === 'o' ? 7 : b === '8' ? 12 : 0), at, spb*1.5, .16);
    if (c.arp) tone('p12', c.root + 24 + semi(sc, chord + [0, 2, 4, 7][i % 4]), at, spb*.8, .022);
    if (c.k[i] === 'x') hit('k', at);
    if (c.s[i] === 'x') hit('s', at);
    if (c.h[i] === 'x') hit('h', at);
  }
  return {
    play(name){ if (name === curName) return; curName = name; if (ensure()) start(); },
    setVol(v){ vol = v; },
    setRate(r){ rate = r; },
    tick(){
      if (!actx) return;
      if (!master) { if (!ensure()) return; start(); }
      try { master.gain.setTargetAtTime(muted ? 0 : .55*vol, actx.currentTime, .05); } catch(e) {}
      if (!cur || actx.state !== 'running') return;
      const spb = 60/(cur.bpm*rate)/4;
      if (next < actx.currentTime - .25) next = actx.currentTime + .02;
      while (next < actx.currentTime + .12) {
        try { schedule(step, next, spb); } catch(e) {}
        step++; next += spb;
        if (cur.once && step >= cur.once) { cur = null; break; }
      }
    }
  };
})();
function musicFor(){
  switch (state) {
    case 'title': case 'select': case 'initials': case 'ranking': return 'title';
    case 'story': if (story && story.after) return 'victory'; return boss ? 'boss' : (ZONE(camX + 160) === 'guarida' ? 'boss' : ZONE(camX + 160));
    case 'continue': return 'continue';
    case 'over': return 'over';
    case 'clear': return 'victory';
    default: {
      if (boss) return 'boss';
      const z = ZONE(camX + 160);
      return z === 'guarida' ? 'boss' : z;
    }
  }
}
