import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getToken } from "../utils/auth";

const API_BASE =
  import.meta.env.VITE_API_BASE ?? "https://bada-backend.vercel.app/api";

export type Favorite = {
  _id: string;
  userId?: string;
  beachId: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function useFavorites() {
  const token = getToken();
  return useQuery({
    queryKey: ["favorites", token],
    enabled: !!token,
    queryFn: async (): Promise<Favorite[]> => {
      const res = await fetch(`${API_BASE}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch favorites");
      return res.json();
    },
    staleTime: 60_000,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  const token = getToken();
  return useMutation({
    mutationFn: async (beachId: string) => {
      const res = await fetch(`${API_BASE}/favorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ beachId }),
      });
      if (!res.ok) throw new Error("Failed to add favorite");
      return res.json() as Promise<Favorite>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", token] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  const token = getToken();
  return useMutation({
    mutationFn: async (vars: { id?: string; beachId?: string }) => {
      const url = vars.id
        ? `${API_BASE}/favorites/${vars.id}`
        : `${API_BASE}/favorites/by-beach/${vars.beachId}`;
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to remove favorite");
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", token] });
    },
  });
}
