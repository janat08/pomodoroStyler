var cacheName = 'v1';
// var filesToCache = [
//     '/',
//     '/index.html',
//     '/hello-world.css'
// ];

self.addEventListener('install', event => {
    event.waitUntil(async function () {
      const cache = await caches.open(CACHE_NAME)
  
    //   await cache.addAll(CACHED_URLS)
    }())
  })

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // if (new URL(event.request.url).hostname == "localhost"){
  //   console.log('quiting')
  //   return
  // }
    event.respondWith(
      caches.open('mysite-dynamic').then(function(cache) {
        return cache.match(event.request).then(function(response) {
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          return response || fetchPromise;
        })
      })
    );
  });
  