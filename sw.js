const CACHE_NAME = "yassir-perfil-pwa-v3";

const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./manifest.json",
    "./catalogo.json",
    "./assets/foto1.jpeg",
    "./assets/foto2.jpeg",
    "./assets/foto3.jpeg",
    "./assets/foto4.jpeg",
    "./assets/foto5.jpeg",
    "./assets/icon-192.png",
    "./assets/icon-512.png"
];

// INSTALACIÓN
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                try {
                    await cache.addAll(STATIC_ASSETS);
                } catch (err) {
                    console.warn("PWA: Falló la precarga de algunos archivos:", err);
                }
            })
            .then(() => self.skipWaiting())
    );
});

// ACTIVACIÓN Y PURGA DE CACHÉS OBSOLETAS
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// ESTRATEGIA: CACHÉ PRIMERO, RED COMO RESPALDO
self.addEventListener("fetch", event => {
    const request = event.request;

    // Solo interceptar peticiones GET
    if (request.method !== "GET") return;

    // Manejo de peticiones de navegación (HTML)
    if (request.mode === "navigate") {
        event.respondWith(
            caches.match(request)
                .then(cachedResponse => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.ok) {
                                const clone = networkResponse.clone();
                                caches.open(CACHE_NAME).then(c => c.put(request, clone));
                            }
                            return networkResponse;
                        })
                        .catch(() => caches.match("./index.html"));
                })
        );
        return;
    }

    // Recursos estáticos: CSS, JS, imágenes, JSON y CDNs
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(request).then(networkResponse => {
                if (networkResponse && networkResponse.ok) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, clone);
                    });
                }
                return networkResponse;
            }).catch(error => {
                // Si falla la red y es JSON o recurso crítico, intentar devolver respaldo
                if (request.url.includes("catalogo.json")) {
                    return caches.match("./catalogo.json");
                }
                console.warn("PWA: Recurso no disponible offline:", request.url);
            });
        })
    );
});
