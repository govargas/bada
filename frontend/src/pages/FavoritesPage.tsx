import { useFavorites, useRemoveFavorite } from "@/api/favorites";
import { Link } from "react-router-dom";

export default function FavoritesPage() {
  const { data: favorites, isLoading, isError, error } = useFavorites();
  const rmFav = useRemoveFavorite();

  if (isLoading) {
    return (
      <main className="max-w-screen-lg mx-auto p-6">
        <h1 className="font-spectral text-2xl mb-4">Your favorite beaches</h1>
        <p>Loading…</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="max-w-screen-lg mx-auto p-6">
        <h1 className="font-spectral text-2xl mb-4">Your favorite beaches</h1>
        <p className="text-red-600">
          {(error as Error).message ?? "Could not load favorites"}
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-screen-lg mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-2xl">Your favorite beaches</h1>

      {(!favorites || favorites.length === 0) && (
        <p className="text-ink-muted">
          You don’t have any favorites yet. Browse{" "}
          <Link to="/" className="text-accent underline">
            all beaches
          </Link>{" "}
          and save your favorites!
        </p>
      )}

      <ul className="space-y-3">
        {favorites?.map((fav) => (
          <li
            key={fav._id}
            className="card p-4 flex items-center justify-between"
          >
            <Link
              to={`/beach/${fav.beachId}`}
              className="font-medium hover:underline"
            >
              {fav.beachId}
            </Link>
            <button
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-surface-muted text-sm"
              disabled={rmFav.isPending}
              onClick={() =>
                rmFav.mutateAsync({ id: fav._id, beachId: fav.beachId })
              }
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
