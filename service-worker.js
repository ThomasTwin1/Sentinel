const CACHE_PREFIX = "sentinel-tracker-";
const CACHE_NAME = `${CACHE_PREFIX}v0.8.1-team-completion`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./csv-security.js",
  "./secure-vault.js",
  "./team-attribution.js",
  "./app.js",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(async (keys) => {
      const previousCaches = keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME);
      await Promise.all(previousCaches.map((key) => caches.delete(key)));
      await self.clients.claim();
      if (previousCaches.length) {
        const windows = await self.clients.matchAll({ type: "window" });
        await Promise.all(windows.map(client => client.navigate(client.url)));
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  const allowedPaths = new Set(APP_SHELL.map(path => new URL(path, self.location.href).pathname));
  if (!allowedPaths.has(requestUrl.pathname)) return;

  event.respondWith(
    fetch(event.request).then((response) => {
      if (response.ok && response.type === "basic") {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === "navigate") return caches.match("./index.html");
        throw new Error("Sentinel is offline and this resource is not cached.");
      })
    )
  );
});
