// Service worker: permite instalar el juego y jugar sin conexión.
//
// Estrategias:
// - Archivos propios: primero la red y, si no hay conexión, la caché. Así
//   siempre se juega la última versión publicada y nunca una antigua.
// - Fuentes de Google: primero la caché. Se guardan la primera vez que se
//   descargan y desde entonces funcionan sin conexión.
//
// Al publicar una versión con archivos nuevos o renombrados, actualiza ASSETS
// (npm run lint comprueba que coincide con index.html) y sube CACHE_VERSION.
'use strict';

const CACHE_VERSION = 'v0.5.0';
const APP_CACHE = `dnd-app-${CACHE_VERSION}`;
const FONT_CACHE = 'dnd-fonts-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/styles.css',
  './img/icons/favicon-32.png',
  './img/icons/icon-192.png',
  './img/icons/icon-512.png',
  './js/core/config.js',
  './js/core/pixel.js',
  './js/sprites/characters.js',
  './js/sprites/monsters.js',
  './js/sprites/caves.js',
  './js/world/level.js',
  './js/world/caves.js',
  './js/data/game-data.js',
  './js/audio/sfx.js',
  './js/audio/music.js',
  './js/core/input.js',
  './js/core/touch.js',
  './js/game/state.js',
  './js/core/utils.js',
  './js/game/combat.js',
  './js/entities/player.js',
  './js/entities/enemies.js',
  './js/entities/bosses.js',
  './js/ui/story.js',
  './js/ui/ranking.js',
  './js/ui/options.js',
  './js/ui/achievements.js',
  './js/ui/credits.js',
  './js/game/bossrush.js',
  './js/game/loop.js',
  './js/render/draw.js',
  './js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  // Borra las cachés de versiones anteriores.
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== APP_CACHE && k !== FONT_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache => cache.match(req).then(hit => hit || fetch(req).then(res => {
        if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
        return res;
      })))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(APP_CACHE).then(cache => cache.put(req, copy)); }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('./index.html')))
  );
});
