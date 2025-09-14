import { useParams, Link } from "react-router-dom";
import BeachDetailPanel from "./BeachDetailPanel";
import { useTranslation } from "react-i18next";

export default function BeachDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  if (!id) return <p>{t("loadError")}</p>;

  return (
    <div style={{ padding: 16 }}>
      <p>
        <Link to="/">← {t("back")}</Link>
      </p>
      <BeachDetailPanel id={id} />
    </div>
  );
}
