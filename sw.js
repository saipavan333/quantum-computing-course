/* Service worker — offline cache for the hosted (https) version.
   Bump VERSION when content changes to refresh caches. */
const VERSION = "qcc-v2.5.0";
const CORE = [
  ".", "index.html", "manifest.webmanifest",
  "assets/css/styles.css", "assets/css/features.css",
  "assets/js/app.js", "assets/js/site.js", "assets/js/features.js",
  "assets/js/runner.js", "assets/js/assistant.js", "assets/js/widgets.js",
  "assets/js/labs.js", "assets/js/hero.js", "assets/js/effects.js", "assets/js/diagrams.js",
  "assets/vendor/three.min.js",
  "assets/vendor/marked.min.js", "assets/vendor/highlight.min.js",
  "assets/vendor/hljs-dark.min.css",
  "assets/vendor/katex/katex.min.css", "assets/vendor/katex/katex.min.js",
  "assets/vendor/katex/contrib/auto-render.min.js",
  "content/manifest.js",
  "content/m0.js", "content/m1.js", "content/m2.js", "content/m3.js",
  "content/m4.js", "content/m5.js", "content/m6.js", "content/m7.js",
  "content/m8.js", "content/m9.js", "content/m10.js", "content/m11.js",
  "content/glossary.js", "content/interview.js",
  "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* cache-first for same-origin GETs (fonts included), network fallback + backfill */
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, copy));
          return res;
        })
    )
  );
});
