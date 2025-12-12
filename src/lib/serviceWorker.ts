export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        console.log('[SW] Service Worker registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('[SW] New service worker found');

          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[SW] New service worker installed and ready');
              }
            });
          }
        });

        if (registration.waiting) {
          console.log('[SW] Service worker waiting');
        }

        if (registration.active) {
          console.log('[SW] Service worker active');
        }

        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);

      } catch (error) {
        console.error('[SW] Service Worker registration failed:', error);
      }
    });

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
}

export function precacheAssets(urls: string[]) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_URLS',
      urls
    });
  }
}

export function clearAllCaches() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CLEAR_CACHE'
    });
  }
}
