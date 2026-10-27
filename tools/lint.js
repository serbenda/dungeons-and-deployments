#!/usr/bin/env node
// Lint: comprueba la sintaxis de todos los scripts y que index.html carga cada archivo
// de js/ exactamente una vez.
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
for (const file of [...walk(path.join(root, 'js')), ...walk(path.join(root, 'tools'))]) {
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

console.log(failed ? 'Hay errores.' : `OK: ${onDisk.length} scripts del juego revisados.`);
process.exit(failed ? 1 : 0);
