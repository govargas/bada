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
 * IMPORTANT: subscribe to auth status via selector so the query refetches on
 * login/logout. The session cookie identifies the user, so the key is static.
 */
export function useFavorites() {
  const status = useAuth((s) => s.status);
  return useQuery<Favorite[]>({
    queryKey: ["favorites"],
    enabled: status === "authenticated",
    queryFn: () => apiFetch("/favorites"),
    staleTime: 60_000,
    // keepPreviousData: true, // optional for smoother transitions
  });
}

/**
 * Add a new favorite by beachId.
 */
export function useAddFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (beachId: string) =>
      apiFetch<Favorite>("/favorites", {
        method: "POST",
        body: JSON.stringify({ beachId }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * Remove a favorite (by _id or by beachId) with a small optimistic update.
 */
export function useRemoveFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (vars: { id?: string; beachId?: string }) => {
      const url = vars.id
        ? `/favorites/${vars.id}`
        : `/favorites/by-beach/${vars.beachId}`;
      return apiFetch<void>(url, { method: "DELETE" });
    },
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["favorites"] });
      const prev = qc.getQueryData<Favorite[]>(["favorites"]);
      if (prev) {
        const next = prev.filter((f) =>
          vars.id ? f._id !== vars.id : f.beachId !== vars.beachId
        );
        qc.setQueryData(["favorites"], next);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["favorites"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}

/**
 * Persist custom order of favorites on the server.
 * Accepts an array of beachIds in the desired order.
 */
export function useReorderFavorites() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (order: string[]) =>
      apiFetch<void>("/favorites/reorder", {
        method: "PATCH",
        body: JSON.stringify({ order }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
    },
  });
}
