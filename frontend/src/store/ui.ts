import { create } from "zustand";

type UIState = {
  search: string;
  setSearch: (value: string) => void;
};

export const useUI = create<UIState>((set) => ({
  search: "",
  setSearch: (value) => set({ search: value }),
}));
