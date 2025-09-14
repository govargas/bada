/**
 * Format a date-ish value. If it's already human text, returns as-is.
 * If it's an ISO string or timestamp, formats using the current locale.
 */
export function formatDate(input?: string | number | Date): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) {
    // Not a real date — just return the original string (e.g., "Ingen provtagning")
    return String(input);
  }
  // Use browser locale; fallback to Swedish style if unavailable.
  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "sv-SE";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
