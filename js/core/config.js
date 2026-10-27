// Canvas, resolución, paleta y fuentes.
'use strict';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;
const W = 320, H = 200, FY0 = 128, FY1 = 190, LEVEL_END = 3520, LVW = LEVEL_END + W + 120;
const OUTLINE = '#0b0912';
const C = {
  k:'#0b0912', d:'#2c2440', m:'#4b4470', l:'#7a70ad', w:'#ece6f6', a:'#f4b860', ad:'#a8722e', g:'#6ee7a8', gd:'#2f7a5a',
  r:'#ff5d73', rd:'#8a2c3c', b:'#5ec8f2', bd:'#2b5f7d', u:'#d8cfb4', ud:'#8d8468', e:'#ff8a3d'
};
const F8 = '8px "Press Start 2P", "Courier New", monospace';
const F16 = '16px "Press Start 2P", "Courier New", monospace';
