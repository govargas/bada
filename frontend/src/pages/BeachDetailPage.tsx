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
import {
  ArrowLeft,
  CalendarBlank,
  ClipboardText,
  EnvelopeSimple,
  Globe,
  Info,
  Leaf,
  MapPin,
  Phone,
  Star,
  Warning,
  type Icon,
} from "@phosphor-icons/react";
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

function DetailFact({
  icon: FactIcon,
  label,
  value,
}: {
  icon: Icon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface-muted/40 px-3 py-3">
      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
        <FactIcon size={15} weight="bold" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="mt-1 text-sm font-semibold leading-snug text-ink">
        {value}
      </div>
    </div>
  );
}

function ContactItem({
  icon: ContactIcon,
  label,
  children,
}: {
  icon: Icon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-surface-muted/35 px-3 py-2.5">
      <ContactIcon
        size={16}
        weight="bold"
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-ink-muted"
      />
      <div className="min-w-0">
        <div className="text-xs text-ink-muted">{label}</div>
        <div className="mt-0.5 break-words text-sm font-medium text-ink">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BeachDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const status = useAuth((s) => s.status);

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
    : "-";

  // HaV sometimes sends "false"/"true"/empty for unset text fields. Treat
  // those as no-data so we never print a raw "false" to the user.
  const cleanText = (v: unknown): string => {
    const s = String(v ?? "").trim();
    const lower = s.toLowerCase();
    return s === "" || lower === "false" || lower === "true" ? "" : s;
  };

  // Translate algal status
  const algalKey = getAlgalStatusKey(data.algalText);
  const algalDisplay = algalKey ? t(algalKey) : cleanText(data.algalText) || "-";

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
    : cleanText(data.euMotive) || "-";
  const hasContact =
    Boolean(data.contactMail) ||
    Boolean(data.contactPhone) ||
    Boolean(data.contactUrl);
  const hasDissuasion = Boolean(data.dissuasion && data.dissuasion.length > 0);
  const swimVerdictClass = hasDissuasion
    ? "kpi-poor"
    : algalSafety
    ? algalSafetyToneClass
    : "kpi-unknown";
  const swimVerdictText = hasDissuasion
    ? t("beachDetail.swimAdvisory")
    : algalSafety
    ? t(algalSafety.key)
    : t("beachDetail.checkLocalConditions");

  async function handleFavoriteClick() {
    if (status !== "authenticated") {
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
      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["beach", id] });
    } catch (e: any) {
      const errorMsg = e?.message ?? t("favorites.removed");
      toast.error(errorMsg);
    }
  }

  return (
    <section className="page-shell space-y-4 md:space-y-5">
      <div className="card p-4 sm:p-5 space-y-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(250px,0.34fr)] lg:items-start">
          <header className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {data.euType && (
                <span className="liquid-chip">{t("beachDetail.euBad")}</span>
              )}
              <span className={`liquid-chip ${swimVerdictClass}`}>
                {swimVerdictText}
              </span>
            </div>
            <div className="space-y-2">
              <h1 className="font-beach text-4xl leading-[1.02] sm:text-5xl">
                {title}
              </h1>
              <p className="flex items-center gap-1.5 text-base text-ink-muted">
                <MapPin size={18} weight="bold" aria-hidden="true" />
                <span>{muni || "-"}</span>
              </p>
            </div>
          </header>

          <Tooltip content={qualityTooltip}>
            <div
              className="rounded-2xl border border-border/40 bg-surface-muted/35 p-4 cursor-help"
              tabIndex={0}
            >
              <div className="text-xs text-ink-muted">
                {t("waterQuality")}
              </div>
              <div className={`mt-1 text-2xl font-semibold leading-tight ${pillClass}`}>
                {qualityText}
              </div>
              {data.classificationYear && (
                <div className="mt-1 text-sm text-ink-muted">
                  {t("latestYear")} {data.classificationYear}
                </div>
              )}
            </div>
          </Tooltip>
        </div>

        {hasDissuasion && (
          <div
            role="alert"
            className="rounded-xl border border-[var(--color-quality-poor)]/50 bg-[var(--color-quality-poor)]/10 p-3"
          >
            <h2 className="font-display text-base text-[var(--color-quality-poor)] flex items-center gap-2">
              <Warning size={19} weight="bold" aria-hidden="true" />
              {t("beachDetail.dissuasion")}
            </h2>
            <ul className="mt-1 text-sm list-disc list-inside space-y-0.5">
              {data.dissuasion?.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <DetailFact
            icon={CalendarBlank}
            label={t("beachDetail.latestSampleDate")}
            value={latestSampleLabel}
          />
          <DetailFact
            icon={Leaf}
            label={t("beachDetail.algalBloom")}
            value={
              <span>
                {algalDisplay}
                {algalSafety && (
                  <>
                    {" - "}
                    <span className={algalSafetyToneClass}>
                      {t(algalSafety.key)}
                    </span>
                  </>
                )}
              </span>
            }
          />
          <DetailFact
            icon={ClipboardText}
            label={t("beachDetail.euMotive")}
            value={euMotiveDisplay}
          />
        </div>

        <details className="group border-t border-border/50 pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink">
            <Info size={14} weight="bold" aria-hidden="true" />
            {t("beachDetail.sourceAndSafety")}
          </summary>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-ink-muted">
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
          </p>
        </details>

        <div className="flex flex-col gap-2 border-t border-border/50 pt-3 sm:flex-row sm:items-center">
          <button
            className={`btn w-full sm:w-auto ${isFav ? "" : "btn-primary"}`}
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

          <Link to="/" className="btn w-full sm:w-auto">
            <ArrowLeft size={16} aria-hidden="true" /> {t("back")}
          </Link>
        </div>
      </div>

      {id && <BeachWeatherPanel beachId={id} />}

      {(data.bathInformation || hasContact) && (
        <div
          className={`grid gap-4 ${
            data.bathInformation && hasContact
              ? "lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]"
              : ""
          }`}
        >
          {data.bathInformation && (
            <article className="card p-4 sm:p-5">
              <h2 className="font-display text-lg mb-2">
                {t("beachDetail.bathInformation")}
              </h2>
              <p className="max-w-3xl text-sm leading-relaxed whitespace-pre-line">
                {data.bathInformation}
              </p>
            </article>
          )}

          {hasContact && (
            <div className="card p-4 sm:p-5 space-y-3">
              <h3 className="font-display text-lg">{t("nav.contact")}</h3>
              <div className="space-y-2">
                {data.contactMail && (
                  <ContactItem icon={EnvelopeSimple} label={t("beachDetail.mail")}>
                    <a
                      href={`mailto:${data.contactMail}`}
                      className="underline text-accent"
                    >
                      {data.contactMail}
                    </a>
                  </ContactItem>
                )}
                {data.contactPhone && (
                  <ContactItem icon={Phone} label={t("beachDetail.phone")}>
                    {data.contactPhone}
                  </ContactItem>
                )}
                {data.contactUrl && (
                  <ContactItem icon={Globe} label={t("beachDetail.website")}>
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
                  </ContactItem>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
