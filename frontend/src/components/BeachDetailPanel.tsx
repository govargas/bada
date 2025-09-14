import { useBeachDetail } from "../hooks/useBeaches";
import { deriveClassificationCode } from "../utils/quality";
import { useTranslation } from "react-i18next";

export default function BeachDetailPanel({ id }: { id: string }) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, error } = useBeachDetail(id);

  if (isLoading) return <p>{t("loadingBeaches")}</p>;
  if (error || !data) return <p>{t("loadError")}</p>;

  const code = deriveClassificationCode(data); // "excellent" | "good" | ...
  const qualityText = t(`classification.${code}`);

  return (
    <section style={{ padding: 16 }}>
      <h2>{data.locationName}</h2>
      <div>
        <strong>{t("waterQuality")}:</strong> {qualityText}
      </div>
      {data.classificationYear && (
        <div>
          {t("latestYear")}: {data.classificationYear}
        </div>
      )}
      {data.bathInformation && (
        <p style={{ marginTop: 12 }}>
          {data.bathInformation}
          {i18n.language.startsWith("en") && (
            <span
              style={{
                display: "block",
                fontSize: 12,
                opacity: 0.7,
                marginTop: 4,
              }}
            >
              {t("sourceTextNote")}
            </span>
          )}
        </p>
      )}
    </section>
  );
}
