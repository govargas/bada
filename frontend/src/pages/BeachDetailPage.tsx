import { useParams, Link, useNavigate, useLocation } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { fetchBeach } from "../api/beaches";
import { formatDate } from "../utils/format";
import { getClassificationKey } from "../utils/quality";
import { getAlgalStatusKey, getAlgalSafety, getEuMotiveKey } from "../utils/algal";
import {
  useFavorites,
  useAddFavorite,
  useRemoveFavorite,
} from "../api/favorites";
import { useAuth } from "@/store/auth";
import { ArrowLeft, Star, Warning, Info } from "@phosphor-icons/react";
import Tooltip from "../components/Tooltip";
import BeachWeatherPanel from "../components/BeachWeatherPanel";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["beach", id],
    enabled: !!id,
    queryFn: () => fetchBeach(id!),
    staleTime: 5 * 60 * 1000,
  });

  useDocumentTitle(data?.locationName);

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
          <p className="font-display text-lg">{t("loadError")}</p>
          <p className="text-sm text-ink-muted mt-1">
            {(error as Error)?.message ?? t("beachDetail.pleaseTryAgain")}
          </p>
          <Link to="/" className="btn mt-3">
            <ArrowLeft size={16} aria-hidden="true" /> {t("back")}
          </Link>
        </div>
      </section>
    );
  }

  const title = data.locationName ?? t("beachDetail.beach");
  const muni = data.locationArea ?? "";
  const qualityNum = data.classification;
  const classificationKey = getClassificationKey(
    qualityNum ?? data.classificationText
  );
  const qualityText = t(classificationKey);
  const pillClass = qualityClass(qualityNum ?? data.classificationText);

  // Get the short description for tooltip
  const classificationTooltipKey = classificationKey.replace(
    "classification.",
    "classificationTooltip."
  );
  const qualityTooltip = t(classificationTooltipKey);

  const latestSampleLabel = data.latestSampleDate
    ? formatDate(data.latestSampleDate, "short")
    : "–";

  // HaV sometimes sends "false"/"true"/empty for unset text fields. Treat
  // those as no-data so we never print a raw "false" to the user.
  const cleanText = (v: unknown): string => {
    const s = String(v ?? "").trim();
    const lower = s.toLowerCase();
    return s === "" || lower === "false" || lower === "true" ? "" : s;
  };

  // Translate algal status
  const algalKey = getAlgalStatusKey(data.algalText);
  const algalDisplay = algalKey ? t(algalKey) : cleanText(data.algalText) || "–";

  // Swim-safety verdict derived from the bloom status (null when unmeasured)
  const algalSafety = getAlgalSafety(algalKey);
  const algalSafetyToneClass =
    algalSafety?.tone === "safe"
      ? "kpi-good"
      : algalSafety?.tone === "caution"
      ? "kpi-sufficient"
      : "kpi-poor";

  // Translate EU motive
  const euMotiveKey = getEuMotiveKey(data.euMotive);
  const euMotiveDisplay = euMotiveKey
    ? t(euMotiveKey)
    : cleanText(data.euMotive) || "–";

  async function handleFavoriteClick() {
    if (!token) {
      navigate("/login", { replace: false, state: { from: location } });
      return;
    }
    try {
      if (isFav) {
        await rmFav.mutateAsync({ id: existingFav?._id, beachId: id });
        toast.success(t("favorites.removed"));
      } else {
        await addFav.mutateAsync(id!);
        toast.success(t("favorites.added"));
      }
      queryClient.invalidateQueries({ queryKey: ["favorites", token] });
      queryClient.invalidateQueries({ queryKey: ["beach", id] });
    } catch (e: any) {
      const errorMsg = e?.message ?? t("favorites.removed");
      toast.error(errorMsg);
    }
  }

  return (
    <section className="p-4 space-y-4">
      {/* Heading block */}
      <header className="space-y-1">
        <h1 className="font-beach text-2xl leading-tight">{title}</h1>
        <p className="text-ink-muted">{muni || "–"}</p>
      </header>

      {/* KPI row */}
      <div className="flex items-center gap-2">
        <Tooltip content={qualityTooltip}>
          <span className={`badge ${pillClass} cursor-help`} tabIndex={0}>
            {qualityText}{" "}
            {data.classificationYear ? `· ${data.classificationYear}` : ""}
          </span>
        </Tooltip>
        {data.euType && <span className="badge">{t("beachDetail.euBad")}</span>}
      </div>

      {/* Swimming advisory — surfaced prominently because it is safety data */}
      {data.dissuasion && data.dissuasion.length > 0 && (
        <div
          role="alert"
          className="rounded-2xl border border-[var(--color-quality-poor)]/50 bg-[var(--color-quality-poor)]/10 p-4"
        >
          <h2 className="font-display text-lg text-[var(--color-quality-poor)] flex items-center gap-2">
            <Warning size={20} weight="bold" aria-hidden="true" />
            {t("beachDetail.dissuasion")}
          </h2>
          <ul className="mt-1 text-sm list-disc list-inside space-y-0.5">
            {data.dissuasion.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Meta card */}
      <div className="card p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-ink-muted">
              {t("beachDetail.latestSampleDate")}
            </div>
            <div className="font-medium">{latestSampleLabel}</div>
          </div>
          <div>
            <div className="text-ink-muted flex items-center gap-1">
              {t("beachDetail.algalBloom")}
              <Tooltip content={t("algalBloomInfo")}>
                <span
                  tabIndex={0}
                  role="img"
                  aria-label={t("algalBloomInfo")}
                  className="inline-flex cursor-help text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-full"
                >
                  <Info size={15} weight="bold" aria-hidden="true" />
                </span>
              </Tooltip>
            </div>
            <div className="font-medium">
              {algalDisplay}
              {algalSafety && (
                <>
                  {" – "}
                  <span className={algalSafetyToneClass}>
                    {t(algalSafety.key)}
                  </span>
                </>
              )}
            </div>
          </div>
          <div>
            <div className="text-ink-muted">{t("beachDetail.euMotive")}</div>
            <div className="font-medium">{euMotiveDisplay}</div>
          </div>
        </div>

        {/* Swim-safety disclaimer — this data is decision support, not a
            real-time guarantee, so the caveat sits with the safety figures. */}
        <p className="flex items-start gap-1.5 border-t border-[var(--color-border)] pt-3 text-xs leading-relaxed text-ink-muted">
          <Info
            size={14}
            weight="bold"
            aria-hidden="true"
            className="mt-0.5 shrink-0"
          />
          <span>
            {t("beachDetail.safetyDisclaimer")}{" "}
            <a
              href="https://badplatsen.havochvatten.se"
              target="_blank"
              rel="noreferrer"
              className="underline text-accent"
            >
              {t("beachDetail.safetyDisclaimerSource")}
            </a>
            .
          </span>
        </p>

        {/* Actions row */}
        <div className="pt-2 flex items-center gap-2">
          <button
            className="btn"
            onClick={handleFavoriteClick}
            disabled={addFav.isPending || rmFav.isPending}
          >
            <Star
              size={16}
              weight={isFav ? "fill" : "regular"}
              aria-hidden="true"
            />
            {isFav
              ? t("beachDetail.removeFavorite")
              : t("beachDetail.addFavorite")}
          </button>

          <Link to="/" className="btn">
            <ArrowLeft size={16} aria-hidden="true" /> {t("back")}
          </Link>
        </div>
      </div>

      {/* Weather & sun times */}
      {id && <BeachWeatherPanel beachId={id} />}

      {/* Description */}
      {data.bathInformation && (
        <article className="card p-4">
          <h2 className="font-display text-lg mb-1">
            {t("beachDetail.bathInformation")}
          </h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {data.bathInformation}
          </p>
        </article>
      )}

      {/* Contact */}
      {(data.contactMail || data.contactPhone || data.contactUrl) && (
        <div className="card p-4 space-y-1 text-sm">
          <h3 className="font-display text-lg">{t("nav.contact")}</h3>
          {data.contactMail && (
            <div>
              {t("beachDetail.mail")}{" "}
              <a
                href={`mailto:${data.contactMail}`}
                className="underline text-accent"
              >
                {data.contactMail}
              </a>
            </div>
          )}
          {data.contactPhone && (
            <div>
              {t("beachDetail.phone")} {data.contactPhone}
            </div>
          )}
          {data.contactUrl && (
            <div>
              {t("beachDetail.website")}{" "}
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
