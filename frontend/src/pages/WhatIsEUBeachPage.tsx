import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function WhatIsEUBeachPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.whatIsEUBeach.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.whatIsEUBeach.directive")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.whatIsEUBeach.directiveDesc")}
        </p>
        <p className="text-ink leading-relaxed">
          {t("pages.whatIsEUBeach.directiveDesc2")}
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.whatIsEUBeach.classifications")}</h2>
        
        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-excellent">{t("classification.excellent")}</span>
            </div>
            <p className="text-sm text-ink-muted">
              {t("pages.whatIsEUBeach.excellentDesc")}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-good">{t("classification.good")}</span>
            </div>
            <p className="text-sm text-ink-muted">
              {t("pages.whatIsEUBeach.goodDesc")}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-sufficient">{t("classification.sufficient")}</span>
            </div>
            <p className="text-sm text-ink-muted">
              {t("pages.whatIsEUBeach.sufficientDesc")}
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-poor">{t("classification.poor")}</span>
            </div>
            <p className="text-sm text-ink-muted">
              {t("pages.whatIsEUBeach.poorDesc")}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">{t("pages.whatIsEUBeach.monitoring")}</h2>
        <p className="text-ink leading-relaxed">
          {t("pages.whatIsEUBeach.monitoringDesc")}
        </p>
        <p className="text-ink leading-relaxed">
          {t("pages.whatIsEUBeach.monitoringDesc2")}
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

