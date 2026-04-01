const CACHE_NAME = 'blacktop-v2'
const APP_SHELL = ['/blacktop/', '/blacktop/manifest.webmanifest', '/blacktop/favicon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const request = event.request
  const isNavigation = request.mode === 'navigate'

  // Per HTML/navigation: network-first, così evitiamo index.html stantio.
  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || caches.match('/blacktop/')
        })
    )
    return
  }

  // Per asset statici: cache-first con fallback rete.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached

      return fetch(request).then((response) => {
        if (!response || response.status !== 200) return response

        const cloned = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, cloned))
        return response
      })
    })
  )
})
