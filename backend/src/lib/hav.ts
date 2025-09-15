import { cache } from "./cache.js";

/**
 * Env
 * - HAV_BASE_URL: v1 base, e.g. https://badplatsen.havochvatten.se/badplatsen/api
 * - HAV_USER_AGENT: something like 'BADA/1.0 (contact: you@example.com)'
 * - HAV_V2_BASE_URL: v2 base, e.g. https://api.havochvatten.se/bathingwaters/v2
 */
const HAV_BASE_URL = process.env.HAV_BASE_URL!;
const HAV_USER_AGENT = process.env.HAV_USER_AGENT!;
const HAV_V2_BASE_URL = process.env.HAV_V2_BASE_URL!;

function key(k: string) {
  return `hav:${k}`;
}

/* ---------------- v1 (Badplatsen) ---------------- */

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

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HaV v1 error ${res.status} ${res.statusText}: ${text}`);
  }

  const data = await res.json();
  cache.set(k, data, ttlMs);
  return data;
}

/* ---------------- v2 (Bathing Waters API) ---------------- */

/**
 * Minimal v2 fetcher. Add simple cache since results don’t change often.
 */
export async function havV2Get<T>(
  path: string,
  ttlMs = 5 * 60 * 1000,
  init?: RequestInit
): Promise<T> {
  const k = key(`v2:${path}`);
  const cached = cache.get(k);
  if (cached) return cached as T;

  const url = `${HAV_V2_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
      // Add UA if the API requires/helps with diagnostics:
      "User-Agent": HAV_USER_AGENT,
    },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HaV v2 error ${res.status} ${res.statusText}: ${text}`);
  }

  const data = (await res.json()) as T;
  cache.set(k, data, ttlMs);
  return data;
}

/**
 * Returns latest water sample date (ISO string) for a bathing water id,
 * or null if no dated results exist.
 *
 * Swagger notes: v2 `/bathing-waters/{id}/results` returns an object with `results: MonitoringResult[]`
 * and each item can include `takenAt` (ISO timestamp).
 */
export async function getLatestSampleDate(id: string): Promise<string | null> {
  type MonitoringResult = { takenAt?: string | null };
  type ResultsEnvelope = { results?: MonitoringResult[] };

  const data = await havV2Get<ResultsEnvelope>(
    `/bathing-waters/${encodeURIComponent(id)}/results`
  );

  const latest =
    (data.results ?? [])
      .map((r) => r.takenAt)
      .filter((d): d is string => !!d)
      // Sort desc by ISO date string
      .sort((a, b) => (a < b ? 1 : a > b ? -1 : 0))[0] ?? null;

  return latest;
}
