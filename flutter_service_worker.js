'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "assets/AssetManifest.json": "e88f9448a50e460e964cdbeeaa08a298",
"assets/assets/fonts/visuelt/VisueltPro-Black.ttf": "691b6f9aa3ee625e3cd8da2f8849a126",
"assets/assets/fonts/visuelt/VisueltPro-Bold.ttf": "18acd33c965a455418d4204f0f334ea8",
"assets/assets/fonts/visuelt/VisueltPro-ExtraLight.ttf": "90bfa0766e43260710e3c6ac0f78c9e9",
"assets/assets/fonts/visuelt/VisueltPro-Light.ttf": "2a1df2ff00c2611bf1b7fdeeaeebfa59",
"assets/assets/fonts/visuelt/VisueltPro-Medium.ttf": "cf4dbc20776a2b309fe30a9bbfe7de0a",
"assets/assets/fonts/visuelt/VisueltPro-Regular.ttf": "0f8cd2494eb8c5e3a33352b2dd38fd61",
"assets/assets/fonts/visuelt/VisueltPro-Thin.ttf": "82d7b5b67c24f00acb08f2dccf1fd03b",
"assets/assets/images/circle.png": "663d5187ada8666bfa87120d1665605f",
"assets/assets/images/david-cobbina-cv.pdf": "13e9e3eed9b9cab2e41ffb3f63fcd6d3",
"assets/assets/images/DAVID_COBBINA_CV.pdf": "13e9e3eed9b9cab2e41ffb3f63fcd6d3",
"assets/assets/images/david_legend.png": "1858888dd1cd4e89ae185d37b1bc52c7",
"assets/assets/images/dev_meditate.png": "96b85147712203308377a05755eb5d87",
"assets/assets/images/skills.png": "2bd1870ebedbbd39a41827675a2846c3",
"assets/assets/images/skills1.png": "77752281625f377820cdc5de7e66512c",
"assets/assets/images/skills2.png": "5849f99db0aaf1026199cd184087deae",
"assets/assets/images/works.png": "5c6f8eb3a22f703781aad6c2528cf0cd",
"assets/FontManifest.json": "a78f950d25c1e29b92a4a309465e60cd",
"assets/fonts/MaterialIcons-Regular.otf": "e7069dfd19b331be16bed984668fe080",
"assets/NOTICES": "a60752081e030da2474fd63ea48d416f",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "6d342eb68f170c97609e9da345464e5e",
"assets/packages/flutter_feather_icons/fonts/feather.ttf": "c96dc22ca29a082af83cce866d35cebc",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "3241d1d9c15448a4da96df05f3292ffe",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "eaed33dc9678381a55cb5c13edaf241d",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "ffed6899ceb84c60a1efa51c809a57e4",
"assets/shaders/ink_sparkle.frag": "a04e492a05f9fd1a8cc6f12163b184dd",
"canvaskit/canvaskit.js": "687636ce014616f8b829c44074231939",
"canvaskit/canvaskit.wasm": "d4972dbefe733345d4eabb87d17fcb5f",
"canvaskit/profiling/canvaskit.js": "ba8aac0ba37d0bfa3c9a5f77c761b88b",
"canvaskit/profiling/canvaskit.wasm": "05ad694fda6cfca3f9bbac4b18358f93",
"flutter.js": "195f32f4217e034162a6697208586f44",
"icons/logo-aerium-1.png": "c9c1749b275f61ebc563d6596ccf2569",
"icons/logo-aerium-2.png": "58b131c1e81194452cb702693c040a92",
"index.html": "e7689e2e118fb459265b2305dc250b1a",
"/": "e7689e2e118fb459265b2305dc250b1a",
"main.dart.js": "139a5aac42c95dd7a2cb8d22ff96998c",
"manifest.json": "2e28cebc1e27a999e5b0da349afad267",
"version.json": "a8bb8d7849c8c8260fb219a37233d33a"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "main.dart.js",
"index.html",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
