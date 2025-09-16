// frontend/src/components/BeachesList.tsx
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import MapView from "./MapView";

import { fetchBeaches } from "../api/beaches";
import { BeachSummary } from "../types/beaches";
import { useGeolocation } from "../hooks/useGeolocation";
import { distanceKm, formatKm } from "../utils/geo";
import { useUI } from "../store/ui";

// Defaults
const SERGELS_TORG = { lat: 59.3326, lon: 18.0649 };
const DEFAULT_RADIUS_KM = 20;
const NEARBY_RADIUS_KM = 10;

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

  // Build a distance-annotated array (used for sorting + badge)
  const items = useMemo<(BeachSummary & { _distanceKm?: number })[]>(() => {
    if (!data) return [];

    // reference point for distance: center in default/nearby; none for viewport
    const refPoint = mode === "viewport" ? null : center;

    // Always include _distanceKm (undefined if no ref point) so the type is stable
    const withDist = data.map((b) => {
      const km = refPoint
        ? distanceKm(
            { lat: refPoint.lat, lon: refPoint.lon },
            { lat: b.lat, lon: b.lon }
          )
        : undefined;
      return { ...b, _distanceKm: km };
    });

    // Sort only if we have distances
    return refPoint
      ? withDist.sort((a, b) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0))
      : withDist;
  }, [data, center, mode]);

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
      // show beaches inside current map view
      return filteredBySearch.filter(
        (b) =>
          b.lon >= bounds.west &&
          b.lon <= bounds.east &&
          b.lat >= bounds.south &&
          b.lat <= bounds.north
      );
    }

    // default/nearby → use radius from current center
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

  // When geolocation coordinates arrive/changes, switch to nearby mode and fit
  useEffect(() => {
    if (!coords) return;
    setCenter({ lat: coords.lat, lon: coords.lon });
    setRadiusKm(NEARBY_RADIUS_KM);
    setMode("nearby");
  }, [coords]);

  // “Use current location” — request permission/position (no return value expected)
  const handleUseLocation = async () => {
    await request();
    // coords effect above will run when the hook sets coordinates
  };

  // Map move -> switch to viewport mode and filter by bounds
  const handleMoveEnd = (e: {
    bounds: { west: number; south: number; east: number; north: number };
    center: { lon: number; lat: number };
    zoom: number;
  }) => {
    setBounds(e.bounds);
    setMode("viewport");
  };

  // Focus prop for the map: in default/nearby we guide the map to center+radius
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

  if ((q || mode !== "default") && filtered.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface-muted p-4">
        <p className="font-spectral text-lg">No matches here.</p>
        <p className="text-sm text-ink-muted mt-1">
          {mode === "viewport"
            ? "Pan or zoom to a different area."
            : `Try widening the radius around this area.`}
        </p>
      </div>
    );
  }

  /* ---------- UI ---------- */
  return (
    <div className="space-y-4">
      {/* Controls + status */}
      <div className="flex items-center gap-3">
        <button
          className="px-3 py-2 rounded-2xl border border-border bg-surface-muted hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          onClick={handleUseLocation}
          disabled={geoLoading}
        >
          {geoLoading ? "Getting location…" : "Use current location"}
        </button>

        <div aria-live="polite" className="text-sm">
          {mode === "default" && (
            <span className="text-ink-muted">
              Default view: Sergels torg ± {DEFAULT_RADIUS_KM} km.
            </span>
          )}
          {mode === "nearby" && (
            <span className="text-ink-muted">
              Showing beaches within {NEARBY_RADIUS_KM} km & sorting by
              proximity.
            </span>
          )}
          {mode === "viewport" && (
            <span className="text-ink-muted">
              Showing beaches in the current map view.
            </span>
          )}
          {geoError && <span className="text-red-600"> {geoError}</span>}
        </div>
      </div>

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
