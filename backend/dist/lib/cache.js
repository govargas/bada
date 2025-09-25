export class SimpleCache {
    defaultTtlMs;
    store = new Map();
    constructor(defaultTtlMs = 60_000) {
        this.defaultTtlMs = defaultTtlMs;
    } // default 60s
    get(key) {
        const hit = this.store.get(key);
        if (!hit)
            return;
        if (Date.now() > hit.expiry) {
            this.store.delete(key);
            return;
        }
        return hit.value;
    }
    set(key, value, ttlMs = this.defaultTtlMs) {
        this.store.set(key, { value, expiry: Date.now() + ttlMs });
    }
}
export const cache = new SimpleCache(60_000); // 60s default
//# sourceMappingURL=cache.js.map