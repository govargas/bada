type Entry<T> = { value: T; expiry: number };

export class SimpleCache {
  private store = new Map<string, Entry<any>>();

  constructor(private defaultTtlMs = 60_000) {} // default 60s

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return;
    if (Date.now() > hit.expiry) {
      this.store.delete(key);
      return;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.defaultTtlMs) {
    this.store.set(key, { value, expiry: Date.now() + ttlMs });
  }
}

export const cache = new SimpleCache(60_000); // 60s default
