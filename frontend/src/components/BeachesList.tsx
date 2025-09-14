import type { BeachSummary } from "../types/beaches";
import { useBeaches } from "../hooks/useBeaches";
import { Link } from "react-router-dom";

export default function BeachesList() {
  const { data, isLoading, error } = useBeaches();

  if (isLoading) return <p>Loading beaches…</p>;
  if (error) return <p>Could not load beaches.</p>;

  const items: BeachSummary[] = data ?? [];

  return (
    <div style={{ padding: 16 }}>
      <h2>Beaches ({items.length})</h2>
      <ul>
        {items.map((b) => (
          <li key={b.id}>
            <Link to={`/beach/${b.id}`}>
              {b.name}
              {b.municipality ? ` — ${b.municipality}` : ""}
            </Link>{" "}
            <small>
              ({b.lat.toFixed(4)}, {b.lng.toFixed(4)})
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
