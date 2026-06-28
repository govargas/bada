import { apiFetch } from "./client";

/**
 * Permanently delete the authenticated user's account and all their data.
 * The auth token is attached automatically by apiFetch.
 */
export function deleteAccount(): Promise<{ ok: true }> {
  return apiFetch<{ ok: true }>("/auth/me", { method: "DELETE" });
}
