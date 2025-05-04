// static/sw.js

// static/sw.js

// Increment cache version when SW changes
const CACHE_NAME = 'self-discipline-pwa-cache-v2';
const urlsToCache = [
  '/', // Root path
  '/sleep',
  '/exercise',
  '/study',
  '/styles.css', // Main CSS file (served from root)
  '/favicon.ico', // Favicon (served from root)
  '/logo.svg', // Logo (served from root)
  '/manifest.json', // Manifest file (served from root)
  // 注意：Fresh 生成的 JS 文件名是动态的，包含哈希值。
  // 我们不能直接缓存它们。Service Worker 需要更复杂的逻辑来处理动态导入的 Island JS。
  // 一个简单的策略是缓存所有 JS 请求，但这可能导致缓存过多或过旧的文件。
  // 更优的策略是在构建时生成一个包含所有资源（包括带哈希的 JS）的列表，
  // 或者在运行时动态缓存 JS 请求。
  // 这里我们暂时不显式缓存 Fresh 生成的 JS，依赖浏览器缓存和 Network First 策略。
];

// 安装 Service Worker 时触发
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // 预缓存核心资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        // 使用 addAll 原子性地添加资源，如果任何一个失败，整个操作都会失败。
        // 对于 Fresh 的动态 JS，我们暂时不加入预缓存列表。
        // The urlsToCache should already have correct root-relative paths
        // Filter out JS files for now as they are dynamic in Fresh
        const urlsToPreCache = urlsToCache.filter(url => !url.includes('.js'));
        console.log('Service Worker: Pre-caching:', urlsToPreCache);
        return cache.addAll(urlsToPreCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete, skipping waiting.');
        // 强制新的 Service Worker 立即激活，而不是等待旧的 SW 停止
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Caching failed during install:', error);
      })
  );
});

// 激活 Service Worker 时触发
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // 清理旧版本的缓存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete, claiming clients.');
      // 让 Service Worker 控制当前打开的所有页面
      return self.clients.claim();
    })
  );
});

// 拦截网络请求时触发
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求和 GET 请求
  if (url.origin !== location.origin || request.method !== 'GET') {
    // 对于非 GET 请求或跨域请求，直接返回网络响应
    return;
  }

  // 优先处理导航请求 (HTML 页面) - Network First
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 如果网络请求成功，克隆响应并存入缓存
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // 使用请求的 URL 作为键
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // 如果网络请求失败，尝试从缓存中获取
          console.log(`Service Worker: Network failed for navigation to ${url.pathname}, trying cache.`);
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // 如果缓存中也没有，可以返回一个离线页面（如果准备了的话）
            // return caches.match('/offline.html');
            console.warn(`Service Worker: No cache match found for navigation to ${url.pathname}`);
            // 返回一个基本的错误响应或让浏览器处理
             return new Response("Network error and no cache available.", { status: 503, statusText: "Service Unavailable" });
          });
        })
    );
    return; // 结束导航请求处理
  }

  // 处理其他静态资源请求 (CSS, Images, JS etc.) - Cache First
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // 如果缓存命中，直接返回缓存的响应
        if (cachedResponse) {
          // console.log(`Service Worker: Serving from cache: ${url.pathname}`);
          return cachedResponse;
        }

        // 如果缓存未命中，发起网络请求
        // console.log(`Service Worker: Cache miss, fetching from network: ${url.pathname}`);
        return fetch(request).then((networkResponse) => {
          // 检查响应是否有效
          // 我们需要缓存 'basic' 和 'opaque' 类型的响应 (例如来自 CDN 的 JS/CSS)
          // 但只缓存状态码为 200 的 'basic' 响应
          if (!networkResponse || (networkResponse.type === 'basic' && networkResponse.status !== 200)) {
            return networkResponse;
          }

          // 克隆响应，因为响应体只能被读取一次
          const responseToCache = networkResponse.clone();

          // 将新的响应存入缓存
          caches.open(CACHE_NAME)
            .then((cache) => {
              // console.log(`Service Worker: Caching new resource: ${url.pathname}`);
              cache.put(request, responseToCache);
            });

          return networkResponse;
        }).catch(error => {
          console.error(`Service Worker: Fetch failed for ${url.pathname}:`, error);
          // 对于静态资源加载失败，可以返回一个占位符或错误响应
          // 例如，对于图片：return caches.match('/static/placeholder.png');
          // 对于 JS/CSS，可能最好还是抛出错误让页面知道加载失败
          // 返回一个简单的文本响应表示错误
          return new Response(`Failed to fetch ${url.pathname}`, { status: 503, statusText: 'Service Unavailable' });
        });
      })
  );
});