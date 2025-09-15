import { cache } from "./cache.js";

const HAV_BASE_URL = process.env.HAV_BASE_URL!;
const HAV_USER_AGENT = process.env.HAV_USER_AGENT!;

// Helper to build a cache key
function key(path: string) {
  return `hav:${path}`;
}

// Generic fetch wrapper with caching
export async function havGet(path: string, ttlMs = 5 * 60 * 1000) {
  const k = key(path);
  const cached = cache.get(k);
  if (cached) {
    return cached; // ✅ serve from memory if not expired
  }

  const url = `${HAV_BASE_URL}${path}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": HAV_USER_AGENT,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`HaV API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  cache.set(k, data, ttlMs); // ✅ cache result
  return data;
}
