// Motor de pixel art: pintor por píxeles, contorno automático y caché de sprites.
'use strict';

const RGB = {};
function rgb(hex){ let v = RGB[hex]; if (v) return v; const n = parseInt(hex.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; RGB[hex] = v; return v; }
function mkCanvas(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function prng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let x = a; x = Math.imul(x ^ (x >>> 15), x | 1); x ^= x + Math.imul(x ^ (x >>> 7), x | 61); return ((x ^ (x >>> 14)) >>> 0)/4294967296; }; }
function painter(w, h){
  const buf = new Array(w*h).fill(null);
  const S = {
    w, h, buf,
    px(x, y, c){ x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) buf[y*w + x] = c; },
    rect(x, y, ww, hh, c){ x = Math.round(x); y = Math.round(y); ww = Math.round(ww); hh = Math.round(hh); for (let j = 0; j < hh; j++) { const yy = y + j; if (yy < 0 || yy >= h) continue; for (let i = 0; i < ww; i++) { const xx = x + i; if (xx >= 0 && xx < w) buf[yy*w + xx] = c; } } },
    disc(cx, cy, rr, c){ const R = Math.ceil(rr) + 1; for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) if (i*i + j*j <= rr*rr + rr*.5) S.px(cx + i, cy + j, c); },
    ell(cx, cy, rx, ry, c){ const X = Math.ceil(rx), Y = Math.ceil(ry); for (let j = -Y; j <= Y; j++) for (let i = -X; i <= X; i++) if ((i*i)/(rx*rx) + (j*j)/(ry*ry) <= 1) S.px(cx + i, cy + j, c); },
    line(x0, y0, x1, y1, th, c){
      const d = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.ceil(d*1.5)), o = (th - 1)/2;
      for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0)*k/n, y = y0 + (y1 - y0)*k/n; if (th <= 1) S.px(x, y, c); else S.rect(x - o, y - o, th, th, c); }
    },
    poly(pts, c){
      let minY = Infinity, maxY = -Infinity;
      for (const p of pts) { if (p[1] < minY) minY = p[1]; if (p[1] > maxY) maxY = p[1]; }
      for (let y = Math.floor(minY); y <= Math.ceil(maxY); y++) {
        const xs = [], yc = y + .5;
        for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1])*(b[0] - a[0])/(b[1] - a[1])); }
        xs.sort((p, q) => p - q);
        for (let i = 0; i + 1 < xs.length; i += 2) for (let x = Math.round(xs[i]); x < Math.round(xs[i + 1]); x++) S.px(x, y, c);
      }
    }
  };
  return S;
}
function toCanvas(S, outline){
  const { w, h, buf } = S;
  let out = buf;
  if (outline) {
    out = buf.slice();
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y*w + x; if (buf[i]) continue;
      if ((x > 0 && buf[i - 1]) || (x < w - 1 && buf[i + 1]) || (y > 0 && buf[i - w]) || (y < h - 1 && buf[i + w])) out[i] = OUTLINE;
    }
  }
  const c = mkCanvas(w, h), g = c.getContext('2d'), img = g.createImageData(w, h);
  let f = null, imf = null, gf = null;
  if (outline) { f = mkCanvas(w, h); gf = f.getContext('2d'); imf = gf.createImageData(w, h); }
  for (let i = 0; i < w*h; i++) {
    const col = out[i]; if (!col) continue;
    const v = rgb(col), o = i*4;
    img.data[o] = v[0]; img.data[o + 1] = v[1]; img.data[o + 2] = v[2]; img.data[o + 3] = 255;
    if (imf) { imf.data[o] = 255; imf.data[o + 1] = 255; imf.data[o + 2] = 255; imf.data[o + 3] = 255; }
  }
  g.putImageData(img, 0, 0);
  if (gf) gf.putImageData(imf, 0, 0);
  return { c, f, w, h };
}
const SPR = new Map();
function sprite(key, w, h, fn){ let s = SPR.get(key); if (!s) { const S = painter(w, h); const meta = fn(S); s = toCanvas(S, true); s.meta = meta; SPR.set(key, s); } return s; }

const D = a => [Math.sin(a*Math.PI/180), Math.cos(a*Math.PI/180)];
const add = (a, d, l) => [a[0] + d[0]*l, a[1] + d[1]*l];
