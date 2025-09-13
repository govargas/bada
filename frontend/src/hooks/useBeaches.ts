// frontend/src/hooks/useBeaches.ts
import { useQuery } from "@tanstack/react-query";
import { fetchBeaches, fetchBeach } from "../api/beaches";
import type { BeachSummary, BeachDetail } from "../types/beaches";

export function useBeaches() {
  return useQuery<BeachSummary[]>({
    queryKey: ["beaches"],
    queryFn: fetchBeaches,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBeachDetail(id: string | undefined) {
  return useQuery<BeachDetail>({
    queryKey: ["beach", id],
    enabled: !!id,
    queryFn: () => fetchBeach(id!),
    staleTime: 5 * 60 * 1000,
  });
}
