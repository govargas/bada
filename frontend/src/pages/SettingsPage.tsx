import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">Settings</h1>
      
      <section className="card p-6 space-y-4">
        <h2 className="font-spectral text-xl">Language</h2>
        <p className="text-ink-muted">
          Choose your preferred language for BADA.
        </p>
        <LanguageSwitcher />
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-spectral text-xl">Dark Mode</h2>
        <p className="text-ink-muted">
          Toggle dark mode from the user menu in the header.
        </p>
      </section>

      <section className="card p-6 space-y-4">
        <h2 className="font-spectral text-xl">Notifications</h2>
        <p className="text-ink-muted">
          Notification preferences will be available in a future update.
        </p>
      </section>

      <div className="pt-6">
        <Link 
          to="/" 
          className="inline-block px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90"
        >
          ← Back to map
        </Link>
      </div>
    </main>
  );
}

