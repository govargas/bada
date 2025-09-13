import {
  BeachSummary,
  BeachDetail,
  BeachFeatureCollection,
  featureToSummary,
} from "../types/beaches";

// Helper: fetch JSON with error handling
async function apiGet<T>(path: string): Promise<T> {
  const base = import.meta.env.VITE_API_BASE; // e.g. https://bada-backend.vercel.app/api
  const res = await fetch(`${base}${path}`);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

// List all beaches → BeachSummary[]
export async function fetchBeaches(): Promise<BeachSummary[]> {
  const data = await apiGet<BeachFeatureCollection>("/beaches");
  return data.features
    .map(featureToSummary)
    .filter((x): x is BeachSummary => x !== null);
}

// One beach detail
export async function fetchBeach(id: string): Promise<BeachDetail> {
  return apiGet<BeachDetail>(`/beaches/${id}`);
}
