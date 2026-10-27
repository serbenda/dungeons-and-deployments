#!/usr/bin/env node
// Lint del proyecto:
// - sintaxis de todos los scripts (node --check),
// - index.html carga cada archivo de js/ una sola vez y js/main.js el último,
// - la lista de precarga del service worker (sw.js) coincide con index.html,
// - existen todos los archivos que citan index.html, sw.js y el manifest.
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(d => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : [];
});

let failed = false;
const fail = msg => { failed = true; console.error('ERR ' + msg); };
for (const file of [...walk(path.join(root, 'js')), ...walk(path.join(root, 'tools')), ...walk(path.join(root, 'tests')), path.join(root, 'sw.js')]) {
  try { execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' }); }
  catch (e) { failed = true; console.error(`ERR ${path.relative(root, file)}\n${e.stderr}`); }
}

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const loaded = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const onDisk = walk(path.join(root, 'js')).map(f => path.relative(root, f).split(path.sep).join('/'));
for (const f of onDisk) if (!loaded.includes(f)) { failed = true; console.error(`ERR ${f} no se carga en index.html`); }
for (const f of loaded) {
  if (!onDisk.includes(f)) { failed = true; console.error(`ERR index.html carga ${f}, que no existe`); }
  if (loaded.indexOf(f) !== loaded.lastIndexOf(f)) { failed = true; console.error(`ERR ${f} se carga dos veces`); }
}
if (loaded[loaded.length - 1] !== 'js/main.js') { failed = true; console.error('ERR js/main.js debe ser el último script'); }

// Service worker: debe precargar exactamente los scripts de index.html, y todo lo que cita debe existir.
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const assets = [...sw.matchAll(/'\.\/([^']*)'/g)].map(m => m[1]).filter(Boolean);
for (const f of loaded) if (!assets.includes(f)) fail(`sw.js no precarga ${f}`);
for (const f of assets) {
  if (f.startsWith('js/') && !loaded.includes(f)) fail(`sw.js precarga ${f}, que index.html no carga`);
  if (!fs.existsSync(path.join(root, f))) fail(`sw.js precarga ${f}, que no existe`);
}

// Recursos locales citados en index.html y en el manifest.
const refs = [...html.matchAll(/(?:href|src)="(?!https?:|#|mailto:)([^"]+)"/g)].map(m => m[1]);
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8'));
for (const f of [...refs, ...manifest.icons.map(i => i.src)]) if (!fs.existsSync(path.join(root, f))) fail(`falta el archivo ${f}`);

console.log(failed ? 'Hay errores.' : `OK: ${onDisk.length} scripts del juego revisados.`);
process.exit(failed ? 1 : 0);
