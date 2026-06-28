import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@phosphor-icons/react";

export default function PrivacyPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-display text-3xl">{t("pages.privacy.title")}</h1>

      <p className="text-ink leading-relaxed max-w-prose">
        {t("pages.privacy.intro")}
      </p>

      {(
        [
          "dataWeCollect",
          "location",
          "howWeUse",
          "sharing",
          "storage",
          "retention",
          "rights",
        ] as const
      ).map((section) => (
        <section key={section} className="space-y-4">
          <h2 className="font-display text-2xl">
            {t(`pages.privacy.${section}`)}
          </h2>
          <p className="text-ink leading-relaxed max-w-prose">
            {t(`pages.privacy.${section}Desc`)}
          </p>
        </section>
      ))}

      <section className="space-y-4">
        <h2 className="font-display text-2xl">{t("pages.privacy.contact")}</h2>
        <p className="text-ink leading-relaxed max-w-prose">
          {t("pages.privacy.contactDesc")}{" "}
          <Link to="/contact" className="text-accent underline">
            {t("pages.privacy.contactUs")}
          </Link>
          .
        </p>
      </section>

      <div className="pt-6">
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} aria-hidden="true" />
          {t("pages.backToMap")}
        </Link>
      </div>
    </main>
  );
}
