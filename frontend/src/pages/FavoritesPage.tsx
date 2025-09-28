import {
  useFavorites,
  useRemoveFavorite,
  type Favorite,
  useReorderFavorites,
} from "@/api/favorites";
import { useBeachDetails } from "@/api/useBeachDetails";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import SortableFavorite from "@/components/SortableFavorite";

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

const SORT_KEY = "favoritesSort"; // 'custom' | 'name' | 'municipality'
const ORDER_KEY = "favoritesOrder:v1"; // stores array of beachIds

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError, error } = useFavorites();
  const ids = favorites?.map((f) => f.beachId);
  const details = useBeachDetails(ids);
  const rmFav = useRemoveFavorite();
  const reorderFavs = useReorderFavorites();

  // --- Sort mode with persistence
  const [sortBy, setSortBy] = useState<"custom" | "name" | "municipality">(
    () =>
      (localStorage.getItem(SORT_KEY) as "custom" | "name" | "municipality") ??
      "name"
  );
  useEffect(() => {
    localStorage.setItem(SORT_KEY, sortBy);
  }, [sortBy]);

  // --- Custom order state (array of beachIds), persisted
  const [order, setOrder] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(ORDER_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });
  // Reconcile order whenever favorites change (add missing, remove gone)
  useEffect(() => {
    if (!favorites) return;
    const favIds = favorites.map((f) => f.beachId);
    const known = new Set(order);
    const merged = [...order, ...favIds.filter((id) => !known.has(id))];
    const filtered = merged.filter((id) => favIds.includes(id));
    if (JSON.stringify(filtered) !== JSON.stringify(order)) {
      setOrder(filtered);
    }
  }, [favorites]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  }, [order]);

  // --- Enriched items map
  const enriched = useMemo(() => {
    const map = new Map<
      string,
      {
        fav: Favorite;
        name: string;
        muni: string;
        classification?: number | string;
        classificationText: string;
      }
    >();

    if (!favorites) return map;

    for (const f of favorites) {
      const info = details.byId.get(f.beachId);
      map.set(f.beachId, {
        fav: f,
        name: info?.locationName ?? f.beachId,
        muni: info?.locationArea ?? "",
        classification: info?.classification ?? info?.classificationText,
        classificationText: info?.classificationText ?? "Unknown",
      });
    }
    return map;
  }, [favorites, details.byId]);

  // --- Items to render (IDs in display order)
  const displayIds = useMemo(() => {
    if (!favorites) return [];
    const favIds = favorites.map((f) => f.beachId);

    if (sortBy === "custom" && order.length) {
      return order.filter((id) => favIds.includes(id));
    }

    const list = favIds.slice();
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });
    list.sort((a, b) => {
      const A = enriched.get(a);
      const B = enriched.get(b);
      if (!A || !B) return 0;
      if (sortBy === "name") return collator.compare(A.name, B.name);
      return collator.compare(A.muni, B.muni);
    });
    return list;
  }, [favorites, sortBy, order, enriched]);

  // --- DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function onDragEnd(event: DragEndEvent) {
    if (sortBy !== "custom") return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(String(active.id));
    const newIndex = order.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);

    // Call backend to persist
    reorderFavs.mutate(next, {
      onError: () => {
        // Rollback on error
        setOrder(order);
      },
    });
  }

  // --- Loading state
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

  // --- Error state
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

  // --- Normal render
  return (
    <main className="max-w-screen-lg mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <h1 className="font-spectral text-2xl">Your favorite beaches</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm">
            Sort by:{" "}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "custom" | "name" | "municipality")
              }
              className="ml-1 border rounded px-2 py-1 text-sm"
              aria-label="Sort favorites"
            >
              <option value="custom">Custom (drag & drop)</option>
              <option value="name">Name (A–Z)</option>
              <option value="municipality">Municipality (A–Z)</option>
            </select>
          </label>
          <Link to="/" className="underline text-accent block">
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

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={displayIds} strategy={rectSortingStrategy}>
          <ul className="grid gap-3 list-none sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {displayIds.map((id) => {
              const item = enriched.get(id);
              if (!item) return null;
              const { fav, name, muni, classification, classificationText } =
                item;
              const klass = qualityClass(classification ?? classificationText);

              return (
                <SortableFavorite
                  key={fav._id}
                  id={id}
                  name={name}
                  muni={muni}
                  classificationText={classificationText}
                  classificationClass={klass}
                  disabled={sortBy !== "custom"}
                  onRemove={() =>
                    rmFav
                      .mutateAsync({ id: fav._id, beachId: fav.beachId })
                      .then(() => {
                        setOrder((prev) => prev.filter((x) => x !== id));
                      })
                  }
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </main>
  );
}
