/**
 * Lightweight in-memory TTL cache for routing/embedding results.
 * This is intentionally simple; replace with Redis/semantic cache later.
 */

type CacheValue<T> = {
  value: T;
  expiresAt: number;
  hits: number;
};

export class TTLCache<T> {
  private store = new Map<string, CacheValue<T>>();

  constructor(private ttlMs: number, private maxSize = 5000) {}

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    entry.hits += 1;
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      this.store.delete(firstKey);
    }
    this.store.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs,
      hits: 0,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const classificationCache = new TTLCache<any>(5 * 60 * 1000, 2000);
export const embeddingCache = new TTLCache<any>(30 * 60 * 1000, 2000);
