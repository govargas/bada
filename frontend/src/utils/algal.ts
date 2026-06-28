/**
 * Translates Swedish algal bloom status to translation key
 * @param swedishText - The Swedish algal status from the API
 * @returns Translation key for i18n
 */
export function getAlgalStatusKey(swedishText: string | undefined): string | null {
  if (!swedishText) return null;
  
  const normalized = swedishText.toLowerCase().trim();
  
  // Map Swedish text to translation keys
  const mapping: Record<string, string> = {
    'ingen blomning': 'algalStatus.ingenBlomning',
    'blomning': 'algalStatus.blomning',
    'kraftig blomning': 'algalStatus.kraftigBlomning',
    'måttlig blomning': 'algalStatus.mattligBlomning',
    'mattlig blomning': 'algalStatus.mattligBlomning',
    'lindrig blomning': 'algalStatus.lindrigBlomning',
  };
  
  return mapping[normalized] || null;
}

/**
 * Maps an algal-status translation key to a swim-safety verdict.
 *
 * Cyanobacteria blooms can be harmful even at low intensity (especially for
 * children and pets), so anything beyond "no bloom" advises caution or worse.
 * Returns null when the status is unknown/unmeasured — we never imply "safe"
 * without data.
 *
 * @returns `{ key, tone }` where `key` is an i18n key under `algalSafety` and
 *   `tone` selects the colour (kpi-good / kpi-sufficient / kpi-poor).
 */
export function getAlgalSafety(
  algalKey: string | null
): { key: string; tone: "safe" | "caution" | "avoid" } | null {
  switch (algalKey) {
    case "algalStatus.ingenBlomning":
      return { key: "algalSafety.safe", tone: "safe" };
    case "algalStatus.lindrigBlomning":
    case "algalStatus.mattligBlomning":
      return { key: "algalSafety.caution", tone: "caution" };
    case "algalStatus.blomning":
    case "algalStatus.kraftigBlomning":
      return { key: "algalSafety.avoid", tone: "avoid" };
    default:
      return null;
  }
}

/**
 * Translates Swedish EU motive to translation key
 * @param swedishText - The Swedish EU motive from the API
 * @returns Translation key for i18n
 */
export function getEuMotiveKey(swedishText: string | undefined): string | null {
  if (!swedishText) return null;
  
  const normalized = swedishText.toLowerCase().trim();
  
  // Map Swedish text to translation keys
  const mapping: Record<string, string> = {
    'stor badbelastning': 'euMotive.storBadbelastning',
    'badbelastning': 'euMotive.badbelastning',
    'tradition': 'euMotive.tradition',
    'turistattraktion': 'euMotive.turistattraktion',
  };
  
  return mapping[normalized] || null;
}

