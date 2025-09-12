// GeoJSON + domain types for beaches

export type LngLat = [number, number]; // GeoJSON order: [lon, lat]

// --- GeoJSON (list) ---
export interface BeachFeatureProperties {
  NUTSKOD: string; // e.g. "SE0441273000000001" (stable beach ID)
  NAMN: string; // e.g. "Hökarängsbadet, Drevviken"
  KMN_NAMN?: string; // municipality (optional)
}

export interface BeachFeature {
  type: "Feature";
  id?: string;
  geometry: { type: "Point"; coordinates: LngLat };
  geometry_name?: string;
  properties: BeachFeatureProperties;
}

export interface BeachFeatureCollection {
  type: "FeatureCollection";
  features: BeachFeature[];
}

// Simplified list item for UI
export interface BeachSummary {
  id: string; // NUTSKOD
  name: string; // NAMN
  municipality?: string; // KMN_NAMN
  lat: number;
  lng: number;
}

export function featureToSummary(f: BeachFeature): BeachSummary | null {
  const [lng, lat] = f.geometry?.coordinates ?? [];
  if (typeof lat !== "number" || typeof lng !== "number") return null;
  return {
    id: f.properties.NUTSKOD,
    name: f.properties.NAMN,
    municipality: f.properties.KMN_NAMN,
    lat,
    lng,
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
  locationArea?: string; // municipality/area
  locationName?: string; // beach name
  nutsCode: string; // stable id (same as NUTSKOD)
  qualityRating?: BeachQualityRating[];
}
