// frontend/src/components/BeachDetailPage.tsx
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchBeach } from "../api/beaches";
import type { BeachDetail } from "../types/beaches";
import { formatDate } from "../utils/format";

// Map quality to CSS class (uses the tokens defined in index.css)
function qualityClass(q?: number | string) {
  // Prefer numeric classification 1..4 if present
  if (typeof q === "number") {
    switch (q) {
      case 1:
        return "kpi-excellent";
      case 2:
        return "kpi-good";
      case 3:
        return "kpi-sufficient";
      case 4:
        return "kpi-poor";
      default:
        return "kpi-unknown";
    }
  }
  // Fallback by text (covers Swedish/English labels from API)
  const t = String(q ?? "").toLowerCase();
  if (t.includes("utmärkt") || t.includes("excellent")) return "kpi-excellent";
  if (t.includes("bra") || t.includes("good")) return "kpi-good";
  if (t.includes("tillfreds") || t.includes("sufficient"))
    return "kpi-sufficient";
  if (t.includes("dålig") || t.includes("poor")) return "kpi-poor";
  return "kpi-unknown";
}

export default function BeachDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["beach", id],
    enabled: !!id,
    queryFn: () => fetchBeach(id!),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <BackBar />
        <div className="card p-4">
          <div className="h-6 w-2/3 bg-surface animate-pulse rounded" />
          <div className="h-4 w-1/3 bg-surface animate-pulse rounded mt-3" />
          <div className="h-4 w-3/4 bg-surface animate-pulse rounded mt-2" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <BackBar />
        <div role="alert" className="card p-4">
          <p className="font-spectral text-lg">Could not load beach.</p>
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
      </div>
    );
  }

  // Pull primary fields
  const name = data.locationName ?? data.nutsCode;
  const area = data.locationArea ?? "—";
  const qualityNum = data.classification; // 1..4 (current)
  const qualityText = data.classificationText ?? ""; // e.g. "Bra kvalitet"
  const year = data.classificationYear;

  // Most recent rating in the history array (if present)
  const latestRating =
    Array.isArray(data.qualityRating) && data.qualityRating.length
      ? data.qualityRating[0]
      : undefined;

  return (
    <div className="space-y-4">
      <BackBar />

      {/* Title + municipality */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-spectral text-2xl leading-tight">{name}</h1>
          <p className="text-ink-muted">{area}</p>
        </div>

        {/* Quality pill */}
        <div className="badge">
          <span className={qualityClass(qualityNum ?? qualityText)}>●</span>
          <span className="whitespace-nowrap">
            {qualityText || "Okänd kvalitet"}
            {year ? ` • ${year}` : ""}
          </span>
        </div>
      </header>

      {/* Quick facts row (expand later maybe) */}
      <section className="card p-3">
        <ul className="text-sm space-y-1">
          {typeof data.algalText === "string" && (
            <li>
              <span className="text-ink-muted">Algblomning:</span>{" "}
              <span>{data.algalText}</span>
            </li>
          )}
          {typeof data.euMotive === "string" && (
            <li>
              <span className="text-ink-muted">EU-motiv:</span>{" "}
              <span>{data.euMotive}</span>
            </li>
          )}
          {latestRating && (
            <li>
              <span className="text-ink-muted">Senaste betyg:</span>{" "}
              <span>
                {latestRating.qualityRatingText} ({latestRating.ratingYear})
              </span>
            </li>
          )}
          {/* contact info */}
          {(data.contactMail || data.contactPhone || data.contactUrl) && (
            <li className="pt-1">
              <span className="text-ink-muted">Kontakt:</span>{" "}
              <span>
                {data.contactMail ?? "—"}
                {data.contactPhone ? ` • ${data.contactPhone}` : ""}
                {data.contactUrl ? ` • ${data.contactUrl}` : ""}
              </span>
            </li>
          )}
        </ul>
      </section>

      {/* Long description */}
      {data.bathInformation && (
        <section className="card p-4">
          <h2 className="font-spectral text-xl mb-2">Om badplatsen</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {data.bathInformation}
          </p>
        </section>
      )}

      {/* History (optional compact list) */}
      {Array.isArray(data.qualityRating) && data.qualityRating.length > 0 && (
        <section className="card p-3">
          <h3 className="font-spectral text-lg mb-2">Historik</h3>
          <ul className="text-sm space-y-1">
            {data.qualityRating.slice(0, 5).map((r) => (
              <li key={r.ratingYear} className="flex items-center gap-2">
                <span className={`text-xs ${qualityClass(r.qualityRating)}`}>
                  ●
                </span>
                <span className="w-16">{r.ratingYear}</span>
                <span className="truncate">{r.qualityRatingText}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function BackBar() {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/"
        className="px-3 py-2 rounded-2xl border border-border bg-surface-muted hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
      >
        ← Back
      </Link>
    </div>
  );
}
