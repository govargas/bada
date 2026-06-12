import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@phosphor-icons/react";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <main className="max-w-md mx-auto p-6">
      <div className="card p-6 space-y-3 text-center">
        <h1 className="font-display text-3xl">{t("pages.notFound.title")}</h1>
        <p className="text-ink-muted">{t("pages.notFound.desc")}</p>
        <div className="pt-2">
          <Link to="/" className="btn btn-primary">
            <ArrowLeft size={16} aria-hidden="true" />
            {t("pages.backToMap")}
          </Link>
        </div>
      </div>
    </main>
  );
}
