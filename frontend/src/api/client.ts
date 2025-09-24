import { useAuth } from "@/store/auth";

const API_BASE = import.meta.env.VITE_API_BASE;

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const token = useAuth.getState().token; // read current token without subscribing
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  // Optional: normalize common error shapes from backend
  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {
      // ignore parse error
    }
    const error = new Error(body?.error || res.statusText);
    (error as any).status = res.status;
    (error as any).details = body;
    throw error;
  }

  // For 204 No Content
  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}
