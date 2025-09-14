import { useEffect, useMemo } from "react";
import { fetchBeaches } from "../api/beaches";
import { BeachSummary } from "../types/beaches";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceKm, formatKm } from "../utils/geo";

export default function BeachesList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["beaches"],
    queryFn: fetchBeaches,
    staleTime: 5 * 60 * 1000,
  });

  const {
    coords,
    loading: geoLoading,
    error: geoError,
    request,
  } = useGeolocation();

  // Re-sort by proximity when coords arrive (no re-fetch needed)
  const items = useMemo(() => {
    if (!data) return [] as BeachSummary[];
    if (!coords) return data;

    const withDist = data.map((b) => {
      const km = distanceKm(
        { lat: coords.lat, lon: coords.lon },
        { lat: b.lat, lon: b.lon }
      );
      return { ...b, _distanceKm: km } as BeachSummary & {
        _distanceKm: number;
      };
    });

    return withDist.sort((a, b) => a._distanceKm - b._distanceKm);
  }, [data, coords]);

  // optional: ensure we refetch once on mount in case cache is empty
  useEffect(() => {
    if (!data && !isLoading) refetch();
  }, [data, isLoading, refetch]);

  if (isLoading) return <p>Loading beaches…</p>;
  if (isError)
    return <p>Could not load beaches. {(error as Error)?.message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-card border border-border bg-surface-muted hover:bg-surface/60"
          onClick={request}
          disabled={geoLoading}
        >
          {geoLoading ? "Getting location…" : "Use current location"}
        </button>

        {coords && (
          <span className="text-ink-muted text-sm">
            Using your location for proximity.
          </span>
        )}
        {geoError && <span className="text-red-600 text-sm">{geoError}</span>}
      </div>

      <ul className="space-y-3">
        {items.slice(0, 50).map((b) => (
          <li key={b.id} className="border-b border-border pb-3">
            <Link to={`/beach/${b.id}`} className="block">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-spectral text-xl">{b.name}</h3>
                {/* distance pill if available */}
                {"_distanceKm" in b && (
                  <span className="badge">
                    {formatKm((b as any)._distanceKm)}
                  </span>
                )}
              </div>
              <p className="text-ink-muted text-sm">
                {b.municipality} — {b.lat.toFixed(4)}, {b.lon.toFixed(4)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
