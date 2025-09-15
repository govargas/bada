import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import MapView from "./MapView";

import { fetchBeaches } from "../api/beaches";
import { BeachSummary } from "../types/beaches";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceKm, formatKm } from "../utils/geo";
import { useUI } from "../store/ui";

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

  // Derive sorted items (nearest first when we have coords)
  const items = useMemo<(BeachSummary & { _distanceKm?: number })[]>(() => {
    if (!data) return [];
    if (!coords) return data;

    const withDist = data.map((b) => {
      const km = distanceKm(
        { lat: coords.lat, lon: coords.lon },
        { lat: b.lat, lon: b.lon }
      );
      return { ...b, _distanceKm: km };
    });

    return withDist.sort((a, b) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0));
  }, [data, coords]);

  // 🔎 Filter by search (from Zustand store)
  const search = useUI((s) => s.search);
  const q = search.trim().toLowerCase();

  const filtered = useMemo<(BeachSummary & { _distanceKm?: number })[]>(() => {
    if (!q) return items;
    return items.filter((b) => {
      const hay = `${b.name} ${b.municipality ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, q]);

  // Refetch once on mount if cache was empty
  useEffect(() => {
    if (!data && !isLoading) refetch();
  }, [data, isLoading, refetch]);

  /* ---------- STATES ---------- */
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-9 w-40 rounded-2xl bg-surface-muted animate-pulse" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-border bg-surface-muted p-4"
      >
        <p className="font-spectral text-lg">Could not load beaches.</p>
        <p className="text-sm text-ink-muted mt-1">
          {(error as Error)?.message ?? "Please try again."}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-3 px-3 py-2 rounded-2xl border border-border bg-surface hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-border bg-surface-muted p-4">
        <p className="font-spectral text-lg">No beaches found.</p>
        <p className="text-sm text-ink-muted mt-1">
          Try refreshing or adjusting the filters.
        </p>
      </div>
    );
  }

  if (q && filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-muted p-4">
        <p className="font-spectral text-lg">No matches.</p>
        <p className="text-sm text-ink-muted mt-1">
          Nothing matches “{search}”. Try a different name or municipality.
        </p>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="space-y-4">
      {/* Location action + status */}
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-2xl border border-border bg-surface-muted hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={request}
          disabled={geoLoading}
        >
          {geoLoading ? "Getting location…" : "Use current location"}
        </button>

        <div aria-live="polite" className="text-sm">
          {coords && (
            <span className="text-ink-muted">
              Sorting by proximity to your location.
            </span>
          )}
          {geoError && <span className="text-red-600">{geoError}</span>}
        </div>
      </div>

      {/* Map (mobile-first) */}
      <MapView
        points={filtered.slice(0, 200).map((b) => ({
          id: b.id,
          name: b.name,
          lat: b.lat,
          lon: b.lon,
        }))}
      />

      {/* Card list */}
      <ul className="space-y-3">
        {filtered.slice(0, 50).map((b) => (
          <li key={b.id}>
            <Link
              to={`/beach/${b.id}`}
              className="block rounded-2xl border border-border bg-surface-muted p-3 hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-spectral text-lg leading-tight truncate">
                    {b.name}
                  </h3>
                  <p className="text-ink-muted text-sm">
                    {b.municipality ?? "—"} • {b.lat.toFixed(4)},{" "}
                    {b.lon.toFixed(4)}
                  </p>
                </div>

                {"_distanceKm" in b && b._distanceKm !== undefined && (
                  <span className="badge shrink-0">
                    {formatKm(b._distanceKm)}
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** small skeleton block for loading state */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-3">
      <div className="h-5 w-2/3 bg-surface animate-pulse rounded" />
      <div className="h-4 w-1/3 bg-surface animate-pulse rounded mt-2" />
    </div>
  );
}
