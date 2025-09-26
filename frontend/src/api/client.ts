import { useAuth } from "@/store/auth";
import { logApi } from "@/utils/logger";

const API_BASE = import.meta.env.VITE_API_BASE;

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  if (!API_BASE && !path.startsWith("http")) {
    throw new Error(
      "VITE_API_BASE is not set. Did you configure frontend/.env(.local)?"
    );
  }

  const token = useAuth.getState().token;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  logApi("→", options.method ?? "GET", url, { headers, body: options.body });

  const res = await fetch(url, { ...options, headers });

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
