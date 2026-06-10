import { apiFetch } from "./client";
import {
  BeachSummary,
  BeachDetail,
  BeachFeatureCollection,
  featureToSummary,
} from "@/types/beaches";

// List all beaches → BeachSummary[]
//
// Primary source is a static snapshot (frontend/public/beaches.json) built at
// deploy time and served from the CDN — no serverless cold start, no large
// GeoJSON round trip. Falls back to the live HaV proxy if the snapshot is
// missing (e.g. local dev before the file is generated).
export async function fetchBeaches(): Promise<BeachSummary[]> {
  try {
    const res = await fetch("/beaches.json", {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      const data = (await res.json()) as BeachSummary[];
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // ignore and fall back to the live proxy
  }

  const data = await apiFetch<BeachFeatureCollection>("/beaches");
  return data.features
    .map(featureToSummary)
    .filter((x): x is BeachSummary => x !== null);
}

// One beach detail
export async function fetchBeach(id: string): Promise<BeachDetail> {
  return apiFetch<BeachDetail>(`/beaches/${id}`);
}
