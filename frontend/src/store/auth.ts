import { create } from "zustand";
import { apiFetch } from "@/api/client";

export type AuthUser = { sub: string; email: string };
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

// Auth is now driven by an httpOnly session cookie the JS can't read, so we no
// longer hold a token. "Am I logged in?" is answered by asking the backend
// (GET /api/auth/me), and reflected here as `status`.
type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
  /** Ask the backend whether the session cookie is valid; hydrate status/user. */
  refresh: () => Promise<void>;
  /** Mark authenticated after a successful login (server already set the cookie). */
  setAuthenticated: (user: AuthUser) => void;
  /** Log out: clear the server cookie, then local state. */
  logout: () => Promise<void>;
  /** Clear local state only — e.g. after account deletion already cleared the cookie. */
  clearLocal: () => void;
};

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  refresh: async () => {
    try {
      const { user } = await apiFetch<{ user: AuthUser }>("/auth/me");
      set({ status: "authenticated", user });
    } catch {
      set({ status: "unauthenticated", user: null });
    }
  },
  setAuthenticated: (user) => set({ status: "authenticated", user }),
  logout: async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Clear local state regardless of the network outcome.
    }
    set({ status: "unauthenticated", user: null });
  },
  clearLocal: () => set({ status: "unauthenticated", user: null }),
}));
