import { cache } from "./cache.js";
const HAV_BASE_URL = process.env.HAV_BASE_URL;
const HAV_USER_AGENT = process.env.HAV_USER_AGENT || "BADA/1.0";
const HAV_V2_BASE = process.env.HAV_V2_BASE ?? "https://api.havochvatten.se/bathingwaters/v2";
function key(path) {
    return `hav:${path}`;
}
/** v1 fetcher (old endpoints like /feature, /detail) */
export async function havGet(path, ttlMs = 5 * 60 * 1000) {
    const k = key(`v1:${path}`);
    const cached = cache.get(k);
    if (cached)
        return cached;
    const url = `${HAV_BASE_URL}${path}`;
    // TEMP: trace outgoing in dev
    if (process.env.NODE_ENV !== "production") {
        console.log(`[HaV v1] GET ${url}`);
    }
    const res = await fetch(url, {
        headers: {
            "User-Agent": HAV_USER_AGENT,
            Accept: "application/json",
        },
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(`[HaV v1] ${res.status} ${res.statusText} for ${url}: ${text.slice(0, 500)}`);
        throw new Error(`HaV v1 error ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    cache.set(k, data, ttlMs);
    return data;
}
/** Minimal v2 fetcher (used for monitoring results, etc.) */
export async function havV2Get(path, init) {
    const url = `${HAV_V2_BASE}${path}`;
    if (process.env.NODE_ENV !== "production") {
        console.log(`[HaV v2] GET ${url}`);
    }
    const res = await fetch(url, {
        headers: { Accept: "application/json" },
        ...init,
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.warn(`[HaV v2] ${res.status} ${res.statusText} for ${url}: ${text.slice(0, 500)}`);
        throw new Error(`HaV v2 error ${res.status} ${res.statusText}`);
    }
    return res.json();
}
/** Pull latest sample date (ISO string) from /bathing-waters/{id}/results */
export async function getLatestSampleDate(id) {
    const data = await havV2Get(`/bathing-waters/${encodeURIComponent(id)}/results`);
    const latest = (data.results ?? [])
        .map((r) => r.takenAt)
        .filter((d) => !!d)
        .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))[0] ?? null;
    return latest;
}
//# sourceMappingURL=hav.js.map