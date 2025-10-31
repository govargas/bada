import { Link } from "react-router";
import { useTranslation } from "react-i18next";

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="font-spectral text-3xl">{t("pages.terms.title")}</h1>
      
      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Acceptance of Terms</h2>
        <p className="text-ink leading-relaxed">
          By using BADA, you agree to these terms of use. If you do not agree with any part 
          of these terms, please do not use our service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Service Description</h2>
        <p className="text-ink leading-relaxed">
          BADA provides information about EU-classified bathing waters in Sweden. We aggregate 
          data from official sources and present it in an accessible format.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Disclaimer</h2>
        <p className="text-ink leading-relaxed">
          The water quality information provided by BADA is based on official data from the 
          Swedish Agency for Marine and Water Management. While we strive for accuracy, we 
          cannot guarantee the completeness or timeliness of all information.
        </p>
        <p className="text-ink leading-relaxed">
          BADA is provided "as is" without warranty of any kind. Users should exercise their 
          own judgment and discretion when using this information to make decisions about 
          swimming or other water activities.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">User Accounts</h2>
        <p className="text-ink leading-relaxed">
          When you create an account, you are responsible for maintaining the confidentiality 
          of your account information and password. You agree to notify us immediately of any 
          unauthorized use of your account.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Intellectual Property</h2>
        <p className="text-ink leading-relaxed">
          The BADA application and its original content, features, and functionality are owned 
          by the BADA project and are protected by international copyright, trademark, and 
          other intellectual property laws.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Changes to Terms</h2>
        <p className="text-ink leading-relaxed">
          We reserve the right to modify these terms at any time. We will notify users of any 
          significant changes by posting the new terms on this page.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="font-spectral text-2xl">Contact</h2>
        <p className="text-ink leading-relaxed">
          If you have questions about these terms, please{" "}
          <Link to="/contact" className="text-accent underline">
            contact us
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

