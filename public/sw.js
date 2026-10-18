const CACHE = "parallax-visited-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.add("/")));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
function remember(event, request, response) {
  if (response.ok) {
    const copy = response.clone();
    event.waitUntil(
      caches.open(CACHE).then((cache) => cache.put(request, copy)),
    );
  }
  return response;
}
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => remember(event, "/", response))
        .catch(
          async () =>
            (await caches.match("/")) ||
            new Response("This page has not been saved for offline use.", {
              status: 503,
            }),
        ),
    );
    return;
  }
  if (url.pathname.startsWith("/content/")) {
    // Lesson URLs keep their IDs between releases, so refresh online.
    event.respondWith(
      fetch(new Request(event.request, { cache: "no-store" }))
        .then((response) => remember(event, event.request, response))
        .catch(
          async () =>
            (await caches.match(event.request)) ||
            new Response(
              "Visit this lesson online before opening it offline.",
              { status: 503 },
            ),
        ),
    );
    return;
  }
  if (url.pathname.startsWith("/assets/")) {
    // Build assets have content hashes and can remain cache-first.
    event.respondWith(
      caches
        .match(event.request)
        .then(
          (cached) =>
            cached ||
            fetch(event.request).then((response) =>
              remember(event, event.request, response),
            ),
        ),
    );
  }
});
