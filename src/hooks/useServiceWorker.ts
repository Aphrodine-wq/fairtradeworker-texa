import { useEffect, useState } from 'react';

const MAX_QUEUE_ITEMS = 50;
const MAX_BODY_LENGTH = 50_000;

const trimBody = (body?: string) => {
  if (!body) return undefined;
  if (body.length <= MAX_BODY_LENGTH) return body;
  console.warn(`[OfflineQueue] Trimming large body from ${body.length} to ${MAX_BODY_LENGTH} characters`);
  return body.slice(0, MAX_BODY_LENGTH);
};

export function useServiceWorker() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      setIsInstalling(true);
      const reg = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setRegistration(reg);
      setIsInstalling(false);

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedsUpdate(true);
            }
          });
        }
      });

      await navigator.serviceWorker.ready;
      console.log('[SW] Service worker ready');
    } catch (error) {
      console.error('[SW] Registration failed:', error);
      setIsInstalling(false);
    }
  };

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const cacheUrls = (urls: string[]) => {
    if (registration?.active) {
      registration.active.postMessage({ type: 'CACHE_URLS', urls });
    }
  };

  const clearCache = () => {
    if (registration?.active) {
      registration.active.postMessage({ type: 'CLEAR_CACHE' });
    }
  };

  return {
    registration,
    isOnline,
    needsUpdate,
    isInstalling,
    updateServiceWorker,
    cacheUrls,
    clearCache
  };
}

export function useOfflineQueue() {
  const [queue, setQueue] = useState<Array<{
    id: string;
    url: string;
    method: string;
    headers: Record<string, string>;
    body?: string;
    timestamp: number;
  }>>([]);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    try {
      const stored = await window.spark.kv.get<typeof queue>('offline-queue');
      if (stored?.length) {
        const trimmed = stored.slice(-MAX_QUEUE_ITEMS);
        if (trimmed.length !== stored.length) {
          await window.spark.kv.set('offline-queue', trimmed);
        }
        setQueue(trimmed);
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  };

  const addToQueue = async (item: Omit<typeof queue[0], 'id' | 'timestamp'>) => {
    let dropped = 0;
    const newItem = {
      ...item,
      body: trimBody(item.body),
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now()
    };

    let nextQueue: typeof queue = [];
    setQueue((current) => {
      const merged = [...current, newItem];
      const trimmed = merged.length > MAX_QUEUE_ITEMS
        ? merged.slice(merged.length - MAX_QUEUE_ITEMS)
        : merged;
      dropped = merged.length - trimmed.length;
      nextQueue = trimmed;
      return trimmed;
    });

    if (dropped > 0) {
      console.warn(`[OfflineQueue] Dropped ${dropped} queued request(s) to stay within memory limits`);
    }

    await window.spark.kv.set('offline-queue', nextQueue);
  };

  const removeFromQueue = async (id: string) => {
    const newQueue = queue.filter(item => item.id !== id);
    setQueue(newQueue);
    await window.spark.kv.set('offline-queue', newQueue);
  };

  const clearQueue = async () => {
    setQueue([]);
    await window.spark.kv.delete('offline-queue');
  };

  const processQueue = async () => {
    for (const item of queue) {
      try {
        await fetch(item.url, {
          method: item.method,
          headers: item.headers,
          body: item.body
        });
        await removeFromQueue(item.id);
      } catch (error) {
        console.error('Failed to process queue item:', item, error);
      }
    }
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue
  };
}

export function usePrefetch() {
  const prefetch = (urls: string[]) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_URLS',
        urls
      });
    }
  };

  const prefetchJob = async (jobId: string) => {
    const urls = [
      `/api/jobs/${jobId}`,
      `/api/jobs/${jobId}/bids`,
      `/api/jobs/${jobId}/messages`
    ];
    prefetch(urls);
  };

  const prefetchUserData = async (userId: string) => {
    const urls = [
      `/api/users/${userId}`,
      `/api/users/${userId}/jobs`,
      `/api/users/${userId}/reviews`
    ];
    prefetch(urls);
  };

  return {
    prefetch,
    prefetchJob,
    prefetchUserData
  };
}
