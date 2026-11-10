const CACHE_NAME = "yassir-perfil-v2";

const CORE_FILES = [
    "./",
    "./index.html",
    "./styles.css",
    "./script.js",
    "./manifest.json"
];

const IMAGE_FILES = [
    "./assets/foto1.jpeg",
    "./assets/foto2.jpeg",
    "./assets/foto3.jpeg",
    "./assets/foto4.jpeg",
    "./assets/foto5.jpeg"
];

// INSTALACIÓN
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                // Los archivos principales son necesarios.
                await cache.addAll(CORE_FILES);

                // Las fotografías se guardan si existen.
                await Promise.all(
                    IMAGE_FILES.map(async file => {
                        try {
                            await cache.add(file);
                        } catch (error) {
                            console.warn("No se pudo guardar en caché:", file);
                        }
                    })
                );
            })
            .then(() => self.skipWaiting())
    );
});

// ACTIVACIÓN Y LIMPIEZA DE CACHÉS ANTIGUOS
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

// CONSULTAS Y FUNCIONAMIENTO SIN CONEXIÓN
self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method !== "GET") return;

    const url = new URL(request.url);

    // No interceptar solicitudes de otros sitios.
    if (url.origin !== self.location.origin) return;

    // Para las páginas, intentar conexión y usar caché si no hay internet.
    if (request.mode === "navigate") {
        event.respondWith(
            fetch(request)
                .then(response => {
                    if (response && response.ok) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(request, copy);
                        });
                    }
                    return response;
                })
                .catch(async () => {
                    return await caches.match(request) ||
                           await caches.match("./index.html");
                })
        );
        return;
    }

    // Para CSS, JavaScript, imágenes y otros recursos: caché primero.
    event.respondWith(
        caches.match(request).then(cachedResponse => {
            if (cachedResponse) return cachedResponse;

            return fetch(request).then(response => {
                if (response && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, copy);
                    });
                }
                return response;
            });
        })
    );
});