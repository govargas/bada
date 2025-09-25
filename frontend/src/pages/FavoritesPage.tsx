import { useFavorites, useRemoveFavorite } from "@/api/favorites";
import { useBeachDetails } from "@/api/useBeachDetails";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";

function qualityClass(q?: number | string) {
  if (typeof q === "number") {
    return (
      ["kpi-excellent", "kpi-good", "kpi-sufficient", "kpi-poor"][q - 1] ??
      "kpi-unknown"
    );
  }
  const s = String(q ?? "").toLowerCase();
  if (s.includes("utmärkt")) return "kpi-excellent";
  if (s.includes("bra")) return "kpi-good";
  if (s.includes("tillfreds") || s.includes("sufficient"))
    return "kpi-sufficient";
  if (s.includes("dålig") || s.includes("poor")) return "kpi-poor";
  return "kpi-unknown";
}

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError, error } = useFavorites();
  const ids = favorites?.map((f) => f.beachId);
  const details = useBeachDetails(ids);
  const rmFav = useRemoveFavorite();

  // --- Sorting state with persistence ---
  const [sortBy, setSortBy] = useState<"name" | "municipality">(() => {
    return (
      (localStorage.getItem("favoritesSort") as "name" | "municipality") ??
      "name"
    );
  });

  useEffect(() => {
    localStorage.setItem("favoritesSort", sortBy);
  }, [sortBy]);

  // --- Derived, enriched list ---
  const items = useMemo(() => {
    if (!favorites) return [];
    const enriched = favorites.map((f) => {
      const info = details.byId.get(f.beachId);
      return {
        fav: f,
        name: info?.locationName ?? f.beachId,
        muni: info?.locationArea ?? "",
        classification: info?.classification,
        classificationText: info?.classificationText ?? "Unknown",
      };
    });

    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    enriched.sort((a, b) => {
      if (sortBy === "name") return collator.compare(a.name, b.name);
      return collator.compare(a.muni, b.muni);
    });

    return enriched;
  }, [favorites, details.byId, sortBy]);

  // --- Loading state ---
  if (isLoading) {
    return (
      <main className="max-w-screen-lg mx-auto p-6">
        <h1 className="font-spectral text-2xl mb-4">Your favorite beaches</h1>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-5 w-1/2 bg-surface-muted rounded mb-2" />
              <div className="h-4 w-1/3 bg-surface-muted rounded" />
            </div>
          ))}
        </div>
      </main>
    );
  }

  // --- Error state ---
  if (isError) {
    return (
      <main className="max-w-screen-lg mx-auto p-6">
        <h1 className="font-spectral text-2xl mb-4">Your favorite beaches</h1>
        <p className="text-red-600">
          {(error as Error)?.message ?? "Could not load favorites"}
        </p>
      </main>
    );
  }

  // --- Normal render ---
  return (
    <main className="max-w-screen-lg mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-spectral text-2xl">Your favorite beaches</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm">
            Sort by:{" "}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "municipality")
              }
              className="ml-1 border rounded px-2 py-1 text-sm"
            >
              <option value="name">Name</option>
              <option value="municipality">Municipality</option>
            </select>
          </label>
          <Link to="/" className="underline text-accent">
            Browse all beaches
          </Link>
        </div>
      </div>

      {favorites && favorites.length === 0 && (
        <div className="card p-6">
          <h2 className="font-spectral text-lg mb-1">No favorites yet</h2>
          <p className="text-sm text-ink-muted mb-3">
            Browse the map and tap “Save as favorite” on a beach you like.
          </p>
          <Link
            to="/"
            className="inline-block px-3 py-2 rounded-2xl border border-border hover:bg-surface-muted"
          >
            Go to map
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {items.map((item) => {
          const { fav, name, muni, classification, classificationText } = item;
          const qClass = qualityClass(classification ?? classificationText);

          return (
            <li
              key={fav._id}
              className="card p-4 flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <Link
                  to={`/beach/${fav.beachId}`}
                  className="font-medium hover:underline block truncate"
                  title={name}
                >
                  {name}
                </Link>
                <div className="text-sm text-ink-muted truncate">
                  {muni || "—"}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <span className={`badge ${qClass}`}>
                    {classificationText}
                  </span>
                  {details.isLoading && (
                    <span className="text-xs text-ink-muted">updating…</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/beach/${fav.beachId}`}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
                >
                  View
                </Link>
                <button
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
                  disabled={rmFav.isPending}
                  onClick={() =>
                    rmFav.mutateAsync({ id: fav._id, beachId: fav.beachId })
                  }
                  aria-label={`Remove ${name} from favorites`}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
