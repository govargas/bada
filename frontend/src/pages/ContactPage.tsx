import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.contact.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.contact.getInTouch")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.contact.getInTouchDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.contact.github")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.contact.githubDesc")}{" "}
          <a 
            href="https://github.com/govargas/bada" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            {t("pages.contact.githubRepo")}
          </a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.contact.feedback")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.contact.feedbackDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.contact.accuracy")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.contact.accuracyDesc")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.contact.privacy")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.contact.privacyDesc")}
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

