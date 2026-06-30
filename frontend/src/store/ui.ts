import { create } from "zustand";

type UIState = {
  search: string;
  homeResetVersion: number;
  setSearch: (v: string) => void;
  resetHomeView: () => void;
};

export const useUI = create<UIState>((set) => ({
  search: "",
  homeResetVersion: 0,
  setSearch: (v) => set({ search: v }),
  resetHomeView: () =>
    set((state) => ({
      search: "",
      homeResetVersion: state.homeResetVersion + 1,
    })),
}));
