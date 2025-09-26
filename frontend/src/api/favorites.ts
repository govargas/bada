import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { useAuth } from "@/store/auth";

export type Favorite = {
  _id: string;
  userId?: string;
  beachId: string;
  note?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export function useFavorites() {
  const token = useAuth.getState().token;
  return useQuery<Favorite[]>({
    queryKey: ["favorites", token],
    enabled: !!token,
    queryFn: () => apiFetch("/favorites"),
    staleTime: 60_000,
  });
}

export function useAddFavorite() {
  const qc = useQueryClient();
  const token = useAuth.getState().token;

  return useMutation({
    mutationFn: (beachId: string) =>
      apiFetch<Favorite>("/favorites", {
        method: "POST",
        body: JSON.stringify({ beachId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", token] });
    },
  });
}

export function useRemoveFavorite() {
  const qc = useQueryClient();
  const token = useAuth.getState().token;

  return useMutation({
    mutationFn: (vars: { id?: string; beachId?: string }) => {
      const url = vars.id
        ? `/favorites/${vars.id}`
        : `/favorites/by-beach/${vars.beachId}`;
      return apiFetch<void>(url, { method: "DELETE" });
    },
    // small optimistic update (works for either id or beachId)
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["favorites", token] });
      const prev = qc.getQueryData<Favorite[]>(["favorites", token]);

      if (prev) {
        const next = prev.filter((f) =>
          vars.id ? f._id !== vars.id : f.beachId !== vars.beachId
        );
        qc.setQueryData(["favorites", token], next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["favorites", token], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites", token] });
    },
  });
}

export function useReorderFavorites() {
  const qc = useQueryClient();
  const token = useAuth.getState().token;
  return useMutation({
    mutationFn: (order: string[]) =>
      apiFetch<void>("/favorites/reorder", {
        method: "PATCH",
        body: JSON.stringify({ order }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", token] });
    },
  });
}
