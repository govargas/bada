import { useBeachDetail } from "../hooks/useBeaches";
import { deriveClassificationCode, getQualityLabel } from "../utils/quality";

export default function BeachDetailPanel({
  id,
  lang = "sv",
}: {
  id: string;
  lang?: "sv" | "en";
}) {
  const { data, isLoading, error } = useBeachDetail(id);

  if (isLoading) return <p>Loading beach…</p>;
  if (error || !data) return <p>Could not load beach.</p>;

  const code = deriveClassificationCode(data);
  const qualityText = getQualityLabel(data.classification ?? 0, lang);

  return (
    <section style={{ padding: 16 }}>
      <h2>{data.locationName}</h2>
      <div>
        <strong>{lang === "sv" ? "Vattenkvalitet" : "Water quality"}:</strong>{" "}
        {qualityText}
      </div>
      {data.classificationYear && (
        <div>
          {lang === "sv" ? "Senaste år" : "Latest year"}:{" "}
          {data.classificationYear}
        </div>
      )}
      {data.bathInformation && (
        <p style={{ marginTop: 12 }}>{data.bathInformation}</p>
      )}
    </section>
  );
}
