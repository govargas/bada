import { create } from "zustand";

type UIState = {
  search: string;
  setSearch: (v: string) => void;
};

export const useUI = create<UIState>((set) => ({
  search: "",
  setSearch: (v) => set({ search: v }),
}));
