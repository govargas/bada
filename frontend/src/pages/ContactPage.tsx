import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function ContactPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.contact.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Get in Touch</h2>
        <p className="text-ink leading-relaxed">
          We'd love to hear from you! Whether you have feedback, suggestions, questions, or 
          found a bug, please don't hesitate to reach out.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">GitHub</h2>
        <p className="text-ink leading-relaxed">
          For bug reports, feature requests, or code contributions, please visit our{" "}
          <a 
            href="https://github.com/govargas/bada" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-accent underline"
          >
            GitHub repository
          </a>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Issues & Feedback</h2>
        <p className="text-ink leading-relaxed">
          If you encounter any issues with the application or have suggestions for improvement, 
          please open an issue on GitHub. Your feedback helps us make BADA better.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Data Accuracy</h2>
        <p className="text-ink leading-relaxed">
          If you notice any inaccuracies in the water quality data or beach information, please 
          let us know. We rely on official sources, but errors can occur and we'll work to 
          correct them promptly.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Privacy</h2>
        <p className="text-ink leading-relaxed">
          For questions about privacy and data handling, please see our terms of use or contact 
          us through GitHub.
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

