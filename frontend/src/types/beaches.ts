// GeoJSON + domain types for beaches

export type LngLat = [number, number]; // GeoJSON order: [lon, lat]

// --- GeoJSON (list) ---
export interface BeachFeatureProperties {
  NUTSKOD: string; // stable beach ID
  NAMN: string; // name
  KMN_NAMN?: string; // municipality (optional)
}

export interface BeachFeature {
  type: "Feature";
  id?: string;
  geometry?: { type: "Point"; coordinates: LngLat };
  geometry_name?: string;
  properties?: BeachFeatureProperties;
}

export interface BeachFeatureCollection {
  type: "FeatureCollection";
  features: BeachFeature[];
}

// --- Simplified list item for UI ---
export interface BeachSummary {
  id: string; // NUTSKOD
  name: string; // NAMN
  municipality: string; // KMN_NAMN (empty string if missing)
  lat: number;
  lon: number; // canonical longitude
  lng?: number; // temporary alias (same as lon) to avoid breaking older code
}

/**
 * Map a GeoJSON feature → BeachSummary.
 * Returns null if coordinates are missing/invalid.
 */
export function featureToSummary(f: BeachFeature): BeachSummary | null {
  const props = f.properties;
  const coords = f.geometry?.coordinates;
  if (!props || !coords) return null;

  const [lon, lat] = coords;
  if (typeof lat !== "number" || typeof lon !== "number") return null;

  return {
    id: props.NUTSKOD ?? f.id ?? "",
    name: props.NAMN ?? "Okänd",
    municipality: props.KMN_NAMN ?? "",
    lat,
    lon,
    lng: lon, // alias for any code still using `lng`
  };
}

// --- Detail shape (plain JSON from /detail/:id) ---
export interface BeachQualityRating {
  qualityRating: number; // 1..4
  qualityRatingText: string; // "Utmärkt kvalitet" | "Bra kvalitet" | ...
  ratingYear: number;
}

export interface BeachDetail {
  algalText?: string;
  algalValue?: number;
  bathInformation?: string;
  classification?: number; // 1..4 (current year)
  classificationText?: string; // e.g. "Bra kvalitet"
  classificationYear?: number;
  contactMail?: string;
  contactPhone?: string;
  contactUrl?: string;
  dissuasion?: string[];
  euMotive?: string;
  euType?: boolean;
  locationArea?: string;
  locationName?: string;
  nutsCode: string;
  qualityRating?: BeachQualityRating[];

  // ⬇️ Likely sample-date candidates we’ll probe for:
  latestSampleDate?: string;
  sampleDate?: string;
  lastSampleDate?: string;
  // sometimes APIs nest:
  samples?: Array<{ date?: string; [k: string]: unknown }>;
  lastSample?: { date?: string; [k: string]: unknown };
}
