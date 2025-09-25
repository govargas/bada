import { useQueries, UseQueryResult } from "@tanstack/react-query";
import { fetchBeach } from "@/api/beaches";
import type { BeachDetail } from "@/types/beaches";

export function useBeachDetails(ids: string[] | undefined) {
  const queries = useQueries({
    queries: (ids ?? []).map((id) => ({
      queryKey: ["beach", id],
      queryFn: () => fetchBeach(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
    })),
  }) as UseQueryResult<BeachDetail, Error>[];

  const byId = new Map<string, BeachDetail>();
  queries.forEach((q, i) => {
    const id = ids?.[i];
    if (id && q.data) byId.set(id, q.data);
  });

  return {
    byId,
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
  };
}
