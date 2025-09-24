import { create } from "zustand";

type AuthState = {
  token: string | null;
  setToken: (t: string | null) => void;
  clearToken: () => void;
};

const TOKEN_KEY = "bada_token";

export const useAuth = create<AuthState>((set) => {
  // hydrate from localStorage on first run
  const initialToken =
    typeof window !== "undefined"
      ? window.localStorage.getItem(TOKEN_KEY)
      : null;

  return {
    token: initialToken,
    setToken: (t) => {
      if (t) {
        window.localStorage.setItem(TOKEN_KEY, t);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      set({ token: t });
    },
    clearToken: () => {
      window.localStorage.removeItem(TOKEN_KEY);
      set({ token: null });
    },
  };
});

export const isAuthenticated = () => !!useAuth.getState().token;
export const TOKEN_STORAGE_KEY = TOKEN_KEY;
