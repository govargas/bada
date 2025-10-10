// frontend/src/components/BeachesList.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import MapView from "./MapView";

import { fetchBeaches } from "../api/beaches";
import { BeachSummary } from "../types/beaches";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceKm, formatKm } from "../utils/geo";
import { useUI } from "../store/ui";

// Defaults
const SERGELS_TORG = { lat: 59.3326, lon: 18.0649 };
const DEFAULT_RADIUS_KM = 10;
const NEARBY_RADIUS_KM = 5;

type Mode = "default" | "nearby" | "viewport";

export default function BeachesList() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["beaches"],
    queryFn: fetchBeaches,
    staleTime: 5 * 60 * 1000,
  });

  // Global search text
  const search = useUI((s) => s.search);
  const q = search.trim().toLowerCase();

  // Geo hook
  const {
    coords,
    loading: geoLoading,
    error: geoError,
    request,
  } = useGeolocation();

  // View state (center/radius or viewport bounds)
  const [mode, setMode] = useState<Mode>("default");
  const [center, setCenter] = useState(SERGELS_TORG);
  const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
  const [bounds, setBounds] = useState<{
    west: number;
    south: number;
    east: number;
    north: number;
  } | null>(null);

  // Distance-annotated list (stable type)
  const items = useMemo<(BeachSummary & { _distanceKm?: number })[]>(() => {
    if (!data) return [];
    const refPoint = coords ? coords : mode === "viewport" ? null : center;
    const withDist = data.map((b) => {
      const km = refPoint
        ? distanceKm(
            { lat: refPoint.lat, lon: refPoint.lon },
            { lat: b.lat, lon: b.lon }
          )
        : undefined;
      return { ...b, _distanceKm: km };
    });
    return refPoint
      ? withDist.sort((a, b) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0))
      : withDist;
  }, [data, coords, center, mode]);

  // Text filter
  const filteredBySearch = useMemo(() => {
    if (!q) return items;
    return items.filter((b) => {
      const hay = `${b.name} ${b.municipality ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, q]);

  // Radius or viewport filter
  const filtered = useMemo(() => {
    if (mode === "viewport" && bounds) {
      return filteredBySearch.filter(
        (b) =>
          b.lon >= bounds.west &&
          b.lon <= bounds.east &&
          b.lat >= bounds.south &&
          b.lat <= bounds.north
      );
    }
    return filteredBySearch.filter((b) => {
      if (mode === "default" || mode === "nearby") {
        const km = distanceKm(center, { lat: b.lat, lon: b.lon });
        return km <= radiusKm;
      }
      return true;
    });
  }, [filteredBySearch, mode, bounds, center, radiusKm]);

  // Initial fetch safeguard
  useEffect(() => {
    if (!data && !isLoading) refetch();
  }, [data, isLoading, refetch]);

  // Geolocation → nearby mode
  useEffect(() => {
    if (!coords) return;
    setCenter({ lat: coords.lat, lon: coords.lon });
    setRadiusKm(NEARBY_RADIUS_KM);
    setMode("nearby");
  }, [coords]);

  const handleUseLocation = async () => {
    await request(); // coords effect handles the rest
  };

  // Map move → viewport mode
  const handleMoveEnd = (e: {
    bounds: { west: number; south: number; east: number; north: number };
    center: { lon: number; lat: number };
    zoom: number;
  }) => {
    setBounds(e.bounds);
    setMode("viewport");
  };

  const mapFocus =
    mode === "viewport"
      ? undefined
      : { center: { lon: center.lon, lat: center.lat }, radiusKm };

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
          className="mt-3 w-full px-3 py-3 rounded-2xl border border-border bg-surface hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
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

  if ((q || mode !== "default") && filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-muted p-4">
        <p className="font-spectral text-lg">No matches here.</p>
        <p className="text-sm text-ink-muted mt-1">
          {mode === "viewport"
            ? "Pan or zoom to a different area."
            : `Try widening the radius.`}
        </p>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="space-y-4">
      {/* Map */}
      <MapView
        points={filtered.map((b) => ({
          id: b.id,
          name: b.name,
          lat: b.lat,
          lon: b.lon,
        }))}
        focus={mapFocus}
        onMoveEnd={handleMoveEnd}
      />

      {/* Use current location — full width, now under the map */}
      <div className="px-0">
        <button
          className="w-full px-3 py-2 rounded-2xl border border-border bg-surface-muted hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={handleUseLocation}
          disabled={geoLoading}
        >
          {geoLoading ? "Getting location…" : "Use current location"}
        </button>
      </div>

      {/* List (keep to 50 for UX) */}
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
                {typeof b._distanceKm === "number" && (
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

function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-surface-muted p-3">
      <div className="h-5 w-2/3 bg-surface animate-pulse rounded" />
      <div className="h-4 w-1/3 bg-surface animate-pulse rounded mt-2" />
    </div>
  );
}
