import { useFavorites } from "@/api/favorites";

export default function FavoritesPage() {
  const { data, isLoading, isError } = useFavorites();
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6">Your favourites</h1>
      {isLoading && <p role="status">Loading…</p>}
      {isError && <p role="alert">Could not load favourites.</p>}
      {data && data.length === 0 && <p>No favourites yet.</p>}
      <ul className="space-y-3">
        {data?.map((fav) => (
          <li key={fav._id} className="rounded border p-3">
            <div className="font-medium">{fav.beachId}</div>
            {fav.note && (
              <div className="text-sm text-neutral-600">{fav.note}</div>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
