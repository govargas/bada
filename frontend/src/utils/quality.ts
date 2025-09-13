/**
 * HaV uses numeric classification codes:
 * 1 = Utmärkt kvalitet / Excellent quality
 * 2 = Bra kvalitet / Good quality
 * 3 = Tillfredsställande kvalitet / Sufficient quality
 * 4 = Dålig kvalitet / Poor quality
 */
export function getQualityLabel(
  code: number,
  lang: "sv" | "en" = "sv"
): string {
  const map: Record<number, { sv: string; en: string }> = {
    1: { sv: "Utmärkt kvalitet", en: "Excellent quality" },
    2: { sv: "Bra kvalitet", en: "Good quality" },
    3: { sv: "Tillfredsställande kvalitet", en: "Sufficient quality" },
    4: { sv: "Dålig kvalitet", en: "Poor quality" },
  };
  const entry = map[code];
  if (!entry) return lang === "sv" ? "Okänd" : "Unknown";
  return entry[lang];
}
