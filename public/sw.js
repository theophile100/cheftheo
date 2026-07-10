// Service worker minimal et prudent : l'app est pilotee par des donnees
// Supabase qui changent en permanence (progression, energie, commentaires),
// donc on ne met en cache QUE ce qui est sur et amelioration de la robustesse
// hors-ligne (assets statiques + page de secours), jamais le HTML dynamique
// ni les appels reseau vers Supabase.
const CACHE_VERSION = "cheftheo-v1";
const OFFLINE_URL = "/hors-ligne";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-192.png",
  "/icon-maskable-512.png",
  "/apple-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Fichiers de build : immuables (nom de fichier contient un hash), sur a
  // garder en cache indefiniment.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE_VERSION).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  // Icones/manifest precaches : cache d'abord, reseau en secours.
  if (PRECACHE_URLS.includes(url.pathname)) {
    event.respondWith(caches.match(request).then((cached) => cached ?? fetch(request)));
    return;
  }

  // Navigation vers une page : toujours le reseau en priorite (donnees a
  // jour), page hors-ligne uniquement si vraiment pas de connexion.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL).then((r) => r ?? Response.error())),
    );
    return;
  }

  // Tout le reste (API, donnees Supabase...) : reseau direct, jamais de cache.
});
