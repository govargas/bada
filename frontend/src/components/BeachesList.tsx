import type { BeachSummary } from "../types/beaches";
import { useBeaches } from "../hooks/useBeaches";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BeachesList() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useBeaches();

  if (isLoading) return <p>{t("loadingBeaches")}</p>;
  if (error) return <p>{t("loadError")}</p>;

  const items: BeachSummary[] = data ?? [];

  return (
    <div style={{ padding: 16 }}>
      <h2>
        {t("beaches")} ({items.length})
      </h2>
      <ul>
        {items.map((b) => (
          <li key={b.id}>
            <Link to={`/beach/${b.id}`}>
              {b.name}
              {b.municipality ? ` — ${b.municipality}` : ""}
            </Link>{" "}
            <small>
              {t("coordinates")}: {b.lat.toFixed(4)}, {b.lng.toFixed(4)}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
