import { logApi } from "@/utils/logger";

// Topology A requires the app to be same-origin with its API: in production we
// ALWAYS use the relative "/api" path, which Netlify proxies to the backend so
// the session cookie stays first-party. This is hardcoded for prod on purpose —
// a stale VITE_API_BASE pointing at the cross-site backend would silently break
// cookie auth. In dev, VITE_API_BASE points at a local backend.
const API_BASE = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_BASE ?? "/api";

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  logApi("→", options.method ?? "GET", url, {
    headers,
    body: options.body,
  });

  // credentials:"include" sends/receives the httpOnly session cookie, including
  // on the dev cross-origin (localhost:5180 → localhost:3000) case.
  const res = await fetch(url, { ...options, headers, credentials: "include" });

  logApi("←", res.status, res.statusText, url);

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      // non-JSON error response
    }
    const error = new Error(body?.error || res.statusText);
    (error as any).status = res.status;
    (error as any).details = body;
    throw error;
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
