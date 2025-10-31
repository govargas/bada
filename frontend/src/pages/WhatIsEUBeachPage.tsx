import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function WhatIsEUBeachPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.whatIsEUBeach.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">EU Bathing Water Directive</h2>
        <p className="text-ink leading-relaxed">
          An EU bathing water is a beach or section of a coastline where the European Union's 
          Bathing Water Directive (2006/7/EC) applies. This directive requires member states 
          to monitor and regularly test the water quality at designated bathing sites.
        </p>
        <p className="text-ink leading-relaxed">
          In Sweden, the Swedish Agency for Marine and Water Management (HaV) monitors these 
          beaches and classifies them according to water quality standards.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Water Quality Classifications</h2>
        
        <div className="space-y-3">
          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-excellent">Excellent</span>
            </div>
            <p className="text-sm text-ink-muted">
              Best water quality. The water meets the highest standards with excellent microbiological quality.
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-good">Good</span>
            </div>
            <p className="text-sm text-ink-muted">
              Good water quality. The water meets the standards with good microbiological quality.
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-sufficient">Sufficient</span>
            </div>
            <p className="text-sm text-ink-muted">
              Sufficient water quality. The water meets the minimum standards.
            </p>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="badge kpi-poor">Poor</span>
            </div>
            <p className="text-sm text-ink-muted">
              Poor water quality. Swimming is not recommended. The water does not meet the minimum standards.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Monitoring</h2>
        <p className="text-ink leading-relaxed">
          Water quality is monitored throughout the bathing season (typically May to September). 
          Samples are taken regularly and tested for bacteria and other contaminants that could 
          affect human health.
        </p>
        <p className="text-ink leading-relaxed">
          The classification is based on data from the last four bathing seasons to provide a 
          stable and reliable assessment of water quality.
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

