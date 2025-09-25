export declare class SimpleCache {
    private defaultTtlMs;
    private store;
    constructor(defaultTtlMs?: number);
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T, ttlMs?: number): void;
}
export declare const cache: SimpleCache;
//# sourceMappingURL=cache.d.ts.map