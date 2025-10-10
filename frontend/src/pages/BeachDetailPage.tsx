import { useParams, Link, useNavigate, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchBeach } from "../api/beaches";
import { formatDate } from "../utils/format";
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from "../api/favorites";
import { useAuth } from "@/store/auth"; // NEW

// Map numeric/class text → color class
function qualityClass(q: number | string | undefined) {
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
  if (typeof q === "string") {
    const s = q.toLowerCase();
    if (s.includes("utmärkt")) return "kpi-excellent";
    if (s.includes("bra")) return "kpi-good";
    if (s.includes("tillfreds") || s.includes("sufficient"))
      return "kpi-sufficient";
    if (s.includes("dålig") || s.includes("poor")) return "kpi-poor";
  }
  return "kpi-unknown";
}

export default function BeachDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth(); // NEW

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["beach", id],
    enabled: !!id,
    queryFn: () => fetchBeach(id!),
    staleTime: 5 * 60 * 1000,
  });

  // --- FAVORITES HOOKS ---
  const queryClient = useQueryClient();
  const { data: favorites } = useFavorites();
  const addFav = useAddFavorite();
  const rmFav = useRemoveFavorite();
  const existingFav = favorites?.find((f) => f.beachId === id);
  const isFav = !!existingFav;

  if (isLoading) {
    return (
      <section className="p-4 space-y-4">
        <div className="h-7 w-2/3 bg-surface-muted rounded animate-pulse" />
        <div className="h-4 w-1/3 bg-surface-muted rounded animate-pulse" />
        <div className="card p-4">
          <div className="h-4 w-1/2 bg-surface rounded animate-pulse" />
          <div className="h-4 w-1/3 bg-surface rounded animate-pulse mt-2" />
        </div>
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section className="p-4">
        <div className="card p-4">
          <p className="font-spectral text-lg">Could not load this beach.</p>
          <p className="text-sm text-ink-muted mt-1">
            {(error as Error)?.message ?? "Please try again."}
          </p>
          <Link
            to="/"
            className="inline-block mt-3 px-3 py-2 rounded-2xl border border-border bg-surface hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            ← Back to list
          </Link>
        </div>
      </section>
    );
  }

  const title = data.locationName ?? "Beach";
  const muni = data.locationArea ?? "";
  const qualityNum = data.classification;
  const qualityText = data.classificationText ?? "Okänd";
  const pillClass = qualityClass(qualityNum ?? qualityText);

  const latestSampleLabel = data.latestSampleDate
    ? formatDate(data.latestSampleDate, "short")
    : "—";

  async function handleFavoriteClick() {
    if (!token) {
      // Not logged in → route to login and return here after
      navigate("/login", { replace: false, state: { from: location } });
      return;
    }
    try {
      if (isFav) {
        await rmFav.mutateAsync({ id: existingFav?._id, beachId: id });
      } else {
        await addFav.mutateAsync(id!); // mutation takes beachId string
      }
      // Optional: refresh favorites/beach queries
      queryClient.invalidateQueries({ queryKey: ["favorites", token] });
      queryClient.invalidateQueries({ queryKey: ["beach", id] });
    } catch (e: any) {
      alert(e?.message ?? "Favorite action failed");
    }
  }

  return (
    <section className="p-4 space-y-4">
      {/* Heading block */}
      <header className="space-y-1">
        <h1 className="font-spectral text-2xl leading-tight">{title}</h1>
        <p className="text-ink-muted">{muni || "—"}</p>
      </header>

      {/* KPI row */}
      <div className="flex items-center gap-2">
        <span className={`badge ${pillClass}`}>
          {qualityText}{" "}
          {data.classificationYear ? `• ${data.classificationYear}` : ""}
        </span>
        {data.euType && <span className="badge">EU-bad</span>}
      </div>

      {/* Meta card */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-ink-muted">Latest sample</div>
            <div className="font-medium">{latestSampleLabel}</div>
          </div>
          <div>
            <div className="text-ink-muted">Algal bloom</div>
            <div className="font-medium">{data.algalText ?? "—"}</div>
          </div>
          <div>
            <div className="text-ink-muted">EU motive</div>
            <div className="font-medium">{data.euMotive ?? "—"}</div>
          </div>
          <div>
            <div className="text-ink-muted">NUTS code</div>
            <div className="font-medium">{data.nutsCode}</div>
          </div>
        </div>

        {/* Actions row */}
        <div className="pt-2 flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-2xl border border-border bg-surface hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60"
            onClick={handleFavoriteClick}
            disabled={addFav.isPending || rmFav.isPending}
          >
            {isFav ? "★ Remove favorite" : "☆ Save as favorite"}
          </button>

          <Link
            to="/"
            className="px-3 py-2 rounded-2xl border border-border bg-surface hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            ← Back
          </Link>
        </div>
      </div>

      {/* Description */}
      {data.bathInformation && (
        <article className="card p-4">
          <h2 className="font-spectral text-lg mb-1">About this beach</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {data.bathInformation}
          </p>
        </article>
      )}

      {/* Contact */}
      {(data.contactMail || data.contactPhone || data.contactUrl) && (
        <div className="card p-4 space-y-1 text-sm">
          <h3 className="font-spectral text-lg">Contact</h3>
          {data.contactMail && (
            <div>
              Mail:{" "}
              <a
                href={`mailto:${data.contactMail}`}
                className="underline text-accent"
              >
                {data.contactMail}
              </a>
            </div>
          )}
          {data.contactPhone && <div>Phone: {data.contactPhone}</div>}
          {data.contactUrl && (
            <div>
              Website:{" "}
              <a
                href={
                  data.contactUrl.startsWith("http")
                    ? data.contactUrl
                    : `https://${data.contactUrl}`
                }
                target="_blank"
                rel="noreferrer"
                className="underline text-accent"
              >
                {data.contactUrl}
              </a>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
