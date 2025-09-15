/**
 * Format a date in a human readable way.
 * If input is invalid, return as-is.
 * If no input, return em dash.
 *
 * @param input Date input (string, number, Date)
 * @param style "long" (default) or "short" (YYYY-MM-DD)
 * @returns Formatted date string
 */

export function formatDate(
  input?: string | number | Date,
  style: "long" | "short" = "long"
): string {
  if (!input) return "—";
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return String(input);

  if (style === "short") {
    return d.toLocaleDateString("sv-SE", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }

  const locale =
    (typeof navigator !== "undefined" && navigator.language) || "sv-SE";
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
