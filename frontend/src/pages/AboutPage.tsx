import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.about.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">What is BADA?</h2>
        <p className="text-ink leading-relaxed">
          BADA helps beachgoers and families in Sweden find safe, EU-classified bathing waters 
          with real-time quality updates. We replace outdated or clunky websites with a clean, 
          mobile-friendly experience.
        </p>
        <p className="text-ink leading-relaxed">
          Our mission is to make water quality information accessible to everyone, helping you 
          make informed decisions about where to swim and enjoy Sweden's beautiful coastal waters.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Data Source</h2>
        <p className="text-ink leading-relaxed">
          BADA uses official data from the Swedish Agency for Marine and Water Management 
          (Havs- och Vattenmyndigheten, HaV), which monitors and classifies EU bathing waters 
          across Sweden.
        </p>
        <p className="text-ink leading-relaxed">
          Water quality classifications are based on the European Bathing Water Directive and 
          are updated regularly throughout the bathing season.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Features</h2>
        <ul className="space-y-2 list-disc list-inside text-ink">
          <li>🗺️ Interactive map of all EU-classified beaches in Sweden</li>
          <li>📍 Find the nearest beach based on your current location</li>
          <li>🔬 View water quality, classification, and recent test results</li>
          <li>❤️ Save your favorite beaches to your profile</li>
          <li>🌗 Dark mode and responsive design</li>
          <li>🌐 Multi-language support (Swedish / English)</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Built With</h2>
        <p className="text-ink">
          BADA is built with React, TypeScript, Node.js, Express, and MongoDB. 
          Maps are powered by MapLibre and OpenStreetMap. 
          See our{" "}
          <a 
            href="https://github.com/govargas/bada" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            GitHub repository
          </a>{" "}
          for more details.
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

