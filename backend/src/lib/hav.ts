// backend/src/lib/hav.ts
import { cache } from "./cache.js";

const HAV_BASE_URL = process.env.HAV_BASE_URL!;
const HAV_USER_AGENT = process.env.HAV_USER_AGENT!;

// Accept either HAV_V2_BASE or HAV_V2_BASE_URL (backward-compatible)
const HAV_V2_BASE =
  process.env.HAV_V2_BASE || process.env.HAV_V2_BASE_URL || "";

if (!HAV_BASE_URL) throw new Error("HAV_BASE_URL not set");
if (!HAV_USER_AGENT) throw new Error("HAV_USER_AGENT not set");
if (!HAV_V2_BASE)
  console.warn(
    "[warn] HAV_V2_BASE(_URL) not set — latestSampleDate will be null"
  );

// Small key helper for the v1 cache
function key(path: string) {
  return `hav:${path}`;
}

// --- v1 fetcher (existing)
export async function havGet(path: string, ttlMs = 5 * 60 * 1000) {
  const k = key(`v1:${path}`);
  const cached = cache.get(k);
  if (cached) return cached;

  const url = `${HAV_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": HAV_USER_AGENT,
      Accept: "application/json",
    },
  });
  if (!res.ok)
    throw new Error(`HaV API error: ${res.status} ${res.statusText}`);
  const data = await res.json();
  cache.set(k, data, ttlMs);
  return data;
}

// --- v2 fetcher
export async function havV2Get<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  if (!HAV_V2_BASE) throw new Error("HAV_V2_BASE not configured");
  const url = `${HAV_V2_BASE}${path}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HaV v2 error ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Pull latest sample date from v2 results
export async function getLatestSampleDate(id: string): Promise<string | null> {
  type MonitoringResult = { takenAt?: string | null };
  type Results = { results?: MonitoringResult[] };

  const data = await havV2Get<Results>(
    `/bathing-waters/${encodeURIComponent(id)}/results`
  );
  const latest =
    (data.results ?? [])
      .map((r) => r.takenAt)
      .filter((d): d is string => !!d)
      .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))[0] ?? null;

  return latest;
}
