const CACHE = "pool-mind-v1";

// Páginas shell pré-cacheadas na instalação
const PRECACHE = ["/", "/produtos", "/medicoes", "/tarefas", "/insights", "/configuracoes"];

// ─── Ciclo de vida ──────────────────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ──────────────────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora requisições não-GET e cross-origin
  if (request.method !== "GET" || !request.url.startsWith(self.location.origin)) return;

  const url = new URL(request.url);

  // API routes e Supabase: network-only (sem cache — dados ao vivo)
  if (url.pathname.startsWith("/api/") || url.hostname.includes("supabase")) return;

  // Assets estáticos do Next.js: cache-first (imutáveis com hash no nome)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // RSC / Next data: network-first (não cacheia — conteúdo dinâmico)
  if (url.pathname.startsWith("/_next/") || url.searchParams.has("_rsc")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  // Navegação de página: network-first com fallback no cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(request, clone));
          return res;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? (await caches.match("/"));
        })
    );
    return;
  }
});

// ─── Push notifications ─────────────────────────────────────────────────────

self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Pool Mind", {
      body: data.body ?? "",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag ?? "pool-mind",
      data: { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        const existing = list.find((c) => c.url.includes(self.location.origin));
        if (existing) return existing.focus();
        return clients.openWindow(event.notification.data.url);
      })
  );
});
