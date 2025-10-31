import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.about.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.about.whatIsBADA")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.about.whatIsBADADesc")}
        </p>
        <p className="text-ink leading-relaxed">
          {t("pages.about.whatIsBADAMission")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.about.dataSource")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.about.dataSourceDesc")}
        </p>
        <p className="text-ink leading-relaxed">
          {t("pages.about.dataSourceDirective")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.about.features")}</h2>
        <ul className="space-y-2 list-disc list-inside text-ink">
          <li>{t("pages.about.featureMap")}</li>
          <li>{t("pages.about.featureLocation")}</li>
          <li>{t("pages.about.featureQuality")}</li>
          <li>{t("pages.about.featureFavorites")}</li>
          <li>{t("pages.about.featureDarkMode")}</li>
          <li>{t("pages.about.featureLang")}</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.about.builtWith")}</h2>
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
          className="inline-block px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90"
        >
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}

