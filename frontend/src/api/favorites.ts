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

/**
 * List favorites for the current user.
 * IMPORTANT: subscribe to token via selector so the query updates on login/logout.
 */
export function useFavorites() {
  const token = useAuth((s) => s.token);
  return useQuery<Favorite[]>({
    queryKey: ["favorites", token],
    enabled: !!token,
    queryFn: () => apiFetch("/favorites"),
    staleTime: 60_000,
    // keepPreviousData: true, // optional for smoother transitions
  });
}

/**
 * Add a new favorite by beachId.
 * OK to use getState() in mutations to avoid unnecessary re-renders.
 */
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

/**
 * Remove a favorite (by _id or by beachId) with a small optimistic update.
 */
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

/**
 * Persist custom order of favorites on the server.
 * Accepts an array of beachIds in the desired order.
 */
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
