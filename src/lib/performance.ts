export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage));
}

export function lazyLoadImage(img: HTMLImageElement) {
  const src = img.dataset.src;
  if (!src) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLImageElement;
        element.src = element.dataset.src || '';
        element.removeAttribute('data-src');
        observer.unobserve(element);
      }
    });
  }, {
    rootMargin: '50px'
  });

  observer.observe(img);
}

export function prefetchRoute(route: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}

export function preconnect(url: string) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  document.head.appendChild(link);
}

export function deferScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
}

export async function measureAsync(name: string, fn: () => Promise<any>) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
  return result;
}

export function optimizeRender(component: React.ComponentType<any>) {
  return React.memo(component, (prevProps, nextProps) => {
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

export function batchUpdates<T>(
  updates: T[],
  callback: (batch: T[]) => void,
  batchSize: number = 10,
  delay: number = 50
) {
  let batch: T[] = [];
  let timeout: NodeJS.Timeout;

  updates.forEach((update, index) => {
    batch.push(update);

    if (batch.length >= batchSize || index === updates.length - 1) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        callback([...batch]);
        batch = [];
      }, delay);
    }
  });
}

export function useVirtualizeList<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  scrollTop: number
): {
  visibleItems: T[];
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
} {
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  return {
    visibleItems: items.slice(startIndex, endIndex),
    startIndex,
    endIndex,
    totalHeight: items.length * itemHeight,
    offsetY: startIndex * itemHeight
  };
}

export const performanceMonitor = {
  marks: new Map<string, number>(),

  start(name: string) {
    this.marks.set(name, performance.now());
  },

  end(name: string) {
    const start = this.marks.get(name);
    if (start) {
      const duration = performance.now() - start;
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
      this.marks.delete(name);
      return duration;
    }
    return 0;
  },

  measure(name: string, fn: () => void) {
    this.start(name);
    fn();
    return this.end(name);
  },

  async measureAsync(name: string, fn: () => Promise<any>) {
    this.start(name);
    const result = await fn();
    this.end(name);
    return result;
  }
};

import React from 'react';
