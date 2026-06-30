import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  GlobeHemisphereWest,
  Heart,
  MapTrifold,
  Moon,
  NavigationArrow,
  TestTube,
  type Icon,
} from "@phosphor-icons/react";

export default function AboutPage() {
  const { t } = useTranslation();
  const features: Array<{ key: string; Icon: Icon }> = [
    { key: "featureMap", Icon: MapTrifold },
    { key: "featureLocation", Icon: NavigationArrow },
    { key: "featureQuality", Icon: TestTube },
    { key: "featureFavorites", Icon: Heart },
    { key: "featureDarkMode", Icon: Moon },
    { key: "featureLang", Icon: GlobeHemisphereWest },
  ];

  return (
    <main className="content-shell space-y-6">
      <h1 className="font-display text-3xl">{t("pages.about.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.about.whatIsBADA")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.about.whatIsBADADesc")}
        </p>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.about.whatIsBADAMission")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.about.dataSource")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.about.dataSourceDesc")}
        </p>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.about.dataSourceDirective")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.about.features")}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {features.map(({ key, Icon }) => (
            <li
              key={key}
              className="rounded-xl border border-border/40 bg-surface-muted/35 px-3 py-3"
            >
              <div className="flex items-start gap-2.5">
                <Icon
                  size={18}
                  weight="bold"
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-accent"
                />
                <span className="text-sm leading-snug text-ink">
                  {t(`pages.about.${key}`)}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.about.builtWith")}</h2>
        <p className="text-ink">
          {t("pages.about.builtWithDesc")}{" "}
          <a 
            href="https://github.com/govargas/bada" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {t("pages.about.githubRepo")}
          </a>{" "}
          {t("pages.about.builtWithDesc2")}
        </p>
      </section>

      <div className="pt-6">
        <Link 
          to="/" 
          className="btn btn-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}
