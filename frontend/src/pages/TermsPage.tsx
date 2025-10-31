import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.terms.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.acceptance")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.acceptanceDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.service")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.serviceDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.disclaimer")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.disclaimerDesc")}
        </p>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.disclaimerDesc2")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.accounts")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.accountsDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.ip")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.ipDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.changes")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.changesDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.terms.contact")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.terms.contactDesc")}{" "}
          <Link to="/contact" className="text-accent underline">
            {t("pages.terms.contactUs")}
          </Link>.
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

