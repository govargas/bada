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

