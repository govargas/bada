/** v1 fetcher (old endpoints like /feature, /detail) */
export declare function havGet(path: string, ttlMs?: number): Promise<any>;
/** Minimal v2 fetcher (used for monitoring results, etc.) */
export declare function havV2Get<T>(path: string, init?: RequestInit): Promise<T>;
/** Pull latest sample date (ISO string) from /bathing-waters/{id}/results */
export declare function getLatestSampleDate(id: string): Promise<string | null>;
//# sourceMappingURL=hav.d.ts.map