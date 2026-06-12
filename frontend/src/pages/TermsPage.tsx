import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@phosphor-icons/react";

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-display text-3xl">{t("pages.terms.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.acceptance")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.acceptanceDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.service")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.serviceDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.disclaimer")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.disclaimerDesc")}
        </p>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.disclaimerDesc2")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.accounts")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.accountsDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.ip")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.ipDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.changes")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.changesDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.terms.contact")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.terms.contactDesc")}{" "}
          <Link to="/contact" className="text-accent underline">
            {t("pages.terms.contactUs")}
          </Link>.
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

